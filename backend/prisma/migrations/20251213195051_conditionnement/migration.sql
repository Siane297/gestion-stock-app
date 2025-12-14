-- AlterTable
ALTER TABLE "ventes_details" ADD COLUMN     "conditionnement_id" TEXT;

-- CreateTable
CREATE TABLE "conditionnements_produit" (
    "id" TEXT NOT NULL,
    "produit_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "quantite_base" DOUBLE PRECISION NOT NULL,
    "prix_vente" DOUBLE PRECISION NOT NULL,
    "code_barre" TEXT,
    "est_actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conditionnements_produit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conditionnements_produit_code_barre_key" ON "conditionnements_produit"("code_barre");

-- CreateIndex
CREATE UNIQUE INDEX "conditionnements_produit_produit_id_nom_key" ON "conditionnements_produit"("produit_id", "nom");

-- AddForeignKey
ALTER TABLE "conditionnements_produit" ADD CONSTRAINT "conditionnements_produit_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes_details" ADD CONSTRAINT "ventes_details_conditionnement_id_fkey" FOREIGN KEY ("conditionnement_id") REFERENCES "conditionnements_produit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
