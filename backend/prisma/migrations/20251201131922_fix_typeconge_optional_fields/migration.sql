/*
  Warnings:

  - Made the column `couleur` on table `types_conge` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "types_conge" ALTER COLUMN "estPaye" DROP NOT NULL,
ALTER COLUMN "necessiteDocument" DROP NOT NULL,
ALTER COLUMN "couleur" SET NOT NULL;
