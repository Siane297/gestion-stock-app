# Architecture Backend - API de Gestion de Présence

## 🎯 Vue d'ensemble

Backend Node.js/Express avec TypeScript suivant le pattern **MVC (Model-View-Controller)** pour une application de gestion de présence avec QR codes.

## 📐 Architecture MVC

### Model (Modèle)
- **Emplacement** : `prisma/schema.prisma` + `@prisma/client`
- **Rôle** : Définit la structure des données et gère les interactions avec PostgreSQL
- **Modèles** :
  - `Employee` : Employés de l'entreprise
  - `Attendance` : Pointages (entrées/sorties)
  - `User` : Utilisateurs système (admin/manager)
  - `Company` : Informations entreprise

### Controller (Contrôleur)
- **Emplacement** : `src/controllers/`
- **Rôle** : Logique métier et traitement des requêtes
- **Contrôleurs** :
  - `employeeController.ts` : CRUD employés
  - `attendanceController.ts` : Gestion pointages
  - `authController.ts` : Authentification (à implémenter)
  - `statsController.ts` : Statistiques (à implémenter)

### Routes (Vue/Interface)
- **Emplacement** : `src/routes/`
- **Rôle** : Définit les endpoints API et applique les middlewares
- **Routes** :
  - `employeeRoutes.ts` : `/api/employees`
  - `attendanceRoutes.ts` : `/api/attendance`
  - `authRoutes.ts` : `/api/auth`
  - `statsRoutes.ts` : `/api/stats`

## 🏗️ Structure du projet

```
backend/
├── src/
│   ├── config/              # Configuration
│   │   ├── database.ts      # Connexion PostgreSQL (Prisma)
│   │   └── logger.ts        # Logger Winston
│   │
│   ├── controllers/         # Contrôleurs MVC
│   │   ├── employeeController.ts
│   │   └── attendanceController.ts
│   │
│   ├── middleware/          # Middlewares Express
│   │   ├── auth.ts          # Authentification JWT
│   │   ├── errorHandler.ts # Gestion erreurs
│   │   └── notFound.ts      # Route 404
│   │
│   ├── routes/              # Routes API
│   │   ├── employeeRoutes.ts
│   │   ├── attendanceRoutes.ts
│   │   ├── authRoutes.ts
│   │   └── statsRoutes.ts
│   │
│   ├── services/            # Services métier (optionnel)
│   ├── utils/               # Utilitaires
│   ├── types/               # Types TypeScript
│   │   └── index.ts         # Interfaces et types
│   │
│   ├── database/            # Base de données
│   │   ├── migrations/      # Migrations Prisma
│   │   └── seeds/           # Données de test
│   │
│   └── server.ts            # Point d'entrée
│
├── prisma/
│   └── schema.prisma        # Schéma base de données
│
├── doc/                     # Documentation
├── logs/                    # Fichiers de logs
├── .env                     # Variables d'environnement
├── .env.example             # Exemple de configuration
├── package.json             # Dépendances
├── tsconfig.json            # Configuration TypeScript
├── nodemon.json             # Configuration dev
└── README.md                # Documentation principale
```

## 🔄 Flux de données

### Requête HTTP → Réponse

```
Client (Frontend)
    ↓
[Express Server]
    ↓
[Middleware] (CORS, Helmet, Rate Limit, Auth)
    ↓
[Routes] (Routing vers le bon contrôleur)
    ↓
[Controller] (Logique métier)
    ↓
[Prisma Client] (ORM)
    ↓
[PostgreSQL] (Base de données)
    ↓
[Response] (JSON)
    ↓
Client (Frontend)
```

### Exemple : Créer un employé

1. **Client** : `POST /api/employees` avec données JSON
2. **Middleware** : Vérification authentification JWT
3. **Route** : `employeeRoutes.ts` → `createEmployee`
4. **Controller** : 
   - Validation des données
   - Vérification unicité matricule/email
   - Génération QR code unique
   - Appel Prisma pour insertion
5. **Prisma** : Insertion dans table `employees`
6. **PostgreSQL** : Enregistrement des données
7. **Response** : Retour JSON avec employé créé

## 🔐 Sécurité

### Couches de sécurité

1. **Helmet** : Protection headers HTTP
2. **CORS** : Contrôle accès cross-origin
3. **Rate Limiting** : Protection contre DDoS
4. **JWT** : Authentification stateless
5. **Validation** : Joi pour validation données
6. **Prisma** : Protection SQL injection (ORM)

### Middleware d'authentification

```typescript
// Vérification token JWT
authenticate(req, res, next)

// Vérification rôles
authorize('ADMIN', 'MANAGER')
```

## 📊 Base de données PostgreSQL

### Schéma relationnel

```
┌─────────────┐         ┌──────────────┐
│  Employee   │────1:N──│  Attendance  │
└─────────────┘         └──────────────┘
     │
     │ (QR Code unique)
     │
     └─ Pointages via QR
```

### Tables principales

**employees**
- `id` (UUID) - Clé primaire
- `matricule` (String) - Unique
- `fullName` (String)
- `email` (String?) - Unique, optionnel
- `position` (String)
- `department` (String)
- `qrCode` (String) - Unique, généré automatiquement
- `isActive` (Boolean) - Soft delete

**attendances**
- `id` (UUID) - Clé primaire
- `employeeId` (UUID) - Foreign key
- `type` (Enum) - ENTRY | EXIT
- `timestamp` (DateTime)
- `location` (String?) - Optionnel
- `notes` (String?) - Optionnel

## 🛠️ Configuration

### Variables d'environnement (.env)

```env
# Serveur
NODE_ENV=development
PORT=3001
HOST=localhost

# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/pointage_db"

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100           # 100 requêtes max

# Logging
LOG_LEVEL=info
```

### TypeScript Configuration

- **Module** : ESNext (modules ES)
- **Target** : ES2022
- **Strict mode** : Activé
- **Source maps** : Activés
- **Module resolution** : Node

## 🚀 Démarrage

### Développement
```bash
npm run dev
# Utilise nodemon + tsx pour hot reload
```

### Production
```bash
npm run build  # Compile TypeScript → JavaScript
npm start      # Lance le serveur compilé
```

## 📝 Logging

### Winston Logger

- **Console** : Logs colorés en développement
- **Fichiers** :
  - `logs/error.log` : Erreurs uniquement
  - `logs/combined.log` : Tous les logs

### Niveaux de log
- `error` : Erreurs critiques
- `warn` : Avertissements
- `info` : Informations générales
- `http` : Requêtes HTTP (via Morgan)
- `debug` : Debug détaillé

## 🔄 Gestion des erreurs

### Middleware centralisé

```typescript
errorHandler(error, req, res, next)
```

**Gère** :
- Erreurs Prisma (DB)
- Erreurs JWT (Auth)
- Erreurs Joi (Validation)
- Erreurs personnalisées
- Erreurs inconnues

**Retourne** :
```json
{
  "success": false,
  "message": "Description de l'erreur",
  "stack": "..." // En développement seulement
}
```

## 🎯 Bonnes pratiques implémentées

1. **Séparation des responsabilités** : MVC strict
2. **DRY** : Code réutilisable
3. **Type safety** : TypeScript strict
4. **Error handling** : Gestion centralisée
5. **Logging** : Traçabilité complète
6. **Security** : Multiples couches
7. **Validation** : Données entrantes
8. **Documentation** : Code commenté
9. **Configuration** : Variables d'environnement
10. **Scalabilité** : Architecture modulaire

## 📈 Performance

### Optimisations

- **Prisma** : Requêtes optimisées avec relations
- **Pagination** : Limite résultats API
- **Indexation** : Clés uniques sur matricule, email, qrCode
- **Connection pooling** : Prisma gère automatiquement
- **Rate limiting** : Protection surcharge

### Monitoring

- **Health check** : `/health` endpoint
- **Database health** : Vérification connexion
- **Logs** : Analyse performance via Winston

---

Cette architecture garantit une **maintenabilité**, **scalabilité** et **sécurité** optimales pour l'application de gestion de présence.
