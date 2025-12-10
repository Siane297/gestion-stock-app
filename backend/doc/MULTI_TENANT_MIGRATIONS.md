# Système Multi-Tenant avec Prisma Migrate

## Vue d'ensemble

Ce backend utilise une architecture **multi-tenant** avec des schémas PostgreSQL séparés. Chaque organisation a son propre schéma isolé, utilisant **Prisma Migrate** pour la gestion automatique des migrations.

## Architecture

```
PostgreSQL Database (pointage_db)
│
├── Schema public/           # Gestion des tenants
│   ├── companies           # Liste des organisations
│   ├── users              # Super admins
│   └── badge_customizations
│
├── Schema sirhame_tech/    # Tenant 1
│   ├── employees
│   ├── attendances
│   ├── conges
│   └── ...
│
└── Schema acme_corp/       # Tenant 2
    ├── employees
    ├── attendances
    ├── conges
    └── ...
```

## Création d'un Tenant

### 1. Inscription d'une Organisation

Quand un utilisateur s'inscrit via `/api/auth/register` :

```typescript
// 1. Normalisation du nom
const schemaName = normalizeSchemaName("Sirhame Tech");
// Résultat: "sirhame_tech"

// 2. Création de l'entrée dans public.companies
const company = await prismaPublic.company.create({
  data: {
    name: "Sirhame Tech",
    schemaName: "sirhame_tech",
    email: "contact@sirhame.tech",
    // ...
  },
});

// 3. Création du schéma tenant
await createTenantSchema("sirhame_tech");
```

### 2. Processus Automatique

La fonction `createTenantSchema()` dans [tenantService.ts](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/src/services/tenantService.ts) exécute :

```typescript
export const createTenantSchema = async (schemaName: string) => {
  // 1. Créer le schéma PostgreSQL vide
  await prismaPublic.$executeRawUnsafe(
    `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`
  );

  // 2. Appliquer TOUTES les migrations Prisma
  await applyTenantMigrations(schemaName);
  // → Prisma lit les fichiers .prisma
  // → Crée automatiquement toutes les tables

  // 3. Seed les données de base
  await seedTenantData(schemaName);
  // → Crée les postes et départements par défaut
};
```

### 3. Migration Automatique avec Prisma

```typescript
const applyTenantMigrations = async (schemaName: string) => {
  // Construction de l'URL avec le schéma tenant
  const tenantDbUrl = `${DATABASE_URL}?schema=${schemaName}`;

  // Exécution de toutes les migrations
  execSync("npx prisma migrate deploy", {
    env: { DATABASE_URL: tenantDbUrl },
  });
};
```

**Résultat** : Le nouveau tenant a **toutes les tables** automatiquement créées à partir des fichiers `.prisma` !

## Workflow de Migration

### Développement Local

#### 1. Ajouter un Champ

```prisma
// employee.prisma
model Employee {
  // ... autres champs
  dateNaissance DateTime? @db.Date  // Nouveau champ
}
```

#### 2. Créer la Migration

```bash
npx prisma migrate dev --name add_date_naissance
```

**Ce qui se passe** :

- ✅ Prisma génère le fichier SQL de migration
- ✅ Applique sur le schéma `public` (dev)
- ✅ Synchronise le client Prisma

#### 3. Migrer les Tenants Existants

```bash
npm run migrate:tenants
```

**Ce qui se passe** :

- ✅ Récupère tous les tenants depuis `public.companies`
- ✅ Execute `prisma migrate deploy` sur chaque tenant
- ✅ Tous les tenants reçoivent le nouveau champ

### Production (Render)

#### Déploiement Automatique

```json
{
  "scripts": {
    "start": "npx prisma migrate deploy && npm run migrate:tenants && node dist/src/server.js"
  }
}
```

**Séquence lors du déploiement** :

1. ✅ `prisma migrate deploy` → Migre le schéma `public`
2. ✅ `migrate:tenants` → **Migre TOUS les tenants automatiquement**
3. ✅ Démarre le serveur

**Aucune intervention manuelle requise !**

## Scripts Disponibles

| Script                    | Description                        |
| ------------------------- | ---------------------------------- |
| `npm run db:migrate`      | Créer une nouvelle migration (dev) |
| `npm run migrate:tenants` | Migrer tous les tenants existants  |
| `npm run db:generate`     | Régénérer le client Prisma         |

## Exemple Complet

### Scénario : Ajouter un champ "téléphone2"

**1. Local - Modifier le schéma**

```prisma
model Employee {
  phoneNumber String?
  phoneNumber2 String?  // Nouveau
}
```

**2. Local - Créer la migration**

```bash
npx prisma migrate dev --name add_phone2
npm run migrate:tenants  # Migre tenants locaux
```

**3. Production - Déployer**

```bash
git add .
git commit -m "feat: add second phone number"
git push
```

**4. Render (Automatique)**

- ✅ Build le projet
- ✅ Execute `npm run start`
  - Migre `public`
  - **Migre tous les tenants en prod**
- ✅ Démarre

**Résultat** : Tous les tenants (local + prod) ont le champ `phoneNumber2` automatiquement ! 🎉

## Avantages de cette Architecture

✅ **Isolation des données** : Chaque organisation a son propre schéma  
✅ **Sécurité** : Impossible d'accéder aux données d'un autre tenant  
✅ **Scalabilité** : Facile d'ajouter de nouveaux tenants  
✅ **Maintenance** : Une seule modification de schéma pour tous  
✅ **Automatisation** : Migrations automatiques en dev et prod

## Fichiers Importants

- [tenantService.ts](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/src/services/tenantService.ts) : Gestion des schémas
- [migrate-tenants.ts](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/src/scripts/migrate-tenants.ts) : Script de migration des tenants
- [prisma/migrations/](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/prisma/migrations) : Historique des migrations
