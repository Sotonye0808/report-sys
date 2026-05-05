-- DropForeignKey
ALTER TABLE "org_units" DROP CONSTRAINT "org_units_admin_fkey";

-- DropForeignKey
ALTER TABLE "org_units" DROP CONSTRAINT "org_units_leader_fkey";

-- DropForeignKey
ALTER TABLE "org_units" DROP CONSTRAINT "org_units_parent_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_unitId_fkey";

-- DropForeignKey
ALTER TABLE "role_scopes" DROP CONSTRAINT "role_scopes_role_fkey";

-- DropForeignKey
ALTER TABLE "role_scopes" DROP CONSTRAINT "role_scopes_unit_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_roleId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_unitId_fkey";

-- AlterTable
ALTER TABLE "org_units" ALTER COLUMN "archivedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "role_scopes" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "archivedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "org_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_units" ADD CONSTRAINT "org_units_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "org_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_units" ADD CONSTRAINT "org_units_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_units" ADD CONSTRAINT "org_units_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_scopes" ADD CONSTRAINT "role_scopes_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_scopes" ADD CONSTRAINT "role_scopes_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "org_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "org_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "org_units_parent_idx" RENAME TO "org_units_parentId_idx";

-- RenameIndex
ALTER INDEX "org_units_root_level_idx" RENAME TO "org_units_rootKey_level_idx";

-- RenameIndex
ALTER INDEX "role_scopes_role_unit_uniq" RENAME TO "role_scopes_roleId_unitId_key";

-- RenameIndex
ALTER INDEX "role_scopes_unit_idx" RENAME TO "role_scopes_unitId_idx";

-- RenameIndex
ALTER INDEX "roles_archived_idx" RENAME TO "roles_archivedAt_idx";
