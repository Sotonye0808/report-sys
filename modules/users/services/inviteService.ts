import { db } from "@/lib/data/db";
import { sendInviteEmail } from "@/lib/email/resend";
import { fail, ok, type OperationResult } from "@/modules/common/services/operationResult";
import { HIERARCHY_ORDER, InviteLinkType, UserRole } from "@/types/global";

interface CreateInviteInput {
  targetRole: UserRole;
  recipientEmail?: string;
  campusId?: string;
  groupId?: string;
  expiresInHours: number;
  note?: string;
}

interface InviteActor {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export async function createInviteLink(
  input: CreateInviteInput,
  actor: InviteActor,
): Promise<OperationResult<InviteLink>> {
  const creatorOrder = HIERARCHY_ORDER[actor.role];
  const targetOrder = HIERARCHY_ORDER[input.targetRole];
  if (actor.role !== UserRole.SUPERADMIN && targetOrder <= creatorOrder) {
    return fail("Cannot create invite for a role at or above your level", 403);
  }

  const expiresAt = new Date(Date.now() + input.expiresInHours * 3600 * 1000).toISOString();
  const token = crypto.randomUUID().replace(/-/g, "");

  const link = await db.inviteLink.create({
    data: {
      token,
      type: InviteLinkType.DIRECT,
      targetRole: input.targetRole,
      campusId: input.campusId,
      groupId: input.groupId,
      createdById: actor.id,
      expiresAt,
      note: input.note,
      isActive: true,
    },
  });

  if (input.recipientEmail && process.env.RESEND_API_KEY) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
    const inviteUrl = `${appUrl}/join?token=${token}`;
    void sendInviteEmail({
      to: input.recipientEmail,
      inviterName: `${actor.firstName} ${actor.lastName}`.trim() || "Harvesters Admin",
      role: input.targetRole,
      joinUrl: inviteUrl,
    });
  }

  return ok(link as unknown as InviteLink);
}

export async function revokeInviteLink(
  id: string,
  actor: Pick<InviteActor, "id" | "role">,
): Promise<OperationResult<InviteLink>> {
  const link = await db.inviteLink.findUnique({ where: { id } });
  if (!link) {
    return fail("Invite link not found", 404);
  }

  if (link.createdById !== actor.id && actor.role !== UserRole.SUPERADMIN) {
    return fail("You can only revoke your own invite links", 403);
  }

  if (!link.isActive) {
    return fail("Invite link is already revoked", 400);
  }

  const updated = await db.inviteLink.update({
    where: { id },
    data: { isActive: false },
  });

  return ok(updated as unknown as InviteLink);
}

