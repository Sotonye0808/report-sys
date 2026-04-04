import { cache, db } from "@/lib/data/db";
import { fail, ok, type OperationResult } from "@/modules/common/services/operationResult";

interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export async function getOwnProfile(userId: string): Promise<OperationResult<UserProfile>> {
  const user = await db.user.findUnique({
    where: { id: userId },
    omit: { passwordHash: true },
  });

  if (!user) {
    return fail("User not found.", 404);
  }

  return ok(user as unknown as UserProfile);
}

export async function updateOwnProfile(
  userId: string,
  data: UpdateProfileInput,
): Promise<OperationResult<UserProfile>> {
  const existing = await db.user.findUnique({ where: { id: userId } });
  if (!existing) {
    return fail("User not found.", 404);
  }

  const updated = await db.user.update({
    where: { id: userId },
    data,
    omit: { passwordHash: true },
  });

  await cache.invalidatePattern(`users:detail:${userId}`);
  return ok(updated as unknown as UserProfile);
}

