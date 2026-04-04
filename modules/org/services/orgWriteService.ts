import { cache, db } from "@/lib/data/db";
import { fail, ok, type OperationResult } from "@/modules/common/services/operationResult";

function invalidateOrgCaches() {
  cache.invalidatePatternAsync("org:campuses:list");
  cache.invalidatePatternAsync("org:groups:list");
  cache.invalidatePatternAsync("org:hierarchy");
  cache.invalidatePatternAsync("org:campuses:*");
  cache.invalidatePatternAsync("org:groups:*");
  cache.invalidatePatternAsync("org:hierarchy*");
}

export async function createGroup(data: {
  name: string;
  country?: string;
  leaderId?: string;
}): Promise<OperationResult<OrgGroup>> {
  const group = await db.orgGroup.create({
    data: {
      name: data.name,
      country: data.country ?? "",
      leaderId: data.leaderId,
    },
  });

  invalidateOrgCaches();
  return ok(group as unknown as OrgGroup);
}

export async function updateGroup(
  id: string,
  data: { name?: string; country?: string; leaderId?: string | null },
): Promise<OperationResult<OrgGroup>> {
  const existing = await db.orgGroup.findUnique({ where: { id } });
  if (!existing) return fail("Group not found.", 404);

  const updated = await db.orgGroup.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.leaderId !== undefined && { leaderId: data.leaderId }),
    },
  });

  invalidateOrgCaches();
  return ok(updated as unknown as OrgGroup);
}

export async function createCampus(data: {
  name: string;
  country?: string;
  location?: string;
  groupId?: string;
  adminId?: string;
}): Promise<OperationResult<Campus>> {
  const campus = await db.campus.create({
    data: {
      name: data.name,
      parentId: data.groupId ?? "",
      country: data.country ?? "",
      location: data.location ?? "",
      adminId: data.adminId,
      isActive: true,
    },
  });

  invalidateOrgCaches();
  return ok(campus as unknown as Campus);
}

export async function updateCampus(
  id: string,
  data: {
    name?: string;
    groupId?: string;
    country?: string;
    location?: string;
    adminId?: string | null;
  },
): Promise<OperationResult<Campus>> {
  const existing = await db.campus.findUnique({ where: { id } });
  if (!existing) return fail("Campus not found.", 404);

  const updated = await db.campus.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.groupId !== undefined && { parentId: data.groupId }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.adminId !== undefined && { adminId: data.adminId }),
    },
  });

  invalidateOrgCaches();
  return ok(updated as unknown as Campus);
}

