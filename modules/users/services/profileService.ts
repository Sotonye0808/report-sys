import { cache, db } from "@/lib/data/db";
import { fail, ok, type OperationResult } from "@/modules/common/services/operationResult";

interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

function mapUserProfile(user: any): UserProfile {
  return {
    ...(user as UserProfile),
    pendingEmail: user.pendingEmail ?? undefined,
    emailVerifiedAt: user.emailVerifiedAt ?? undefined,
    emailVerificationSentAt: user.emailVerificationSentAt ?? undefined,
    pendingEmailRequestedAt: user.pendingEmailRequestedAt ?? undefined,
    pendingEmailSentAt: user.pendingEmailSentAt ?? undefined,
  };
}

export async function getOwnProfile(userId: string): Promise<OperationResult<UserProfile>> {
  const user = await db.user.findUnique({
    where: { id: userId },
    omit: { passwordHash: true },
  });

  if (!user) {
    return fail("User not found.", 404);
  }

  return ok(mapUserProfile(user));
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

  cache.invalidatePatternAsync(`users:detail:${userId}`);
  cache.invalidatePatternAsync("users:list:*");
  return ok(mapUserProfile(updated));
}

