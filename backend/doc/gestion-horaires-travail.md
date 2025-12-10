# 🕐 Gestion des Horaires de Travail

## 📋 Vue d'ensemble

Ce système permet de :
- ✅ **Configurer les horaires de travail** (heure de début, heure de fin, durée de pause)
- ✅ **Définir des tolérances** (retard acceptable, avance)
- ✅ **Contrôler les pointages** (1 entrée + 1 sortie maximum par jour)
- ✅ **Calculer automatiquement** le statut (EN_AVANCE, A_L_HEURE, EN_RETARD)
- ✅ **Calculer la durée de travail** (entrée - sortie - pause)

---

## 🗄️ Modèle de données

### 1. ConfigurationHoraire

```prisma
model ConfigurationHoraire {
  id                    String   @id @default(uuid())
  
  // Horaires de travail
  heureDebut            String   // Format "HH:mm" ex: "08:00"
  heureFin              String   // Format "HH:mm" ex: "17:00"
  
  // Pause
  dureePauseMinutes     Int      @default(60) // Durée de la pause en minutes
  
  // Tolérances
  toleranceRetardMinutes Int     @default(30) // Tolérance après l'heure de début
  toleranceAvanceMinutes Int     @default(30) // Tolérance avant l'heure de début
  
  // Métadonnées
  isActive              Boolean  @default(true)
  description           String?
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

**Exemple de configuration :**
```json
{
  "heureDebut": "08:00",
  "heureFin": "17:00",
  "dureePauseMinutes": 60,
  "toleranceRetardMinutes": 30,
  "toleranceAvanceMinutes": 30,
  "description": "Horaires standard"
}
```

**Interprétation :**
- L'employé doit arriver entre **7h30** (08:00 - 30 min) et **8h30** (08:00 + 30 min) pour être "À L'HEURE"
- Avant **7h30** → EN_AVANCE
- Après **8h30** → EN_RETARD
- Durée de travail = (17:00 - 08:00) - 60 min = **8 heures**

---

### 2. Attendance (modifié)

```prisma
model Attendance {
  id         String          @id @default(uuid())
  employeeId String
  type       AttendanceType  // ENTREE ou SORTIE
  timestamp  DateTime        @default(now())
  date       DateTime        @db.Date // Date du pointage
  location   String?
  notes      String?
  
  // Statut (calculé automatiquement pour ENTREE)
  statut     StatutPointage? // EN_AVANCE, A_L_HEURE, EN_RETARD
  
  // Durée de travail (calculée après SORTIE)
  dureeTravailMinutes Int?   // Durée totale en minutes
  
  employee   Employee        @relation(fields: [employeeId], references: [id])
  
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt
}

enum StatutPointage {
  EN_AVANCE
  A_L_HEURE
  EN_RETARD
}
```

---

## 🛠️ Services créés

### `horaireService.ts`

**Fonctions principales :**

| Fonction | Description |
|----------|-------------|
| `calculerStatutEntree()` | Calcule le statut d'un pointage d'entrée |
| `verifierPointageExistant()` | Vérifie si un pointage du même type existe déjà aujourd'hui |
| `calculerDureeTravail()` | Calcule la durée de travail (entrée - sortie - pause) |
| `mettreAJourDureeTravail()` | Met à jour la durée après enregistrement de la sortie |
| `obtenirResumePointage()` | Résumé des pointages d'un employé pour une date |

**Exemple d'utilisation :**
```typescript
// Calculer le statut d'une entrée
const statut = await calculerStatutEntree("08:15"); // A_L_HEURE

// Vérifier si l'employé a déjà pointé
const existe = await verifierPointageExistant(employeeId, "ENTREE"); // false

// Calculer la durée de travail
const duree = await calculerDureeTravail(employeeId, new Date()); // 480 minutes (8h)
```

---

## 🎯 Logique implémentée

### 1. Contrôle des pointages

**Règle :** 1 entrée + 1 sortie maximum par jour

```typescript
// Lors d'un scan QR
const pointageExiste = await verifierPointageExistant(employeeId, type);

if (pointageExiste) {
  return {
    success: false,
    message: "Un pointage de type ENTREE a déjà été enregistré aujourd'hui"
  };
}
```

### 2. Calcul automatique du statut

**Pour une ENTREE uniquement :**

```typescript
const heurePointage = "08:45"; // Heure du pointage
const statut = await calculerStatutEntree(heurePointage);
// Résultat: EN_RETARD (car 08:45 > 08:30)
```

**Diagramme de décision :**
```
Heure de début: 08:00
Tolérance avance: 30 min
Tolérance retard: 30 min

├─ < 07:30 → EN_AVANCE
├─ 07:30 - 08:30 → A_L_HEURE
└─ > 08:30 → EN_RETARD
```

### 3. Calcul de la durée de travail

**Après une SORTIE :**

```typescript
// Exemple:
// Entrée: 08:15
// Sortie: 17:30
// Pause: 60 minutes

const dureeMinutes = (17:30 - 08:15) - 60
// = 555 minutes - 60 minutes
// = 495 minutes (8h15)
```

---

## 🌐 API Routes

### Configuration Horaire

| Méthode | Route | Description |
|---------|-------|-------------|
| **GET** | `/api/configurations-horaire/active` | Récupérer la configuration active |
| **GET** | `/api/configurations-horaire` | Lister toutes les configurations |
| **POST** | `/api/configurations-horaire` | Créer une nouvelle configuration |
| **PUT** | `/api/configurations-horaire/:id` | Modifier une configuration |
| **DELETE** | `/api/configurations-horaire/:id` | Supprimer une configuration |

### Exemples de requêtes

**Créer une configuration :**
```bash
POST /api/configurations-horaire
Content-Type: application/json

{
  "heureDebut": "08:00",
  "heureFin": "17:00",
  "dureePauseMinutes": 60,
  "toleranceRetardMinutes": 30,
  "toleranceAvanceMinutes": 30,
  "description": "Horaires standard"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Configuration créée avec succès",
  "data": {
    "id": "uuid...",
    "heureDebut": "08:00",
    "heureFin": "17:00",
    "dureePauseMinutes": 60,
    "toleranceRetardMinutes": 30,
    "toleranceAvanceMinutes": 30,
    "isActive": true,
    "createdAt": "2025-11-05T..."
  }
}
```

---

## 🔄 Flux de pointage

### Scénario complet

**1. Configuration initiale (Admin)**
```json
{
  "heureDebut": "08:00",
  "heureFin": "17:00",
  "dureePauseMinutes": 60,
  "toleranceRetardMinutes": 30
}
```

**2. Pointage ENTREE (Employé à 08:10)**
```bash
POST /api/attendance/scan
{
  "qrCode": "employee-qr-code",
  "type": "ENTREE"
}
```

**Résultat automatique :**
```json
{
  "id": "...",
  "employeeId": "...",
  "type": "ENTREE",
  "timestamp": "2025-11-05T08:10:00Z",
  "date": "2025-11-05",
  "statut": "A_L_HEURE",  // ← Calculé automatiquement
  "dureeTravailMinutes": null
}
```

**3. Tentative de 2ème ENTREE (Bloquée)**
```bash
POST /api/attendance/scan
{
  "qrCode": "employee-qr-code",
  "type": "ENTREE"
}
```

**Résultat :**
```json
{
  "success": false,
  "message": "Un pointage de type ENTREE a déjà été enregistré aujourd'hui"
}
```

**4. Pointage SORTIE (Employé à 17:20)**
```bash
POST /api/attendance/scan
{
  "qrCode": "employee-qr-code",
  "type": "SORTIE"
}
```

**Résultat automatique :**
```json
{
  "id": "...",
  "employeeId": "...",
  "type": "SORTIE",
  "timestamp": "2025-11-05T17:20:00Z",
  "date": "2025-11-05",
  "statut": null,  // Pas de statut pour une sortie
  "dureeTravailMinutes": 490  // ← Calculé : (17:20 - 08:10) - 60 = 490 min (8h10)
}
```

---

## 📊 Exemple de résumé journalier

```typescript
const resume = await obtenirResumePointage(employeeId, new Date());
```

**Résultat :**
```json
{
  "date": "2025-11-05",
  "entree": {
    "heure": "08:10",
    "statut": "A_L_HEURE",
    "timestamp": "2025-11-05T08:10:00Z"
  },
  "sortie": {
    "heure": "17:20",
    "timestamp": "2025-11-05T17:20:00Z"
  },
  "dureeTravailMinutes": 490,
  "dureeTravailFormatee": "08:10"
}
```

---

## 🚀 Commandes de mise en production

### 1. Générer le client Prisma
```bash
npx prisma generate
```

### 2. Créer une migration
```bash
npx prisma migrate dev --name ajout_gestion_horaires
```

### 3. (Optionnel) Seed une configuration par défaut
Créer un fichier dans `prisma/seed-horaire.ts` :
```typescript
import { prisma } from '../src/config/database';

async function seedConfiguration() {
  await prisma.configurationHoraire.create({
    data: {
      heureDebut: "08:00",
      heureFin: "17:00",
      dureePauseMinutes: 60,
      toleranceRetardMinutes: 30,
      toleranceAvanceMinutes: 30,
      description: "Horaires standard",
      isActive: true,
    },
  });
}

seedConfiguration();
```

### 4. Redémarrer le serveur
```bash
npm run dev
```

---

## ✅ Checklist de déploiement

- [ ] Exécuter `npx prisma generate`
- [ ] Exécuter `npx prisma migrate dev --name ajout_gestion_horaires`
- [ ] Créer une configuration horaire par défaut via l'API
- [ ] Tester le scan d'entrée (doit calculer le statut)
- [ ] Tester le scan de sortie (doit calculer la durée)
- [ ] Vérifier le blocage des doubles pointages
- [ ] Tester avec différentes heures (en avance, à l'heure, en retard)

---

## 🔍 Logs utiles

Le système log automatiquement :
- ✅ Création de configurations
- ✅ Calcul des statuts
- ✅ Calcul des durées
- ❌ Tentatives de double pointage

**Exemple de logs :**
```
[INFO] Configuration horaire créée: uuid-123
[INFO] Statut calculé pour employé xyz: A_L_HEURE
[INFO] Durée de travail calculée: 490 minutes
```
