-- AlterEnum
ALTER TYPE "StatutVente" ADD VALUE 'PARTIELLEMENT_REMBOURSEE';

-- AlterTable
ALTER TABLE "ventes_details" ADD COLUMN     "quantite_remboursee" INTEGER NOT NULL DEFAULT 0;
