# Architecture Multi-Tenant - Application Pointage

## Vue d'ensemble

Cette application utilise une architecture **multi-tenant avec isolation par schéma PostgreSQL**. Chaque organisation dispose de son propre schéma PostgreSQL, garantissant une isolation complète des données entre les tenants.

## Schémas PostgreSQL

### Schéma `public` (Partagé)

Contient les données partagées entre toutes les organisations :

| Table                  | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `companies`            | Liste des organisations/entreprises                       |
| `users`                | Utilisateurs administrateurs (SUPER_ADMIN)                |
| `badge_customizations` | Configurations personnalisées des badges par organisation |

**Gestion** : Migrations Prisma automatiques via `prisma migrate deploy`

**Fichiers Prisma** : [`prisma/models/public/`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/prisma/models/public)

- [`company.prisma`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/prisma/models/public/company.prisma)
- [`badgeCustomization.prisma`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/prisma/models/public/badgeCustomization.prisma)
- [`user.prisma`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/prisma/models/public/user.prisma)

Annotation : `@@schema("public")`

---

### Schémas Tenant (Dynamiques)

Un schéma PostgreSQL par organisation (ex: `sirhame_tech`, `acme_corp`), contenant :

| Table                    | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `employees`              | Employés de l'organisation                               |
| `tenant_users`           | Comptes utilisateurs de l'organisation (accès interface) |
| `attendances`            | Pointages (entrées/sorties)                              |
| `bilans_presence`        | Bilans journaliers de présence                           |
| `postes`                 | Postes/Fonctions dans l'organisation                     |
| `departements`           | Départements de l'organisation                           |
| `configurations_horaire` | Configuration des horaires de travail                    |

**Gestion** : Créés dynamiquement par [`tenantService.ts`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/src/services/tenantService.ts)

**Fichiers Prisma** : [`prisma/models/tenant/`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/prisma/models/tenant)

- [`employee.prisma`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/prisma/models/tenant/employee.prisma)
- [`tenantUser.prisma`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/prisma/models/tenant/tenantUser.prisma)
- [`attendance.prisma`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/prisma/models/tenant/attendance.prisma)
- [`bilanPresence.prisma`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/prisma/models/tenant/bilanPresence.prisma)
- [`poste.prisma`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/prisma/models/tenant/poste.prisma)
- [`departement.prisma`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/prisma/models/tenant/departement.prisma)
- [`configurationHoraire.prisma`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/prisma/models/tenant/configurationHoraire.prisma)

Annotation : `@@schema("tenant")` où **"tenant" est un placeholder documentaire**

---

## Organisation des Fichiers Prisma

```
prisma/
├── schema.prisma              # Configuration principale (generator + datasource)
├── models/
│   ├── public/                # Modèles du schéma public
│   │   ├── company.prisma
│   │   ├── badgeCustomization.prisma
│   │   └── user.prisma
│   └── tenant/                # Modèles des schémas tenant
│       ├── employee.prisma
│       ├── tenantUser.prisma
│       ├── attendance.prisma
│       ├── bilanPresence.prisma
│       ├── poste.prisma
│       ├── departement.prisma
│       └── configurationHoraire.prisma
└── enums/
    └── index.prisma           # Énumérations (public et tenant)
```

---

## Configuration Prisma MultiSchema

Le fichier [`schema.prisma`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/prisma/schema.prisma) utilise la fonctionnalité native `multiSchema` de Prisma 6+ :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["public", "tenant"]
}
```

- **`"public"`** : Schéma réel géré par Prisma migrations
- **`"tenant"`** : Placeholder documentaire, les vrais schémas sont créés dynamiquement

---

## Flux de Création d'une Organisation

Lors de la création d'une nouvelle organisation via l'API :

```mermaid
sequenceDiagram
    participant Admin
    participant API
    participant CompanyController
    participant TenantService
    participant PostgreSQL

    Admin->>API: POST /api/companies
    API->>CompanyController: createCompany()
    CompanyController->>TenantService: createTenantSchema(schemaName)
    TenantService->>PostgreSQL: CREATE SCHEMA "sirhame_tech"
    TenantService->>PostgreSQL: Créer tables tenant (SQL brut)
    TenantService->>TenantService: seedTenantData()
    TenantService-->>CompanyController: Schéma créé
    CompanyController-->>Admin: Organisation créée
```

### Étapes détaillées

1. **Création de la Company** dans le schéma `public` (table `companies`)
2. **Normalisation du nom** : `"Sirhame Tech"` → `"sirhame_tech"`
3. **Création du schéma PostgreSQL** : `CREATE SCHEMA "sirhame_tech"`
4. **Application des migrations tenant** via `applyTenantMigrations()` :
   - Création des ENUMs PostgreSQL (AttendanceType, StatutPointage, TenantUserRole)
   - Création des tables (postes, departements, employees, etc.)
   - Création des index de performance
5. **Seed des données initiales** : Départements et postes par défaut
6. **Connexion Prisma dynamique** : Cache de connexions par schéma

Code source : [`tenantService.ts:27-51`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/src/services/tenantService.ts#L27-L51)

---

## Connexions Prisma

### Schéma Public

```typescript
import { prismaPublic } from "./services/tenantService.js";

// Utiliser pour accéder aux tables public
const companies = await prismaPublic.company.findMany();
```

### Schémas Tenant

```typescript
import { getTenantConnection } from "./services/tenantService.js";

// Obtenir une connexion pour un tenant spécifique
const prismaTenant = getTenantConnection("sirhame_tech");

// Utiliser pour accéder aux tables du tenant
const employees = await prismaTenant.employee.findMany();
```

**Note** : Les connexions tenant sont mises en cache automatiquement.

---

## Source de Vérité

### Tables Public

- **Définition** : Fichiers Prisma (`models/public/*.prisma`)
- **Création** : Migrations Prisma (`prisma migrate`)
- **SQL** : Généré automatiquement par Prisma

### Tables Tenant

- **Définition TypeScript** : Fichiers Prisma (`models/tenant/*.prisma`)
- **Création Réelle** : SQL brut dans `tenantService.ts` (fonction `applyTenantMigrations`)
- **SQL** : Écrit manuellement (lignes 57-227)

> [!IMPORTANT] > **Synchronisation manuelle requise**
>
> Il existe une duplication intentionnelle de la définition des tables tenant :
>
> - Prisma schemas (pour les types TypeScript)
> - SQL dans `tenantService.ts` (pour la création réelle)
>
> **Lors de modifications de modèles tenant** :
>
> 1. Modifier le fichier `.prisma` correspondant
> 2. Modifier le SQL dans `tenantService.ts:applyTenantMigrations()`
> 3. Vérifier que les deux définitions correspondent

---

## Énumérations

Les énumérations sont réparties selon leur usage :

### Schéma Public

- **`UserRole`** : SUPER_ADMIN, ADMIN, MANAGER, USER

### Schémas Tenant

- **`AttendanceType`** : ENTREE, SORTIE, ABSENCE
- **`StatutPointage`** : A_L_HEURE, EN_RETARD, ABSENT, INCOMPLET
- **`TenantUserRole`** : ADMIN, MANAGER, USER, RH

Fichier : [`enums/index.prisma`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/prisma/enums/index.prisma)

---

## Migrations

### Migrations Public

```bash
# Créer une migration pour les tables public
npx prisma migrate dev --name nom_de_la_migration

# Appliquer en production
npx prisma migrate deploy
```

Ces migrations n'affectent QUE les tables du schéma `public`.

### Modifications Tenant

Lorsque vous modifiez un modèle tenant :

1. **Modifier le fichier Prisma** (ex: `models/tenant/employee.prisma`)
2. **Modifier le SQL dans `tenantService.ts`** (fonction `applyTenantMigrations`)
3. **Option 1 - Nouveaux tenants** : Les nouveaux tenants seront créés avec la nouvelle structure
4. **Option 2 - Tenants existants** : Créer un script de migration dans `scripts/` pour mettre à jour tous les schémas

> [!WARNING] > **Pas de rollback automatique pour les modifications tenant**
>
> Contrairement aux migrations Prisma, les modifications des schémas tenant nécessitent une gestion manuelle du rollback.

---

## Scripts Utiles

### Création d'un Tenant

Via l'API : `POST /api/companies` avec les données de l'organisation

### Suppression d'un Tenant

⚠️ **DESTRUCTIF** - Utiliser avec précaution

```typescript
import { deleteTenantSchema } from "./services/tenantService.js";
await deleteTenantSchema("sirhame_tech"); // Supprime tout le schéma
```

### Vérifier si un Schéma Existe

```typescript
import { schemaExists } from "./services/tenantService.js";
const exists = await schemaExists("sirhame_tech");
```

---

## Performances

### Index Créés Automatiquement

Pour chaque schéma tenant :

```sql
CREATE INDEX "attendances_employeeId_idx" ON "tenant"."attendances"("employeeId");
CREATE INDEX "attendances_date_idx" ON "tenant"."attendances"("date");
CREATE INDEX "bilans_presence_employeeId_idx" ON "tenant"."bilans_presence"("employeeId");
CREATE INDEX "bilans_presence_date_idx" ON "tenant"."bilans_presence"("date");
```

### Cache de Connexions

Les connexions Prisma pour chaque tenant sont mises en cache dans une `Map<string, PrismaClient>` pour éviter de créer trop de connexions.

---

## Déploiement

### Variables d'Environnement

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

**Important** : Le paramètre `schema=public` est obligatoire dans l'URL de base. Les connexions tenant modifient dynamiquement ce paramètre.

### Démarrage de l'Application

1. **Appliquer les migrations public** :

   ```bash
   npx prisma migrate deploy
   ```

2. **Générer le client Prisma** :

   ```bash
   npx prisma generate
   ```

3. **Lancer l'application** :

   ```bash
   npm start
   ```

4. **Créer le super admin** (si nécessaire) :
   ```bash
   npm run db:seed-superadmin
   ```

---

## Dépannage

### "Table does not exist" dans un schéma tenant

**Cause** : Le schéma tenant n'a pas été créé ou les migrations tenant n'ont pas été appliquées.

**Solution** :

```typescript
import { createTenantSchema } from "./services/tenantService.js";
await createTenantSchema("nom_du_schema");
```

### "Enum type does not exist"

**Cause** : Les ENUMs PostgreSQL ne sont pas créés dans le schéma tenant.

**Solution** : Recréer le schéma tenant ou exécuter manuellement la partie création des ENUMs de `applyTenantMigrations`.

### Connexions Prisma qui s'accumulent

**Cause** : Les connexions tenant ne sont pas fermées.

**Solution** : Appeler `disconnectAllTenants()` lors de l'arrêt du serveur (déjà configuré dans `server.ts`).

---

## Sécurité

### Isolation des Données

- ✅ Chaque organisation a son propre schéma PostgreSQL
- ✅ Pas d'accès croisé possible entre tenants au niveau SQL
- ✅ Les connexions Prisma sont filtrées par schéma

### Validation des Noms de Schéma

```typescript
if (!/^[a-z][a-z0-9_]*$/.test(schemaName)) {
  throw new Error(`Nom de schéma invalide: ${schemaName}`);
}
```

Empêche les injections SQL via le nom du schéma.

---

## Références

- **Documentation Prisma MultiSchema** : https://www.prisma.io/docs/orm/prisma-schema/data-model/multi-schema
- **PostgreSQL Schemas** : https://www.postgresql.org/docs/current/ddl-schemas.html
- **Service Tenant** : [`src/services/tenantService.ts`](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/pointage-back/src/services/tenantService.ts)
