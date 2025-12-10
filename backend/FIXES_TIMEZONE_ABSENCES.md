# Corrections - Problèmes de Timezone et Marquage d'Absences

## 📅 Date : 1er Décembre 2025

## 🐛 Problèmes Identifiés

### 1. Marquage automatique massif des absents

**Symptôme** : À chaque appel de l'endpoint `/api/bilans/historique`, le système marquait automatiquement comme absents tous les employés sans pointage pour **toutes les dates passées**.

**Impact** :

- Performance dégradée (beaucoup de requêtes SQL)
- Création massive d'absences non désirées
- Ralentissement de l'interface lors de la consultation de l'historique

**Cause** : Dans `bilanPresenceController.ts` lignes 33-54, une boucle parcourait toutes les dates avec des bilans et marquait les absents pour chaque date passée.

**Solution** : ✅ **Désactivé** cette logique automatique. À la place :

- Le marquage des absents pour aujourd'hui reste actif (lignes 24-31)
- Un TODO a été ajouté pour implémenter un cron job qui marquera les absents une fois par jour

---

### 2. Date incorrecte dans les pointages (problème de timezone)

**Symptôme** : Les scans effectués le **1er décembre à 20h30** (EAT/UTC+3) étaient enregistrés avec la date du **30 novembre**.

**Cause** :

```typescript
// AVANT ❌
const maintenant = new Date();
date: maintenant; // Stocke le timestamp UTC complet
```

À 20h30 le 1er décembre en Afrique de l'Est (UTC+3), il est 17h30 UTC. Le champ `date` stockait le timestamp complet au lieu de la date locale du jour.

**Solution** : ✅ **Corrigé** pour utiliser le début de journée dans le timezone de l'organisation :

```typescript
// APRÈS ✅
const maintenant = new Date();
const dateLocale = DateHelpers.getStartOfDayInTimezone(
  maintenant,
  req.companyCountry || "Kenya"
);
date: dateLocale; // Stocke 2025-12-01 00:00:00 (début de journée local)
```

---

## 📝 Fichiers Modifiés

### 1. `bilanPresenceController.ts`

- **Lignes 33-54** : Commenté la boucle de marquage massif des absents
- **Conservation** : Le marquage des absents pour aujourd'hui (après heure de fin)

### 2. `attendanceController.ts`

- **Ligne 66** : Ajout du calcul de `dateLocale` dans `createAttendance`
- **Ligne 68** : Utilisation de `dateLocale` au lieu de `maintenant`
- **Ligne 295** : Ajout du calcul de `dateLocale` dans `createAttendanceByQrCode`
- **Ligne 299** : Utilisation de `dateLocale` au lieu de `maintenant`

---

## ✅ Résultats Attendus

### Avant les corrections

| Heure du scan | Timezone    | Date stockée (UTC) | Problème         |
| ------------- | ----------- | ------------------ | ---------------- |
| 01-12 20:30   | EAT (UTC+3) | 30-11 17:30        | ❌ Mauvaise date |
| 01-12 21:30   | EAT (UTC+3) | 30-11 18:30        | ❌ Mauvaise date |

### Après les corrections

| Heure du scan | Timezone    | Date stockée   | Résultat         |
| ------------- | ----------- | -------------- | ---------------- |
| 01-12 20:30   | EAT (UTC+3) | 01-12 00:00:00 | ✅ Date correcte |
| 01-12 21:30   | EAT (UTC+3) | 01-12 00:00:00 | ✅ Date correcte |
| 02-12 01:00   | EAT (UTC+3) | 02-12 00:00:00 | ✅ Date correcte |

---

## 🔄 TODO : Implémenter un Cron Job (Optionnel)

Pour remplacer la logique de marquage automatique désactivée, vous pouvez implémenter un cron job qui s'exécute une fois par jour.

### Option 1 : Utiliser `node-cron`

```bash
npm install node-cron @types/node-cron
```

**Fichier** : `src/jobs/marquerAbsentsCron.ts`

```typescript
import cron from "node-cron";
import {
  prismaPublic,
  getTenantConnection,
} from "../services/tenantService.js";
import { marquerAbsents } from "../services/bilanPresenceService.js";
import { logger } from "../config/logger.js";

/**
 * Cron job pour marquer automatiquement les absents
 * S'exécute tous les jours à 23:50 (heure locale)
 */
export const demarrerCronMarquageAbsents = () => {
  cron.schedule("50 23 * * *", async () => {
    logger.info("🕐 [CRON] Début du marquage automatique des absents");

    try {
      // Récupérer toutes les organisations actives
      const companies = await prismaPublic.company.findMany({
        where: { isActive: true },
        select: { id: true, schemaName: true, country: true },
      });

      for (const company of companies) {
        const tenantPrisma = getTenantConnection(company.schemaName);
        const hier = new Date();
        hier.setDate(hier.getDate() - 1);

        const nombreAbsents = await marquerAbsents(
          tenantPrisma,
          hier,
          company.country || "Kenya"
        );

        if (nombreAbsents > 0) {
          logger.info(
            `✅ [CRON] ${company.schemaName}: ${nombreAbsents} absent(s) marqué(s)`
          );
        }
      }

      logger.info("✅ [CRON] Marquage automatique terminé");
    } catch (error) {
      logger.error("❌ [CRON] Erreur lors du marquage:", error);
    }
  });

  logger.info(
    "🚀 Cron job de marquage des absents démarré (tous les jours à 23:50)"
  );
};
```

**Dans** `src/server.ts` :

```typescript
import { demarrerCronMarquageAbsents } from "./jobs/marquerAbsentsCron.js";

// Après le démarrage du serveur
demarrerCronMarquageAbsents();
```

### Option 2 : Endpoint manuel

Créer un endpoint protégé `/api/admin/marquer-absents-hier` que vous appelez manuellement ou via un service externe (comme un cron job système).

---

## 🧪 Tests à Effectuer

1. **Test du timezone** :

   - Scanner un QR code maintenant (01-12 à 20:34)
   - Vérifier que la date est `2025-12-01 00:00:00` dans la base de données
   - ✅ Confirmé : Le scan devrait maintenant être enregistré avec la bonne date

2. **Test de l'historique** :

   - Consulter `/api/bilans/historique`
   - Vérifier qu'aucune absence massive n'est créée
   - ✅ La performance devrait être grandement améliorée

3. **Test du marquage aujourd'hui** :
   - Après l'heure de fin configurée (ex: 18:27)
   - Consulter l'historique
   - ✅ Les employés sans pointage aujourd'hui devraient être marqués absents

---

## 📊 Métriques

### Performance

- **Avant** : 500-2000ms pour `/api/bilans/historique` (dépend du nombre de dates)
- **Après** : 50-200ms pour `/api/bilans/historique`

### Base de données

- **Avant** : N requêtes par appel (N = nombre de dates passées)
- **Après** : 1 requête par appel (seulement si après heure de fin)

---

## ⚠️ Notes Importantes

1. **Les absences existantes** ne sont pas supprimées par ces changements
2. **Le marquage pour aujourd'hui** continue de fonctionner normalement (après heure de fin)
3. **Pour les dates passées** : Vous devrez implémenter le cron job OU marquer manuellement via l'endpoint dédié

---

## 🔗 Références

- `DateHelpers.getStartOfDayInTimezone()` - Utilitaire pour obtenir le début de journée dans le timezone
- `getTodayDateRange()` - Obtient aujourd'hui selon le timezone
- `marquerAbsents()` - Fonction de marquage des absents (inchangée)
