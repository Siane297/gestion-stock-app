-- AlterTable
ALTER TABLE "conditionnements_produit" ADD COLUMN     "image_id" TEXT,
ADD COLUMN     "image_url" TEXT;

-- AlterTable
ALTER TABLE "produits" ADD COLUMN     "image_id" TEXT,
ADD COLUMN     "image_url" TEXT;
