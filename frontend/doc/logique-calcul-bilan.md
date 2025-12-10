# 📊 Logique de Calcul des Bilans de Présence

## 🎯 Vue d'ensemble

Ce document explique en détail la logique de calcul des bilans de présence, incluant la détection des retards, le calcul de la durée de travail effective, et la gestion des horaires traversant minuit.

---

## 📋 Configuration Horaire

Chaque organisation définit une configuration horaire avec les paramètres suivants :

| Paramètre | Description | Format | Exemple |
|-----------|-------------|--------|---------|
| `heureDebut` | Heure de début de travail | HH:MM | 08:00 |
| `heureFin` | Heure de fin de travail | HH:MM | 17:00 |
| `heureDebutPause` | Début de la pause | HH:MM | 12:00 |
| `heureFinPause` | Fin de la pause | HH:MM | 14:00 |
| `toleranceRetardMinutes` | Tolérance de retard en minutes | Number | 30 |

---

## 🌍 Gestion des Timezones

### Principe
Tous les timestamps sont stockés en **UTC** dans la base de données, mais les calculs se font dans le **timezone local** du **pays de l'organisation**. Cette gestion automatique permet au système de fonctionner correctement peu importe où le serveur est hébergé.

### Détermination du Fuseau Horaire
Le fuseau horaire est déterminé automatiquement selon le pays sélectionné lors de la création de l'organisation :

```typescript
// Récupération du pays depuis req.companyCountry (middleware tenantMiddleware)
const organizationCountry = req.companyCountry || 'Kenya'; // Fallback
const timezone = getTimezoneByCountry(organizationCountry);
// Exemple : 'Comoros' → 'Indian/Comoro' (UTC+3)
//          'France' → 'Europe/Paris' (UTC+1)
```

### Conversion Automatique
```typescript
// Exemple : Organisation aux Comoros (UTC+3)
Timestamp UTC: 2025-11-14T14:48:00.000Z
Heure locale Comoros: 17:48 (Indian/Comoro Time)

// Le système convertit automatiquement pour tous les calculs
const dateEnMinutes = (date: Date): number => {
  const localTime = date.toLocaleString('en-US', { 
    timeZone: timezone,  // Automatiquement déterminé : 'Indian/Comoro'
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
  const [hours, minutes] = localTime.split(':').map(Number);
  return hours * 60 + minutes;
};
```

### Avantages de cette Approche
- ✅ **Serveur en France, Organisation aux Comoros** : Fonctionne parfaitement
- ✅ **Serveur aux USA, Organisation au Kenya** : Calculs corrects
- ✅ **Déploiement global** : Aucune configuration manuelle nécessaire
- ✅ **Multi-tenant** : Chaque organisation utilise son fuseau horaire

---

## ⏰ Calcul du Retard

### Règles
1. **Limite de tolérance** = `heureDebut` + `toleranceRetardMinutes`
2. Si l'employé arrive **après** la limite de tolérance → **EN_RETARD**
3. Si l'employé arrive **entre** `heureDebut` et la limite → **PRESENT** (dans la tolérance)
4. Si l'employé arrive **avant** `heureDebut` → **PRESENT** (à l'heure)

### Formule
```typescript
limiteTolerance = heureDebutMin + toleranceMin

if (heureArrivee > limiteTolerance) {
  retardMinutes = heureArrivee - limiteTolerance
  statut = 'EN_RETARD'
} else if (heureArrivee > heureDebutMin) {
  statut = 'PRESENT' // Dans la tolérance
} else {
  statut = 'PRESENT' // À l'heure
}
```

### Exemple
```
Configuration:
- heureDebut: 08:00
- toleranceRetardMinutes: 20

Cas 1: Arrivée à 07:50 → PRESENT (à l'heure)
Cas 2: Arrivée à 08:15 → PRESENT (dans la tolérance, 15 min < 20 min)
Cas 3: Arrivée à 08:30 → EN_RETARD (retard de 10 minutes)
  Calcul: 08:30 - (08:00 + 20) = 08:30 - 08:20 = 10 minutes
```

---

## 🕐 Calcul de la Durée de Travail

### Principe Fondamental
La durée de travail se calcule **uniquement** dans les plages suivantes :
- **Période du matin** : de `heureDebut` à `heureDebutPause`
- **Période de l'après-midi** : de `heureFinPause` à `heureFin`

⚠️ **La période de pause n'est JAMAIS comptée comme temps de travail.**

### Algorithme

#### 1. Période du Matin
```typescript
debutTravailMatin = Math.max(heureArrivee, heureDebut)
finTravailMatin = Math.min(heureSortie, heureDebutPause)

if (finTravailMatin > debutTravailMatin) {
  dureeTravailMatin = finTravailMatin - debutTravailMatin
} else {
  dureeTravailMatin = 0
}
```

#### 2. Période de l'Après-midi
```typescript
debutTravailApresMidi = Math.max(heureArrivee, heureFinPause)
finTravailApresMidi = Math.min(heureSortie, heureFin)

if (finTravailApresMidi > debutTravailApresMidi) {
  dureeTravailApresMidi = finTravailApresMidi - debutTravailApresMidi
} else {
  dureeTravailApresMidi = 0
}
```

#### 3. Durée Totale
```typescript
dureeTravailMinutes = dureeTravailMatin + dureeTravailApresMidi
```

### Cas Particuliers

#### Cas 1 : Employé quitte avant la pause
```
Configuration: 08:00-17:00, pause 12:00-14:00
Arrivée: 08:00, Sortie: 11:30

Matin: 08:00 → 11:30 = 3h30
Après-midi: 0 (pas travaillé)
Total: 3h30
```

#### Cas 2 : Employé arrive pendant la pause
```
Configuration: 08:00-17:00, pause 12:00-14:00
Arrivée: 13:00, Sortie: 17:00

Matin: 0 (arrivé après le début de la pause)
Après-midi: 14:00 → 17:00 = 3h00
Total: 3h00
```

#### Cas 3 : Employé part pendant la pause
```
Configuration: 08:00-17:00, pause 12:00-14:00
Arrivée: 08:00, Sortie: 13:00

Matin: 08:00 → 12:00 = 4h00
Après-midi: 0 (parti avant la fin de la pause)
Total: 4h00
```

---

## 🌙 Gestion des Horaires de Nuit

### Détection
Un horaire traverse minuit si `heureFin < heureDebut`.

```typescript
traverseMinuit = heureFinMin < heureDebutMin
// Exemple: 22:00-06:00 → true
```

### Ajustement des heures
Pour les horaires de nuit, on ajoute 24h (1440 minutes) aux heures après minuit :

```typescript
if (traverseMinuit) {
  // Si l'arrivée est après minuit (< heureDebut), ajouter 24h
  if (heureArriveeMin < heureDebutMin) {
    heureArriveeAjustee = heureArriveeMin + 1440
  }
  
  // Même logique pour la sortie et les pauses
  if (heureSortieMin < heureDebutMin) {
    heureSortieAjustee = heureSortieMin + 1440
  }
}
```

### Exemple
```
Configuration: 22:00-06:00, pause 00:00-02:00

Conversion en minutes:
- heureDebut: 22:00 = 1320 min
- heureFin: 06:00 = 360 min
- traverseMinuit = true (360 < 1320)

Arrivée: 23:00 = 1380 min → Pas d'ajustement (>= 1320)
Sortie: 05:00 = 300 min → Ajusté à 300 + 1440 = 1740 min

Durée: 1740 - 1380 = 360 minutes = 6h00
```

---

## 📊 Exemple Complet

### Configuration
```json
{
  "heureDebut": "08:00",
  "heureFin": "17:00",
  "heureDebutPause": "12:00",
  "heureFinPause": "14:00",
  "toleranceRetardMinutes": 20
}
```

### Cas d'un employé
```json
{
  "heureArrivee": "08:40",
  "heureSortie": "17:00"
}
```

### Calculs

#### 1. Conversion en minutes
```
heureDebut = 08:00 = 480 min
heureFin = 17:00 = 1020 min
heureDebutPause = 12:00 = 720 min
heureFinPause = 14:00 = 840 min
heureArrivee = 08:40 = 520 min
heureSortie = 17:00 = 1020 min
tolerance = 20 min
```

#### 2. Calcul du retard
```
limiteTolerance = 480 + 20 = 500 min (08:20)
heureArrivee = 520 min (08:40)

520 > 500 → EN_RETARD
retardMinutes = 520 - 500 = 20 minutes
```

#### 3. Calcul de la durée de travail

**Période du matin :**
```
debutTravailMatin = max(520, 480) = 520 (08:40)
finTravailMatin = min(1020, 720) = 720 (12:00)
dureeTravailMatin = 720 - 520 = 200 minutes (3h20)
```

**Période de l'après-midi :**
```
debutTravailApresMidi = max(520, 840) = 840 (14:00)
finTravailApresMidi = min(1020, 1020) = 1020 (17:00)
dureeTravailApresMidi = 1020 - 840 = 180 minutes (3h00)
```

**Total :**
```
dureeTravailMinutes = 200 + 180 = 380 minutes = 6h20
```

#### 4. Résultat final
```json
{
  "statut": "EN_RETARD",
  "retardMinutes": 20,
  "dureeTravailMinutes": 380,
  "notes": "Retard: 20min"
}
```

---

## 🎯 Règles Importantes

### ✅ À Retenir
1. **Le retard n'affecte PAS la durée de travail** : même en retard, on compte le temps effectivement travaillé
2. **La pause n'est JAMAIS comptée** : peu importe si l'employé est présent pendant la pause
3. **Les calculs se font en heure locale** : conversion automatique depuis UTC
4. **Les horaires de nuit sont supportés** : ajustement automatique des heures

### ❌ Erreurs Courantes
1. Ne pas soustraire le retard de la durée de travail
2. Compter la période de pause comme temps de travail
3. Oublier de convertir les timestamps UTC en heure locale du pays de l'organisation
4. Ne pas gérer les horaires traversant minuit
5. Utiliser l'heure du serveur au lieu de l'heure du pays de l'organisation

---

## 🔧 Maintenance

### Modification de la logique
Le code source se trouve dans : `pointage-back/src/services/bilanPresenceService.ts`

### Tests
Pour tester la logique, utilisez l'endpoint de maintenance :
```bash
POST /api/maintenance/regenerate-bilans
```

### Logs
Les logs détaillés sont disponibles dans la console du serveur avec les préfixes :
- `🕒` : Heures converties
- `⏰` : Calcul de retard
- `🌅` : Période du matin
- `🌆` : Période de l'après-midi
- `📊` : Durée totale

---

## 📚 Références

### Services Backend
- **Service principal** : `pointage-back/src/services/bilanPresenceService.ts`
- **Service horaires** : `pointage-back/src/services/horaireService.ts`
- **Utilitaires dates** : `pointage-back/src/utils/dateUtils.ts`
- **Gestion des timezones** : `pointage-back/src/utils/countryTimezone.ts`

### Contrôleurs
- **Stats quotidiennes** : `pointage-back/src/controllers/statsController.ts`
- **Graphiques** : `pointage-back/src/controllers/chartsController.ts`
- **Bilans** : `pointage-back/src/controllers/bilanPresenceController.ts`

### Configuration
- **Modèle de données** : `pointage-back/prisma/schema.prisma` (BilanPresence)
- **Middleware tenant** : `pointage-back/src/middleware/tenantMiddleware.ts`
- **Configuration pays** : Sélection lors de l'inscription organisation

---

*Dernière mise à jour : 2025-11-14*
