/*
  Warnings:

  - A unique constraint covering the columns `[pin]` on the table `tenant_users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tenant_users" ADD COLUMN     "pin" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tenant_users_pin_key" ON "tenant_users"("pin");
