/*
  Warnings:

  - You are about to drop the column `permissions` on the `tenant_users` table. All the data in the column will be lost.
  - You are about to drop the column `role_stock_id` on the `tenant_users` table. All the data in the column will be lost.
  - The `customPermissions` column on the `tenant_users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "tenant_users" DROP CONSTRAINT "tenant_users_role_stock_id_fkey";

-- AlterTable
ALTER TABLE "tenant_users" DROP COLUMN "permissions",
DROP COLUMN "role_stock_id",
DROP COLUMN "customPermissions",
ADD COLUMN     "customPermissions" JSONB NOT NULL DEFAULT '[]';
