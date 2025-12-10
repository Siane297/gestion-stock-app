# Guide de soumission de formulaires standardisé

## 📋 Vue d'ensemble

Ce guide définit le **pattern standard** pour la soumission de formulaires dans l'application. Tous les formulaires doivent suivre cette structure pour assurer la cohérence du code.

---

## 🎯 Structure standardisée

### 1. Imports nécessaires

```typescript
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import { useXxxApi } from '~/composables/api/useXxxApi'; // API correspondante
```

### 2. État du formulaire

```typescript
// Référence du formulaire
const formRef = ref<InstanceType<typeof FormulaireDynamique> | null>(null);

// Toast pour les notifications
const toast = useToast();

// État de chargement
const loading = ref(false);

// Composable API
const { createXxx, updateXxx } = useXxxApi();
```

### 3. Définition des champs

```typescript
const formFields = [
  {
    name: 'fieldName',
    label: 'Label du champ',
    type: 'text' | 'email' | 'select' | 'number' | 'date' | 'textarea',
    placeholder: 'Texte de placeholder',
    required: true | false,
    disabled?: boolean,
    value?: string | number,
    options?: string[] | any[], // Pour type='select'
    optionLabel?: string,       // Pour type='select' - propriété à afficher
    optionValue?: string,       // Pour type='select' - propriété à envoyer
    min?: number,               // Pour type='number'
    max?: number                // Pour type='number'
  },
  // ... autres champs
];
```

---

## 📋 Utilisation des champs Select

### Configuration avec optionLabel/optionValue

**Exemple: Sélection d'Employés**

```typescript
// 1. Charger les employés
const employees = ref<Array<{ id: string; fullName: string; matricule: string }>>([]);

const loadEmployees = async () => {
  const { getAllEmployees } = useEmployeeApi();
  const result = await getAllEmployees();
  employees.value = result.data;
};

// 2. Définir le champ sans transformation
const formFields = computed(() => [
  {
    name: 'employeeId',
    label: 'Employé',
    type: 'select',
    placeholder: 'Sélectionnez un employé',
    required: true,
    options: employees.value,      // Liste directe sans map()
    optionLabel: 'fullName',       // Affiche le nom complet
    optionValue: 'id'              // Envoie l'ID
  }
]);
```

**Résultat:**
- Affiche `"Jean Dupont"`, `"Marie Martin"`, etc.
- Envoie l'ID: `data.employeeId` contiendra l'UUID

---

### Exemple 2: Sélection de Postes

```typescript
// 1. Charger les postes depuis l'API
const postes = ref<Array<{ id: string; name: string }>>([]);

const loadPostes = async () => {
  const { getPostes } = usePosteApi();
  postes.value = await getPostes();
};

onMounted(() => {
  loadPostes();
});

// 2. Définir le champ
const formFields = computed(() => [
  {
    name: 'positionId',
    label: 'Poste / Fonction',
    type: 'select',
    placeholder: 'Sélectionnez un poste',
    required: true,
    options: postes.value,      // Liste directe
    optionLabel: 'name',        // Affiche le nom du poste
    optionValue: 'id'           // Envoie l'ID
  }
]);
```

**Résultat:**
- Affiche `"Développeur"`, `"Comptable"`, etc.
- Envoie l'ID: `data.positionId` contiendra l'UUID du poste

---

---

## 📝 Méthode handleSubmit standardisée

### Pattern de base

```typescript
const handleSubmit = async (data: Record<string, any>) => {
  loading.value = true;

  try {
    // 1. Appeler l'API avec les données du formulaire
    const result = await createXxx({
      field1: data.field1,
      field2: data.field2,
      // ... mapper tous les champs
    });

    console.log('Résultat créé:', result);

    // 2. Réinitialiser le formulaire
    formRef.value?.resetForm();

    // 3. Afficher le toast de succès
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Élément enregistré avec succès !',
      life: 3000
    });

    // 4. Actions post-soumission (navigation, dialog, etc.)
    // Exemple: navigateTo('/list')
    // Exemple: showDialog.value = true

  } catch (error: any) {
    console.error('Erreur lors de l\'enregistrement:', error);
    
    // 5. Afficher le toast d'erreur
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Une erreur est survenue',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};
```

---

## 🔄 Pattern pour UPDATE

```typescript
const handleUpdate = async (data: Record<string, any>) => {
  loading.value = true;

  try {
    const result = await updateXxx(itemId, {
      field1: data.field1,
      field2: data.field2,
    });

    console.log('Élément mis à jour:', result);

    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Élément mis à jour avec succès !',
      life: 3000
    });

    // Navigation ou autre action
    navigateTo('/list');

  } catch (error: any) {
    console.error('Erreur mise à jour:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors de la mise à jour',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};
```

---

## 📝 Exemple complet - Modification d'employé

### Vue d'ensemble du flux

1. **Récupération de l'ID** depuis l'URL (route params)
2. **Chargement des données** de l'entité existante
3. **Chargement des listes** (postes, départements, etc.)
4. **Pré-remplissage du formulaire** avec les valeurs actuelles
5. **Soumission** avec `updateEmployee(id, data)`
6. **Redirection** après succès

---

### Structure de la page de modification

**Fichier:** `pages/employees/modifier/[id].vue`

```typescript
<template>
  <div>
    <!-- Formulaire avec données pré-remplies -->
    <FormulaireDynamique
      v-if="!loadingEmployee"
      title="Modifier un employé"
      description="Modifiez les informations du profil employé"
      :fields="employeeFields"
      submit-label="Enregistrer les modifications"
      cancel-label="Annuler"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @addClick="handleAddClick"
      ref="formRef"
    />

    <!-- Loader pendant le chargement -->
    <div v-else class="flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <Icon icon="lucide:loader-2" class="text-6xl text-primary animate-spin mb-4" />
        <p class="text-gray-600">Chargement des données...</p>
      </div>
    </div>

    <!-- Popups pour ajout rapide -->
    <FormPopupDynamique
      v-model:visible="showPosteDialog"
      title="Ajouter un poste"
      :fields="posteFields"
      @submit="handleCreatePoste"
    />

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import FormPopupDynamique from '~/components/form/FormPopupDynamique.vue';
import { useEmployeeApi } from '~/composables/api/useEmployeeApi';
import { usePosteApi } from '~/composables/api/usePosteApi';
import { useDepartementApi } from '~/composables/api/useDepartementApi';

// 1. Récupérer l'ID depuis l'URL
const route = useRoute();
const employeeId = route.params.id as string;

// 2. Initialiser les composables
const { getEmployeeById, updateEmployee } = useEmployeeApi();
const { getPostes, createPoste } = usePosteApi();
const { getDepartements, createDepartement } = useDepartementApi();
const toast = useToast();

// 3. États
const formRef = ref<InstanceType<typeof FormulaireDynamique> | null>(null);
const loading = ref(false);
const loadingEmployee = ref(true);
const employee = ref<any>(null);

// Listes pour les selects
const postes = ref<Array<{ id: string; name: string }>>([]);
const departements = ref<Array<{ id: string; name: string }>>([]);

// États des popups
const showPosteDialog = ref(false);
const showDepartmentDialog = ref(false);
const loadingPoste = ref(false);
const loadingDepartment = ref(false);

// 4. Charger les données de l'employé
const loadEmployee = async () => {
  loadingEmployee.value = true;
  try {
    employee.value = await getEmployeeById(employeeId);
    console.log('Employé chargé:', employee.value);
  } catch (error: any) {
    console.error('Erreur chargement employé:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors du chargement de l\'employé',
      life: 5000
    });
    // Rediriger si l'employé n'existe pas
    setTimeout(() => navigateTo('/employees'), 2000);
  } finally {
    loadingEmployee.value = false;
  }
};

// 5. Charger les listes (postes, départements)
const loadPostesAndDepartements = async () => {
  try {
    const [postesData, departementsData] = await Promise.all([
      getPostes(),
      getDepartements()
    ]);
    
    postes.value = postesData;
    departements.value = departementsData;
  } catch (error) {
    console.error('Erreur chargement listes:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Erreur lors du chargement des listes',
      life: 3000
    });
  }
};

// 6. Définir les champs avec valeurs pré-remplies
const employeeFields = computed(() => [
  {
    name: 'matricule',
    label: 'Matricule',
    type: 'text' as const,
    placeholder: 'Matricule',
    required: true,
    disabled: true,              // ✅ Non modifiable
    value: employee.value?.matricule || ''
  },
  {
    name: 'fullName',
    label: 'Nom complet',
    type: 'text' as const,
    placeholder: 'Ex: Jean Dupont',
    required: true,
    value: employee.value?.fullName || ''  // ✅ Pré-rempli
  },
  {
    name: 'positionId',
    label: 'Poste / Fonction',
    type: 'select-with-add' as const,
    placeholder: 'Sélectionnez un poste',
    required: true,
    options: postes.value,
    optionLabel: 'name',
    optionValue: 'id',
    value: employee.value?.positionId || ''  // ✅ Sélection actuelle
  },
  {
    name: 'departmentId',
    label: 'Département',
    type: 'select-with-add' as const,
    placeholder: 'Sélectionnez un département',
    required: true,
    options: departements.value,
    optionLabel: 'name',
    optionValue: 'id',
    value: employee.value?.departmentId || ''  // ✅ Sélection actuelle
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email' as const,
    placeholder: 'Ex: jean.dupont@entreprise.com',
    required: false,
    value: employee.value?.email || ''
  },
  {
    name: 'phone',
    label: 'Téléphone',
    type: 'text' as const,
    placeholder: 'Ex: +212 6 12 34 56 78',
    required: false,
    value: employee.value?.phoneNumber || ''
  }
]);

// 7. Gestion de la soumission
const handleSubmit = async (data: Record<string, any>) => {
  loading.value = true;

  try {
    // Mettre à jour l'employé
    await updateEmployee(employeeId, {
      fullName: data.fullName,
      positionId: data.positionId,
      departmentId: data.departmentId,
      email: data.email || undefined,
      phoneNumber: data.phone || undefined,
    });

    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Employé modifié avec succès !',
      life: 3000
    });

    // Rediriger vers la liste après 1 seconde
    setTimeout(() => navigateTo('/employees'), 1000);

  } catch (error: any) {
    console.error('Erreur lors de la modification:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Une erreur est survenue lors de la modification',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

// 8. Annulation
const handleCancel = () => {
  navigateTo('/employees');
};

// 9. Gérer les clics sur les boutons + (ajout rapide)
const handleAddClick = (field: any) => {
  if (field.name === 'positionId') {
    showPosteDialog.value = true;
  } else if (field.name === 'departmentId') {
    showDepartmentDialog.value = true;
  }
};

// 10. Créer un nouveau poste (ajout rapide)
const handleCreatePoste = async (data: Record<string, any>) => {
  loadingPoste.value = true;
  try {
    const newPoste = await createPoste({ name: data.name });
    
    // Ajouter à la liste
    postes.value.push(newPoste);
    
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Poste créé avec succès',
      life: 3000
    });
    
    showPosteDialog.value = false;
    
    // Sélectionner automatiquement
    await nextTick();
    if (formRef.value && (formRef.value as any).formData) {
      (formRef.value as any).formData.positionId = newPoste.id;
    }
  } catch (error: any) {
    console.error('Erreur création poste:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors de la création du poste',
      life: 3000
    });
  } finally {
    loadingPoste.value = false;
  }
};

// 11. Charger au montage
onMounted(async () => {
  await Promise.all([
    loadEmployee(),
    loadPostesAndDepartements()
  ]);
});
</script>
```

---

### Points clés de la modification

#### 1. Récupération de l'ID
```typescript
const route = useRoute();
const employeeId = route.params.id as string;
```

#### 2. Chargement parallèle des données
```typescript
onMounted(async () => {
  await Promise.all([
    loadEmployee(),           // Charger l'employé
    loadPostesAndDepartements() // Charger les listes
  ]);
});
```

#### 3. Pré-remplissage avec `value`
```typescript
const employeeFields = computed(() => [
  {
    name: 'fullName',
    type: 'text',
    value: employee.value?.fullName || '',  // ✅ Valeur actuelle
  },
  {
    name: 'positionId',
    type: 'select',
    value: employee.value?.positionId || '', // ✅ ID sélectionné
  }
]);
```

#### 4. Champs désactivés (non modifiables)
```typescript
{
  name: 'matricule',
  disabled: true,  // ✅ Le matricule ne peut pas être changé
  value: employee.value?.matricule
}
```

#### 5. Soumission avec `updateEmployee`
```typescript
const handleSubmit = async (data: Record<string, any>) => {
  loading.value = true;
  try {
    await updateEmployee(employeeId, {  // ✅ Passer l'ID
      fullName: data.fullName,
      positionId: data.positionId,
      // ...
    });
    
    toast.add({ severity: 'success', ... });
    setTimeout(() => navigateTo('/employees'), 1000);
  } catch (error: any) {
    toast.add({ severity: 'error', ... });
  } finally {
    loading.value = false;
  }
};
```

---

### Gestion des erreurs de chargement

```typescript
const loadEmployee = async () => {
  loadingEmployee.value = true;
  try {
    employee.value = await getEmployeeById(employeeId);
  } catch (error: any) {
    console.error('Erreur:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Employé introuvable',
      life: 5000
    });
    // Rediriger si l'entité n'existe pas
    setTimeout(() => navigateTo('/employees'), 2000);
  } finally {
    loadingEmployee.value = false;
  }
};
```

---

### Redirection depuis la liste

**Dans la table (TablePersonnel)** :

```typescript
const handleEdit = (employee: Employee) => {
  navigateTo(`/employees/modifier/${employee.id}`);
};
```

---

## 🛠️ Composables API - Structure standardisée

### Types d'interface

```typescript
export interface CreateXxxDto {
  field1: string;
  field2: string;
  optionalField?: string;
}

export interface UpdateXxxDto {
  field1?: string;
  field2?: string;
}
```

### Méthode CREATE

```typescript
const createXxx = async (data: CreateXxxDto): Promise<Xxx> => {
  try {
    const response = await $fetch<ApiResponse<Xxx>>(
      '/api/xxx',
      {
        baseURL,
        method: 'POST',
        body: data,
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la création');
    }

    return response.data;
  } catch (error: any) {
    console.error('Erreur createXxx:', error);
    throw new Error(handleApiError(error));
  }
};
```

### Méthode UPDATE

```typescript
const updateXxx = async (id: string, data: UpdateXxxDto): Promise<Xxx> => {
  try {
    const response = await $fetch<ApiResponse<Xxx>>(
      `/api/xxx/${id}`,
      {
        baseURL,
        method: 'PUT',
        body: data,
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la mise à jour');
    }

    return response.data;
  } catch (error: any) {
    console.error('Erreur updateXxx:', error);
    throw new Error(handleApiError(error));
  }
};
```

---

## ✅ Checklist de soumission

### Avant soumission
- [ ] `loading.value = true`
- [ ] Mapper les données du formulaire vers le DTO

### Pendant soumission
- [ ] Appel API avec try/catch
- [ ] Vérifier `response.success`
- [ ] Logger le résultat avec `console.log`

### Après succès
- [ ] Réinitialiser le formulaire: `formRef.value?.resetForm()`
- [ ] Toast de succès avec `severity: 'success'`
- [ ] Action post-soumission (navigation, dialog, etc.)

### En cas d'erreur
- [ ] Logger l'erreur avec `console.error`
- [ ] Toast d'erreur avec `severity: 'error'`
- [ ] Message d'erreur explicite

### Toujours
- [ ] `loading.value = false` dans le `finally`

---

## 📖 Exemple complet - Création d'employé

```typescript
<script setup lang="ts">
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import { useEmployeeApi } from '~/composables/api/useEmployeeApi';

const { createEmployee } = useEmployeeApi();
const toast = useToast();

const formRef = ref<InstanceType<typeof FormulaireDynamique> | null>(null);
const loading = ref(false);

const employeeFields = [
  {
    name: 'fullName',
    label: 'Nom complet',
    type: 'text' as const,
    placeholder: 'Ex: Jean Dupont',
    required: true
  },
  {
    name: 'position',
    label: 'Poste',
    type: 'text' as const,
    placeholder: 'Ex: Développeur',
    required: true
  },
  {
    name: 'department',
    label: 'Département',
    type: 'select' as const,
    placeholder: 'Sélectionnez',
    required: true,
    options: ['IT', 'RH', 'Finance']
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email' as const,
    placeholder: 'ex@example.com',
    required: false
  }
];

const handleSubmit = async (data: Record<string, any>) => {
  loading.value = true;

  try {
    const employee = await createEmployee({
      fullName: data.fullName,
      position: data.position,
      department: data.department,
      email: data.email || undefined,
    });

    console.log('Employé créé:', employee);

    formRef.value?.resetForm();

    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Employé enregistré avec succès !',
      life: 3000
    });

    navigateTo('/employees');

  } catch (error: any) {
    console.error('Erreur:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  navigateTo('/employees');
};
</script>
```

---

## 🚫 Anti-patterns à éviter

### ❌ Ne pas faire
```typescript
// Pas de gestion d'erreur
const handleSubmit = async (data: Record<string, any>) => {
  const result = await createXxx(data); // Peut crasher
  navigateTo('/list');
};

// Oublier loading state
const handleSubmit = async (data: Record<string, any>) => {
  // loading.value = true; // OUBLIÉ
  await createXxx(data);
};

// Pas de feedback utilisateur
const handleSubmit = async (data: Record<string, any>) => {
  await createXxx(data);
  // Pas de toast, pas de message
};
```

### ✅ À faire
```typescript
const handleSubmit = async (data: Record<string, any>) => {
  loading.value = true;
  try {
    await createXxx(data);
    toast.add({ severity: 'success', ... });
  } catch (error) {
    toast.add({ severity: 'error', ... });
  } finally {
    loading.value = false;
  }
};
```

---

## 📋 Mapping des données

### Champs optionnels
```typescript
const handleSubmit = async (data: Record<string, any>) => {
  await createXxx({
    requiredField: data.requiredField,
    optionalField: data.optionalField || undefined,
  });
};
```

### Transformation des données
```typescript
const handleSubmit = async (data: Record<string, any>) => {
  await createXxx({
    name: data.name.trim(),
    email: data.email?.toLowerCase(),
    age: parseInt(data.age),
  });
};
```

---

## 🎨 Toast - Messages standardisés

### Succès
```typescript
toast.add({
  severity: 'success',
  summary: 'Succès',
  detail: 'Action réussie !',
  life: 3000
});
```

### Erreur
```typescript
toast.add({
  severity: 'error',
  summary: 'Erreur',
  detail: error.message || 'Une erreur est survenue',
  life: 5000
});
```

### Info
```typescript
toast.add({
  severity: 'info',
  summary: 'Information',
  detail: 'Message informatif',
  life: 3000
});
```

### Avertissement
```typescript
toast.add({
  severity: 'warn',
  summary: 'Attention',
  detail: 'Message d\'avertissement',
  life: 4000
});
```

---

## 🔄 Actions post-soumission courantes

### Navigation
```typescript
navigateTo('/list');
navigateTo(`/detail/${result.id}`);
```

### Afficher un dialog
```typescript
showDialog.value = true;
dialogData.value = result;
```

### Recharger des données
```typescript
await refreshData();
```

### Réinitialiser un état
```typescript
formRef.value?.resetForm();
selectedItem.value = null;
```

---

---

## ✅ Checklist - Page de modification

### Avant le rendu
- [ ] Récupérer l'ID depuis `route.params.id`
- [ ] Charger l'entité avec `getXxxById(id)`
- [ ] Charger les listes nécessaires (postes, départements, etc.)
- [ ] Afficher un loader pendant le chargement

### Définition des champs
- [ ] Utiliser `computed()` pour les champs
- [ ] Pré-remplir avec `value: entity.value?.fieldName`
- [ ] Désactiver les champs non modifiables avec `disabled: true`
- [ ] Vérifier que les selects ont les bonnes valeurs par défaut

### Soumission
- [ ] Utiliser `updateXxx(id, data)` et non `createXxx(data)`
- [ ] Passer l'ID comme premier paramètre
- [ ] Mapper correctement les données
- [ ] Toast de succès
- [ ] Redirection après succès

### Gestion d'erreurs
- [ ] Gérer le cas où l'entité n'existe pas
- [ ] Rediriger si erreur 404
- [ ] Toast d'erreur explicite
- [ ] Logger les erreurs avec `console.error`

---

**Version:** 1.1.0  
**Dernière mise à jour:** 2025-11-11  
**Standard obligatoire pour tous les formulaires**
