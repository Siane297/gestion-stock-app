-- CreateEnum
CREATE TYPE "StatutAchat" AS ENUM ('COMMANDE', 'RECU_PARTIELLEMENT', 'RECU_COMPLET', 'FACTURE_RECU', 'PAYE', 'ANNULE');

-- CreateEnum
CREATE TYPE "UniteProduit" AS ENUM ('UNITE', 'KG', 'LITRE', 'METRE', 'PAQUET', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeMouvementStock" AS ENUM ('ENTREE_ACHAT', 'ENTREE_RETOUR', 'SORTIE_VENTE', 'SORTIE_PERISSABLE', 'AJUSTEMENT', 'TRANSFERT');

-- CreateEnum
CREATE TYPE "StatutVente" AS ENUM ('BROUILLON', 'EN_ATTENTE', 'PAYEE', 'ANNULEE', 'REMBOURSEE');

-- CreateEnum
CREATE TYPE "MethodePaiement" AS ENUM ('ESPECES', 'MOBILE_MONEY', 'CARTE', 'CHEQUE', 'VIREMENT', 'AUTRE');

-- AlterTable
ALTER TABLE "tenant_users" ADD COLUMN     "role_stock_id" TEXT;

-- CreateTable
CREATE TABLE "achats" (
    "id" TEXT NOT NULL,
    "magasin_id" TEXT NOT NULL,
    "fournisseur_id" TEXT NOT NULL,
    "numero_commande" TEXT,
    "montant_total" DOUBLE PRECISION NOT NULL,
    "montant_tva" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "statut" "StatutAchat" NOT NULL,
    "date_commande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_livraison_prevue" TIMESTAMP(3),
    "date_livraison_reelle" TIMESTAMP(3),
    "notes" TEXT,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achats_details" (
    "id" TEXT NOT NULL,
    "achat_id" TEXT NOT NULL,
    "produit_id" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prix_unitaire" DOUBLE PRECISION NOT NULL,
    "prix_total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "achats_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "table_cible" TEXT NOT NULL,
    "enregistrement_id" TEXT NOT NULL,
    "ancienne_valeur" TEXT,
    "nouvelle_valeur" TEXT,
    "ip_adresse" TEXT,
    "user_agent" TEXT,
    "date_action" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "solde_credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "limite_credit" DOUBLE PRECISION,
    "est_actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "responsable" TEXT,
    "delai_livraison" INTEGER,
    "est_actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magasins" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "localisation" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "gerant_id" TEXT,
    "heure_ouverture" TEXT,
    "heure_fermeture" TEXT,
    "est_actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "magasins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories_produit" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_produit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits" (
    "id" TEXT NOT NULL,
    "code_barre" TEXT,
    "categorie_id" TEXT,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "prix_achat" DOUBLE PRECISION,
    "prix_vente" DOUBLE PRECISION NOT NULL,
    "unite" "UniteProduit" NOT NULL DEFAULT 'UNITE',
    "marge_min_pourcent" DOUBLE PRECISION,
    "est_actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historique_prix" (
    "id" TEXT NOT NULL,
    "produit_id" TEXT NOT NULL,
    "ancien_prix" DOUBLE PRECISION NOT NULL,
    "nouveau_prix" DOUBLE PRECISION NOT NULL,
    "raison" TEXT,
    "date_change" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historique_prix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocks_magasin" (
    "id" TEXT NOT NULL,
    "magasin_id" TEXT NOT NULL,
    "produit_id" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 0,
    "quantite_minimum" INTEGER NOT NULL DEFAULT 0,
    "quantite_maximum" INTEGER,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocks_magasin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvements_stock" (
    "id" TEXT NOT NULL,
    "magasin_id" TEXT NOT NULL,
    "produit_id" TEXT NOT NULL,
    "utilisateur_id" TEXT,
    "type" "TypeMouvementStock" NOT NULL,
    "quantite" INTEGER NOT NULL,
    "vente_id" TEXT,
    "achat_id" TEXT,
    "raison" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mouvements_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "est_actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "groupe" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_roles" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "permission_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventes" (
    "id" TEXT NOT NULL,
    "magasin_id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "client_id" TEXT,
    "montant_total" DOUBLE PRECISION NOT NULL,
    "montant_remise" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "montant_tva" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "statut" "StatutVente" NOT NULL,
    "methode_paiement" "MethodePaiement" NOT NULL,
    "notes" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ventes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventes_details" (
    "id" TEXT NOT NULL,
    "vente_id" TEXT NOT NULL,
    "produit_id" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prix_unitaire" DOUBLE PRECISION NOT NULL,
    "remise" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "prix_total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ventes_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factures" (
    "id" TEXT NOT NULL,
    "vente_id" TEXT NOT NULL,
    "numero_facture" TEXT NOT NULL,
    "montant_ht" DOUBLE PRECISION NOT NULL,
    "montant_tva" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "montant_ttc" DOUBLE PRECISION NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'VALIDEE',
    "date_emission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_echeance" TIMESTAMP(3),
    "pdf_url" TEXT,
    "notes" TEXT,

    CONSTRAINT "factures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achats_numero_commande_key" ON "achats"("numero_commande");

-- CreateIndex
CREATE INDEX "achats_fournisseur_id_idx" ON "achats"("fournisseur_id");

-- CreateIndex
CREATE INDEX "achats_date_commande_idx" ON "achats"("date_commande");

-- CreateIndex
CREATE INDEX "audit_logs_utilisateur_id_idx" ON "audit_logs"("utilisateur_id");

-- CreateIndex
CREATE INDEX "audit_logs_table_cible_idx" ON "audit_logs"("table_cible");

-- CreateIndex
CREATE INDEX "audit_logs_date_action_idx" ON "audit_logs"("date_action");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE INDEX "clients_telephone_idx" ON "clients"("telephone");

-- CreateIndex
CREATE INDEX "clients_email_idx" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_produit_nom_key" ON "categories_produit"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "produits_code_barre_key" ON "produits"("code_barre");

-- CreateIndex
CREATE INDEX "stocks_magasin_magasin_id_idx" ON "stocks_magasin"("magasin_id");

-- CreateIndex
CREATE INDEX "stocks_magasin_produit_id_idx" ON "stocks_magasin"("produit_id");

-- CreateIndex
CREATE UNIQUE INDEX "stocks_magasin_magasin_id_produit_id_key" ON "stocks_magasin"("magasin_id", "produit_id");

-- CreateIndex
CREATE INDEX "mouvements_stock_magasin_id_produit_id_idx" ON "mouvements_stock"("magasin_id", "produit_id");

-- CreateIndex
CREATE INDEX "mouvements_stock_date_creation_idx" ON "mouvements_stock"("date_creation");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nom_key" ON "roles"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "permissions_groupe_idx" ON "permissions"("groupe");

-- CreateIndex
CREATE UNIQUE INDEX "permission_roles_role_id_permission_id_key" ON "permission_roles"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "ventes_magasin_id_idx" ON "ventes"("magasin_id");

-- CreateIndex
CREATE INDEX "ventes_utilisateur_id_idx" ON "ventes"("utilisateur_id");

-- CreateIndex
CREATE INDEX "ventes_client_id_idx" ON "ventes"("client_id");

-- CreateIndex
CREATE INDEX "ventes_date_creation_idx" ON "ventes"("date_creation");

-- CreateIndex
CREATE UNIQUE INDEX "factures_vente_id_key" ON "factures"("vente_id");

-- CreateIndex
CREATE UNIQUE INDEX "factures_numero_facture_key" ON "factures"("numero_facture");

-- CreateIndex
CREATE INDEX "factures_numero_facture_idx" ON "factures"("numero_facture");

-- AddForeignKey
ALTER TABLE "achats" ADD CONSTRAINT "achats_magasin_id_fkey" FOREIGN KEY ("magasin_id") REFERENCES "magasins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achats" ADD CONSTRAINT "achats_fournisseur_id_fkey" FOREIGN KEY ("fournisseur_id") REFERENCES "fournisseurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achats_details" ADD CONSTRAINT "achats_details_achat_id_fkey" FOREIGN KEY ("achat_id") REFERENCES "achats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achats_details" ADD CONSTRAINT "achats_details_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "tenant_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magasins" ADD CONSTRAINT "magasins_gerant_id_fkey" FOREIGN KEY ("gerant_id") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produits" ADD CONSTRAINT "produits_categorie_id_fkey" FOREIGN KEY ("categorie_id") REFERENCES "categories_produit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique_prix" ADD CONSTRAINT "historique_prix_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks_magasin" ADD CONSTRAINT "stocks_magasin_magasin_id_fkey" FOREIGN KEY ("magasin_id") REFERENCES "magasins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks_magasin" ADD CONSTRAINT "stocks_magasin_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_magasin_id_fkey" FOREIGN KEY ("magasin_id") REFERENCES "magasins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_roles" ADD CONSTRAINT "permission_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_roles" ADD CONSTRAINT "permission_roles_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_role_stock_id_fkey" FOREIGN KEY ("role_stock_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_magasin_id_fkey" FOREIGN KEY ("magasin_id") REFERENCES "magasins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "tenant_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes_details" ADD CONSTRAINT "ventes_details_vente_id_fkey" FOREIGN KEY ("vente_id") REFERENCES "ventes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes_details" ADD CONSTRAINT "ventes_details_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_vente_id_fkey" FOREIGN KEY ("vente_id") REFERENCES "ventes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
