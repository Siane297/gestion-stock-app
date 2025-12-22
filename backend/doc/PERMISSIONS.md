# Système de Permissions Granulaires (RBAC + ACL)

Ce document décrit l'architecture et l'implémentation du système de gestion des rôles et des permissions utilisé dans l'application. Ce système est conçu pour être à la fois simple (basé sur des rôles métiers) et flexible (possibilité de surcharger les permissions par utilisateur).

## 1. Architecture Générale

Le système repose sur deux piliers :

- **RBAC (Role-Based Access Control)** : Des permissions par défaut sont associées à des rôles métiers (`ADMIN`, `STORE_MANAGER`, `SELLER`, etc.).
- **ACL (Access Control List)** : Possibilité d'ajouter des permissions spécifiques via le champ `customPermissions` sur l'utilisateur.

### Format des Permissions

Une permission est une chaîne de caractères au format `module:action`.

- **Exemples** : `produits:voir`, `ventes:creer`, `caisses:valider`.
- **Wildcards** : `produits:*` (toutes les actions sur le module produits) ou `*` (tous les droits).

---

## 2. Modèle de Données (Prisma)

Le système utilise principalement la table `tenant_users`.

```prisma
// Rôles métiers prédéfinis
enum TenantUserRole {
  ADMIN          // Accès total organisation
  STORE_MANAGER  // Gérant de boutique (accès complet à ses magasins)
  STOCK_MANAGER  // Responsable stock/achats
  SELLER         // Vendeur (ventes + caisses)
  ACCOUNTANT     // Comptable (comptabilité + rapports)
  USER           // Consultation uniquement
}

model TenantUser {
  id                String         @id @default(uuid())
  role              TenantUserRole @default(USER)
  isOwner           Boolean        @default(false)
  globalScope       Boolean        @default(false) // Accès à toutes les boutiques (Admin)

  // Permissions spécifiques (JSON car compatible MySQL/Postgres)
  // Format : ["module:action", "module:voir"]
  customPermissions Json           @default("[]")

  // Relations
  magasin_id        String?        // Boutique d'affectation
  magasins_geres    magasin[]      // Boutiques gérées (pour STORE_MANAGER)
}
```

---

## 3. Logique Backend (PermissionService)

Le `PermissionService` est le cerveau du système. Il calcule les **permissions effectives** en fusionnant celles du rôle et les permissions personnalisées.

### Fonctionnement du calcul :

1. Si l'utilisateur est `OWNER` ou `SUPER_ADMIN` → **Autorisé**.
2. Récupération de la matrice de base pour le rôle du `TenantUserRole`.
3. Fusion avec les `customPermissions` stockées en base.
4. Vérification du scope (global vs magasin spécifique).

### Exemple d'usage interne :

```typescript
const result = PermissionService.hasPermission(context, Module.PRODUITS, Action.CREER);
if (result.allowed) { // ... }
```

---

### Protection des Routes Métier

Toutes les routes métier du backend (`backend/src/routes/`) sont systématiquement protégées par `requirePermission`.

| Module                    | Action Requise   | Fichier de Route      |
| ------------------------- | ---------------- | --------------------- |
| **Produits**              | `voir` / `creer` | `produitRoutes.ts`    |
| **Ventes**                | `voir` / `creer` | `venteRoutes.ts`      |
| **Achats**                | `voir` / `creer` | `achatRoutes.ts`      |
| **Utilisateurs**          | `voir` / `creer` | `tenantUserRoutes.ts` |
| **Paramètres Entreprise** | `modifier`       | `companyRoutes.ts`    |

> [!IMPORTANT]
> L'authentification simple (`authenticate`) ne suffit plus pour les actions métier. Le middleware `requirePermission` doit toujours être utilisé pour garantir l'étanchéité du système.

---

## 5. Intégration Frontend : Architecture et Fichiers

L'intégration frontend est conçue pour être réactive et sécurisée, s'appuyant sur les données calculées par le backend.

### Fichiers Clés du Frontend

| Fichier                                      | Rôle                                                                                               |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `utils/permissions.ts`                       | **Moteur Frontend** : Matrice des permissions par défaut (`ROLE_DEFAULT_PERMISSIONS`) et calculs.  |
| `composables/usePermissions.ts`              | **Interface UI Réactive** : Fournit `hasPermission()`, `isAdmin()`, `canAccessStore()`.            |
| `composables/useSecureAuth.ts`               | **Contexte & Session** : Gère l'état global et stocke les permissions calculées du backend.        |
| `middleware/permissions.ts`                  | **Gardien des pages** : Middleware Nuxt qui redirige selon le mapping Route -> Permission.         |
| `middleware/auth.ts`                         | **Gardien d'accès** : S'assure que l'utilisateur est authentifié avant toute chose.                |
| `composables/useSecureApi.ts`                | **Sécurité Réseau** : Injecte le token Bearer et gère les erreurs de permission (403).             |
| `components/sidebar/AppSidebar.vue`          | **Filtrage de Navigation** : Affiche les menus seulement si `hasPermission(module:voir)` est vrai. |
| `components/form/FormulaireUtilisateur.vue`  | **Administration** : Interface de gestion (Stepper) des rôles et des accès aux boutiques.          |
| `components/form/PermissionModuleToggle.vue` | **Granularité UI** : Gère l'activation individuelle des modules et des actions (panel extensible). |

---

## 6. Détails de l'Implémentation Frontend

### A. Le Composable `usePermissions`

C'est l'outil principal utilisé dans les composants pour conditionner l'affichage.

```typescript
const { hasPermission, isAdmin, isManager } = usePermissions();

// Vérifier une action précise
const canEdit = hasPermission("produits", "modifier");

// Vérifier l'accès à une boutique
const hasAccess = canAccessStore("ID_BOUTIQUE");
```

### B. Protection des Routes (Middleware)

Le fichier `middleware/permissions.ts` contient un mapping `Route -> Permission`.
Lorsqu'un utilisateur tente d'accéder à une URL, le middleware vérifie automatiquement son droit.

```typescript
// Exemple de configuration dans le middleware
const routePermissions = [
  { path: "/produits", permission: "produits:voir" },
  { path: "/ventes", permission: "ventes:voir" },
  { path: "/comptabilite", permission: "comptabilite:voir" },
];
```

### C. Gestion des Menus (Sidebar)

La barre latérale (`AppSidebar.vue`) filtre dynamiquement les éléments. Si un utilisateur n'a pas la permission `voir` sur un module, l'entrée disparait totalement de son interface.

### D. Gestion des Permissions (Nouvelle Interface)

La gestion s'effectue désormais dans un **Stepper** en deux étapes dans `FormulaireUtilisateur.vue`.

#### Étape 1 : Accès et Portée

- **Accès Global** (`globalScope`) : Si activé, l'utilisateur a accès à l'intégralité des boutiques de l'organisation. Typique pour un `ADMIN`.
- **Boutique d'affectation** : Point de vente principal pour les opérations de caisse.
- **Boutiques Gérées** (`managedStoreIds`) : Liste de boutiques supplémentaires accessibles, utilisée principalement pour les `STORE_MANAGER`.

#### Étape 2 : Permissions Granulaires (`PermissionModuleToggle.vue`)

Le système utilise un composant moderne par module :

- **Activation** : Un `ToggleSwitch` active le module entier.
- **Actions** : Un panel extensible permet de cocher finement les actions (`voir`, `creer`, `modifier`, `supprimer`, `exporter`, `valider`).
- **Synchronisation** : Les actions sont stockées à plat dans `customPermissions` au format `module:action`.

---

## 7. Guide d'Ajout d'un Nouveau Module

Pour ajouter un nouveau module (ex: "Livraisons") :

1. **Backend** :
   - Ajouter `LIVRAISONS = 'livraisons'` dans `Enum Module` (`types/permissions.ts`).
   - Mettre à jour la matrice dans `PermissionService.ts`.
2. **Frontend** :
   - Ajouter le menu dans `AppSidebar.vue` (catégorie et lien).
   - Ajouter la route et sa permission dans `middleware/permissions.ts`.
   - Ajouter le module dans la liste `permissionModules` de `FormulaireUtilisateur.vue`.
   - Le composant `PermissionModuleToggle.vue` gérera automatiquement l'affichage des actions que vous aurez définies dans cette liste.

---

## 8. Notes Importantes sur la Compatibilité

- **Type JSON** : Le champ `customPermissions` est stocké en `Json` pour assurer le support de **MySQL/MariaDB**.
- **Réactivité** : Le composable `usePermissions` utilise les `computed` de Vue pour réagir instantanément aux changements d'état de l'utilisateur (connexion/déconnexion).
