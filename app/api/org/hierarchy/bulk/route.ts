import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache, invalidateCache } from "@/lib/data/db";
import { UserRole } from "@/types/global";

const OrgBulkOpSchema = z.object({
    type: z.enum(["group", "campus"]),
    action: z.enum(["create", "update", "delete"]),
    data: z.record(z.string(), z.any()),
});

type OrgBulkOp = z.infer<typeof OrgBulkOpSchema>;

const OrgBulkRequestSchema = z.object({
    ops: z.array(OrgBulkOpSchema),
    dryRun: z.boolean().optional().default(false),
});

async function validateOps(ops: z.infer<typeof OrgBulkOpSchema>[]) {
    const results: Array<{ index: number; success: boolean; message: string }> = [];

    for (let i = 0; i < ops.length; i++) {
        const op = ops[i];
        try {
            if (op.type === "group") {
                const data = op.data;
                if (op.action === "create") {
                    if (!data.name) throw new Error("Group name required.");
                    if (!data.country) throw new Error("Group country required.");
                }
                if (op.action !== "create" && !data.id) throw new Error("Group id required.");
            } else {
                const data = op.data;
                if (op.action === "create") {
                    if (!data.name) throw new Error("Campus name required.");
                    if (!data.groupId) throw new Error("Campus groupId required.");
                    if (!data.country) throw new Error("Campus country required.");
                    if (!data.location) throw new Error("Campus location required.");
                }
                if (op.action !== "create" && !data.id) throw new Error("Campus id required.");
            }
            results.push({ index: i, success: true, message: "OK" });
        } catch (err: any) {
            results.push({ index: i, success: false, message: err.message ?? "Invalid op" });
        }
    }

    return results;
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success || auth.user.role !== UserRole.SUPERADMIN) {
            return NextResponse.json(
                { success: false, error: auth.success ? "Forbidden" : auth.error },
                { status: auth.success ? 403 : auth.status ?? 401 },
            );
        }

        const body = await req.json();
        const parsed = OrgBulkRequestSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });
        }

        const { ops, dryRun } = parsed.data;
        console.info("[api] org/hierarchy/bulk request", { count: ops.length, dryRun });
        const validation = await validateOps(ops);
        const hasInvalid = validation.some((it) => !it.success);
        if (hasInvalid) {
            return NextResponse.json({ success: false, validation }, { status: 400 });
        }

        const results: Array<{ index: number; success: boolean; message: string; id?: string }> = [];

        if (dryRun) {
            for (let i = 0; i < ops.length; i++) {
                results.push({ index: i, success: true, message: "Dry-run OK" });
            }
            return NextResponse.json({ success: true, dryRun: true, results });
        }

        await db.$transaction(async (tx) => {
            for (let i = 0; i < ops.length; i++) {
                const op = ops[i];
                console.debug("[api] org/hierarchy/bulk op start", { index: i, op });

                if (op.type === "group") {
                    const { action, data } = op as OrgBulkOp;
                    const groupId = data.id ? String(data.id) : undefined;
                    if (action === "create") {
                        const group = await tx.orgGroup.create({
                            data: {
                                name: String(data.name),
                                country: String(data.country),
                                isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
                                leaderId: data.leaderId ? String(data.leaderId) : null,
                            },
                        });
                        results.push({ index: i, success: true, message: "Group created", id: group.id });
                    } else if (action === "update") {
                        if (!groupId) throw new Error("Group id required for update");
                        const existing = await tx.orgGroup.findUnique({ where: { id: groupId } });
                        if (!existing) throw new Error("Group not found: " + groupId);
                        const updated = await tx.orgGroup.update({
                            where: { id: groupId },
                            data: {
                                ...(data.name !== undefined && { name: String(data.name) }),
                                ...(data.country !== undefined && { country: String(data.country) }),
                                ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
                                ...(data.leaderId !== undefined && { leaderId: data.leaderId ? String(data.leaderId) : null }),
                            },
                        });
                        results.push({ index: i, success: true, message: "Group updated", id: updated.id });
                    } else if (action === "delete") {
                        if (!groupId) throw new Error("Group id required for delete");
                        const campusCount = await tx.campus.count({ where: { parentId: groupId } });
                        if (campusCount > 0) throw new Error("Group has campuses, cannot delete");
                        await tx.orgGroup.delete({ where: { id: groupId } });
                        results.push({ index: i, success: true, message: "Group deleted" });
                    }
                } else if (op.type === "campus") {
                    const { action, data } = op as OrgBulkOp;
                    const campusId = data.id ? String(data.id) : undefined;
                    if (action === "create") {
                        const campus = await tx.campus.create({
                            data: {
                                name: String(data.name),
                                parentId: String(data.groupId),
                                country: String(data.country),
                                location: String(data.location),
                                isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
                            },
                        });
                        results.push({ index: i, success: true, message: "Campus created", id: campus.id });
                    } else if (action === "update") {
                        if (!campusId) throw new Error("Campus id required for update");
                        const existing = await tx.campus.findUnique({ where: { id: campusId } });
                        if (!existing) throw new Error("Campus not found: " + campusId);
                        const updated = await tx.campus.update({
                            where: { id: campusId },
                            data: {
                                ...(data.name !== undefined && { name: String(data.name) }),
                                ...(data.groupId !== undefined && { parentId: String(data.groupId) }),
                                ...(data.country !== undefined && { country: String(data.country) }),
                                ...(data.location !== undefined && { location: String(data.location) }),
                                ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
                            },
                        });
                        results.push({ index: i, success: true, message: "Campus updated", id: updated.id });
                    } else if (action === "delete") {
                        if (!campusId) throw new Error("Campus id required for delete");
                        const reportCount = await tx.report.count({ where: { campusId } });
                        if (reportCount > 0) throw new Error("Campus has reports, cannot delete");
                        await tx.campus.delete({ where: { id: campusId } });
                        results.push({ index: i, success: true, message: "Campus deleted" });
                    }
                }
            }
        });

        await invalidateCache("org:hierarchy");
        await invalidateCache("org:groups");
        await invalidateCache("org:campuses");

        console.info("[api] org/hierarchy/bulk success", { total: results.length, results });
        return NextResponse.json({ success: true, dryRun: false, results });
    } catch (error: any) {
        console.error("[api] Error in POST /api/org/hierarchy/bulk", error);
        return NextResponse.json({ success: false, error: error?.message ?? "Failed to update org hierarchy" }, { status: 500 });
    }
}
