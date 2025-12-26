-- CreateEnum
CREATE TYPE "StatutInventaire" AS ENUM ('BROUILLON', 'EN_COURS', 'TERMINE', 'VALIDE');

-- CreateTable
CREATE TABLE "inventaires" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "magasin_id" TEXT NOT NULL,
    "statut" "StatutInventaire" NOT NULL DEFAULT 'BROUILLON',
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "date_validation" TIMESTAMP(3),
    "utilisateur_debut_id" TEXT,
    "utilisateur_validation_id" TEXT,
    "commentaire" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventaires_detail" (
    "id" TEXT NOT NULL,
    "inventaire_id" TEXT NOT NULL,
    "produit_id" TEXT NOT NULL,
    "lot_id" TEXT,
    "quantite_theorique" INTEGER NOT NULL DEFAULT 0,
    "quantite_comptee" INTEGER,
    "ecart" INTEGER,
    "valeur_ecart" DOUBLE PRECISION,
    "est_compte" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventaires_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventaires_numero_key" ON "inventaires"("numero");

-- CreateIndex
CREATE INDEX "inventaires_magasin_id_idx" ON "inventaires"("magasin_id");

-- CreateIndex
CREATE INDEX "inventaires_statut_idx" ON "inventaires"("statut");

-- CreateIndex
CREATE INDEX "inventaires_date_creation_idx" ON "inventaires"("date_creation");

-- CreateIndex
CREATE INDEX "inventaires_detail_inventaire_id_idx" ON "inventaires_detail"("inventaire_id");

-- CreateIndex
CREATE INDEX "inventaires_detail_produit_id_idx" ON "inventaires_detail"("produit_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventaires_detail_inventaire_id_produit_id_lot_id_key" ON "inventaires_detail"("inventaire_id", "produit_id", "lot_id");

-- AddForeignKey
ALTER TABLE "inventaires" ADD CONSTRAINT "inventaires_magasin_id_fkey" FOREIGN KEY ("magasin_id") REFERENCES "magasins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventaires" ADD CONSTRAINT "inventaires_utilisateur_debut_id_fkey" FOREIGN KEY ("utilisateur_debut_id") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventaires" ADD CONSTRAINT "inventaires_utilisateur_validation_id_fkey" FOREIGN KEY ("utilisateur_validation_id") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventaires_detail" ADD CONSTRAINT "inventaires_detail_inventaire_id_fkey" FOREIGN KEY ("inventaire_id") REFERENCES "inventaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventaires_detail" ADD CONSTRAINT "inventaires_detail_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventaires_detail" ADD CONSTRAINT "inventaires_detail_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots_produit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
