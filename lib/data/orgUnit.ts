/**
 * lib/data/orgUnit.ts
 *
 * CRUD + tree helpers for the polymorphic `OrgUnit` substrate. Intentionally
 * shape-agnostic — every read path queries by id / parent / level / rootKey
 * rather than by concrete "Campus" / "OrgGroup" type. The hierarchy
 * admin-config namespace owns the canonical list of levels.
 *
 * Multi-tree:
 *   - `rootKey` groups roots into separate trees so e.g. "primary" (Group→Campus)
 *     and "departments" (Department→Sub-department) coexist with parallel
 *     scope checks.
 *
 * Back-compat:
 *   - The migration back-filled OrgUnit rows from existing OrgGroup + Campus
 *     rows with the SAME UUID, so every existing FK in `User.campusId`,
 *     `Report.campusId`, etc. resolves to a real OrgUnit too. New code reads
 *     OrgUnit; legacy reads still work unchanged.
 */

import { prisma } from "@/lib/data/prisma";

export interface OrgUnitInput {
    id?: string;
    code?: string | null;
    level: string;
    name: string;
    description?: string | null;
    parentId?: string | null;
    rootKey?: string;
    country?: string | null;
    location?: string | null;
    address?: string | null;
    phone?: string | null;
    leaderId?: string | null;
    adminId?: string | null;
    metadata?: Record<string, unknown> | null;
    isActive?: boolean;
}

export interface OrgUnitNode {
    id: string;
    code?: string | null;
    level: string;
    name: string;
    description?: string | null;
    parentId: string | null;
    rootKey: string;
    country: string | null;
    location: string | null;
    address: string | null;
    phone: string | null;
    leaderId: string | null;
    adminId: string | null;
    metadata: Record<string, unknown> | null;
    isActive: boolean;
    archivedAt: Date | null;
    children?: OrgUnitNode[];
}

export class OrgUnitValidationError extends Error {
    constructor(public reason: string) {
        super(reason);
        this.name = "OrgUnitValidationError";
    }
}

function normaliseCode(code: string | null | undefined): string | null {
    if (!code) return null;
    const trimmed = code.trim();
    return trimmed.length === 0 ? null : trimmed;
}

function normaliseLevel(level: string): string {
    return level.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
}

async function validate(input: OrgUnitInput): Promise<void> {
    if (!input.name || input.name.trim().length === 0) {
        throw new OrgUnitValidationError("Name is required");
    }
    if (!input.level || input.level.trim().length === 0) {
        throw new OrgUnitValidationError("Level is required");
    }
    if (input.parentId) {
        const parent = await prisma.orgUnit.findUnique({ where: { id: input.parentId } });
        if (!parent) throw new OrgUnitValidationError("Parent unit not found");
        // Cycle guard: a unit cannot be its own ancestor.
        if (input.id && input.id === input.parentId) {
            throw new OrgUnitValidationError("Cannot set a unit as its own parent");
        }
    }
}

export async function listUnits(opts: {
    rootKey?: string;
    level?: string;
    includeArchived?: boolean;
} = {}): Promise<OrgUnitNode[]> {
    const where: Record<string, unknown> = {};
    if (opts.rootKey) where.rootKey = opts.rootKey;
    if (opts.level) where.level = normaliseLevel(opts.level);
    if (!opts.includeArchived) where.archivedAt = null;
    const rows = await prisma.orgUnit.findMany({
        where: where as never,
        orderBy: [{ rootKey: "asc" }, { level: "asc" }, { name: "asc" }],
    });
    return rows.map((r) => ({ ...r, metadata: (r.metadata as Record<string, unknown>) ?? null }));
}

export async function getUnit(id: string): Promise<OrgUnitNode | null> {
    const r = await prisma.orgUnit.findUnique({ where: { id } });
    if (!r) return null;
    return { ...r, metadata: (r.metadata as Record<string, unknown>) ?? null };
}

/**
 * Build the full tree (or trees, if `rootKey` is omitted) from a flat unit list.
 * Archived units are excluded by default.
 */
export async function tree(opts: { rootKey?: string; includeArchived?: boolean } = {}): Promise<{
    rootKey: string;
    roots: OrgUnitNode[];
}[]> {
    const flat = await listUnits({
        rootKey: opts.rootKey,
        includeArchived: opts.includeArchived,
    });
    // Group by rootKey, then build per-tree.
    const byRootKey = new Map<string, OrgUnitNode[]>();
    for (const u of flat) {
        if (!byRootKey.has(u.rootKey)) byRootKey.set(u.rootKey, []);
        byRootKey.get(u.rootKey)!.push(u);
    }
    const out: { rootKey: string; roots: OrgUnitNode[] }[] = [];
    for (const [rootKey, list] of byRootKey.entries()) {
        const byId = new Map(list.map((u) => [u.id, { ...u, children: [] as OrgUnitNode[] }]));
        const roots: OrgUnitNode[] = [];
        for (const u of byId.values()) {
            if (u.parentId && byId.has(u.parentId)) {
                byId.get(u.parentId)!.children!.push(u);
            } else {
                roots.push(u);
            }
        }
        // Sort each level alphabetically by name for predictable rendering.
        const sortRecursive = (nodes: OrgUnitNode[]) => {
            nodes.sort((a, b) => a.name.localeCompare(b.name));
            for (const n of nodes) if (n.children) sortRecursive(n.children);
        };
        sortRecursive(roots);
        out.push({ rootKey, roots });
    }
    out.sort((a, b) => a.rootKey.localeCompare(b.rootKey));
    return out;
}

export async function descendantIds(rootId: string): Promise<string[]> {
    // Iterative BFS so we don't blow the stack on deep trees. Reads only
    // (parentId, id) pairs in a single batch instead of N+1 queries.
    const all = await prisma.orgUnit.findMany({
        select: { id: true, parentId: true },
    });
    const childrenOf = new Map<string, string[]>();
    for (const u of all) {
        if (!u.parentId) continue;
        if (!childrenOf.has(u.parentId)) childrenOf.set(u.parentId, []);
        childrenOf.get(u.parentId)!.push(u.id);
    }
    const out: string[] = [];
    const queue = [rootId];
    const seen = new Set<string>([rootId]);
    while (queue.length > 0) {
        const id = queue.shift()!;
        const kids = childrenOf.get(id) ?? [];
        for (const k of kids) {
            if (seen.has(k)) continue;
            seen.add(k);
            out.push(k);
            queue.push(k);
        }
    }
    return out;
}

export async function ancestorIds(unitId: string): Promise<string[]> {
    const out: string[] = [];
    let current = await prisma.orgUnit.findUnique({
        where: { id: unitId },
        select: { parentId: true },
    });
    const seen = new Set<string>([unitId]);
    while (current?.parentId && !seen.has(current.parentId)) {
        out.push(current.parentId);
        seen.add(current.parentId);
        current = await prisma.orgUnit.findUnique({
            where: { id: current.parentId },
            select: { parentId: true },
        });
    }
    return out;
}

export async function createUnit(input: OrgUnitInput): Promise<OrgUnitNode> {
    await validate(input);
    const created = await prisma.orgUnit.create({
        data: {
            id: input.id,
            code: normaliseCode(input.code),
            level: normaliseLevel(input.level),
            name: input.name.trim(),
            description: input.description?.trim() || null,
            parentId: input.parentId ?? null,
            rootKey: input.rootKey ?? "primary",
            country: input.country ?? null,
            location: input.location ?? null,
            address: input.address ?? null,
            phone: input.phone ?? null,
            leaderId: input.leaderId ?? null,
            adminId: input.adminId ?? null,
            metadata: (input.metadata ?? null) as never,
            isActive: input.isActive ?? true,
        },
    });
    return { ...created, metadata: (created.metadata as Record<string, unknown>) ?? null };
}

export async function updateUnit(id: string, patch: Partial<OrgUnitInput>): Promise<OrgUnitNode> {
    if (patch.parentId !== undefined && patch.parentId === id) {
        throw new OrgUnitValidationError("Cannot set a unit as its own parent");
    }
    // Cycle guard: prevent re-parenting onto a descendant.
    if (patch.parentId) {
        const descendants = await descendantIds(id);
        if (descendants.includes(patch.parentId)) {
            throw new OrgUnitValidationError("Cannot move a unit into one of its own descendants");
        }
    }
    const updated = await prisma.orgUnit.update({
        where: { id },
        data: {
            ...(patch.code !== undefined && { code: normaliseCode(patch.code) }),
            ...(patch.level !== undefined && { level: normaliseLevel(patch.level) }),
            ...(patch.name !== undefined && { name: patch.name.trim() }),
            ...(patch.description !== undefined && { description: patch.description?.trim() || null }),
            ...(patch.parentId !== undefined && { parentId: patch.parentId }),
            ...(patch.rootKey !== undefined && { rootKey: patch.rootKey }),
            ...(patch.country !== undefined && { country: patch.country }),
            ...(patch.location !== undefined && { location: patch.location }),
            ...(patch.address !== undefined && { address: patch.address }),
            ...(patch.phone !== undefined && { phone: patch.phone }),
            ...(patch.leaderId !== undefined && { leaderId: patch.leaderId }),
            ...(patch.adminId !== undefined && { adminId: patch.adminId }),
            ...(patch.metadata !== undefined && { metadata: (patch.metadata ?? null) as never }),
            ...(patch.isActive !== undefined && { isActive: patch.isActive }),
        },
    });
    return { ...updated, metadata: (updated.metadata as Record<string, unknown>) ?? null };
}

/**
 * Soft-delete: archives the unit + all descendants instead of dropping rows.
 * Existing FKs (`User.unitId`, `Report.unitId`, etc.) keep working because the
 * row is not deleted — it's just marked archived.
 */
export async function archiveUnit(id: string): Promise<{ archivedIds: string[] }> {
    const descendants = await descendantIds(id);
    const allIds = [id, ...descendants];
    await prisma.orgUnit.updateMany({
        where: { id: { in: allIds } },
        data: { archivedAt: new Date(), isActive: false },
    });
    return { archivedIds: allIds };
}

export async function restoreUnit(id: string): Promise<void> {
    await prisma.orgUnit.update({
        where: { id },
        data: { archivedAt: null, isActive: true },
    });
}

/**
 * Convert a node into a parallel root tree. Used when an admin promotes a
 * subtree (e.g. "Departments") to live alongside the existing "primary" tree.
 * The children's `rootKey` is updated to match.
 */
export async function promoteToRoot(id: string, rootKey: string): Promise<void> {
    const allDescendants = await descendantIds(id);
    await prisma.orgUnit.update({
        where: { id },
        data: { parentId: null, rootKey },
    });
    if (allDescendants.length > 0) {
        await prisma.orgUnit.updateMany({
            where: { id: { in: allDescendants } },
            data: { rootKey },
        });
    }
}
