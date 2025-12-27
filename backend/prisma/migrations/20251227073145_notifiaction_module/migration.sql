-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('VENTE_NOUVELLE', 'VENTE_IMPORTANTE', 'ACHAT_NOUVELLE_COMMANDE', 'ACHAT_RECEPTION_PARTIELLE', 'ACHAT_RECEPTION_COMPLETE', 'STOCK_FAIBLE', 'STOCK_RUPTURE', 'INVENTAIRE_NOUVEAU', 'INVENTAIRE_VALIDE', 'SYSTEME_INFO', 'SYSTEME_ALERTE');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "TypeNotification" NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "destinataire_id" TEXT,
    "emetteur_id" TEXT,
    "est_lue" BOOLEAN NOT NULL DEFAULT false,
    "date_lecture" TIMESTAMP(3),
    "metadata" JSONB,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_destinataire_id_est_lue_idx" ON "notifications"("destinataire_id", "est_lue");

-- CreateIndex
CREATE INDEX "notifications_date_creation_idx" ON "notifications"("date_creation");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_destinataire_id_fkey" FOREIGN KEY ("destinataire_id") REFERENCES "tenant_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_emetteur_id_fkey" FOREIGN KEY ("emetteur_id") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
