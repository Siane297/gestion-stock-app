# Architecture Backend - Guide de Référence pour IA

Ce document définit l'architecture et les conventions du backend. **Toute nouvelle fonctionnalité doit suivre ces patterns.**

---

## 📁 Structure des dossiers

```
backend/
├── prisma/
│   ├── models/
│   │   ├── public/          # Schémas globaux (organizations, users)
│   │   └── tenant/          # Schémas par tenant (produits, ventes, etc.)
│   ├── schema.prisma        # Agrégation des modèles
│   └── migrations/
├── src/
│   ├── config/              # Configuration (database, logger)
│   ├── controllers/         # Gestion HTTP uniquement
│   ├── services/            # Logique métier
│   ├── routes/              # Définition des endpoints
│   ├── middleware/          # Auth, tenant, validation
│   ├── types/               # Types TypeScript
│   ├── utils/               # Utilitaires
│   ├── validators/          # Schémas de validation
│   └── server.ts            # Point d'entrée
└── templates/               # Templates HTML (PDF, emails)
```

---

## 🏗️ Architecture Multi-Tenant

Le système utilise **un schéma PostgreSQL par tenant** (organisation).

### Flux d'une requête tenant

```
Requête HTTP → tenantMiddleware → authMiddleware → Controller → Service → Prisma
```

- `identifyTenant`: Extrait le tenant depuis le token JWT
- `requireTenant`: Vérifie que le tenant existe et injecte `req.tenantPrisma`
- `authenticate`: Vérifie le token JWT et injecte `req.user`

### Accès à Prisma

```typescript
// Dans un controller tenant
const service = new MonService(req.tenantPrisma); // ✅ Utiliser req.tenantPrisma

// Dans un controller public (super admin)
import { prismaPublic } from "../services/tenantService.js";
await prismaPublic.organization.findMany();
```

---

## 📝 Convention de Nommage

| Élément      | Convention               | Exemple                             |
| ------------ | ------------------------ | ----------------------------------- |
| Service      | `PascalCase` + `Service` | `ProduitService`                    |
| Controller   | `camelCase` + action     | `getAllProduits`, `createProduit`   |
| Route file   | `camelCase` + `Routes`   | `produitRoutes.ts`                  |
| DTO          | `PascalCase` + `Dto`     | `CreateProduitDto`                  |
| Prisma model | `snake_case`             | `stock_magasin`, `mouvements_stock` |
| Champs DB    | `snake_case`             | `est_actif`, `date_creation`        |

---

## 🎯 Pattern Service-Controller

### 1. Service (Logique Métier)

**Fichier**: `src/services/[entite]Service.ts`

```typescript
import { PrismaClient } from "@prisma/client";
import { logger } from "../config/logger.js";

// 1. Définir les DTOs
export interface CreateEntiteDto {
  nom: string;
  // ... autres champs obligatoires
}

export interface UpdateEntiteDto {
  nom?: string;
  // ... champs optionnels
}

// 2. Classe Service
export class EntiteService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // 3. Méthode privée de validation
  private validateData(data: CreateEntiteDto | UpdateEntiteDto): void {
    if ("nom" in data && data.nom !== undefined) {
      const nom = String(data.nom).trim();
      if (!nom || nom.length < 2) {
        throw new Error("Le nom doit contenir au moins 2 caractères");
      }
    }
    // ... autres validations
  }

  // 4. Méthodes CRUD
  async getAll(filters?: { search?: string }): Promise<any[]> {
    const where: any = {};
    if (filters?.search) {
      where.nom = { contains: filters.search, mode: "insensitive" };
    }
    return this.prisma.entite.findMany({
      where,
      orderBy: { date_creation: "desc" },
    });
  }

  async getById(id: string): Promise<any> {
    const entite = await this.prisma.entite.findUnique({ where: { id } });
    if (!entite) throw new Error("Entité non trouvée");
    return entite;
  }

  async create(data: CreateEntiteDto): Promise<any> {
    this.validateData(data);
    // Vérifications unicité si nécessaire
    const entite = await this.prisma.entite.create({
      data: { nom: String(data.nom).trim() },
    });
    logger.info(`Entité créée: ${entite.id}`);
    return entite;
  }

  async update(id: string, data: UpdateEntiteDto): Promise<any> {
    const existing = await this.prisma.entite.findUnique({ where: { id } });
    if (!existing) throw new Error("Entité non trouvée");
    this.validateData(data);
    const entite = await this.prisma.entite.update({
      where: { id },
      data: { nom: data.nom?.trim() },
    });
    logger.info(`Entité mise à jour: ${entite.id}`);
    return entite;
  }

  async delete(id: string): Promise<{ deleted: boolean; message: string }> {
    const existing = await this.prisma.entite.findUnique({ where: { id } });
    if (!existing) throw new Error("Entité non trouvée");

    // Vérifier les dépendances avant suppression
    const hasDeps = await this.prisma.autre_entite.count({
      where: { entite_id: id },
    });

    if (hasDeps > 0) {
      // Soft delete
      await this.prisma.entite.update({
        where: { id },
        data: { est_actif: false },
      });
      return {
        deleted: false,
        message: "Entité désactivée (dépendances existantes)",
      };
    }

    // Hard delete
    await this.prisma.entite.delete({ where: { id } });
    return { deleted: true, message: "Entité supprimée avec succès" };
  }
}

export default EntiteService;
```

### 2. Controller (Gestion HTTP)

**Fichier**: `src/controllers/[entite]Controller.ts`

```typescript
import type { Request, Response } from "express";
import { EntiteService } from "../services/entiteService.js";
import { logger } from "../config/logger.js";

export const getAllEntites = async (req: Request, res: Response) => {
  try {
    const service = new EntiteService(req.tenantPrisma);
    const entites = await service.getAll({
      search: req.query.search as string,
    });
    res.json({ success: true, data: entites });
  } catch (error: any) {
    logger.error("Erreur getAllEntites:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEntiteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "ID requis" });
    }
    const service = new EntiteService(req.tenantPrisma);
    const entite = await service.getById(id);
    res.json({ success: true, data: entite });
  } catch (error: any) {
    logger.error("Erreur getEntiteById:", error);
    const status = error.message.includes("non trouvé") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const createEntite = async (req: Request, res: Response) => {
  try {
    const service = new EntiteService(req.tenantPrisma);
    const entite = await service.create(req.body);
    res
      .status(201)
      .json({ success: true, message: "Créé avec succès", data: entite });
  } catch (error: any) {
    logger.error("Erreur createEntite:", error);
    const status = error.message.includes("existe déjà") ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const updateEntite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "ID requis" });
    }
    const service = new EntiteService(req.tenantPrisma);
    const entite = await service.update(id, req.body);
    res.json({
      success: true,
      message: "Mis à jour avec succès",
      data: entite,
    });
  } catch (error: any) {
    logger.error("Erreur updateEntite:", error);
    const status = error.message.includes("non trouvé") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const deleteEntite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "ID requis" });
    }
    const service = new EntiteService(req.tenantPrisma);
    const result = await service.delete(id);
    res.json({ success: true, message: result.message });
  } catch (error: any) {
    logger.error("Erreur deleteEntite:", error);
    const status = error.message.includes("non trouvé") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};
```

### 3. Routes

**Fichier**: `src/routes/[entite]Routes.ts`

```typescript
import { Router } from "express";
import {
  getAllEntites,
  getEntiteById,
  createEntite,
  updateEntite,
  deleteEntite,
} from "../controllers/entiteController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", getAllEntites);
router.get("/:id", getEntiteById);
router.post("/", createEntite);
router.put("/:id", updateEntite);
router.delete("/:id", deleteEntite);

export default router;
```

### 4. Enregistrement dans server.ts

```typescript
// Import
import entiteRoutes from "./routes/entiteRoutes.js";

// Enregistrement (après les middlewares)
app.use("/api/entites", identifyTenant, requireTenant, entiteRoutes);
```

---

## 📊 Schéma Prisma (Tenant)

**Fichier**: `prisma/models/tenant/[entite].prisma`

```prisma
model entite {
    id              String   @id @default(uuid())
    nom             String
    description     String?
    est_actif       Boolean  @default(true)
    date_creation   DateTime @default(now())
    date_modification DateTime @updatedAt

    // Relations
    autre_entites   autre_entite[]

    // Index
    @@index([nom])
    @@map("entites")  // Nom de la table en snake_case
}
```

### Conventions Prisma

| Type          | Convention                               |
| ------------- | ---------------------------------------- |
| ID            | `String @id @default(uuid())`            |
| Booléen actif | `est_actif Boolean @default(true)`       |
| Dates         | `date_creation DateTime @default(now())` |
| Relations     | Pluriel pour `1-N`, singulier pour `N-1` |
| Enums         | `MAJUSCULES_UNDERSCORE`                  |

---

## 🔐 Réponses API

### Format standard

```typescript
// Succès
{
  success: true,
  data: { ... },
  message?: "Message optionnel"
}

// Erreur
{
  success: false,
  message: "Description de l'erreur"
}
```

### Codes HTTP

| Code | Usage                                 |
| ---- | ------------------------------------- |
| 200  | GET, PUT, PATCH, DELETE réussi        |
| 201  | POST création réussie                 |
| 400  | Validation échouée, données invalides |
| 401  | Non authentifié                       |
| 403  | Non autorisé                          |
| 404  | Ressource non trouvée                 |
| 500  | Erreur serveur                        |

---

## 📋 Checklist Nouvelle Fonctionnalité

1. [ ] Créer le schéma Prisma dans `prisma/models/tenant/`
2. [ ] Exécuter `npx prisma generate`
3. [ ] Créer le Service dans `src/services/`
4. [ ] Créer le Controller dans `src/controllers/`
5. [ ] Créer les Routes dans `src/routes/`
6. [ ] Enregistrer les routes dans `server.ts`
7. [ ] Exporter le service dans `src/services/index.ts`
8. [ ] Tester avec `npx tsc --noEmit`

---

## 🔧 Commandes Utiles

```bash
# Générer le client Prisma
npx prisma generate

# Créer une migration
npx prisma migrate dev --name nom_migration

# Vérifier TypeScript
npx tsc --noEmit

# Démarrer en dev
npm run dev
```

---

## 📚 Services Existants (Référence)

| Service              | Responsabilités                   |
| -------------------- | --------------------------------- |
| `StockService`       | Mouvements stock, alertes, totaux |
| `ProduitService`     | CRUD produits, historique prix    |
| `VenteService`       | Ventes, déstockage, facturation   |
| `AchatService`       | Commandes, réception, retours     |
| `ClientService`      | Clients, gestion crédit           |
| `FournisseurService` | Fournisseurs, statistiques        |
| `MagasinService`     | Magasins, stock par magasin       |
| `AuditService`       | Traçabilité des opérations        |
| `CategorieService`   | Catégories produits               |
| `TenantService`      | Gestion multi-tenant, Prisma      |
