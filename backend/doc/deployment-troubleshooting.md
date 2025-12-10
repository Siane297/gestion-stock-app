# 🚨 Guide de dépannage - Erreurs 500 après déploiement

## Problème constaté

Après déploiement sur Render, plusieurs routes API retournent des erreurs **500 Internal Server Error** :

```
❌ GET /api/stats/dashboard - 500
❌ GET /api/charts/statuts - 500
❌ GET /api/tenant-users - 500
```

---

## 🔍 Diagnostic

### Causes probables

#### 1. **ENUMs PostgreSQL non créés dans les schémas tenant**

Le code utilise des ENUMs PostgreSQL spécifiques à chaque schéma tenant :
- `AttendanceType` : `'ENTREE' | 'SORTIE' | 'ABSENCE'`
- `StatutPointage` : `'A_L_HEURE' | 'EN_RETARD' | 'ABSENT' | 'INCOMPLET'`
- `Role` : `'ADMIN' | 'MANAGER' | 'USER' | 'RH'`

**Si ces ENUMs n'existent pas**, toutes les requêtes qui les utilisent échouent avec une erreur 500.

**Fichier concerné** : `src/services/tenantService.ts` ligne 61-80

```typescript
// Création des ENUMs dans le schéma tenant
await prismaPublic.$executeRawUnsafe(`
  DO $$ BEGIN
    CREATE TYPE "${schemaName}"."AttendanceType" AS ENUM ('ENTREE', 'SORTIE', 'ABSENCE');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
`);
```

#### 2. **Base de données non initialisée sur Render**

Lors du premier déploiement, les migrations Prisma créent uniquement le schéma `public`, **pas les schémas tenant**.

Les schémas tenant sont créés dynamiquement via :
- `/api/companies` (création d'une entreprise)
- Script de seed qui appelle `createTenantSchema()`

**Si aucune entreprise n'a été créée**, il n'y a pas de schéma tenant, donc toutes les routes échouent.

#### 3. **Headers x-tenant-id manquants ou invalides**

Les routes tenant nécessitent le header `x-tenant-id` :

```typescript
const tenantId = req.headers['x-tenant-id'] as string;
```

Si ce header est absent ou contient un schéma inexistant, l'erreur 500 est retournée.

---

## ✅ Solutions

### Solution 1 : Exécuter le script de seed sur Render

**Étape 1** : Vérifier que le script seed existe

```bash
# Dans pointage-back/package.json
"scripts": {
  "seed": "tsx prisma/seed-superadmin.ts"
}
```

**Étape 2** : Sur Render, ajouter une commande de build

Dans **Render Dashboard** → Votre service → Settings → Build Command :

```bash
npm install && npm run build && npm run seed
```

Ou créer un script combiné dans `package.json` :

```json
"scripts": {
  "build:production": "npm run build && npm run seed"
}
```

**Étape 3** : Redéployer l'application

Cela va :
1. Créer le super admin
2. Créer l'entreprise par défaut
3. Créer le schéma tenant avec les ENUMs
4. Créer les données de test

---

### Solution 2 : Exécuter manuellement via Shell Render

**Étape 1** : Ouvrir le Shell Render

Dans Render Dashboard → Votre service → **Shell**

**Étape 2** : Exécuter le seed

```bash
npm run seed
```

**Étape 3** : Vérifier les logs

Vous devriez voir :
```
✅ Super Admin créé
✅ Entreprise créée avec schéma: sirhame_tech
✅ Départements créés
✅ Postes créés
✅ Employés créés
✅ TenantUser RH créé
```

---

### Solution 3 : Corriger l'ENUM StatutPointage (Erreur: invalid input value)

**Symptôme** :
```
invalid input value for enum "StatutPointage": "A_L_HEURE"
```

**Cause** : L'ENUM PostgreSQL existe avec les mauvaises valeurs ou est corrompu.

**Solution rapide via Shell Render** :

```bash
# 1. Se connecter à PostgreSQL
psql $DATABASE_URL

# 2. Supprimer et recréer l'ENUM (remplacer 'sirhame_tech' par votre schéma)
DROP TYPE IF EXISTS "sirhame_tech"."StatutPointage" CASCADE;

CREATE TYPE "sirhame_tech"."StatutPointage" AS ENUM (
  'A_L_HEURE', 
  'EN_RETARD', 
  'ABSENT', 
  'INCOMPLET'
);

# 3. Recréer la table bilans_presence
DROP TABLE IF EXISTS "sirhame_tech"."bilans_presence" CASCADE;

CREATE TABLE "sirhame_tech"."bilans_presence" (
  "id" TEXT PRIMARY KEY,
  "employeeId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "statut" "sirhame_tech"."StatutPointage" NOT NULL,
  "heureEntree" TIMESTAMP(3),
  "heureSortie" TIMESTAMP(3),
  "dureeTravailMinutes" INTEGER NOT NULL DEFAULT 0,
  "retardMinutes" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "bilans_presence_employeeId_fkey" 
    FOREIGN KEY ("employeeId") 
    REFERENCES "sirhame_tech"."employees"("id") 
    ON DELETE CASCADE,
  CONSTRAINT "bilans_presence_employeeId_date_key" 
    UNIQUE ("employeeId", "date")
);

# 4. Quitter
\q
```

**Puis redéployer** l'application sur Render (Manual Deploy).

---

### Solution 4 : Vérifier la base de données PostgreSQL

**Étape 1** : Connecter à la base Render via psql

```bash
# Récupérer l'URL de connexion depuis Render Dashboard
psql postgresql://user:password@host:5432/database
```

**Étape 2** : Vérifier les schémas existants

```sql
-- Lister tous les schémas
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name NOT IN ('pg_catalog', 'information_schema');

-- Résultat attendu:
-- public
-- sirhame_tech  (ou autre nom d'entreprise)
```

**Étape 3** : Vérifier les ENUMs dans un schéma tenant

```sql
-- Remplacer 'sirhame_tech' par le nom de votre schéma
SELECT typname 
FROM pg_type 
WHERE typnamespace = (
  SELECT oid FROM pg_namespace WHERE nspname = 'sirhame_tech'
) 
AND typtype = 'e';

-- Résultat attendu:
-- AttendanceType
-- StatutPointage
-- Role
```

**Étape 4** : Vérifier les tables tenant

```sql
SET search_path TO sirhame_tech;

\dt  -- Liste toutes les tables

-- Résultat attendu:
-- Employee
-- Department
-- Position
-- Attendance
-- BilanPresence
-- TenantUser
```

---

### Solution 4 : Créer manuellement un schéma tenant (si nécessaire)

**Si le seed a échoué**, créer manuellement via API :

**Étape 1** : Obtenir un token Super Admin

```bash
curl -X POST https://pointage-back.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@pointage.com",
    "password": "Admin@12345"
  }'
```

**Étape 2** : Créer une entreprise (crée automatiquement le schéma tenant)

```bash
curl -X POST https://pointage-back.onrender.com/api/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Ma Société",
    "schemaName": "ma_societe",
    "email": "admin@masociete.com",
    "country": "Sénégal"
  }'
```

Cela déclenche automatiquement :
- `createTenantSchema()` → Crée le schéma
- `applyTenantMigrations()` → Crée les ENUMs et tables
- `seedTenantData()` → Insère les données de base

---

## 🔧 Vérifications post-résolution

### 1. Tester les routes API

```bash
# Obtenir le token
TOKEN="..."

# Obtenir les entreprises (récupérer le schemaName)
curl https://pointage-back.onrender.com/api/companies \
  -H "Authorization: Bearer $TOKEN"

# Tester les stats (avec x-tenant-id)
curl https://pointage-back.onrender.com/api/stats/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-tenant-id: sirhame_tech"

# Tester les tenant-users
curl https://pointage-back.onrender.com/api/tenant-users \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-tenant-id: sirhame_tech"
```

### 2. Vérifier les logs Render

Dans **Render Dashboard** → Logs, chercher :

**✅ Succès** :
```
📊 Stats dashboard: 2 employés, 0 présents, 0 absents
✅ 2 utilisateurs tenant récupérés
```

**❌ Erreurs** :
```
❌ type "AttendanceType" does not exist
❌ schema "sirhame_tech" does not exist
❌ Tenant ID manquant
```

---

## 📋 Checklist de déploiement

Avant chaque déploiement, s'assurer que :

- [x] Les variables d'environnement sont configurées sur Render
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `NODE_ENV=production`
  
- [x] Le script de build inclut le seed
  ```bash
  npm run build && npm run seed
  ```

- [x] La base de données PostgreSQL est accessible
  
- [x] Au moins une entreprise existe (schéma tenant créé)

- [x] Les ENUMs sont créés dans le schéma tenant
  ```sql
  SELECT typname FROM pg_type WHERE typnamespace = ...
  ```

- [x] Le super admin existe
  ```sql
  SELECT * FROM public.users WHERE role = 'SUPER_ADMIN';
  ```

---

## 🚀 Commandes rapides

### Forcer un redéploiement sur Render

```bash
# Via Render Dashboard
Manual Deploy → Deploy Latest Commit

# Ou via trigger de déploiement
git commit --allow-empty -m "Redeploy to Render"
git push
```

### Réinitialiser complètement la base de données

**⚠️ ATTENTION : Supprime toutes les données !**

```bash
# Se connecter à la base
psql $DATABASE_URL

# Supprimer tous les schémas tenant
DROP SCHEMA IF EXISTS sirhame_tech CASCADE;

# Réinitialiser les migrations Prisma
DELETE FROM "_prisma_migrations";

# Redémarrer l'application sur Render
```

Puis lancer le seed :
```bash
npm run seed
```

---

## 📞 Support

Si le problème persiste après ces solutions :

1. **Vérifier les logs Render** en détail pour l'erreur exacte
2. **Exécuter les requêtes SQL manuellement** pour identifier le problème
3. **Vérifier que le middleware `tenantMiddleware.ts`** récupère bien le token et le tenantId

---

**Dernière mise à jour** : 11 novembre 2025  
**Version** : 1.0
