/*
  Warnings:

  - You are about to drop the column `unite` on the `produits` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "produits" DROP COLUMN "unite",
ADD COLUMN     "unite_id" TEXT;

-- DropEnum
DROP TYPE "UniteProduit";

-- CreateTable
CREATE TABLE "unites_produit" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unites_produit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unites_produit_nom_key" ON "unites_produit"("nom");

-- AddForeignKey
ALTER TABLE "produits" ADD CONSTRAINT "produits_unite_id_fkey" FOREIGN KEY ("unite_id") REFERENCES "unites_produit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
