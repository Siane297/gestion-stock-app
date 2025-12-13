---
description: Comment créer une API frontend pour consommer un endpoint backend
---

# Ajouter une API Frontend

## Prérequis

- Backend endpoint fonctionnel
- Connaissance des types de données attendus

## Étapes

### 1. Créer le fichier composable

Créer `frontend/composables/api/use[Entite]Api.ts`

### 2. Structure du fichier

```typescript
import { useSecureApi } from "~/composables/useSecureApi";
import type { ApiResponse } from "./config";

// 1. Types des données
export interface Entite {
  id: string;
  nom: string;
  // ... autres champs
  date_creation: string;
}

// 2. DTOs
export interface CreateEntiteDto {
  nom: string;
  // ... champs obligatoires
}

export interface UpdateEntiteDto {
  nom?: string;
  // ... champs optionnels
}

// 3. Params de requête
export interface EntiteQueryParams {
  search?: string;
  est_actif?: boolean;
}

// 4. Composable
export const useEntiteApi = () => {
  const { get, post, put, patch, delete: del } = useSecureApi();

  const getEntites = async (params?: EntiteQueryParams): Promise<Entite[]> => {
    const response = await get<ApiResponse<Entite[]>>("/api/entites", {
      params,
    });
    return response.data || [];
  };

  const getEntiteById = async (id: string): Promise<Entite | null> => {
    const response = await get<ApiResponse<Entite>>(`/api/entites/${id}`);
    return response.data || null;
  };

  const createEntite = async (
    data: CreateEntiteDto
  ): Promise<Entite | null> => {
    const response = await post<ApiResponse<Entite>>("/api/entites", data);
    return response.data || null;
  };

  const updateEntite = async (
    id: string,
    data: UpdateEntiteDto
  ): Promise<Entite | null> => {
    const response = await put<ApiResponse<Entite>>(`/api/entites/${id}`, data);
    return response.data || null;
  };

  const deleteEntite = async (id: string): Promise<boolean> => {
    await del(`/api/entites/${id}`);
    return true;
  };

  return {
    getEntites,
    getEntiteById,
    createEntite,
    updateEntite,
    deleteEntite,
  };
};
```

### 3. Utilisation dans un composant

```vue
<script setup lang="ts">
import { useEntiteApi, type Entite } from "~/composables/api/useEntiteApi";

const { getEntites, createEntite } = useEntiteApi();

const entites = ref<Entite[]>([]);

onMounted(async () => {
  entites.value = await getEntites();
});
</script>
```

## Conventions

- Toujours typer les réponses avec `ApiResponse<T>`
- Retourner `[]` pour les listes vides, `null` pour les objets non trouvés
- Utiliser `useSecureApi()` qui gère automatiquement l'authentification
- Les endpoints commencent toujours par `/api/`

## Référence

Voir les fichiers existants dans `frontend/composables/api/` pour exemples.
