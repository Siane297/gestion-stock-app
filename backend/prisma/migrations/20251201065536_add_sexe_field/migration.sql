-- CreateEnum
CREATE TYPE "Sexe" AS ENUM ('MASCULIN', 'FEMININ');

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "sexe" "Sexe";
