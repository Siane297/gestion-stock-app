-- CreateEnum
CREATE TYPE "StatutConge" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REFUSE', 'ANNULE');

-- AlterEnum
ALTER TYPE "StatutPointage" ADD VALUE 'EN_CONGE';

-- AlterTable
ALTER TABLE "bilans_presence" ADD COLUMN     "congeId" TEXT;

-- CreateTable
CREATE TABLE "conges" (
    "id" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "typeCongeId" TEXT NOT NULL,
    "dateDebut" DATE NOT NULL,
    "dateFin" DATE NOT NULL,
    "nombreJours" INTEGER NOT NULL,
    "raison" TEXT,
    "statut" "StatutConge" NOT NULL DEFAULT 'EN_ATTENTE',
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "types_conge" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "estPaye" BOOLEAN NOT NULL DEFAULT true,
    "necessiteDocument" BOOLEAN NOT NULL DEFAULT false,
    "couleur" TEXT,
    "estActif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "types_conge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bilans_presence" ADD CONSTRAINT "bilans_presence_congeId_fkey" FOREIGN KEY ("congeId") REFERENCES "conges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conges" ADD CONSTRAINT "conges_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conges" ADD CONSTRAINT "conges_typeCongeId_fkey" FOREIGN KEY ("typeCongeId") REFERENCES "types_conge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
