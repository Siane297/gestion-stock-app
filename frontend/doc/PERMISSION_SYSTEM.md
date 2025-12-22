# Système de Permissions (Frontend)

Ce document détaille l'architecture et l'implémentation du système de permissions côté client (Vue/Nuxt).

## 🏗️ Architecture des Fichiers

| Fichier                                                                                                                                                                         | Rôle Principal                                                                                                                                                                 |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [permissions.ts](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/gestion-stock-app/frontend/utils/permissions.ts)                                   | **Matrice de référence** : Définit les énumérations (`Module`, `Action`), les rôles et les permissions par défaut. Contient la logique de calcul de "Diff" pour la sauvegarde. |
| [usePermissions.ts](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/gestion-stock-app/frontend/composables/usePermissions.ts)                       | **API de consommation** : Fournit `hasPermission()`, `canAccessStore()` et les getters `isAdmin`/`isManager`. À utiliser dans les composants et pages.                         |
| [permissions.ts (Middleware)](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/gestion-stock-app/frontend/middleware/permissions.ts)                 | **Garde-barrière** : Middleware Nuxt bloquant l'accès aux pages non autorisées. Vérifie soit une liste globale, soit la prop `permission` définie dans `definePageMeta`.       |
| [useSecureAuth.ts](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/gestion-stock-app/frontend/composables/useSecureAuth.ts)                         | **Contexte Utilisateur** : Stocke les informations du token JWT décodé, incluant le rôle, le `globalScope` et les `customPermissions`.                                         |
| [AppSidebar.vue](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/gestion-stock-app/frontend/components/sidebar/AppSidebar.vue)                      | **Menu Dynamique** : Masque les menus selon les permissions (supporte les listes d'actions via une logique OU).                                                                |
| [PermissionModuleToggle.vue](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/gestion-stock-app/frontend/components/form/PermissionModuleToggle.vue) | **UI d'Administration** : Composant granulaire permettant de cocher les actions (`voir`, `creer`, `modifier`...) par module.                                                   |
| [FormulaireUtilisateur.vue](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/gestion-stock-app/frontend/components/form/FormulaireUtilisateur.vue)   | **Gestion des Profils** : Intègre le stepper de configuration (Rôle -> Scope -> Permissions) et calcule les permissions effectives.                                            |

---

## 🛠️ Utilisation dans les Composants

### Vérifier une permission simple

```typescript
const { hasPermission } = usePermissions();

// Vérifie si l'utilisateur a le droit de créer des produits
const canAdd = hasPermission("produits", "creer");
```

### Vérifier une liste de permissions (Logique OU)

```typescript
// Retourne vrai si l'utilisateur a l'une des deux permissions
const canManageCaisse = hasPermission(["caisses:modifier", "caisses:exporter"]);
```

### Masquer des actions dans un tableau

```vue
<TableGeneric
  ...
  :show-edit="hasPermission('produits', 'modifier')"
  :show-delete="hasPermission('produits', 'supprimer')"
/>
```

---

## 🛡️ Protection des Pages (Middleware)

Pour protéger une page, utilisez le middleware `permissions`.

### Méthode 1 : Automatique (par URL)

Le middleware [middleware/permissions.ts](file:///c:/Users/Sirhame/Documents/Projet%20Developpement/Nouveau%20dossier/gestion-stock-app/frontend/middleware/permissions.ts) contient une liste de préfixes de route (ex: `/produits` -> `produits:voir`).

### Méthode 2 : Explicite (recommandée pour Ajouter/Modifier)

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "permissions"],
  permission: "produits:creer",
});
</script>
```

---

## ⚙️ Logique de Calcul (Additions/Retraits)

Le système ne stocke pas toutes les permissions en base de données, mais uniquement les **différences** par rapport au rôle de base :

- **Rôle SELLER** : Possède par défaut `ventes:creer`.
- **Ajout** : Si on lui ajoute un droit, on stocke `module:action`.
- **Retrait** : Si on lui retire un droit par défaut, on stocke `-module:action` (avec un signe moins).

La fonction `getEffectivePermissions` dans `utils/permissions.ts` fusionne ces informations pour obtenir la liste finale des droits de l'utilisateur.
