-- AlterTable
ALTER TABLE "ventes" ADD COLUMN "numero_vente" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ventes_numero_vente_key" ON "ventes"("numero_vente");
