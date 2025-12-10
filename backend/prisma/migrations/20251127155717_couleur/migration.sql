/*
  Warnings:

  - You are about to drop the column `profile_image` on the `employees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "badge_customizations" ALTER COLUMN "backgroundColor" SET DEFAULT '#2B48D1';

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "profile_image";
