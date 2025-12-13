---
description: Comment ajouter une nouvelle fonctionnalité backend (entité CRUD complète)
---

# Ajouter une nouvelle entité backend

## Prérequis

- Node.js installé
- Base de données PostgreSQL configurée

## Étapes

### 1. Créer le schéma Prisma

Créer un fichier dans `backend/prisma/models/tenant/[entite].prisma`:

```prisma
model nom_entite {
    id              String   @id @default(uuid())
    nom             String
    description     String?
    est_actif       Boolean  @default(true)
    date_creation   DateTime @default(now())
    date_modification DateTime @updatedAt

    @@map("nom_entites")
}
```

// turbo

### 2. Générer le client Prisma

```bash
cd backend && npx prisma generate
```

### 3. Créer le Service

Créer `backend/src/services/[entite]Service.ts` en suivant le pattern:

- Importer PrismaClient et logger
- Définir les DTOs (Create, Update)
- Créer la classe avec méthodes: getAll, getById, create, update, delete
- Ajouter validation dans méthode privée validateData()
- Logger les actions importantes

### 4. Créer le Controller

Créer `backend/src/controllers/[entite]Controller.ts`:

- Importer le Service et logger
- Créer les fonctions: getAll[Entites], get[Entite]ById, create[Entite], update[Entite], delete[Entite]
- Toujours instancier le service avec `new Service(req.tenantPrisma)`
- Valider `req.params.id` avant utilisation
- Retourner `{ success: true/false, data?, message? }`

### 5. Créer les Routes

Créer `backend/src/routes/[entite]Routes.ts`:

- Importer Router, authenticate, et les controllers
- Définir les routes GET, POST, PUT, DELETE

### 6. Enregistrer dans server.ts

Dans `backend/src/server.ts`:

```typescript
// Import
import entiteRoutes from "./routes/entiteRoutes.js";

// Route (dans la section "Routes gestion stock")
app.use("/api/entites", identifyTenant, requireTenant, entiteRoutes);
```

### 7. Exporter dans services/index.ts

Ajouter l'export dans `backend/src/services/index.ts`:

```typescript
export { EntiteService } from "./entiteService.js";
export type { CreateEntiteDto, UpdateEntiteDto } from "./entiteService.js";
```

// turbo

### 8. Vérifier la compilation

```bash
cd backend && npx tsc --noEmit
```

## Référence

Voir `backend/.agent/ARCHITECTURE_REFERENCE.md` pour les patterns détaillés.
