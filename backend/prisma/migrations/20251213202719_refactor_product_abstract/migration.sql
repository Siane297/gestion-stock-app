/*
  Warnings:

  - You are about to drop the column `code_barre` on the `produits` table. All the data in the column will be lost.
  - You are about to drop the column `prix_achat` on the `produits` table. All the data in the column will be lost.
  - You are about to drop the column `prix_vente` on the `produits` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "conditionnements_produit_code_barre_key";

-- DropIndex
DROP INDEX "produits_code_barre_key";

-- AlterTable
ALTER TABLE "conditionnements_produit" ADD COLUMN     "prix_achat" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "produits" DROP COLUMN "code_barre",
DROP COLUMN "prix_achat",
DROP COLUMN "prix_vente";
