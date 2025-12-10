# 🚀 Guide des Migrations Prisma en Production

> **Documentation de référence pour éviter toute perte de données en production**

---

## 📋 Table des matières

1. [Comprendre les risques](#comprendre-les-risques)
2. [Workflow de migration sécurisé](#workflow-de-migration-sécurisé)
3. [Commandes Prisma : Local vs Production](#commandes-prisma--local-vs-production)
4. [Cas particuliers : Multi-tenant](#cas-particuliers--multi-tenant)
5. [Modifications sensibles](#modifications-sensibles)
6. [Checklist avant déploiement](#checklist-avant-déploiement)
7. [Gestion des erreurs](#gestion-des-erreurs)
8. [Exemples concrets du projet](#exemples-concrets-du-projet)

---

## 🧠 1. Comprendre les risques

### ❌ Ce qu'il ne faut JAMAIS faire en production

```bash
# ❌ DANGER : Réinitialise la base et perd les données
npx prisma migrate dev

# ❌ DANGER : Reset complet de la base
npx prisma migrate reset

# ❌ DANGER : Push direct sans migration
npx prisma db push
```

### ✅ Ce qu'il faut faire

```bash
# ✅ Applique uniquement les migrations créées localement
npx prisma migrate deploy

# ✅ Génère le client Prisma après migration
npx prisma generate
```

---

## ⚙️ 2. Workflow de migration sécurisé

### **Étape par étape**

| Étape | Action | Environnement | Commande |
|-------|--------|---------------|----------|
| 1️⃣ | Modifier `schema.prisma` | Local | Éditeur |
| 2️⃣ | Créer la migration | Local | `npx prisma migrate dev --name description_changement` |
| 3️⃣ | Tester localement | Local | Tests manuels + automatisés |
| 4️⃣ | Vérifier le SQL généré | Local | Lire `prisma/migrations/XXXXXX_nom/migration.sql` |
| 5️⃣ | Sauvegarder la base | Production | `pg_dump` ou backup Render/Railway |
| 6️⃣ | Commit et push | Git | `git add . && git commit && git push` |
| 7️⃣ | Déployer (auto sur Render) | Production | Render redéploie automatiquement |
| 8️⃣ | Appliquer migration | Production | `npx prisma migrate deploy` (dans start script) |
| 9️⃣ | Vérifier le fonctionnement | Production | Tester l'app en production |

---

## 📦 3. Commandes Prisma : Local vs Production

### **Local (Développement)**

```bash
# Créer une nouvelle migration
npx prisma migrate dev --name add_isowner_field

# Créer migration sans l'appliquer (pour éditer le SQL)
npx prisma migrate dev --name migration_name --create-only

# Réinitialiser la base locale (OK en dev)
npx prisma migrate reset

# Visualiser la base
npx prisma studio
```

### **Production (Render/Railway/Vercel)**

```bash
# Appliquer TOUTES les migrations en attente
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate

# Vérifier l'état des migrations
npx prisma migrate status
```

### **Script `package.json` recommandé**

```json
{
  "scripts": {
    "start": "npx prisma migrate deploy && npm run db:seed && node dist/src/server.js",
    "build": "npx prisma generate && tsc",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:status": "prisma migrate status"
  }
}
```

---

## 🏢 4. Cas particuliers : Multi-tenant

### **Notre architecture**

- **Schéma public** : `users`, `companies`
- **Schémas tenant** : `amel_tech`, `entreprise_xyz`, etc.

### **⚠️ Problème spécifique**

Les migrations Prisma ne gèrent QUE le schéma public. Les schémas tenant sont créés dynamiquement via `tenantService.ts`.

### **✅ Solution**

#### **1. Modification du schéma public (User, Company)**

```bash
# Normal : Prisma gère automatiquement
npx prisma migrate dev --name update_company_schema
```

#### **2. Modification des schémas tenant (Employee, Attendance, etc.)**

**Étapes obligatoires :**

1. **Modifier `schema.prisma`**
   ```prisma
   model Employee {
     positionId   String?  // Changement ici
     departmentId String?  // Changement ici
   }
   ```

2. **Créer la migration Prisma (pour référence)**
   ```bash
   npx prisma migrate dev --name make_position_optional
   ```

3. **⚠️ IMPORTANT : Modifier `src/services/tenantService.ts`**
   
   Mettre à jour la fonction `applyTenantMigrations()` :
   ```typescript
   // 3. Table Employees
   await prismaPublic.$executeRawUnsafe(`
     CREATE TABLE IF NOT EXISTS "${schemaName}"."employees" (
       ...
       "positionId" TEXT,        -- ✅ Retirer NOT NULL
       "departmentId" TEXT,      -- ✅ Retirer NOT NULL
       ...
     )
   `);
   ```

4. **Créer un script de migration pour les tenants existants**
   ```typescript
   // scripts/migrate-existing-tenants.ts
   const companies = await prismaPublic.company.findMany();
   
   for (const company of companies) {
     const tenantPrisma = getTenantConnection(company.schemaName);
     
     await tenantPrisma.$executeRawUnsafe(`
       ALTER TABLE "${company.schemaName}"."employees"
       ALTER COLUMN "positionId" DROP NOT NULL,
       ALTER COLUMN "departmentId" DROP NOT NULL
     `);
   }
   ```

5. **Exécuter le script en production**
   ```bash
   DATABASE_URL="postgresql://..." npx tsx scripts/migrate-existing-tenants.ts
   ```

---

## 🔧 5. Modifications sensibles

### **5.1. Renommer une colonne**

❌ **Mauvaise approche**
```prisma
model Employee {
  // fullname → fullName (perte de données)
  fullName String
}
```

✅ **Bonne approche**
```sql
-- Migration 1 : Ajouter la nouvelle colonne
ALTER TABLE "employees" ADD COLUMN "fullName" TEXT;

-- Migration 2 : Copier les données
UPDATE "employees" SET "fullName" = "fullname";

-- Migration 3 : Rendre NOT NULL si nécessaire
ALTER TABLE "employees" ALTER COLUMN "fullName" SET NOT NULL;

-- Migration 4 (ultérieure) : Supprimer l'ancienne
ALTER TABLE "employees" DROP COLUMN "fullname";
```

### **5.2. Changer un type de colonne**

```sql
-- TEXT → INTEGER (exemple : phoneNumber)

-- Étape 1 : Nouvelle colonne temporaire
ALTER TABLE "employees" ADD COLUMN "phoneNumberTemp" INTEGER;

-- Étape 2 : Convertir et copier
UPDATE "employees" 
SET "phoneNumberTemp" = CAST("phoneNumber" AS INTEGER)
WHERE "phoneNumber" ~ '^[0-9]+$'; -- Seulement si numérique

-- Étape 3 : Drop ancienne, renommer nouvelle
ALTER TABLE "employees" DROP COLUMN "phoneNumber";
ALTER TABLE "employees" RENAME COLUMN "phoneNumberTemp" TO "phoneNumber";
```

### **5.3. Rendre une colonne optionnelle (comme notre cas)**

```sql
-- Exemple : positionId NOT NULL → NULL
ALTER TABLE "employees" ALTER COLUMN "positionId" DROP NOT NULL;
ALTER TABLE "employees" ALTER COLUMN "departmentId" DROP NOT NULL;
```

### **5.4. Ajouter une contrainte de clé étrangère**

```sql
-- ON DELETE RESTRICT → ON DELETE SET NULL
ALTER TABLE "employees" DROP CONSTRAINT "employees_positionId_fkey";
ALTER TABLE "employees" ADD CONSTRAINT "employees_positionId_fkey" 
  FOREIGN KEY ("positionId") 
  REFERENCES "postes"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;
```

---

## ✅ 6. Checklist avant déploiement

### **Avant chaque déploiement avec migration**

- [ ] 📝 Lire le fichier SQL généré (`migration.sql`)
- [ ] 🧪 Tester localement avec des données réalistes
- [ ] 💾 Backup de la base de production
- [ ] 📊 Vérifier l'impact sur les schémas tenant (si applicable)
- [ ] 🚀 Tester le script de rollback
- [ ] 📱 Informer l'équipe du déploiement
- [ ] 🔍 Vérifier les index et performances
- [ ] ⏱️ Prévoir une fenêtre de maintenance si nécessaire

### **Commandes de backup**

```bash
# Backup complet (Render/Railway)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup d'une table spécifique
pg_dump $DATABASE_URL -t public.users > backup_users.sql

# Backup de tous les schémas tenant
pg_dump $DATABASE_URL -n "amel_tech" > backup_amel_tech.sql
```

### **Restauration en cas d'erreur**

```bash
# Restaurer depuis un backup
psql $DATABASE_URL < backup_20251111_193000.sql

# Restaurer une table spécifique
psql $DATABASE_URL < backup_users.sql
```

---

## 🚨 7. Gestion des erreurs

### **Erreur : "P2011 - Null constraint violation"**

**Cause** : Tentative d'insérer `null` dans une colonne `NOT NULL`.

**Solution** :
```sql
-- Rendre la colonne optionnelle
ALTER TABLE "table_name" ALTER COLUMN "column_name" DROP NOT NULL;
```

### **Erreur : "Migration already applied"**

**Cause** : Migration déjà appliquée mais Prisma ne le détecte pas.

**Solution** :
```bash
# Marquer la migration comme appliquée
npx prisma migrate resolve --applied migration_name
```

### **Erreur : "Foreign key constraint fails"**

**Cause** : Données orphelines (références vers des enregistrements supprimés).

**Solution** :
```sql
-- Trouver les lignes problématiques
SELECT * FROM "employees" 
WHERE "positionId" NOT IN (SELECT "id" FROM "postes");

-- Option 1 : Nettoyer les données
UPDATE "employees" SET "positionId" = NULL 
WHERE "positionId" NOT IN (SELECT "id" FROM "postes");

-- Option 2 : Changer la contrainte
ALTER TABLE "employees" DROP CONSTRAINT "employees_positionId_fkey";
ALTER TABLE "employees" ADD CONSTRAINT "employees_positionId_fkey"
  FOREIGN KEY ("positionId") REFERENCES "postes"("id")
  ON DELETE SET NULL;  -- ✅ Permet NULL si le poste est supprimé
```

---

## 📚 8. Exemples concrets du projet

### **Exemple 1 : Ajout du rôle ADMIN**

**Migration** : `20251111154001_add_admin_role_to_tenant_user`

```sql
-- AlterEnum
ALTER TYPE "TenantUserRole" ADD VALUE 'ADMIN' BEFORE 'MANAGER';

-- AlterTable
ALTER TABLE "employees" ADD COLUMN "isOwner" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "tenant_users" ADD COLUMN "isOwner" BOOLEAN NOT NULL DEFAULT false;
```

**Script de correction pour données existantes** : `scripts/fix-owner-data.ts`

```typescript
// 1. Changer rôle MANAGER → ADMIN
await tenantPrisma.tenantUser.updateMany({
  where: { isOwner: true },
  data: { role: 'ADMIN' },
});

// 2. Mettre positionId/departmentId à NULL
await tenantPrisma.employee.updateMany({
  where: { isOwner: true },
  data: { positionId: null, departmentId: null },
});
```

### **Exemple 2 : Rendre poste/département optionnels**

**Migration** : `20251111163959_make_position_department_optional_for_owner`

```sql
-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_departmentId_fkey";
ALTER TABLE "employees" DROP CONSTRAINT "employees_positionId_fkey";

-- AlterTable
ALTER TABLE "employees" 
  ALTER COLUMN "positionId" DROP NOT NULL,
  ALTER COLUMN "departmentId" DROP NOT NULL;

-- AddForeignKey (avec SET NULL)
ALTER TABLE "employees" ADD CONSTRAINT "employees_positionId_fkey" 
  FOREIGN KEY ("positionId") REFERENCES "postes"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;
```

**⚠️ N'oublie pas** : Mettre à jour `tenantService.ts` pour les nouveaux schémas !

---

## 🎯 Règles d'or

1. **JAMAIS** `prisma migrate dev` ou `prisma migrate reset` en production
2. **TOUJOURS** créer un backup avant une migration
3. **TOUJOURS** tester localement avec des données réalistes
4. **TOUJOURS** lire le SQL généré avant de déployer
5. **TOUJOURS** mettre à jour `tenantService.ts` pour les modifications tenant
6. **TOUJOURS** créer un script de correction pour les données existantes
7. **TOUJOURS** utiliser `ON DELETE SET NULL` pour les relations optionnelles
8. **JAMAIS** supprimer une colonne sans d'abord migrer les données
9. **TOUJOURS** prévoir un plan de rollback
10. **TOUJOURS** vérifier l'état avec `npx prisma migrate status`

---

## 📞 Ressources

- [Prisma Migrations Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Render Database Backups](https://render.com/docs/databases#backups)

---

**Dernière mise à jour** : 2025-11-11  
**Version** : 1.0.0
