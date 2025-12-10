/*
  Warnings:

  - You are about to drop the column `date` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `bilans_presence` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "bilans_presence_employeeId_date_key";

-- AlterTable
ALTER TABLE "attendances" DROP COLUMN "date",
DROP COLUMN "timestamp";

-- AlterTable
ALTER TABLE "bilans_presence" DROP COLUMN "date";
