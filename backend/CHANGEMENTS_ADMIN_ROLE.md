# 🎯 Ajout du rôle ADMIN pour le propriétaire

## 📋 Résumé des changements

Le rôle **ADMIN** a été ajouté pour identifier le propriétaire de l'organisation. Le propriétaire n'a plus de poste/département fixe lors de la création - il peut les modifier plus tard via l'interface.

---

## 🔧 Modifications Backend

### 1. **`prisma/schema.prisma`**
- ✅ Ajout de `ADMIN` à l'enum `TenantUserRole`
```prisma
enum TenantUserRole {
  ADMIN       // Administrateur/Propriétaire (tous les droits)
  MANAGER     // Gestion d'équipe
  USER        // Utilisateur standard
  RH          // Ressources humaines
}
```

### 2. **`src/routes/authRoutes.ts`**
- ✅ Le matricule du propriétaire commence par `OWNER-` au lieu de `ADMIN-`
- ✅ Poste et département attribués temporairement (le propriétaire pourra les modifier)
- ✅ Rôle du propriétaire = `ADMIN` (au lieu de `MANAGER`)
- ✅ `isOwner: true` pour marquer le propriétaire

### 3. **`src/services/tenantService.ts`**
- ✅ L'enum créé lors de la création du schéma tenant inclut maintenant `ADMIN`
```typescript
CREATE TYPE "${schemaName}"."TenantUserRole" AS ENUM ('ADMIN', 'MANAGER', 'USER', 'RH');
```

### 4. **Migration Prisma**
- ✅ Fichier : `prisma/migrations/20251111154001_add_admin_role_to_tenant_user/migration.sql`
- ✅ Ajoute `ADMIN` à l'enum `TenantUserRole` AVANT `MANAGER`
- ✅ Ajoute le champ `isOwner` aux tables `employees` et `tenant_users`

---

## 🎨 Modifications Frontend

### 1. **`composables/api/useTenantUserApi.ts`**
- ✅ Types mis à jour pour inclure `ADMIN`
```typescript
role: 'ADMIN' | 'MANAGER' | 'USER' | 'RH'
isOwner?: boolean  // Nouveau champ
```

### 2. **`pages/utilisateur/index.vue`**
- ✅ Label : `ADMIN` → `"Administrateur"`
- ✅ Sévérité : `danger` (badge rouge)

### 3. **`components/form/FormulaireUtilisateur.vue`**
- ✅ Rôle ADMIN ajouté à la liste des rôles
```typescript
{ label: 'Administrateur', value: 'ADMIN', description: 'Propriétaire - Tous les droits' }
```

### 4. **`middleware/permissions.ts`**
- ✅ Déjà configuré pour donner accès complet aux rôles `ADMIN` et `SUPER_ADMIN`

---

## 🚀 Déploiement

### **Étapes pour appliquer les changements**

#### 1. **Base de données locale**
```bash
# Appliquer la migration
npx prisma migrate dev

# Régénérer le client Prisma
npx prisma generate
```

#### 2. **Pour les organisations existantes (Production)**
Exécuter le script `add-isowner-field.ts` pour :
- Ajouter le champ `isOwner` aux tables existantes
- Marquer le premier utilisateur de chaque organisation comme propriétaire

```powershell
# Avec l'URL de production Render
$env:DATABASE_URL="postgresql://...RENDER_URL..."; npx tsx scripts/add-isowner-field.ts
```

#### 3. **Push vers Render**
```bash
git add .
git commit -m "feat: Ajouter rôle ADMIN pour propriétaire + isOwner field"
git push
```

---

## 🎯 Comportement

### **Nouvelles inscriptions**
Lors de l'inscription d'une nouvelle organisation :
1. ✅ Création du compte `User` dans `public.users` avec rôle `ADMIN`
2. ✅ Création du schéma tenant avec enum incluant `ADMIN`
3. ✅ Création d'un `Employee` avec `isOwner: true` et matricule `OWNER-XXXXXX`
4. ✅ Création d'un `TenantUser` avec :
   - `role: 'ADMIN'`
   - `isOwner: true`
   - Toutes les permissions

### **Organisations existantes (après migration)**
1. ✅ Le premier utilisateur créé = Propriétaire
2. ✅ `isOwner: true` sur `Employee` et `TenantUser`
3. ✅ Ne peut pas être bloqué ou supprimé

---

## 🔒 Permissions

### **Rôle ADMIN (Propriétaire)**
- ✅ Accès à toutes les pages
- ✅ Tous les droits de gestion
- ✅ Ne peut pas être bloqué
- ✅ Ne peut pas être supprimé
- ✅ Peut modifier son poste/département via TablePersonnel

### **Autres rôles**
- `MANAGER` : Gestion d'équipe et paramètres
- `USER` : Accès limité selon permissions
- `RH` : Gestion des ressources humaines

---

## ✅ Tests à effectuer

1. **Nouvelle inscription**
   - [ ] Vérifier que le propriétaire a le rôle ADMIN
   - [ ] Vérifier `isOwner: true`
   - [ ] Vérifier matricule `OWNER-XXXXXX`

2. **Interface utilisateur**
   - [ ] Badge "Administrateur" affiché correctement
   - [ ] Formulaire : ADMIN dans la liste des rôles
   - [ ] Permissions complètes pour le propriétaire

3. **Migration organisations existantes**
   - [ ] Script `add-isowner-field.ts` exécuté avec succès
   - [ ] Premier utilisateur marqué comme propriétaire
