-- AlterTable
ALTER TABLE "achats_details" ADD COLUMN     "date_peremption" TIMESTAMP(3),
ADD COLUMN     "numero_lot" TEXT;

-- AlterTable
ALTER TABLE "mouvements_stock" ADD COLUMN     "lot_id" TEXT;

-- AlterTable
ALTER TABLE "produits" ADD COLUMN     "gere_peremption" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "lots_produit" (
    "id" TEXT NOT NULL,
    "produit_id" TEXT NOT NULL,
    "numero_lot" TEXT NOT NULL,
    "date_peremption" TIMESTAMP(3) NOT NULL,
    "date_fabrication" TIMESTAMP(3),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lots_produit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocks_lot" (
    "id" TEXT NOT NULL,
    "magasin_id" TEXT NOT NULL,
    "lot_id" TEXT NOT NULL,
    "quantite" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "stocks_lot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lots_produit_produit_id_numero_lot_key" ON "lots_produit"("produit_id", "numero_lot");

-- CreateIndex
CREATE UNIQUE INDEX "stocks_lot_magasin_id_lot_id_key" ON "stocks_lot"("magasin_id", "lot_id");

-- AddForeignKey
ALTER TABLE "lots_produit" ADD CONSTRAINT "lots_produit_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots_produit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks_lot" ADD CONSTRAINT "stocks_lot_magasin_id_fkey" FOREIGN KEY ("magasin_id") REFERENCES "magasins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks_lot" ADD CONSTRAINT "stocks_lot_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots_produit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
