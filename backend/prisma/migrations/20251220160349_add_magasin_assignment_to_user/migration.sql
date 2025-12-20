-- AlterTable
ALTER TABLE "magasins" ADD COLUMN     "tenantUserId" TEXT;

-- AlterTable
ALTER TABLE "tenant_users" ADD COLUMN     "magasin_id" TEXT;

-- AddForeignKey
ALTER TABLE "magasins" ADD CONSTRAINT "magasins_tenantUserId_fkey" FOREIGN KEY ("tenantUserId") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_magasin_id_fkey" FOREIGN KEY ("magasin_id") REFERENCES "magasins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
