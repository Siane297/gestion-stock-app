/*
  Warnings:

  - You are about to drop the column `nom` on the `fournisseurs` table. All the data in the column will be lost.
  - Added the required column `nom_entreprise` to the `fournisseurs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fournisseurs" DROP COLUMN "nom",
ADD COLUMN     "nom_entreprise" TEXT NOT NULL;
