-- CreateEnum
CREATE TYPE "StatutCaisse" AS ENUM ('ACTIVE', 'INACTIVE', 'EN_MAINTENANCE');

-- CreateEnum
CREATE TYPE "StatutSessionCaisse" AS ENUM ('OUVERTE', 'FERMEE', 'SUSPENDUE');

-- AlterTable
ALTER TABLE "ventes" ADD COLUMN     "session_caisse_id" TEXT;

-- CreateTable
CREATE TABLE "caisses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "magasin_id" TEXT NOT NULL,
    "statut" "StatutCaisse" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caisses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions_caisse" (
    "id" TEXT NOT NULL,
    "caisse_id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "fond_initial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fond_final" DOUBLE PRECISION,
    "total_especes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_carte" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_mobile" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_cheque" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_autre" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ecart" DOUBLE PRECISION,
    "statut" "StatutSessionCaisse" NOT NULL DEFAULT 'OUVERTE',
    "date_ouverture" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fermeture" TIMESTAMP(3),
    "notes_ouverture" TEXT,
    "notes_fermeture" TEXT,

    CONSTRAINT "sessions_caisse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "caisses_magasin_id_idx" ON "caisses"("magasin_id");

-- CreateIndex
CREATE UNIQUE INDEX "caisses_magasin_id_code_key" ON "caisses"("magasin_id", "code");

-- CreateIndex
CREATE INDEX "sessions_caisse_caisse_id_idx" ON "sessions_caisse"("caisse_id");

-- CreateIndex
CREATE INDEX "sessions_caisse_utilisateur_id_idx" ON "sessions_caisse"("utilisateur_id");

-- CreateIndex
CREATE INDEX "sessions_caisse_date_ouverture_idx" ON "sessions_caisse"("date_ouverture");

-- CreateIndex
CREATE INDEX "ventes_session_caisse_id_idx" ON "ventes"("session_caisse_id");

-- AddForeignKey
ALTER TABLE "caisses" ADD CONSTRAINT "caisses_magasin_id_fkey" FOREIGN KEY ("magasin_id") REFERENCES "magasins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions_caisse" ADD CONSTRAINT "sessions_caisse_caisse_id_fkey" FOREIGN KEY ("caisse_id") REFERENCES "caisses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions_caisse" ADD CONSTRAINT "sessions_caisse_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "tenant_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_session_caisse_id_fkey" FOREIGN KEY ("session_caisse_id") REFERENCES "sessions_caisse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
