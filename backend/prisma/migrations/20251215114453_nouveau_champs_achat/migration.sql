/*
  Warnings:

  - You are about to drop the column `qrCode` on the `employees` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "employees_qrCode_key";

-- AlterTable
ALTER TABLE "achats_details" ADD COLUMN     "quantite_recue" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "qrCode";
