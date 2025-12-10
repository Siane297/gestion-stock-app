# Architecture Multi-Tenant - Isolation par Schéma PostgreSQL

## 📋 Table des matières

1. [Vue d'ensemble](#-vue-densemble)
2. [Concepts fondamentaux](#-concepts-fondamentaux)
3. [Architecture technique](#-architecture-technique)
4. [Processus d'inscription](#-processus-dinscription)
5. [Authentification et sécurité](#-authentification-et-sécurité)
6. [Gestion des connexions](#-gestion-des-connexions)
7. [Middleware tenant](#-middleware-tenant)
8. [Migration et seeding](#-migration-et-seeding)
9. [Cas d'utilisation](#-cas-dutilisation)
10. [Dépannage](#-dépannage)

---

## 🎯 Vue d'ensemble

### Qu'est-ce que le multi-tenant ?

Le **multi-tenancy** (multi-location) est une architecture logicielle où une **seule instance d'application** sert **plusieurs organisations indépendantes** (tenants), chacune ayant ses **propres données isolées**.

### Pourquoi l'isolation par schéma PostgreSQL ?

Notre application utilise l'approche **"Schema per Tenant"**, où chaque organisation possède son propre schéma PostgreSQL dans une base de données partagée.

**Avantages** :

- ✅ **Isolation forte** : Impossible d'accéder aux données d'un autre tenant
- ✅ **Performance** : Index et statistiques séparés par tenant
- ✅ **Sécurité** : Séparation physique au niveau base de données
- ✅ **Simplicité** : Pas besoin de filtrer par `tenantId` dans chaque requête
- ✅ **Scalabilité** : Migration facile vers des bases séparées si nécessaire
- ✅ **Coût** : Une seule infrastructure pour tous les clients

**Inconvénients gérés** :

- ⚠️ Complexité de configuration (automatisée par `tenantService`)
- ⚠️ Gestion des migrations (script de migration automatique)
- ⚠️ Limite de schémas PostgreSQL (pas une contrainte en pratique)

---

## 📚 Concepts fondamentaux

### 1. Schéma Public vs Schéma Tenant

```
PostgreSQL Database: pointage_db
│
├── Schema: public (PARTAGÉ)
│   ├── companies           ← Liste des organisations
│   ├── users               ← Comptes Admin/SUPER_ADMIN
│   └── badge_customizations ← Config badges par organisation
│
├── Schema: sirhame_tech (TENANT 1)
│   ├── employees           ← Employés de Sirhame Tech
│   ├── attendances         ← Pointages de Sirhame Tech
│   ├── bilans_presence     ← Bilans de Sirhame Tech
│   ├── postes              ← Postes de Sirhame Tech
│   ├── departements        ← Départements de Sirhame Tech
│   ├── configurations_horaire
│   └── tenant_users        ← Utilisateurs de Sirhame Tech
│
├── Schema: acme_corp (TENANT 2)
│   ├── employees           ← Employés de Acme Corp
│   ├── attendances         ← Pointages de Acme Corp
│   └── ...                 ← Données isolées d'Acme Corp
│
└── Schema: autre_entreprise (TENANT 3)
    └── ...                 ← Données isolées
```

### 2. Types de Ressources

#### Ressources Partagées (Schema PUBLIC)

- **Table `companies`** : Métadonnées des organisations
- **Table `users`** : Comptes administrateurs avec rôles `ADMIN` ou `SUPER_ADMIN`
- **Table `badge_customizations`** : Configuration des badges d'identité

#### Ressources Tenant (Schema ISOLÉ)

Chaque tenant possède ses propres tables :

- `employees` : Employés de l'organisation
- `attendances` : Pointages (entrées/sorties)
- `bilans_presence` : Bilans journaliers
- `postes` : Postes disponibles
- `departements` : Départements
- `configurations_horaire` : Configuration horaires de travail
- `tenant_users` : Comptes utilisateurs liés aux employés

### 3. Normalisation des Noms de Schéma

Les noms d'organisations sont normalisés pour créer des noms de schéma PostgreSQL valides :

```typescript
normalizeSchemaName("Sirhame Tech")
  → "sirhame_tech"

normalizeSchemaName("ACME Corporation (Paris)")
  → "acme_corporation_paris"

normalizeSchemaName("Société 123 - Division A")
  → "societe_123_division_a"
```

**Règles de normalisation** :

1. Conversion en minuscules
2. Remplacement des caractères non-alphanumériques par `_`
3. Suppression des `_` en début/fin
4. Limitation à 63 caractères (limite PostgreSQL)

---

## 🏗️ Architecture technique

### Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP + JWT
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       EXPRESS SERVER (Backend)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Middleware: identifyTenant                │  │
│  │  1. Extraire JWT                                          │  │
│  │  2. Identifier l'organisation (companyId ou tenantId)     │  │
│  │  3. Récupérer Company depuis schema public                │  │
│  │  4. Connecter au schéma tenant                            │  │
│  │  5. Injecter req.tenantPrisma                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Controllers (MVC)                      │  │
│  │  • employeeController                                     │  │
│  │  • attendanceController                                   │  │
│  │  • bilanController                                        │  │
│  │  → Utilise req.tenantPrisma                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                           │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐        │
│  │   public   │      │sirhame_tech│      │ acme_corp  │        │
│  │ companies  │      │ employees  │      │ employees  │        │
│  │   users    │      │attendances │      │attendances │        │
│  └────────────┘      └────────────┘      └────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Modèle de données complet

#### Schema `public`

```prisma
model Company {
  id                    String   @id @default(uuid())
  name                  String   @unique
  schemaName            String   @unique  // Ex: "sirhame_tech"
  email                 String   @unique
  emailOrganisation     String
  telephoneOrganisation String
  country               String
  address               String?
  logo                  String?
  pdfHeader             String?
  isActive              Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  users                 User[]
  badgeCustomization    BadgeCustomization?
}

model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  password      String   // Hashé avec bcrypt
  emailVerified Boolean  @default(false)
  role          UserRole @default(ADMIN)
  isActive      Boolean  @default(true)

  companyId     String?  // null pour SUPER_ADMIN
  company       Company? @relation(...)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum UserRole {
  SUPER_ADMIN  // Accès toutes organisations
  ADMIN        // Propriétaire de l'organisation
  MANAGER      // Manager
  USER         // Utilisateur standard
}
```

#### Schema `<tenant>` (exemple: `sirhame_tech`)

```prisma
model Employee {
  id           String   @id @default(uuid())
  matricule    String   @unique
  fullName     String
  email        String?  @unique
  positionId   String?
  departmentId String?
  phoneNumber  String?
  address      String?
  hireDate     DateTime @default(now())
  isActive     Boolean  @default(true)
  isOwner      Boolean  @default(false)
  qrCode       String?  @unique

  position     Poste?          @relation(...)
  department   Departement?    @relation(...)
  attendances  Attendance[]
  bilans       BilanPresence[]
  tenantUser   TenantUser?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model TenantUser {
  id          String         @id @default(uuid())
  employeeId  String         @unique
  email       String         @unique
  password    String         // Hashé avec bcrypt
  role        TenantUserRole @default(USER)
  isBlocked   Boolean        @default(false)
  isOwner     Boolean        @default(false)
  permissions Json           @default("[]")

  employee    Employee       @relation(...)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastLoginAt DateTime?
}

enum TenantUserRole {
  ADMIN    // Administrateur de l'organisation
  MANAGER  // Manager
  USER     // Utilisateur standard
  RH       // Ressources Humaines
}

model Attendance {
  id         String         @id @default(uuid())
  employeeId String
  type       AttendanceType
  timestamp  DateTime       @default(now())
  date       DateTime       @db.Date
  location   String?
  notes      String?

  employee   Employee       @relation(...)

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// ... autres modèles (BilanPresence, Poste, Departement, ConfigurationHoraire)
```

---

## 🚀 Processus d'inscription

### Flux complet d'inscription d'une nouvelle organisation

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant PublicDB
    participant PostgreSQL

    User->>Frontend: Remplir formulaire inscription
    Note over User: - Nom organisation<br/>- Email admin<br/>- Password<br/>- Pays
    Frontend->>API: POST /api/auth/register

    API->>API: Normaliser nom organisation
    Note over API: "Sirhame Tech" → "sirhame_tech"

    API->>PublicDB: Vérifier email unique
    PublicDB-->>API: ✅ Email disponible

    API->>PublicDB: Créer Company
    Note over PublicDB: INSERT INTO public.companies
    PublicDB-->>API: Company créée (id, schemaName)

    API->>PostgreSQL: CREATE SCHEMA "sirhame_tech"
    PostgreSQL-->>API: ✅ Schéma créé

    API->>PostgreSQL: Appliquer migrations
    Note over PostgreSQL: Créer 7 tables:<br/>- employees<br/>- attendances<br/>- bilans_presence<br/>- postes<br/>- departements<br/>- configurations_horaire<br/>- tenant_users
    PostgreSQL-->>API: ✅ Tables créées

    API->>PostgreSQL: Seed données de base
    Note over PostgreSQL: - 18 départements<br/>- 57 postes
    PostgreSQL-->>API: ✅ Données insérées

    API->>PublicDB: Créer User Admin
    Note over PublicDB: INSERT INTO public.users<br/>role: ADMIN<br/>companyId: ...
    PublicDB-->>API: ✅ User créé

    API->>API: Générer JWT
    Note over API: payload: {<br/>  userId,<br/>  email,<br/>  role: "ADMIN",<br/>  companyId<br/>}

    API-->>Frontend: 201 Created {token, user, company}
    Frontend->>Frontend: Sauvegarder token
    Frontend-->>User: Redirection → Dashboard
```

### Code d'inscription simplifié

```typescript
// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  const { name, email, password, companyName, country, address } = req.body;

  // 1. Normaliser le nom de l'organisation
  const schemaName = normalizeSchemaName(companyName);

  // 2. Créer l'organisation dans le schéma public
  const company = await prismaPublic.company.create({
    data: {
      name: companyName,
      schemaName,
      email,
      emailOrganisation: email,
      telephoneOrganisation: "",
      country,
      address,
      isActive: true,
    },
  });

  // 3. Créer le schéma PostgreSQL et les tables
  await createTenantSchema(schemaName);

  // 4. Créer le compte administrateur
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prismaPublic.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",
      companyId: company.id,
      emailVerified: true,
    },
  });

  // 5. Générer le JWT
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    companyId: company.id,
  });

  res.status(201).json({
    success: true,
    data: { token, user, company },
  });
};
```

---

## 🔐 Authentification et sécurité

### Types d'utilisateurs et leurs JWT

#### 1. SUPER_ADMIN (schéma public uniquement)

```typescript
// JWT Payload
{
  userId: "uuid-super-admin",
  email: "superadmin@pointage.com",
  role: "SUPER_ADMIN",
  // Pas de companyId ni tenantId
}

// Accès
- Gestion de toutes les organisations
- Schéma utilisé: public
- Pas de connexion tenant
```

#### 2. ADMIN (propriétaire d'organisation)

```typescript
// JWT Payload
{
  userId: "uuid-admin",
  email: "admin@sirhame-tech.com",
  role: "ADMIN",
  companyId: "uuid-company"  // ← Identifiant de l'organisation
}

// Accès
- Gestion complète de son organisation
- Schéma utilisé: sirhame_tech (résolu via companyId)
- Connexion automatique au tenant
```

#### 3. TenantUser (employé avec compte)

```typescript
// JWT Payload
{
  userId: "uuid-tenant-user",
  email: "employee@sirhame-tech.com",
  role: "MANAGER", // ou USER, RH, ADMIN
  tenantId: "sirhame_tech",  // ← Nom du schéma
  employeeId: "uuid-employee"
}

// Accès
- Permissions personnalisées par page
- Schéma utilisé: sirhame_tech (direct)
- Connexion automatique au tenant
```

### Processus d'authentification

```typescript
// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Chercher dans public.users (Admin/SUPER_ADMIN)
  const adminUser = await prismaPublic.user.findUnique({
    where: { email },
    include: { company: true },
  });

  if (adminUser && bcrypt.compareSync(password, adminUser.password)) {
    const token = generateToken({
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      companyId: adminUser.companyId,
    });

    return res.json({ success: true, data: { token, user: adminUser } });
  }

  // 2. Chercher dans tenant_users de tous les tenants actifs
  const companies = await prismaPublic.company.findMany({
    where: { isActive: true },
  });

  for (const company of companies) {
    const tenantPrisma = getTenantConnection(company.schemaName);

    const tenantUser = await tenantPrisma.tenantUser.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (tenantUser && bcrypt.compareSync(password, tenantUser.password)) {
      // Vérifier que le compte n'est pas bloqué
      if (tenantUser.isBlocked) {
        return res.status(403).json({
          success: false,
          message: "Compte bloqué",
        });
      }

      const token = generateToken({
        userId: tenantUser.id,
        email: tenantUser.email,
        role: tenantUser.role,
        tenantId: company.schemaName,
        employeeId: tenantUser.employeeId,
      });

      // Mettre à jour lastLoginAt
      await tenantPrisma.tenantUser.update({
        where: { id: tenantUser.id },
        data: { lastLoginAt: new Date() },
      });

      return res.json({
        success: true,
        data: { token, user: tenantUser, company },
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: "Identifiants incorrects",
  });
};
```

---

## 🔌 Gestion des connexions

### Service: `tenantService.ts`

Le service `tenantService` gère toutes les opérations liées aux tenants.

#### 1. Cache de connexions

```typescript
// Cache global des connexions Prisma par tenant
const tenantConnections = new Map<string, PrismaClient>();

export const getTenantConnection = (schemaName: string): PrismaClient => {
  // Vérifier le cache
  if (tenantConnections.has(schemaName)) {
    return tenantConnections.get(schemaName)!;
  }

  // Créer nouvelle connexion avec schéma spécifique
  const databaseUrl = process.env.DATABASE_URL;
  const tenantUrl = databaseUrl.includes("schema=")
    ? databaseUrl.replace(/schema=\w+/, `schema=${schemaName}`)
    : `${databaseUrl}${
        databaseUrl.includes("?") ? "&" : "?"
      }schema=${schemaName}`;

  const tenantPrisma = new PrismaClient({
    datasources: {
      db: { url: tenantUrl },
    },
  });

  // Mettre en cache
  tenantConnections.set(schemaName, tenantPrisma);

  logger.info(`Connexion Prisma créée pour: ${schemaName}`);

  return tenantPrisma;
};
```

**Avantages du cache** :

- ✅ Performance : Évite de créer plusieurs connexions pour le même tenant
- ✅ Pool de connexions : Prisma gère automatiquement le pooling
- ✅ Mémoire : Une seule instance par tenant

#### 2. Création d'un schéma tenant

```typescript
export const createTenantSchema = async (schemaName: string): Promise<void> => {
  // 1. Validation du nom
  if (!/^[a-z][a-z0-9_]*$/.test(schemaName)) {
    throw new Error(`Nom de schéma invalide: ${schemaName}`);
  }

  // 2. Créer le schéma PostgreSQL
  await prismaPublic.$executeRawUnsafe(
    `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`
  );

  logger.info(`Schéma créé: ${schemaName}`);

  // 3. Appliquer les migrations (créer les tables)
  await applyTenantMigrations(schemaName);

  // 4. Seed les données de base
  await seedTenantData(schemaName);
};
```

#### 3. Application des migrations

La fonction `applyTenantMigrations` crée toutes les tables nécessaires dans le schéma tenant.

**Tables créées** :

1. **ENUMs** : `AttendanceType`, `StatutPointage`, `TenantUserRole`
2. **postes** : Avec index sur `name`
3. **departements** : Avec index sur `name`
4. **employees** : Avec foreign keys vers postes/departements
5. **attendances** : Avec foreign key vers employees
6. **bilans_presence** : Avec constraint unique (employeeId, date)
7. **configurations_horaire** : Configuration horaires de travail
8. **tenant_users** : Comptes utilisateurs liés aux employés

```typescript
export const applyTenantMigrations = async (schemaName: string) => {
  // Créer ENUMs
  await prismaPublic.$executeRawUnsafe(`
    CREATE TYPE "${schemaName}"."AttendanceType" 
    AS ENUM ('ENTREE', 'SORTIE', 'ABSENCE');
  `);

  // Créer tables avec foreign keys
  await prismaPublic.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "${schemaName}"."employees" (
      "id" TEXT PRIMARY KEY,
      "matricule" TEXT UNIQUE NOT NULL,
      "fullName" TEXT NOT NULL,
      -- ... autres colonnes
      "positionId" TEXT,
      "departmentId" TEXT,
      CONSTRAINT "employees_positionId_fkey" 
        FOREIGN KEY ("positionId") 
        REFERENCES "${schemaName}"."postes"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE
    )
  `);

  // Créer index pour performance
  await prismaPublic.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "attendances_employeeId_idx" 
    ON "${schemaName}"."attendances"("employeeId")
  `);

  logger.info(`Migrations appliquées: ${schemaName}`);
};
```

#### 4. Seed des données de base

```typescript
export const seedTenantData = async (schemaName: string) => {
  const tenantPrisma = getTenantConnection(schemaName);

  // Départements par défaut (18)
  const departements = [
    "Direction Générale",
    "Ressources Humaines",
    "Informatique",
    "Finance",
    // ... etc
  ];

  for (const name of departements) {
    await tenantPrisma.departement.create({
      data: { name, isActive: true },
    });
  }

  // Postes par défaut (57)
  const postes = [
    "Directeur Général",
    "Développeur",
    "Commercial",
    // ... etc
  ];

  for (const name of postes) {
    await tenantPrisma.poste.create({
      data: { name, isActive: true },
    });
  }

  await tenantPrisma.$disconnect();
  logger.info(`Seed terminé: ${schemaName}`);
};
```

#### 5. Nettoyage des connexions

```typescript
export const disconnectAllTenants = async (): Promise<void> => {
  const promises = Array.from(tenantConnections.values()).map((prisma) =>
    prisma.$disconnect()
  );

  await Promise.all(promises);
  tenantConnections.clear();
  await prismaPublic.$disconnect();

  logger.info("Toutes les connexions tenant fermées");
};

// Dans server.ts
process.on("SIGTERM", async () => {
  await disconnectAllTenants();
  process.exit(0);
});
```

---

## 🛡️ Middleware tenant

### `identifyTenant` - Middleware principal

Ce middleware est le cœur du système multi-tenant. Il identifie automatiquement le tenant et connecte au bon schéma.

```typescript
// src/middleware/tenantMiddleware.ts

export const identifyTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Récupérer le JWT
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // Fallback vers cookies
    if (!token) {
      token = req.cookies?.auth_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token d'authentification manquant",
      });
    }

    // 2. Vérifier et décoder le JWT
    const jwtSecret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Stocker les infos utilisateur
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    // 3. Gestion SUPER_ADMIN (schéma public uniquement)
    if (decoded.role === "SUPER_ADMIN") {
      req.tenantPrisma = prismaPublic;
      req.tenantSchema = "public";
      logger.debug("Requête SUPER_ADMIN - schéma public");
      return next();
    }

    // 4. Identifier l'organisation
    let company;

    if (decoded.tenantId) {
      // TenantUser - Chercher via schemaName
      company = await prismaPublic.company.findUnique({
        where: { schemaName: decoded.tenantId },
        select: { id: true, schemaName: true, isActive: true, country: true },
      });

      if (company) {
        req.companyId = company.id;
      }
    } else if (decoded.companyId) {
      // Admin - Chercher via companyId
      req.companyId = decoded.companyId;
      company = await prismaPublic.company.findUnique({
        where: { id: decoded.companyId },
        select: { id: true, schemaName: true, isActive: true, country: true },
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Utilisateur non associé à une organisation",
      });
    }

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Organisation non trouvée",
      });
    }

    if (!company.isActive) {
      return res.status(403).json({
        success: false,
        message: "Organisation désactivée",
      });
    }

    // 5. Connecter au schéma tenant
    req.tenantSchema = company.schemaName;
    req.companyCountry = company.country;
    req.tenantPrisma = getTenantConnection(company.schemaName);

    logger.debug(`Tenant: ${company.schemaName}`);

    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token invalide",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expiré",
      });
    }

    logger.error("Erreur middleware tenant:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur d'identification du tenant",
    });
  }
};
```

### Middlewares auxiliaires

```typescript
// Vérifier que req.tenantPrisma est défini
export const requireTenant = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.tenantPrisma || !req.tenantSchema) {
    return res.status(403).json({
      success: false,
      message: "Accès tenant requis",
    });
  }
  next();
};

// Autoriser uniquement SUPER_ADMIN
export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.userRole !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Accès réservé au super administrateur",
    });
  }
  next();
};

// Autoriser ADMIN ou SUPER_ADMIN
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.userRole !== "ADMIN" && req.userRole !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Accès réservé aux administrateurs",
    });
  }
  next();
};
```

### Application dans les routes

```typescript
// src/server.ts

// Routes publiques (sans tenant)
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);

// Routes tenant (avec identification automatique)
app.use("/api/employees", identifyTenant, requireTenant, employeeRoutes);
app.use("/api/attendances", identifyTenant, requireTenant, attendanceRoutes);
app.use("/api/bilans", identifyTenant, requireTenant, bilanRoutes);
app.use("/api/tenant-users", identifyTenant, requireTenant, tenantUserRoutes);

// Routes admin uniquement
app.use("/api/companies", identifyTenant, requireAdmin, companyRoutes);
```

---

## 📦 Migration et seeding

### Migration des données existantes

Si vous avez déjà des données dans le schéma `public` et souhaitez les migrer vers un tenant :

```typescript
// scripts/migrate-existing-data.ts

async function migrateExistingData() {
  // 1. Créer l'organisation
  const company = await prismaPublic.company.create({
    data: {
      name: "Organisation Principale",
      schemaName: "organisation_principale",
      email: "admin@exemple.com",
      country: "Comores",
      isActive: true,
    },
  });

  // 2. Créer le schéma et les tables
  await createTenantSchema(company.schemaName);

  // 3. Copier les données du schéma public vers le tenant
  await prismaPublic.$executeRawUnsafe(`
    -- Copier postes
    INSERT INTO "${company.schemaName}".postes
    SELECT * FROM public.postes;
    
    -- Copier départements
    INSERT INTO "${company.schemaName}".departements
    SELECT * FROM public.departements;
    
    -- Copier employés
    INSERT INTO "${company.schemaName}".employees
    SELECT * FROM public.employees;
    
    -- Copier pointages
    INSERT INTO "${company.schemaName}".attendances
    SELECT * FROM public.attendances;
  `);

  // 4. Lier les utilisateurs existants à l'organisation
  await prismaPublic.user.updateMany({
    where: { companyId: null },
    data: { companyId: company.id, role: "ADMIN" },
  });

  console.log("✅ Migration terminée");
}
```

### Recréer un schéma tenant

En cas de problème, vous pouvez recréer complètement un schéma :

```typescript
// scripts/recreate-tenant-schema.ts

async function recreateTenantSchema(schemaName: string) {
  console.log(`🔄 Recréation du schéma: ${schemaName}`);

  // 1. Supprimer l'ancien schéma
  await deleteTenantSchema(schemaName);

  // 2. Recréer le schéma
  await createTenantSchema(schemaName);

  console.log("✅ Schéma recréé avec succès");
}

// Utilisation:
// npx ts-node scripts/recreate-tenant-schema.ts sirhame_tech
```

---

## 💡 Cas d'utilisation

### Cas 1 : Créer un employé

```typescript
// Controller
export const createEmployee = async (req: Request, res: Response) => {
  const { matricule, fullName, email, positionId, departmentId } = req.body;

  // req.tenantPrisma est automatiquement injecté par le middleware
  const employee = await req.tenantPrisma.employee.create({
    data: {
      matricule,
      fullName,
      email,
      positionId,
      departmentId,
      qrCode: generateQRCode(),
      isActive: true,
    },
    include: {
      position: true,
      department: true,
    },
  });

  res.status(201).json({ success: true, data: employee });
};
```

**Flux** :

1. Client envoie `POST /api/employees` avec JWT
2. Middleware `identifyTenant` :
   - Décode JWT → `tenantId: "sirhame_tech"`
   - Récupère Company → `schemaName: "sirhame_tech"`
   - Connecte à `sirhame_tech` → `req.tenantPrisma`
3. Controller utilise `req.tenantPrisma`
4. Prisma exécute : `INSERT INTO "sirhame_tech".employees ...`
5. Données isolées dans le schéma `sirhame_tech`

### Cas 2 : Obtenir les statistiques

```typescript
export const getStats = async (req: Request, res: Response) => {
  // Toutes ces requêtes s'exécutent dans le schéma tenant
  const totalEmployees = await req.tenantPrisma.employee.count({
    where: { isActive: true },
  });

  const totalAttendances = await req.tenantPrisma.attendance.count({
    where: {
      date: {
        gte: startOfMonth(new Date()),
      },
    },
  });

  res.json({
    success: true,
    data: {
      totalEmployees,
      totalAttendances,
    },
  });
};
```

### Cas 3 : SUPER_ADMIN liste toutes les organisations

```typescript
export const getAllCompanies = async (req: Request, res: Response) => {
  // SUPER_ADMIN utilise prismaPublic (schéma public)
  const companies = await req.tenantPrisma.company.findMany({
    include: {
      _count: {
        select: { users: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: companies });
};
```

---

## 🔧 Dépannage

### Problème 1 : "Table does not exist in schema"

**Symptôme** :

```
ERROR: relation "sirhame_tech.employees" does not exist
```

**Causes possibles** :

1. Le schéma n'a pas été créé
2. Les migrations n'ont pas été appliquées
3. Le schéma a été créé avant l'ajout de nouvelles tables

**Solutions** :

```bash
# Vérifier si le schéma existe
psql -d pointage_db -c "\dn"

# Vérifier les tables du schéma
psql -d pointage_db -c "\dt sirhame_tech.*"

# Recréer le schéma (⚠️ supprime les données)
npx ts-node scripts/recreate-tenant-schema.ts sirhame_tech
```

### Problème 2 : "Utilisateur non associé à une organisation"

**Symptôme** :

```json
{
  "success": false,
  "message": "Utilisateur non associé à une organisation"
}
```

**Cause** : Le JWT ne contient ni `companyId` ni `tenantId`.

**Solution** :

```typescript
// Vérifier le payload du JWT
const decoded = jwt.decode(token);
console.log(decoded);

// Le payload doit contenir soit:
// - companyId (pour Admin)
// - tenantId (pour TenantUser)
```

### Problème 3 : Multiples connexions au même tenant

**Symptôme** : Logs montrent plusieurs créations de connexion pour le même schéma.

**Cause** : Le cache `tenantConnections` ne fonctionne pas.

**Vérification** :

```typescript
// Ajouter des logs dans getTenantConnection
export const getTenantConnection = (schemaName: string) => {
  if (tenantConnections.has(schemaName)) {
    logger.debug(`✅ Connexion en cache: ${schemaName}`);
    return tenantConnections.get(schemaName)!;
  }

  logger.info(`🆕 Nouvelle connexion Prisma: ${schemaName}`);
  // ... créer connexion
};
```

### Problème 4 : Schéma avec caractères spéciaux

**Symptôme** :

```
ERROR: syntax error at or near "société-123"
```

**Cause** : Le nom du schéma contient des caractères invalides.

**Solution** : Utiliser `normalizeSchemaName()` qui gère automatiquement la normalisation.

```typescript
normalizeSchemaName("Société 123 - Paris"); // → "societe_123_paris"
```

### Problème 5 : Limite de connexions PostgreSQL

**Symptôme** :

```
ERROR: sorry, too many clients already
```

**Cause** : Trop de connexions PostgreSQL ouvertes (une par tenant).

**Solutions** :

1. **Augmenter la limite PostgreSQL** :

```sql
-- Dans postgresql.conf
max_connections = 200  -- Au lieu de 100
```

2. **Fermer les connexions inactives** :

```typescript
// Implémenter un TTL pour le cache
const TENANT_CONNECTION_TTL = 30 * 60 * 1000; // 30 minutes

setInterval(() => {
  for (const [schemaName, prisma] of tenantConnections.entries()) {
    // Logique de fermeture si inactif
  }
}, 60 * 1000);
```

3. **Utiliser un pool de connexions** :

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=5"
```

### Problème 6 : Migration en production

**Checklist de migration production** :

```bash
# 1. Sauvegarder la base
pg_dump -h localhost -U postgres -d pointage_db -F c -f backup.dump

# 2. Tester sur staging
npm run migrate:test

# 3. Créer les nouveaux schémas
npx prisma migrate deploy

# 4. Migrer les données
npx ts-node scripts/migrate-existing-data.ts

# 5. Vérifier l'isolation
psql -d pointage_db -c "SELECT schemaname, COUNT(*) FROM pg_tables
                        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
                        GROUP BY schemaname;"

# 6. Redémarrer le backend
pm2 restart pointage-back
```

---

## 📚 Ressources supplémentaires

### Documentation liée

- [tenant-users-system.md](./tenant-users-system.md) : Système de gestion des utilisateurs tenant
- [authentication.md](./authentication.md) : Système d'authentification JWT
- [architecture.md](./architecture.md) : Architecture générale du backend
- [api-endpoints.md](./api-endpoints.md) : Liste des endpoints API

### Fichiers clés

```
pointage-back/
├── src/
│   ├── services/
│   │   ├── tenantService.ts         # 🔑 Gestion des tenants
│   │   └── tenantSeedService.ts     # Seed des données
│   ├── middleware/
│   │   └── tenantMiddleware.ts      # 🔑 Identification tenant
│   ├── routes/
│   │   └── authRoutes.ts            # Login universel
│   └── config/
│       └── jwt.ts                   # Types JWT
├── prisma/
│   └── schema.prisma                # Schéma complet
└── MIGRATION_MULTI_TENANT.md        # Guide de migration
```

### Commandes utiles

```bash
# Lister tous les schémas
psql -d pointage_db -c "\dn"

# Voir les tables d'un schéma
psql -d pointage_db -c "\dt sirhame_tech.*"

# Compter les employés par schéma
psql -d pointage_db -c "
  SELECT 'sirhame_tech', COUNT(*) FROM sirhame_tech.employees
  UNION ALL
  SELECT 'acme_corp', COUNT(*) FROM acme_corp.employees;
"

# Vérifier les connexions actives
psql -d pointage_db -c "
  SELECT datname, usename, application_name, state, count(*)
  FROM pg_stat_activity
  GROUP BY datname, usename, application_name, state;
"
```

---

## ✅ Résumé

### Avantages de cette architecture

✅ **Isolation forte** : Données physiquement séparées
✅ **Sécurité** : Impossible d'accéder aux données d'un autre tenant
✅ **Performance** : Index et statistiques par tenant
✅ **Simplicité** : Pas de filtrage `WHERE tenantId = ?` partout
✅ **Scalabilité** : Migration facile vers bases séparées
✅ **Flexibilité** : Personnalisation par organisation
✅ **Compliance** : RGPD, isolation des données sensibles

### Points clés à retenir

1. **Un schéma PostgreSQL = Une organisation**
2. **Schema `public` = Tables partagées (companies, users)**
3. **Middleware `identifyTenant` = Détection automatique du tenant**
4. **Cache de connexions = Performance et réutilisation**
5. **JWT payload différent selon le type d'utilisateur**
6. **Seed automatique lors de la création d'un tenant**

### Flux simplifié

```
Inscription → Créer Company → Créer Schéma → Migrations → Seed → Admin créé
Login → JWT généré → Middleware identifie tenant → req.tenantPrisma injecté
Requête API → Controller utilise req.tenantPrisma → Données isolées
```

---

**🎉 Votre application est maintenant multi-tenant avec une isolation forte par schéma PostgreSQL !**
