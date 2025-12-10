# Documentation Frontend - Système de Gestion des Utilisateurs Tenant

## 📋 Introduction

Cette documentation explique le fonctionnement du système d'authentification et de gestion des permissions côté frontend de l'application de pointage. Elle s'adresse aux développeurs qui maintiendront ou feront évoluer l'application.

### Objectif du système

L'application doit gérer **deux catégories d'utilisateurs** avec des niveaux d'accès différents :

1. **Les Administrateurs (Admin/SUPER_ADMIN)**
   - Ce sont les gestionnaires de l'organisation
   - Ils ont accès à toutes les fonctionnalités sans restriction
   - Leur compte est créé lors de la création de l'organisation

2. **Les Utilisateurs Tenant (MANAGER, USER, RH)**
   - Ce sont les employés qui ont reçu un compte d'accès à l'application
   - Leurs accès sont limités selon leurs permissions personnalisées
   - Un employé peut exister sans compte (accès physique seulement via QR code)

### Pourquoi deux types d'utilisateurs ?

Cette séparation permet de :
- Donner un contrôle total aux administrateurs
- Limiter l'accès des employés selon leur fonction (RH, Manager, etc.)
- Sécuriser les données sensibles (configuration, gestion utilisateurs)
- Permettre un accès progressif selon les besoins métier

---

## 📚 Partie 1 : Comprendre l'Authentification

### Comment fonctionne la connexion ?

Lorsqu'un utilisateur se connecte à l'application, le système doit déterminer automatiquement s'il s'agit d'un **administrateur** ou d'un **employé** avec un compte. Cette détection est entièrement gérée par le backend.

#### Étape 1 : L'utilisateur saisit ses identifiants

Sur la page `/auth/connexion`, l'utilisateur entre :
- Son **email**
- Son **mot de passe**

#### Étape 2 : Envoi au serveur

Le frontend envoie ces informations au backend via la route `POST /api/auth/login`. Le backend :
1. Cherche d'abord dans la table des **administrateurs** (table `users` du schéma public)
2. Si non trouvé, cherche dans les **utilisateurs tenant** de toutes les organisations actives
3. Vérifie le mot de passe avec bcrypt
4. Génère un **JWT (token)** adapté au type d'utilisateur

#### Étape 3 : Stockage des informations

Une fois authentifié, le frontend stocke :
- Le **token JWT** dans un cookie HttpOnly (sécurisé) ET dans localStorage (fallback)
- Les **données utilisateur** dans un état global Nuxt (`useState`)

### Pourquoi deux systèmes de stockage ?

**Cookie HttpOnly** :
- Sécurisé contre les attaques XSS (JavaScript ne peut pas y accéder)
- Envoyé automatiquement avec chaque requête API
- Recommandé pour la production

**localStorage** :
- Utilisé comme fallback si les cookies ne fonctionnent pas (Safari iOS)
- Permet de garder la session après fermeture du navigateur
- Nécessite un envoi manuel dans les headers des requêtes

### Les composables d'authentification

L'application utilise des **composables** (fonctions réutilisables Nuxt) pour gérer l'authentification.

#### `useAuth()` - Le composable principal

**Fichier** : `composables/api/useAuthApi.ts`

Ce composable expose plusieurs fonctions :

**1. `login(credentials)`** : Connecte l'utilisateur
- Envoie email/password au backend
- Reçoit le token et les données utilisateur
- Stocke tout dans l'état global

**2. `checkAuth()`** : Vérifie si l'utilisateur est toujours connecté
- Appelle `/api/auth/me` pour récupérer les données actuelles
- Utilisé au chargement de l'application pour restaurer la session

**3. `logout()`** : Déconnecte l'utilisateur
- Supprime le token et les cookies
- Réinitialise l'état global
- Redirige vers la page de connexion

### La structure des données utilisateur

Les données de l'utilisateur connecté sont stockées dans une interface `User` qui s'adapte au type :

**Pour un Administrateur** :
```
{
  id: "abc123",
  email: "admin@entreprise.com",
  name: "Jean Dupont",
  role: "ADMIN",
  company: { name: "Mon Entreprise" }
}
```

**Pour un Employé (TenantUser)** :
```
{
  id: "xyz789",
  email: "employe@entreprise.com",
  role: "RH",
  permissions: ["pointage", "historique", "employees"],
  employee: {
    fullName: "Marie Martin",
    matricule: "EMP001",
    department: "Ressources Humaines",
    position: "Responsable RH"
  },
  company: { name: "Mon Entreprise" }
}
```

Notez la différence : l'employé a un tableau `permissions` et un objet `employee`, tandis que l'admin a un simple `name`.

### Gestion des rôles

L'application utilise une fonction `formatRole()` pour traduire les rôles techniques en texte lisible :

- `ADMIN` → "Administrateur"
- `SUPER_ADMIN` → "Super Administrateur"  
- `MANAGER` → "Manager"
- `USER` → "Utilisateur"
- `RH` → "Ressources Humaines"

Cette fonction est utilisée partout dans l'interface pour afficher le rôle de manière compréhensible.

---

## 🛡️ Partie 2 : Protection des Routes et Sécurité

### Pourquoi protéger les routes ?

Imaginez qu'un employé RH (avec permission `employees`, `pointage`, `historique`) tape directement dans son navigateur :
```
http://localhost:3000/parametre
```

Sans protection, il accéderait à la page de configuration, ce qui serait une **faille de sécurité majeure**. Le système doit bloquer cet accès **avant même** que la page ne commence à charger.

### Le système de middleware Nuxt

Nuxt propose un mécanisme appelé **middleware** qui s'exécute **avant** le chargement de chaque page. C'est comme un garde de sécurité qui vérifie votre badge avant de vous laisser entrer dans une pièce.

### Les deux middlewares de l'application

#### 1. Middleware `auth` - Vérification de la connexion

**Fichier** : `middleware/auth.ts`

**Rôle** : Vérifier que l'utilisateur est connecté

**Fonctionnement** :
1. Vérifie si un token existe (cookie ou localStorage)
2. Appelle le backend pour valider le token (`/api/auth/me`)
3. Si le token est valide, charge les données utilisateur dans l'état global
4. Si le token est invalide (expiré, corrompu), redirige vers `/auth/connexion`

**Pourquoi ce middleware ?**
- Empêche l'accès aux pages sans être connecté
- Restaure automatiquement la session au rechargement de la page
- Gère la déconnexion automatique si le token expire

#### 2. Middleware `permissions` - Vérification des autorisations

**Fichier** : `middleware/permissions.ts`

**Rôle** : Vérifier que l'utilisateur a la permission d'accéder à la page

**Fonctionnement** :

**Étape 1** : Définition des permissions par route

Une table associe chaque section de l'application à une permission :

| Route | Permission requise | Description |
|-------|-------------------|-------------|
| `/accueil` | `null` | Accessible à tous les utilisateurs connectés |
| `/employees` | `employees` | Gestion des employés |
| `/employees/ajouter` | `employees` | Ajouter un employé (sous-route) |
| `/pointage` | `pointage` | Enregistrer les pointages |
| `/historique` | `historique` | Consulter l'historique |
| `/parametre` | `parametre` | Configuration système |
| `/utilisateur` | `utilisateur` | Gestion des comptes utilisateurs |
| `/utilisateur/ajouter` | `utilisateur` | Créer un compte (sous-route) |

**Étape 2** : Vérification intelligente

Le middleware suit cette logique :

1. **Si pas d'utilisateur** → Le middleware `auth` va gérer (retour)

2. **Si route publique** (`permission: null`) → Accès autorisé

3. **Si utilisateur ADMIN/SUPER_ADMIN** → Accès automatiquement autorisé (ils ont tous les droits)

4. **Si utilisateur TenantUser** → Vérification :
   - Récupérer `user.permissions` (ex: `["pointage", "historique", "employees"]`)
   - Vérifier si la permission requise est dans ce tableau
   - **Si OUI** → Accès autorisé ✓
   - **Si NON** → Bloquer et afficher erreur 403 ✗

**Étape 3** : Protection des sous-routes

Le middleware protège automatiquement les sous-routes. Par exemple, si `/employees` nécessite la permission `employees`, alors :
- `/employees/ajouter` → **Protégé** automatiquement
- `/employees/123/edit` → **Protégé** automatiquement

Cela fonctionne grâce à la vérification par préfixe de chemin :
```javascript
if (to.path === route.path || to.path.startsWith(route.path + '/')) {
  // Cette route ou ses sous-routes correspondent
}
```

### Comment appliquer les middlewares sur une page ?

Chaque page doit déclarer les middlewares qu'elle utilise avec `definePageMeta` :

```typescript
// Dans pages/employees/index.vue
definePageMeta({
  middleware: ['auth', 'permissions'],
});
```

**Ordre d'exécution** :
1. D'abord `auth` : Vérifie que l'utilisateur est connecté
2. Puis `permissions` : Vérifie que l'utilisateur a les droits

### Page 403 - Accès refusé

Quand un utilisateur n'a pas la permission, il est redirigé vers une page d'erreur 403 qui explique la situation.

**Fichier** : `error.vue` (page d'erreur globale Nuxt)

**Ce qu'elle affiche** :
- Code d'erreur : **403**
- Titre : "Accès Refusé"
- Message explicatif
- **Informations utilisateur** :
  - Nom de l'utilisateur
  - Son rôle actuel
  - Ses permissions actuelles
- Bouton "Retour" : Redirige vers `/` pour revérification et redirection intelligente

**Pourquoi afficher les permissions ?**
Cela aide à comprendre pourquoi l'accès est refusé. Par exemple :
```
Utilisateur: Phoebe Roman
Rôle: Ressources Humaines
Permissions: pointage, historique, employees
```
L'utilisateur voit qu'il n'a pas la permission `parametre`, donc c'est normal qu'il ne puisse pas accéder à cette page.

### Exemple concret de flux

**Scénario** : Phoebe (RH) essaie d'accéder aux paramètres

1. Phoebe tape : `http://localhost:3000/parametre`
2. Le middleware `auth` s'exécute :
   - Vérifie le token ✓
   - Charge les données utilisateur ✓
3. Le middleware `permissions` s'exécute :
   - Route : `/parametre` → Permission requise : `parametre`
   - Rôle de Phoebe : `RH` (pas Admin)
   - Permissions de Phoebe : `["pointage", "historique", "employees"]`
   - Vérification : `"parametre"` dans `[...]` ? **NON** ✗
   - **Action** : Bloquer et rediriger vers `/403`
4. La page `error.vue` s'affiche avec code 403

---

## 🎨 Partie 3 : Adaptation de l'Interface Utilisateur

### Le menu latéral dynamique (AppSidebar)

Le menu de navigation doit s'adapter automatiquement selon le type d'utilisateur. Un employé RH ne doit pas voir les options auxquelles il n'a pas accès.

**Fichier** : `components/sidebar/AppSidebar.vue`

#### Comment fonctionne le filtrage du menu ?

**1. Définition du menu complet**

L'application définit d'abord la liste complète de tous les menus possibles :

| Menu | Route | Permission |
|------|-------|------------|
| Tableau de bord | `/accueil` | `null` (tous) |
| Employés | `/employees` | `employees` |
| Pointage | `/pointage` | `pointage` |
| Historique | `/historique` | `historique` |
| Paramètres | `/parametre` | `parametre` |
| Utilisateurs | `/utilisateur` | `utilisateur` |

**2. Filtrage intelligent**

Le composant utilise une `computed property` qui recalcule automatiquement les menus visibles selon l'utilisateur :

**Si Admin/SUPER_ADMIN** → Affiche **TOUS** les menus (6 items)

**Si TenantUser** → Filtre selon `user.permissions` :
- Menu avec `permission: null` → Toujours visible
- Menu avec permission → Visible seulement si l'utilisateur possède cette permission

**Exemple concret** :

Phoebe (RH) avec permissions `["pointage", "historique", "employees"]` verra :
- ✅ Tableau de bord (permission null)
- ✅ Employés (a la permission)
- ✅ Pointage (a la permission)
- ✅ Historique (a la permission)
- ❌ Paramètres (n'a pas la permission)
- ❌ Utilisateurs (n'a pas la permission)

**Résultat** : Phoebe voit 4 items au lieu de 6.

#### Chargement automatique des données

Quand le menu se charge (`onMounted`), il vérifie si les données utilisateur sont déjà en mémoire. Si non, il appelle `checkAuth()` pour les récupérer. Cela garantit que le menu est toujours à jour.

---

### L'en-tête personnalisé (AppHeader)

L'en-tête affiche le nom et le rôle de l'utilisateur connecté, mais la source des données change selon le type d'utilisateur.

**Fichier** : `components/header/AppHeader.vue`

#### Affichage du nom

**Pour un Admin** :
- Utilise `user.name` (ex: "Jean Dupont")
- Affiche directement le nom de l'administrateur

**Pour un TenantUser** :
- Utilise `user.employee.fullName` (ex: "Phoebe Roman")
- Affiche le nom complet de l'employé

#### Affichage du rôle

Le rôle est traduit en français via la fonction `formatRole()` :
- Admin → "Administrateur"
- RH → "Ressources Humaines"
- Manager → "Manager"

#### Avatar/Initiales

L'application génère automatiquement des initiales à partir du nom :
- "Phoebe Roman" → **PR**
- "Jean Dupont" → **JD**

Ces initiales sont affichées dans un cercle coloré si aucune photo de profil n'est disponible.

---

## 🔄 Partie 4 : Comprendre le Flux Complet

### Scénario 1 : Première connexion d'un TenantUser

**Étape 1 - Connexion**
1. Phoebe (RH) ouvre l'application → Elle est redirigée vers `/auth/connexion`
2. Elle entre : `xapyha@mailinator.com` / `password`
3. Click sur "Se connecter"
4. Le frontend appelle `POST /api/auth/login`
5. Le backend :
   - Cherche dans les admins → Pas trouvé
   - Cherche dans les TenantUsers → Trouvé !
   - Vérifie le mot de passe → Correct ✓
   - Génère un JWT avec `{ userId, email, role: "RH", tenantId, employeeId, permissions: [...] }`
6. Le frontend stocke le token et les données utilisateur
7. Redirection vers `/accueil`

**Étape 2 - Chargement de la page d'accueil**
1. Middleware `auth` s'exécute → Vérifie le token ✓
2. Middleware `permissions` s'exécute → Vérifie `/accueil` (permission `null`) → Autorisé ✓
3. La page `/accueil` se charge
4. Le menu `AppSidebar` filtre les items selon les permissions
5. Le header `AppHeader` affiche "Phoebe Roman - Ressources Humaines"

**Étape 3 - Navigation vers Employés**
1. Phoebe clique sur "Employés" dans le menu
2. Middleware `auth` → Token valide ✓
3. Middleware `permissions` :
   - Route `/employees` nécessite permission `employees`
   - Phoebe a `["pointage", "historique", "employees"]`
   - Vérification : `"employees"` présent → Autorisé ✓
4. La page `/employees` se charge avec la liste des employés

**Étape 4 - Tentative d'accès aux Paramètres (BLOQUÉ)**
1. Phoebe tape manuellement : `http://localhost:3000/parametre`
2. Middleware `auth` → Token valide ✓
3. Middleware `permissions` :
   - Route `/parametre` nécessite permission `parametre`
   - Phoebe a `["pointage", "historique", "employees"]`
   - Vérification : `"parametre"` absent → **REFUSÉ** ✗
   - **Action** : `throw createError({ statusCode: 403 })`
4. La page `error.vue` s'affiche immédiatement (pas de flash)
5. Affichage :
   ```
   403
   Accès Refusé
   
   Utilisateur: Phoebe Roman
   Rôle: Ressources Humaines
   Permissions: pointage, historique, employees
   
   [Retour]
   ```
6. **Clic sur "Retour"** :
   - Redirection vers `/` (page index.vue)
   - Vérification de la session pendant 6 secondes
   - Détection automatique de la première page accessible
   - **Redirection finale vers `/pointage`** (première permission de Phoebe)

---

### Scénario 2 : Rafraîchissement de page

**Problème** : Quand l'utilisateur rafraîchit la page (F5), l'état JavaScript est perdu.

**Solution** : Le middleware `auth` restaure automatiquement la session

1. L'utilisateur rafraîchit `/employees`
2. Middleware `auth` s'exécute :
   - Vérifie si un token existe (cookie ou localStorage) → Oui ✓
   - Appelle `GET /api/auth/me` avec le token
   - Le backend retourne les données utilisateur complètes
   - Le frontend stocke ces données dans `useState('authUser')`
3. Middleware `permissions` peut maintenant accéder à `user.value` → Vérifie les permissions
4. La page se charge normalement

**Important** : Sans cette restauration, l'utilisateur serait déconnecté à chaque rafraîchissement !

---

### Scénario 3 : Expiration de session

**Durée du JWT** : 7 jours

**Après 7 jours** :
1. L'utilisateur ouvre l'application
2. Middleware `auth` appelle `/api/auth/me`
3. Le backend retourne `401 Unauthorized` (token expiré)
4. Le middleware supprime le token et redirige vers `/auth/connexion`
5. L'utilisateur doit se reconnecter

**Pourquoi 7 jours ?**
- Assez long pour ne pas gêner l'utilisateur quotidien
- Assez court pour limiter les risques de sécurité
- Peut être modifié dans `pointage-back/src/config/jwt.ts`

---

## 👥 Partie 5 : Gestion des Utilisateurs Tenant

### Création d'un compte utilisateur

Seuls les **administrateurs** et les utilisateurs avec la permission `utilisateur` peuvent créer des comptes.

#### Processus de création

**Page** : `/utilisateur/ajouter`

**Formulaire** : `components/form/FormulaireUtilisateur.vue`

**Étapes** :

1. **Sélection de l'employé**
   - Le formulaire charge tous les employés qui n'ont pas encore de compte
   - Liste déroulante avec nom complet et matricule
   - Exemple : "Phoebe Roman (EMP005)"

2. **Saisie de l'email**
   - Email professionnel de l'employé
   - Doit être unique dans l'organisation
   - Sera utilisé pour la connexion

3. **Définition du mot de passe**
   - Mot de passe initial (minimum 6 caractères)
   - L'employé pourra le changer après sa première connexion

4. **Choix du rôle**
   - **MANAGER** : Gestionnaire d'équipe
   - **USER** : Utilisateur standard
   - **RH** : Ressources Humaines

5. **Attribution des permissions**
   - Interface visuelle avec cases à cocher
   - Chaque permission correspond à une section de l'application :
     - 👥 **employees** : Gérer les employés
     - ⏱️ **pointage** : Enregistrer les entrées/sorties
     - 📅 **historique** : Consulter l'historique
     - ⚙️ **parametre** : Accéder aux paramètres
     - 👤 **utilisateur** : Gérer les comptes

#### Permissions recommandées par rôle

**Manager** :
- ✓ employees
- ✓ pointage
- ✓ historique

**RH (Ressources Humaines)** :
- ✓ employees
- ✓ pointage
- ✓ historique
- ✓ utilisateur (optionnel)

**User** :
- ✓ pointage
- ✓ historique

**Note** : La permission `parametre` est généralement réservée aux administrateurs.

#### Après la création

1. Le compte est créé dans la base de données du tenant
2. Un email de confirmation peut être envoyé (si configuré)
3. L'employé peut maintenant se connecter avec son email et mot de passe
4. Le compte apparaît dans `/utilisateur` avec un statut "Actif"

### Modification d'un compte

**Page** : `/utilisateur/{id}/edit` (prévue)

**Modifications possibles** :
- Changement de rôle
- Ajout/suppression de permissions
- Réinitialisation du mot de passe
- Blocage/Déblocage du compte

**Important** : On ne peut pas changer l'employé associé à un compte (il faut supprimer et recréer).

### Blocage d'un compte

**Action** : Toggle switch dans la liste des utilisateurs

**Effet** :
- Le compte reste dans la base mais ne peut plus se connecter
- L'utilisateur voit "Identifiants invalides" lors de la connexion
- Le statut apparaît comme "Bloqué" (rouge) dans la liste

**Utilisation** : Suspendre temporairement un employé sans supprimer son historique.

### Suppression d'un compte

**Action** : Bouton "Supprimer" dans la liste

**Effet** :
- Le compte utilisateur est supprimé définitivement
- L'employé reste dans la base (historique préservé)
- L'employé peut recevoir un nouveau compte plus tard

**Important** : Cette action est irréversible !

---

## 📂 Partie 6 : Structure des Fichiers

Voici l'organisation des fichiers frontend concernés par le système d'authentification et de permissions :

```
pointage-front/
├── composables/api/
│   ├── useAuthApi.ts          ← Authentification (login, logout, checkAuth)
│   │                            Gestion de l'état global (useState)
│   ├── useUserApi.ts          ← Interface User + formatRole()
│   │                            Gère Admin ET TenantUser
│   └── useTenantUserApi.ts    ← CRUD complet des TenantUsers
│                               (create, update, delete, block)
│
├── middleware/
│   ├── auth.ts                ← Vérification de connexion (token valide)
│   │                            Restauration session au F5
│   └── permissions.ts         ← Vérification permissions par route
│                               Protection des sous-routes
│
├── pages/
│   ├── error.vue              ← Page d'erreur globale (403, 404, 500)
│   │                            Affiche infos utilisateur
│   ├── auth/
│   │   └── connexion.vue      ← Page de login
│   │
│   ├── utilisateur/
│   │   ├── index.vue          ← Liste des TenantUsers + actions
│   │   │                          (bloquer, supprimer)
│   │   └── ajouter/
│   │       └── index.vue      ← Formulaire de création
│   │
│   ├── employees/            ← Toutes avec middleware ['auth', 'permissions']
│   ├── pointage/
│   ├── historique/
│   └── parametre/
│
├── components/
│   ├── sidebar/
│   │   └── AppSidebar.vue     ← Menu latéral dynamique
│   │                          Filtre selon permissions
│   ├── header/
│   │   └── AppHeader.vue      ← En-tête avec nom/rôle
│   │                          Affiche employee.fullName ou name
│   ├── table/
│   │   └── TableUtilisateurs.vue  ← Tableau des TenantUsers
│   │                              Navigation vers /utilisateur/ajouter
│   └── form/
│       └── FormulaireUtilisateur.vue  ← Formulaire création/édition
│                                      Sélection permissions
│
└── doc/
    └── tenant-users-frontend.md        ← Cette documentation
```

---

## 🐛 Partie 7 : Dépannage et Problèmes Courants

### Problème 1 : Menu de navigation vide

**Symptôme** : L'utilisateur est connecté mais aucun menu n'apparaît dans la sidebar.

**Causes possibles** :
- Les données utilisateur ne sont pas chargées (`user.value` est `null`)
- Les permissions ne sont pas récupérées du backend

**Solution** :
1. Vérifier dans la console du navigateur :
   ```javascript
   console.log('User:', user.value);
   console.log('Permissions:', user.value?.permissions);
   ```
2. Si `user.value` est null, le composable `useAuth` n'a pas été initialisé
3. Ajouter un appel à `checkAuth()` dans le `onMounted` de AppSidebar

**Vérification backend** :
- La route `/api/auth/me` doit retourner l'objet utilisateur complet avec `permissions`

---

### Problème 2 : Boucle de redirection infinie

**Symptôme** : La page continue de recharger sans arrêt, l'URL change rapidement.

**Cause** : Le middleware s'applique sur les pages d'erreur ou de connexion.

**Solution** :
Dans `middleware/auth.ts`, exclure les pages publiques :
```typescript
const publicPages = ['/auth/connexion', '/auth/inscription'];
if (publicPages.includes(to.path)) {
  return; // Ne pas vérifier l'auth
}
```

Dans `middleware/permissions.ts`, ne rien faire si pas d'utilisateur (laisser `auth` gérer) :
```typescript
if (!user.value) {
  return; // Ne pas bloquer
}
```

---

### Problème 3 : Nom affiche "Utilisateur" au lieu du vrai nom

**Symptôme** : Le header affiche "Utilisateur" comme nom générique.

**Causes** :
- Les données `employee` ne sont pas incluses dans la réponse `/api/auth/me`
- La logique d'affichage ne trouve pas `user.employee.fullName`

**Vérifications** :
1. **Console du navigateur** :
   ```javascript
   const { user } = useAuth();
   console.log('Employee:', user.value?.employee);
   ```
2. **Réponse backend** : La route `/api/auth/me` doit faire un `include: { employee: true }` dans Prisma

**Solution backend** :
```typescript
// Dans tenant-user.controller.ts
const user = await prisma.tenantUser.findUnique({
  where: { id },
  include: {
    employee: {
      include: { department: true, position: true }
    }
  }
});
```

---

### Problème 4 : Les permissions ne sont pas respectées

**Symptôme** : Un utilisateur peut accéder à des pages malgré l'absence de permission.

**Checklist de vérification** :

✅ **1. Middleware appliqué sur la page ?**
```typescript
// Dans pages/ma-page/index.vue
definePageMeta({
  middleware: ['auth', 'permissions'], // Les DEUX sont nécessaires
});
```

✅ **2. Route configurée dans le middleware ?**
```typescript
// Dans middleware/permissions.ts
const routePermissions = [
  { path: '/ma-page', permission: 'ma-permission' },
];
```

✅ **3. Permission stockée en base ?**
Vérifier dans PostgreSQL :
```sql
SELECT email, permissions FROM tenant_schema.tenant_users;
```

✅ **4. Permission envoyée dans le JWT ?**
Décoder le token sur [jwt.io](https://jwt.io) et vérifier le payload.

---

### Problème 5 : Flash de la page avant la redirection 403

**Symptôme** : On voit brivement la page protégée avant d'être redirigé vers l'erreur 403.

**Cause** : Le middleware utilise `navigateTo()` qui est asynchrone.

**Solution** : Utiliser `throw createError()` pour un blocage immédiat :
```typescript
// middleware/permissions.ts
if (!userPermissions.includes(requiredPermission)) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Accès refusé',
    fatal: false,
  });
}
```

**Note** : Un léger flash reste possible (limitation de Nuxt côté client).

---

### Problème 6 : L'utilisateur est déconnecté au rafraîchissement

**Symptôme** : Après F5, l'utilisateur doit se reconnecter.

**Causes** :
- Le token n'est pas stocké dans localStorage
- Le middleware `auth` ne restaure pas la session
- Les cookies sont bloqués par le navigateur

**Solutions** :
1. **Vérifier localStorage** :
   ```javascript
   console.log(localStorage.getItem('auth_token'));
   ```
2. **Vérifier les cookies** (DevTools > Application > Cookies)
3. **Activer le fallback localStorage** dans `useAuthApi.ts`

---

## ✅ Checklist complète

Utilisez cette checklist pour vérifier que le système est correctement implémenté :

### Backend
- [x] Route `/api/auth/login` détecte Admin vs TenantUser
- [x] Route `/api/auth/me` retourne `employee` avec `include`
- [x] JWT contient `permissions`, `role`, `tenantId`
- [x] Middleware backend vérifie le schéma tenant

### Frontend - Authentification
- [x] `useAuthApi.ts` gère login/logout/checkAuth
- [x] Token stocké dans cookie ET localStorage
- [x] useState('authUser') contient les données utilisateur
- [x] Middleware `auth.ts` restaure la session au F5

### Frontend - Permissions
- [x] `middleware/permissions.ts` vérifie toutes les routes
- [x] Protection des sous-routes avec `startsWith()`
- [x] Page `error.vue` affiche infos 403 avec permissions
- [x] Admin/SUPER_ADMIN ont accès à tout

### Frontend - Interface
- [x] `AppSidebar` filtre les menus selon permissions
- [x] `AppHeader` affiche `employee.fullName` ou `name`
- [x] `TableUtilisateurs` navigue vers `/utilisateur/ajouter`
- [x] `FormulaireUtilisateur` permet de sélectionner permissions

### Sécurité
- [x] Toutes les pages ont `middleware: ['auth', 'permissions']`
- [x] Les routes API backend vérifient les permissions
- [x] Les tokens expirent après 7 jours
- [x] Les mots de passe sont hashés avec bcrypt

---

## 📚 Références

**Documentation liée** :
- Backend : `pointage-back/doc/tenant-users-system.md`
- API : `pointage-back/doc/api-endpoints.md`

**Technologies utilisées** :
- **Nuxt 3** : Framework Vue.js avec SSR
- **useState** : Gestion d'état global Nuxt
- **Middleware** : Guards de navigation
- **JWT** : Tokens d'authentification
- **PrimeVue** : Bibliothèque de composants UI

**Ressources externes** :
- [Nuxt Middleware](https://nuxt.com/docs/guide/directory-structure/middleware)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [RBAC (Role-Based Access Control)](https://en.wikipedia.org/wiki/Role-based_access_control)

---

**Dernière mise à jour** : 10 novembre 2025  
**Version** : 2.0  
**Auteur** : Équipe Développement  
**Contact** : Pour toute question sur cette documentation
