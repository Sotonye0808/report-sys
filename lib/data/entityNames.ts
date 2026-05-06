/**
 * lib/data/entityNames.ts
 *
 * Batched server-side resolver that turns ids into human-readable names for
 * every "scope-bearing" entity in the platform: campuses, org groups, the
 * polymorphic OrgUnit, runtime roles, and users.
 *
 * Why:
 *   The UI used to render raw UUIDs in places where a name belongs (the
 *   profile page rendered `user.campusId` directly). Sweeping every
 *   surface to do its own findUnique-by-id is wasteful, so we centralise.
 *
 * Contract:
 *   - Always returns a record keyed by id, with a string value or `null`
 *     when the id refers to a row that no longer exists.
 *   - Empty-input arrays return empty maps; never crashes on partial data.
 *   - Falsy / whitespace ids are silently dropped from the lookup.
 */

import { prisma } from "@/lib/data/prisma";

export interface EntityNameQuery {
    campusIds?: string[];
    groupIds?: string[];
    unitIds?: string[];
    roleIds?: string[];
    userIds?: string[];
}

export interface EntityNameMap {
    campuses: Record<string, string | null>;
    groups: Record<string, string | null>;
    units: Record<string, string | null>;
    roles: Record<string, string | null>;
    users: Record<string, string | null>;
}

function dedupe(input: string[] | undefined): string[] {
    if (!input) return [];
    const set = new Set<string>();
    for (const raw of input) {
        if (typeof raw !== "string") continue;
        const trimmed = raw.trim();
        if (!trimmed) continue;
        set.add(trimmed);
    }
    return Array.from(set);
}

export async function resolveEntityNames(query: EntityNameQuery): Promise<EntityNameMap> {
    const campusIds = dedupe(query.campusIds);
    const groupIds = dedupe(query.groupIds);
    const unitIds = dedupe(query.unitIds);
    const roleIds = dedupe(query.roleIds);
    const userIds = dedupe(query.userIds);

    const [campuses, groups, units, roles, users] = await Promise.all([
        campusIds.length === 0
            ? Promise.resolve([] as Array<{ id: string; name: string }>)
            : prisma.campus.findMany({
                  where: { id: { in: campusIds } },
                  select: { id: true, name: true },
              }),
        groupIds.length === 0
            ? Promise.resolve([] as Array<{ id: string; name: string }>)
            : prisma.orgGroup.findMany({
                  where: { id: { in: groupIds } },
                  select: { id: true, name: true },
              }),
        unitIds.length === 0
            ? Promise.resolve([] as Array<{ id: string; name: string }>)
            : prisma.orgUnit.findMany({
                  where: { id: { in: unitIds } },
                  select: { id: true, name: true },
              }),
        roleIds.length === 0
            ? Promise.resolve([] as Array<{ id: string; label: string }>)
            : prisma.role.findMany({
                  where: { id: { in: roleIds } },
                  select: { id: true, label: true },
              }),
        userIds.length === 0
            ? Promise.resolve([] as Array<{ id: string; firstName: string; lastName: string }>)
            : prisma.user.findMany({
                  where: { id: { in: userIds } },
                  select: { id: true, firstName: true, lastName: true },
              }),
    ]);

    const out: EntityNameMap = {
        campuses: Object.fromEntries(campusIds.map((id) => [id, null])),
        groups: Object.fromEntries(groupIds.map((id) => [id, null])),
        units: Object.fromEntries(unitIds.map((id) => [id, null])),
        roles: Object.fromEntries(roleIds.map((id) => [id, null])),
        users: Object.fromEntries(userIds.map((id) => [id, null])),
    };
    for (const c of campuses) out.campuses[c.id] = c.name;
    for (const g of groups) out.groups[g.id] = g.name;
    for (const u of units) out.units[u.id] = u.name;
    for (const r of roles) out.roles[r.id] = r.label;
    for (const u of users) {
        out.users[u.id] = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || null;
    }
    return out;
}
