-- AlterTable
ALTER TABLE "achats_details" ADD COLUMN     "conditionnement_id" TEXT,
ADD COLUMN     "quantite_conditionnement" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "achats_details" ADD CONSTRAINT "achats_details_conditionnement_id_fkey" FOREIGN KEY ("conditionnement_id") REFERENCES "conditionnements_produit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
