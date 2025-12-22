/*
  Warnings:

  - The values [MANAGER,RH] on the enum `TenantUserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `permissions` on the `tenant_users` table. All the data in the column will be lost.
  - You are about to drop the column `role_stock_id` on the `tenant_users` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TenantUserRole_new" AS ENUM ('ADMIN', 'STORE_MANAGER', 'STOCK_MANAGER', 'SELLER', 'ACCOUNTANT', 'USER');
ALTER TABLE "tenant_users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "tenant_users" ALTER COLUMN "role" TYPE "TenantUserRole_new" USING (
  CASE
    WHEN "role"::text = 'MANAGER' THEN 'STORE_MANAGER'::"TenantUserRole_new"
    WHEN "role"::text = 'RH' THEN 'USER'::"TenantUserRole_new"
    ELSE "role"::text::"TenantUserRole_new"
  END
);
ALTER TYPE "TenantUserRole" RENAME TO "TenantUserRole_old";
ALTER TYPE "TenantUserRole_new" RENAME TO "TenantUserRole";
DROP TYPE "TenantUserRole_old";
ALTER TABLE "tenant_users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
-- ALTER TABLE "tenant_users" DROP CONSTRAINT "tenant_users_role_stock_id_fkey";

-- AlterTable
ALTER TABLE "tenant_users" 
-- DROP COLUMN "permissions",
-- DROP COLUMN "role_stock_id",
ADD COLUMN     "customPermissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "globalScope" BOOLEAN NOT NULL DEFAULT false;
