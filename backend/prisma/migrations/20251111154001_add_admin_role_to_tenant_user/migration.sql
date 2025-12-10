-- AlterEnum
ALTER TYPE "TenantUserRole" ADD VALUE 'ADMIN' BEFORE 'MANAGER';

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "isOwner" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tenant_users" ADD COLUMN     "isOwner" BOOLEAN NOT NULL DEFAULT false;
