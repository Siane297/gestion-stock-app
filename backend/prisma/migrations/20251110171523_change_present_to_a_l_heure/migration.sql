-- Migration pour changer PRESENT en A_L_HEURE et rendre toleranceRetardMinutes optionnel

-- Étape 1: Créer le nouvel enum avec A_L_HEURE
CREATE TYPE "StatutPointage_new" AS ENUM ('A_L_HEURE', 'EN_RETARD', 'ABSENT', 'INCOMPLET');

-- Étape 2: Mettre à jour toutes les valeurs PRESENT en A_L_HEURE dans bilanPresence
ALTER TABLE "bilans_presence" 
  ALTER COLUMN "statut" TYPE "StatutPointage_new" 
  USING (
    CASE 
      WHEN "statut"::text = 'PRESENT' THEN 'A_L_HEURE'::text
      ELSE "statut"::text
    END
  )::"StatutPointage_new";

-- Étape 3: Supprimer l'ancien enum
DROP TYPE "StatutPointage";

-- Étape 4: Renommer le nouvel enum
ALTER TYPE "StatutPointage_new" RENAME TO "StatutPointage";

-- Étape 5: Rendre toleranceRetardMinutes optionnel (nullable)
ALTER TABLE "configurations_horaire" ALTER COLUMN "toleranceRetardMinutes" DROP NOT NULL;
ALTER TABLE "configurations_horaire" ALTER COLUMN "toleranceRetardMinutes" DROP DEFAULT;
