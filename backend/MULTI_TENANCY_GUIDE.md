# Guide Multi-Tenancy - Application de Pointage

## 📋 Vue d'ensemble

Ce système implémente une architecture **multi-tenant basée sur les schémas PostgreSQL**. Chaque organisation possède son propre schéma dans la base de données, garantissant une isolation complète des données.

## 🏗️ Architecture

### Structure des schémas

```
pointage_db (Database)
├── public (Schéma public - Super Admin)
│   ├── users (Tous les utilisateurs)
│   └── companies (Toutes les organisations)
│
├── sirhame_tech (Schéma Tenant 1)
│   ├── employees
│   ├── attendances
│   ├── bilans_presence
│   ├── postes
│   ├── departements
│   └── configurations_horaire
│
└── autre_entreprise (Schéma Tenant 2)
    ├── employees
    ├── attendances
    └── ... (mêmes tables)
```

### Rôles utilisateurs

- **SUPER_ADMIN** : Accès au schéma `public`, gestion globale
- **ADMIN** : Administrateur d'une organisation (schéma tenant)
- **MANAGER** : Manager dans une organisation
- **USER** : Utilisateur standard

## 🚀 Processus d'inscription

Lorsqu'un utilisateur s'inscrit :

1. **Validation des données** : email, mot de passe, nom, nom d'organisation, pays
2. **Normalisation du nom** : "Sirhame Tech" → `sirhame_tech` (nom du schéma)
3. **Création de l'organisation** dans la table `companies` (schéma public)
4. **Création du schéma PostgreSQL** : `CREATE SCHEMA sirhame_tech`
5. **Application des migrations** : Création de toutes les tables dans le schéma tenant
6. **Création de l'utilisateur** avec le rôle `ADMIN` et lié à l'organisation
7. **Génération du JWT** contenant `companyId` pour identifier le tenant

## 🔐 Authentification & Tenant

### Token JWT

Le token JWT contient :
```json
{
  "userId": "uuid-utilisateur",
  "email": "user@example.com",
  "role": "ADMIN",
  "companyId": "uuid-organisation"
}
```

### Middleware Tenant

Le middleware `identifyTenant` :
1. Extrait le JWT du header `Authorization`
2. Récupère l'organisation associée depuis `companies`
3. Crée une connexion Prisma vers le schéma tenant
4. Injecte `req.tenantPrisma` et `req.tenantSchema` dans la requête

## 📝 Utilisation dans les Controllers

### Avant (sans multi-tenancy)

```typescript
import { prisma } from '../config/database';

export const getAllEmployees = async (req: Request, res: Response) => {
  const employees = await prisma.employee.findMany();
  // ...
};
```

### Après (avec multi-tenancy)

```typescript
export const getAllEmployees = async (req: Request, res: Response) => {
  // req.tenantPrisma est injecté par le middleware
  const employees = await req.tenantPrisma.employee.findMany();
  // Les données sont automatiquement isolées par schéma
};
```

## 🛣️ Configuration des Routes

### Routes publiques (pas de tenant)

```typescript
import { Router } from 'express';

const router = Router();

// Inscription et connexion - pas de middleware tenant
router.post('/register', registerHandler);
router.post('/login', loginHandler);

export default router;
```

### Routes tenant (nécessitent une organisation)

```typescript
import { Router } from 'express';
import { identifyTenant, requireTenant } from '../middleware/tenantMiddleware';

const router = Router();

// Appliquer le middleware tenant à toutes les routes
router.use(identifyTenant);
router.use(requireTenant);

router.get('/employees', getAllEmployees);
router.post('/employees', createEmployee);
// ...

export default router;
```

## 📊 Migration de la base existante

### Étape 1 : Sauvegarder les données

```bash
# Exporter les données existantes
pg_dump -h localhost -U postgres -d pointage_db --data-only --table=employees > backup_employees.sql
```

### Étape 2 : Appliquer les nouvelles migrations

```bash
cd backend
npx prisma migrate dev --name add_multitenancy
```

### Étape 3 : Créer un tenant pour les données existantes

```typescript
// Script de migration
const migrerDonneesExistantes = async () => {
  // 1. Créer une organisation par défaut
  const company = await prismaPublic.company.create({
    data: {
      name: "Organisation Principale",
      schemaName: "organisation_principale",
      email: "admin@example.com",
      country: "Comores",
    },
  });

  // 2. Créer le schéma
  await createTenantSchema("organisation_principale");

  // 3. Migrer les données (script SQL ou via code)
  // Les employés, pointages, etc. seront copiés vers le nouveau schéma
};
```

## 🔧 Variables d'environnement

```env
# .env
DATABASE_URL="postgresql://postgres:root@localhost:5432/pointage_db?schema=public"
JWT_SECRET="votre-secret-jwt-securise"
NODE_ENV="development"
```

## 📱 Frontend - Mise à jour des Composables API

### config.ts

```typescript
export const getAuthHeaders = () => {
  const token = useCookie('auth_token');
  return {
    'Authorization': `Bearer ${token.value}`,
    'Content-Type': 'application/json',
  };
};
```

### Inscription

```typescript
export const useAuthApi = () => {
  const register = async (data: {
    name: string;
    email: string;
    password: string;
    companyName: string;  // Nouveau champ
    country: string;      // Nouveau champ
    address?: string;     // Optionnel
  }) => {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: data,
    });
    return response;
  };
  
  return { register };
};
```

## 🧪 Tests

### Tester la création d'un tenant

```bash
# 1. Inscription
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed",
    "email": "ahmed@test.com",
    "password": "Password123!",
    "companyName": "Test Company",
    "country": "Comores"
  }'

# 2. Vérifier le schéma créé
psql -U postgres -d pointage_db -c "\dn"
# Doit afficher : public, test_company

# 3. Vérifier les tables du tenant
psql -U postgres -d pointage_db -c "\dt test_company.*"
```

## 🔒 Sécurité

### Isolation des données

✅ **Chaque tenant a son propre schéma PostgreSQL**
✅ **Impossible d'accéder aux données d'un autre tenant**
✅ **Le middleware vérifie automatiquement les permissions**

### Bonnes pratiques

1. **Toujours utiliser `req.tenantPrisma`** au lieu de `prisma` dans les controllers tenant
2. **Valider le `companyId`** dans le JWT
3. **Logger les accès tenant** pour l'audit
4. **Sauvegardes régulières** de tous les schémas

## 🐛 Dépannage

### Erreur : "Aucune configuration horaire active"

**Cause** : Le schéma tenant ne contient pas de configuration
**Solution** : Chaque tenant doit créer sa propre configuration horaire

### Erreur : "Organisation non trouvée"

**Cause** : Le `companyId` dans le JWT est invalide
**Solution** : Reconnecter l'utilisateur pour obtenir un nouveau token

### Erreur : "Schéma déjà existant"

**Cause** : Tentative de créer un tenant avec un nom déjà utilisé
**Solution** : Choisir un nom d'organisation différent

## 📚 Ressources

- [PostgreSQL Schemas](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [Prisma Multi-Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [JWT Best Practices](https://auth0.com/blog/jwt-authentication-best-practices/)

## 🎯 Checklist Déploiement

- [ ] Migrations Prisma appliquées
- [ ] Variables d'environnement configurées
- [ ] Tests d'inscription/connexion réussis
- [ ] Vérification de l'isolation des données
- [ ] Sauvegarde de la base de données
- [ ] Monitoring des performances
- [ ] Documentation utilisateur mise à jour
