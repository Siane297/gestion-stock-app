# Backend - API de Gestion de Présence

## 🎯 Vue d'ensemble

Backend Node.js/Express avec TypeScript et PostgreSQL pour l'application de gestion de présence avec QR codes.

## 📁 Structure du projet

```
backend/
├── src/
│   ├── config/           # Configuration (DB, Logger)
│   ├── controllers/      # Contrôleurs MVC
│   ├── middleware/       # Middlewares Express
│   ├── models/          # Modèles (via Prisma)
│   ├── routes/          # Routes API
│   ├── services/        # Services métier
│   ├── types/           # Types TypeScript
│   ├── utils/           # Utilitaires
│   ├── database/        # Migrations et seeds
│   └── server.ts        # Point d'entrée
├── prisma/
│   └── schema.prisma    # Schéma base de données
├── .env.example         # Variables d'environnement
├── package.json         # Dépendances et scripts
├── tsconfig.json        # Configuration TypeScript
└── nodemon.json         # Configuration dev
```

## 🔧 Technologies utilisées

- **Framework** : Express.js 5.1.0
- **Langage** : TypeScript 5.9.3
- **Base de données** : PostgreSQL + Prisma 5.7.0
- **Authentification** : JWT (jsonwebtoken)
- **Sécurité** : Helmet, CORS, Rate limiting
- **Logging** : Winston
- **Validation** : Joi
- **Dev tools** : Nodemon, ts-node

## 🚀 Installation et démarrage

### 1. Installer les dépendances

```bash
cd backend
npm install
# ou
pnpm install
```

### 2. Configuration environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer les variables (DATABASE_URL, JWT_SECRET, etc.)
nano .env
```

### 3. Configuration base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer la base de données et tables
npm run db:push

# Ou utiliser les migrations
npm run db:migrate

# (Optionnel) Seed data
npm run db:seed
```

### 3.1. 🔄 Réinitialisation complète de la base de données

Si vous supprimez votre base de données ou si vous voulez repartir de zéro, exécutez ces commandes **dans cet ordre** :

```bash
# 1. Générer le client Prisma avec les nouveaux modèles
npx prisma generate

# 2. Créer la base de données et toutes les tables
npx prisma migrate dev --name init
# Ou si vous préférez db push:
# npx prisma db push

# 3. Remplir la base avec les données de base (18 départements + 57 postes)
npx prisma db seed

# 4. (Optionnel) Vérifier les données avec Prisma Studio
npx prisma studio

# 5. Lancer le serveur
npm run dev
```

**⚠️ Important :**
- Le `seed` remplit automatiquement les tables **Poste** et **Departement** avec des données réalistes
- Ces données sont nécessaires pour créer des employés
- Sans le seed, les formulaires d'ajout d'employés seront vides

### 4. Démarrage

```bash
# Développement (avec hot reload)
npm run dev

# Build production
npm run build

# Production
npm start
```

## 📊 Schéma de base de données

### Tables principales

- **employees** : Informations des employés
- **postes** : Liste des postes/fonctions (57 postes prédéfinis)
- **departements** : Liste des départements (18 départements prédéfinis)
- **attendances** : Pointages (entrées/sorties)
- **users** : Utilisateurs système (admin/manager)
- **companies** : Informations entreprise

### Relations

- Employee N:1 Poste
- Employee N:1 Departement
- Employee 1:N Attendance
- User gère Company

## 🛣️ Routes API

### Authentification (`/api/auth`)
- `POST /login` - Connexion
- `POST /register` - Inscription (à implémenter)

### Employés (`/api/employees`)
- `GET /` - Liste des employés (paginée, filtrable)
- `GET /:id` - Détails d'un employé
- `POST /` - Créer un employé (ADMIN/MANAGER)
- `PUT /:id` - Modifier un employé (ADMIN/MANAGER)
- `DELETE /:id` - Supprimer un employé (ADMIN)
- `GET /qr/:qrCode` - Recherche par QR code (public)

### Pointages (`/api/attendance`)
- `GET /` - Liste des pointages (filtrés)
- `POST /` - Créer un pointage
- `POST /scan` - Pointage via QR code (public)
- `GET /employee/:id/date/:date` - Pointages par jour

### Statistiques (`/api/stats`)
- `GET /dashboard` - Stats tableau de bord (à implémenter)
- `GET /daily` - Stats quotidiennes (à implémenter)
- `GET /monthly` - Stats mensuelles (à implémenter)

### Utilitaires
- `GET /health` - Santé du serveur
- `GET /` - Informations API

## 🔐 Authentification et autorisation

### Rôles utilisateur
- **ADMIN** : Accès complet
- **MANAGER** : Gestion employés et pointages
- **USER** : Consultation seulement

### Middleware d'authentification
- `authenticate` : Vérification JWT token
- `authorize(roles)` : Vérification permissions

## 🗂️ Contrôleurs implementés

### EmployeeController
- ✅ `getAllEmployees` - Liste paginée avec filtres
- ✅ `getEmployeeById` - Détails avec historique
- ✅ `createEmployee` - Création avec QR unique
- ✅ `updateEmployee` - Modification avec validations
- ✅ `deleteEmployee` - Suppression soft (isActive)
- ✅ `getEmployeeByQrCode` - Recherche QR

### AttendanceController
- ✅ `createAttendance` - Pointage standard
- ✅ `createAttendanceByQrCode` - Pointage QR
- ✅ `getAttendances` - Liste avec filtres
- ✅ `getEmployeeAttendanceForDate` - Pointages journaliers

## 🔨 Scripts disponibles

```bash
npm run dev          # Développement avec nodemon
npm run build        # Build TypeScript
npm start            # Production
npm run db:generate  # Générer client Prisma
npm run db:push      # Pousser schéma vers DB
npm run db:migrate   # Migrations
npm run db:studio    # Interface Prisma Studio
npm run db:seed      # Seed données test
```

## ⚠️ État actuel

### ✅ Terminé
- Structure MVC complète
- Configuration TypeScript/Express
- Schéma Prisma PostgreSQL
- Contrôleurs employés et pointages
- Middleware authentification/autorisation
- Gestion erreurs et logging
- Routes principales

### 🚧 À faire
- Installer les dépendances
- Configurer PostgreSQL
- Implémenter authentification JWT
- Implémenter statistiques
- Tests unitaires/intégration
- Documentation API (Swagger)

## 🌐 Intégration frontend

L'API est conçue pour s'intégrer avec le frontend Nuxt.js :

- CORS configuré pour `http://localhost:3000`
- Routes publiques pour scan QR
- Format de réponse standardisé
- Gestion erreurs cohérente

## 🔧 Configuration requise

### Variables d'environnement (.env)

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/pointage_db"
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Base de données PostgreSQL

Assurer que PostgreSQL est installé et accessible avec les credentials configurés.

---

📚 **Documentation mise à jour** : Cette structure est prête pour la phase d'installation des dépendances et configuration de la base de données.
