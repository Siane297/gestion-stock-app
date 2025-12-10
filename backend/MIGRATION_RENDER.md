# 🚀 Migration isOwner - Base Render

## 📋 Étapes pour migrer votre base Render

### 1️⃣ Récupérer l'URL de connexion Render

1. Allez sur [Render Dashboard](https://dashboard.render.com/)
2. Cliquez sur votre base de données PostgreSQL
3. Dans l'onglet **"Connect"** ou **"Info"**, copiez :
   - **External Database URL** (commence par `postgresql://...`)

**Format de l'URL** :
```
postgresql://USER:PASSWORD@HOST.render.com:5432/DATABASE?ssl=true
```

**Exemple** :
```
postgresql://pointage_user:abcd1234xyz@dpg-xxxxx-a.oregon-postgres.render.com:5432/pointage_db?ssl=true
```

---

### 2️⃣ Exécuter le script de migration

Dans **PowerShell** (dans le dossier `pointage-back`) :

```powershell
$env:DATABASE_URL="COLLER_VOTRE_URL_ICI"; npx tsx scripts/add-isowner-field.ts
```

**Exemple complet** :
```powershell
$env:DATABASE_URL="postgresql://pointage_user:abcd1234@dpg-xxxxx.oregon-postgres.render.com:5432/pointage_db?ssl=true"; npx tsx scripts/add-isowner-field.ts
```

---

### 3️⃣ Résultat attendu

```
🔄 Récupération des organisations...
📊 2 organisation(s) trouvée(s)

🔧 Migration du schéma: entreprise_test (Entreprise Test)
  ➡️ Ajout du champ isOwner à employees...
  ✅ Champ isOwner ajouté à employees
  ➡️ Ajout du champ isOwner à tenant_users...
  ✅ Champ isOwner ajouté à tenant_users
  ➡️ Recherche du premier utilisateur (propriétaire)...
  ➡️ Marquage de admin@test.com comme propriétaire...
  ✅ admin@test.com marqué comme propriétaire
✅ Migration terminée pour entreprise_test

🎉 Migration terminée pour toutes les organisations !
```

---

## ✅ Vérification

### Dans Render SQL Editor :

```sql
-- Voir toutes les organisations
SELECT name, "schemaName", "createdAt" 
FROM public.companies 
ORDER BY "createdAt" ASC;

-- Voir les propriétaires (remplacer NOM_SCHEMA)
SELECT email, role, "isOwner", "createdAt"
FROM "NOM_SCHEMA"."tenant_users"
WHERE "isOwner" = true;
```

### Dans l'application :

1. Se connecter avec un compte admin
2. Aller dans **Utilisateurs**
3. Le premier utilisateur doit avoir 🛡️ **Propriétaire**

---

## ⚠️ En cas d'erreur

### "connection refused" ou "timeout"
- Vérifier que l'URL est correcte
- Vérifier que la base Render est **active** (pas en sleep)
- Vérifier les **IP Whitelisting** si configuré

### "column already exists"
✅ Normal si déjà exécuté - aucun problème

### "relation does not exist"
⚠️ Vérifier que les organisations ont bien des schémas tenant créés

---

## 💾 Sauvegarder les logs

```powershell
$env:DATABASE_URL="..."; npx tsx scripts/add-isowner-field.ts > migration-render-log.txt 2>&1
```

Le fichier `migration-render-log.txt` contiendra tous les résultats.

---

## 🔄 Après la migration

**Pour les nouvelles inscriptions** : Automatique ! ✅
- Le code créera automatiquement le propriétaire
- Aucune action manuelle nécessaire

**Pour les organisations existantes** : Migrées ! ✅
- Premier utilisateur = Propriétaire
- Ne peut pas être bloqué/supprimé
