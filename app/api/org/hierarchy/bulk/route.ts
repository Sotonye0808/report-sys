import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { UserRole } from "@/types/global";
import { runBulkTransaction } from "@/lib/data/bulkTransaction";
import { validateBulkLimit } from "@/app/api/middleware/validate-bulk-limit";
import { getRequestContext } from "@/lib/server/requestContext";
import { badRequestResponse, handleApiError, successResponse, unauthorizedResponse } from "@/lib/utils/api";
import { logServerInfo } from "@/lib/utils/serverLogger";

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

const VALIDATION_ERROR_MESSAGE = "Invalid bulk operation payload";
const ORG_BULK_MAX_ITEMS = 3000;
const ORG_BULK_CHUNK_SIZE = 24;
const ORG_BULK_TX_TIMEOUT_MS = 15000;

type IndexedOrgBulkOp = {
    index: number;
    op: OrgBulkOp;
};

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
    const ctx = getRequestContext(req);
    try {
        const auth = await verifyAuth(req);
        if (!auth.success || auth.user.role !== UserRole.SUPERADMIN) {
            return unauthorizedResponse(auth.success ? "Forbidden" : auth.error, ctx.requestId);
        }

        const body = await req.json();
        const parsed = OrgBulkRequestSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.message, ctx.requestId);
        }

        const { ops, dryRun } = parsed.data;

        const bulkLimitResponse = validateBulkLimit(ops, ORG_BULK_MAX_ITEMS);
        if (bulkLimitResponse) {
            return bulkLimitResponse;
        }

        logServerInfo("[api] org/hierarchy/bulk request", {
            requestId: ctx.requestId,
            route: ctx.route,
            count: ops.length,
            dryRun,
        });
        const validation = await validateOps(ops);
        const hasInvalid = validation.some((it) => !it.success);
        if (hasInvalid) {
            const response = badRequestResponse(VALIDATION_ERROR_MESSAGE, ctx.requestId);
            const body = await response.json();
            return NextResponse.json({ ...body, validation }, {
                status: 400,
                headers: { "x-request-id": ctx.requestId },
            });
        }

        const results: Array<{ index: number; success: boolean; message: string; id?: string }> = [];

        if (dryRun) {
            for (let i = 0; i < ops.length; i++) {
                results.push({ index: i, success: true, message: "Dry-run OK" });
            }
            return NextResponse.json(successResponse({ dryRun: true, results }, ctx.requestId), { headers: { "x-request-id": ctx.requestId } });
        }

        const indexedOps: IndexedOrgBulkOp[] = ops.map((op, index) => ({ op, index }));
        const { results: chunkResults, metrics } = await runBulkTransaction(
            indexedOps,
            async (chunk) => {
                return db.$transaction(
                    async (tx) => {
                        const currentChunkResults: Array<{ index: number; success: boolean; message: string; id?: string }> = [];

                        for (const item of chunk) {
                            const { op, index } = item;

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
                                    currentChunkResults.push({ index, success: true, message: "Group created", id: group.id });
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
                                    currentChunkResults.push({ index, success: true, message: "Group updated", id: updated.id });
                                } else if (action === "delete") {
                                    if (!groupId) throw new Error("Group id required for delete");
                                    const campusCount = await tx.campus.count({ where: { parentId: groupId } });
                                    if (campusCount > 0) throw new Error("Group has campuses, cannot delete");
                                    await tx.orgGroup.delete({ where: { id: groupId } });
                                    currentChunkResults.push({ index, success: true, message: "Group deleted" });
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
                                    currentChunkResults.push({ index, success: true, message: "Campus created", id: campus.id });
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
                                    currentChunkResults.push({ index, success: true, message: "Campus updated", id: updated.id });
                                } else if (action === "delete") {
                                    if (!campusId) throw new Error("Campus id required for delete");
                                    const reportCount = await tx.report.count({ where: { campusId } });
                                    if (reportCount > 0) throw new Error("Campus has reports, cannot delete");
                                    await tx.campus.delete({ where: { id: campusId } });
                                    currentChunkResults.push({ index, success: true, message: "Campus deleted" });
                                }
                            }
                        }

                        return currentChunkResults;
                    },
                    { timeout: ORG_BULK_TX_TIMEOUT_MS },
                );
            },
            {
                chunkSize: ORG_BULK_CHUNK_SIZE,
                maxItems: ORG_BULK_MAX_ITEMS,
                maxRetries: 1,
            },
        );

        results.push(...chunkResults);

        cache.invalidatePatternAsync("org:hierarchy");
        cache.invalidatePatternAsync("org:groups:list");
        cache.invalidatePatternAsync("org:campuses:list");
        cache.invalidatePatternAsync("org:groups:*");
        cache.invalidatePatternAsync("org:campuses:*");

        logServerInfo("[api] org/hierarchy/bulk success", {
            requestId: ctx.requestId,
            route: ctx.route,
            total: results.length,
            metrics,
        });
        return NextResponse.json(successResponse({ dryRun: false, results }, ctx.requestId), { headers: { "x-request-id": ctx.requestId } });
    } catch (error: unknown) {
        return handleApiError(error, {
            requestId: ctx.requestId,
            route: ctx.route,
        });
    }
}
