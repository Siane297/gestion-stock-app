# Guide de Migration vers Multi-Tenancy

## 🎯 Objectif

Migrer l'application de pointage d'une architecture mono-tenant vers une architecture multi-tenant avec schémas PostgreSQL séparés.

## ⚠️ Prérequis

- ✅ Sauvegarde complète de la base de données
- ✅ Accès administrateur PostgreSQL
- ✅ Node.js et npm installés
- ✅ Arrêt de l'application (backend et frontend)

## 📋 Étapes de Migration

### 1️⃣ Sauvegarde de la base de données

```bash
# Créer un répertoire de sauvegarde
mkdir -p backup

# Sauvegarder toute la base
pg_dump -h localhost -U postgres -d pointage_db -F c -f backup/pointage_db_backup_$(date +%Y%m%d).dump

# Sauvegarder les données uniquement (pour référence)
pg_dump -h localhost -U postgres -d pointage_db --data-only > backup/data_backup.sql
```

### 2️⃣ Mise à jour du schéma Prisma

Le nouveau schéma a déjà été créé avec :
- Modèle `Company` (organisations)
- Modèle `User` avec relation vers `Company`
- Rôle `SUPER_ADMIN` ajouté

```bash
cd backend

# Générer les migrations
npx prisma migrate dev --name add_multitenancy

# Générer le client Prisma
npx prisma generate
```

### 3️⃣ Créer un super administrateur

```sql
-- Se connecter à PostgreSQL
psql -U postgres -d pointage_db

-- Créer un compte SUPER_ADMIN
INSERT INTO users (id, name, email, password, role, "isActive", "emailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Super Admin',
  'admin@pointage.com',
  '$2a$10$...', -- Hash bcrypt du mot de passe
  'SUPER_ADMIN',
  true,
  true,
  NOW(),
  NOW()
);
```

### 4️⃣ Créer une organisation pour les données existantes

```typescript
// scripts/migrate-existing-data.ts
import { prismaPublic, createTenantSchema } from '../src/services/tenantService';

async function migrateExistingData() {
  console.log('🚀 Début de la migration...');

  // 1. Créer l'organisation principale
  const company = await prismaPublic.company.create({
    data: {
      name: "Organisation Principale",
      schemaName: "organisation_principale",
      email: "admin@exemple.com",
      country: "Comores",
      address: "Moroni",
      isActive: true,
    },
  });

  console.log(`✅ Organisation créée: ${company.name}`);

  // 2. Créer le schéma tenant
  await createTenantSchema(company.schemaName);
  console.log(`✅ Schéma créé: ${company.schemaName}`);

  // 3. Migrer les données du schéma public vers le schéma tenant
  await prismaPublic.$executeRawUnsafe(`
    -- Copier les postes
    INSERT INTO "${company.schemaName}".postes
    SELECT * FROM public.postes;

    -- Copier les départements
    INSERT INTO "${company.schemaName}".departements
    SELECT * FROM public.departements;

    -- Copier les employés
    INSERT INTO "${company.schemaName}".employees
    SELECT * FROM public.employees;

    -- Copier les pointages
    INSERT INTO "${company.schemaName}".attendances
    SELECT * FROM public.attendances;

    -- Copier les bilans
    INSERT INTO "${company.schemaName}".bilans_presence
    SELECT * FROM public.bilans_presence;

    -- Copier les configurations horaires
    INSERT INTO "${company.schemaName}".configurations_horaire
    SELECT * FROM public.configurations_horaire;
  `);

  console.log(`✅ Données migrées vers ${company.schemaName}`);

  // 4. Mettre à jour les utilisateurs existants pour les lier à l'organisation
  await prismaPublic.user.updateMany({
    where: {
      role: { not: 'SUPER_ADMIN' },
      companyId: null,
    },
    data: {
      companyId: company.id,
      role: 'ADMIN', // Premier utilisateur devient ADMIN
    },
  });

  console.log('✅ Utilisateurs liés à l\'organisation');

  // 5. Nettoyer les tables du schéma public (optionnel)
  // ATTENTION: Sauvegarde avant de faire cela!
  /*
  await prismaPublic.$executeRaw`
    TRUNCATE TABLE public.employees CASCADE;
    TRUNCATE TABLE public.attendances CASCADE;
    TRUNCATE TABLE public.bilans_presence CASCADE;
    -- etc.
  `;
  */

  console.log('🎉 Migration terminée avec succès!');
}

migrateExistingData()
  .catch(console.error)
  .finally(() => prismaPublic.$disconnect());
```

Exécuter le script :

```bash
cd backend
npx tsx scripts/migrate-existing-data.ts
```

### 5️⃣ Mettre à jour les routes

Modifier `src/server.ts` ou `src/app.ts` :

```typescript
import { identifyTenant, requireTenant } from './middleware/tenantMiddleware';

// Routes publiques (sans tenant)
app.use('/api/auth', authRoutes);

// Routes tenant (nécessitent une organisation)
app.use('/api/employees', identifyTenant, requireTenant, employeeRoutes);
app.use('/api/attendances', identifyTenant, requireTenant, attendanceRoutes);
app.use('/api/bilans', identifyTenant, requireTenant, bilanRoutes);
app.use('/api/configurations-horaire', identifyTenant, requireTenant, configurationRoutes);
app.use('/api/postes', identifyTenant, requireTenant, posteRoutes);
app.use('/api/departements', identifyTenant, requireTenant, departementRoutes);
```

### 6️⃣ Mettre à jour les controllers

Pour chaque controller, remplacer `prisma` par `req.tenantPrisma` :

**Exemple - employeeController.ts**

```typescript
// AVANT
import { prisma } from '../config/database';

export const getAllEmployees = async (req: Request, res: Response) => {
  const employees = await prisma.employee.findMany();
  // ...
};

// APRÈS
export const getAllEmployees = async (req: Request, res: Response) => {
  const employees = await req.tenantPrisma.employee.findMany();
  // ...
};
```

### 7️⃣ Mettre à jour le Frontend

**Modifier le formulaire d'inscription :**

```vue
<!-- pages/inscription.vue -->
<script setup lang="ts">
const formData = ref({
  name: '',
  email: '',
  password: '',
  companyName: '',  // Nouveau
  country: '',      // Nouveau
  address: '',      // Optionnel
});

const handleRegister = async () => {
  try {
    await registerUser(formData.value);
    navigateTo('/dashboard');
  } catch (error) {
    // Gérer l'erreur
  }
};
</script>

<template>
  <form @submit.prevent="handleRegister">
    <input v-model="formData.name" placeholder="Nom complet" required />
    <input v-model="formData.email" type="email" placeholder="Email" required />
    <input v-model="formData.password" type="password" placeholder="Mot de passe" required />
    
    <!-- Nouveaux champs -->
    <input v-model="formData.companyName" placeholder="Nom de l'organisation" required />
    <select v-model="formData.country" required>
      <option value="">Sélectionner un pays</option>
      <option value="Comores">Comores</option>
      <option value="France">France</option>
      <!-- ... -->
    </select>
    <input v-model="formData.address" placeholder="Adresse (optionnel)" />
    
    <button type="submit">S'inscrire</button>
  </form>
</template>
```

### 8️⃣ Tests de validation

```bash
# 1. Démarrer le backend
cd backend
npm run dev

# 2. Tester l'inscription d'un nouveau tenant
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "companyName": "Test Company",
    "country": "Comores"
  }'

# 3. Vérifier que le schéma a été créé
psql -U postgres -d pointage_db -c "\dn"

# 4. Vérifier les tables du tenant
psql -U postgres -d pointage_db -c "\dt test_company.*"

# 5. Se connecter et tester les endpoints
curl -X GET http://localhost:3001/api/employees \
  -H "Authorization: Bearer <token>"
```

### 9️⃣ Vérification de l'isolation

```sql
-- Vérifier que chaque schéma a ses propres données
SELECT schemaname, COUNT(*) 
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
GROUP BY schemaname;

-- Compter les employés par schéma
SELECT 'organisation_principale', COUNT(*) FROM organisation_principale.employees
UNION ALL
SELECT 'test_company', COUNT(*) FROM test_company.employees;
```

### 🔟 Déploiement

1. **Commit des changements**
   ```bash
   git add .
   git commit -m "feat: Implement multi-tenancy with PostgreSQL schemas"
   ```

2. **Déployer sur le serveur de production**
   - Sauvegarder la base de production
   - Appliquer les migrations
   - Exécuter le script de migration des données
   - Redémarrer les services

3. **Monitoring**
   - Vérifier les logs d'erreur
   - Surveiller les performances
   - Valider l'isolation des données

## 🔄 Rollback (en cas de problème)

```bash
# Restaurer la sauvegarde
pg_restore -h localhost -U postgres -d pointage_db -c backup/pointage_db_backup_YYYYMMDD.dump

# Revenir au code précédent
git revert HEAD
```

## ✅ Checklist finale

- [ ] Base de données sauvegardée
- [ ] Migrations Prisma appliquées
- [ ] Super admin créé
- [ ] Organisation principale créée
- [ ] Données existantes migrées
- [ ] Routes mises à jour avec middleware tenant
- [ ] Controllers mis à jour (prisma → req.tenantPrisma)
- [ ] Frontend mis à jour (formulaire inscription)
- [ ] Tests réussis (inscription, connexion, CRUD)
- [ ] Isolation des données vérifiée
- [ ] Documentation mise à jour
- [ ] Équipe formée sur le nouveau système

## 🆘 Support

En cas de problème, contacter l'équipe technique avec :
- Logs d'erreur complets
- Version de PostgreSQL
- Étape où le problème survient
- Capture d'écran si applicable

---

**🎉 Félicitations ! Votre application est maintenant multi-tenant !**
