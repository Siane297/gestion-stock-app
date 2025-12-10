/*
  Warnings:

  - The values [A_L_HEURE] on the enum `StatutPointage` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatutPointage_new" AS ENUM ('PRESENT', 'EN_RETARD', 'ABSENT', 'INCOMPLET');
ALTER TABLE "bilans_presence" ALTER COLUMN "statut" TYPE "StatutPointage_new" USING ("statut"::text::"StatutPointage_new");
ALTER TYPE "StatutPointage" RENAME TO "StatutPointage_old";
ALTER TYPE "StatutPointage_new" RENAME TO "StatutPointage";
DROP TYPE "StatutPointage_old";
COMMIT;

-- AlterTable
ALTER TABLE "bilans_presence" ADD COLUMN     "retardMinutes" INTEGER NOT NULL DEFAULT 0;
