<template>
  <div>
    <!-- Formulaire dynamique -->
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

    <!-- Loader pendant le chargement de l'employé -->
    <div v-else class="flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <ProgressSpinner strokeWidth="4" />
        <p class="text-gray-600 mt-4">Chargement des données...</p>
      </div>
    </div>

    <!-- Popup pour ajouter un poste -->
    <FormPopupDynamique
      v-model:visible="showPosteDialog"
      title="Ajouter un poste"
      description="Créez un nouveau poste pour l'organisation"
      headerTitle="Nouveau poste"
      :fields="posteFields"
      submit-label="Créer"
      :loading="loadingPoste"
      @submit="handleCreatePoste"
      @cancel="showPosteDialog = false"
    />

    <!-- Popup pour ajouter un département -->
    <FormPopupDynamique
      v-model:visible="showDepartmentDialog"
      title="Ajouter un département"
      description="Créez un nouveau département pour l'organisation"
      headerTitle="Nouveau département"
      :fields="departmentFields"
      submit-label="Créer"
      :loading="loadingDepartment"
      @submit="handleCreateDepartment"
      @cancel="showDepartmentDialog = false"
    />

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import Toast from 'primevue/toast';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import FormPopupDynamique from '~/components/form/FormPopupDynamique.vue';
import { useEmployeeApi } from '~/composables/api/useEmployeeApi';
import { useEmployeeImageApi } from '~/composables/api/useEmployeeImageApi';
import { usePosteApi } from '~/composables/api/usePosteApi';
import { useDepartementApi } from '~/composables/api/useDepartementApi';


// Protection de la page
definePageMeta({
  middleware: ['auth', 'permissions'],
});
const route = useRoute();
const employeeId = route.params.id as string;
const config = useRuntimeConfig();

const { getEmployeeById, updateEmployee } = useEmployeeApi();
const { uploadEmployeePhoto, deleteEmployeePhoto } = useEmployeeImageApi();
const { getPostes, createPoste } = usePosteApi();
const { getDepartements, createDepartement } = useDepartementApi();
const toast = useToast();

// Helper pour construire l'URL de l'image
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${config.public.apiBase}/${imagePath}`;
};

// Référence du formulaire
const formRef = ref<InstanceType<typeof FormulaireDynamique> | null>(null);

// État
const loading = ref(false);
const loadingEmployee = ref(true);
const employee = ref<any>(null);

// Listes des postes et départements
const postes = ref<Array<{ id: string; name: string }>>([]);
const departements = ref<Array<{ id: string; name: string }>>([]);

// États des popups
const showPosteDialog = ref(false);
const showDepartmentDialog = ref(false);
const loadingPoste = ref(false);
const loadingDepartment = ref(false);

// Charger les données de l'employé
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
    // Rediriger vers la liste si l'employé n'existe pas
    setTimeout(() => navigateTo('/employees'), 2000);
  } finally {
    loadingEmployee.value = false;
  }
};

// Charger les postes et départements
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

// Définition des champs du formulaire
const employeeFields = computed(() => {
  if (!employee.value) return [];
  
  return [
  {
    name: 'photo',
    label: 'Photo de l\'employé',
    type: 'image' as const,
    required: false,
    showLabel: false,
    fixedWidth: true,
    value: getImageUrl(employee.value?.photo),
    onImageUpload: async (file: File) => {
      try {
        const response: any = await uploadEmployeePhoto(employeeId, file);
        if (response.success && response.data?.photo) {
          employee.value.photo = response.data.photo;
          return getImageUrl(response.data.photo);
        }
        throw new Error('Erreur lors de l\'upload');
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de l\'upload de la photo', life: 3000 });
        throw error;
      }
    },
    onImageRemove: async () => {
      try {
        await deleteEmployeePhoto(employeeId);
        employee.value.photo = null;
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression de la photo', life: 3000 });
        throw error;
      }
    }
  },
  {
    name: 'matricule',
    label: 'Matricule',
    type: 'text' as const,
    placeholder: 'Matricule',
    required: true,
    disabled: true,
    value: employee.value?.matricule || ''
  },
  {
    name: 'fullName',
    label: 'Nom complet',
    type: 'text' as const,
    placeholder: 'Ex: Jean Dupont',
    required: true,
    value: employee.value?.fullName || ''
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
    value: employee.value?.positionId || ''
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
    value: employee.value?.departmentId || ''
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
  },
  {
    name: 'sexe',
    label: 'Sexe',
    type: 'select' as const,
    placeholder: 'Sélectionnez le sexe',
    required: false,
    options: [
      { label: 'Masculin', value: 'MASCULIN' },
      { label: 'Féminin', value: 'FEMININ' }
    ],
    optionLabel: 'label',
    optionValue: 'value',
    value: employee.value?.sexe ?? ''
  },
  {
    name: 'dateNaissance',
    label: 'Date de naissance',
    type: 'date' as const,
    placeholder: 'Sélectionnez la date de naissance',
    required: false,
    value: employee.value?.dateNaissance ? new Date(employee.value.dateNaissance) : ''
  },
  {
    name: 'address',
    label: 'Adresse',
    type: 'textarea' as const,
    placeholder: 'Ex: 123 Rue de la Paix, Casablanca',
    required: false,
    value: employee.value?.address || ''
  }
  ];
});

// Fonction helper pour formater la date en YYYY-MM-DD sans décalage de timezone
const formatDateToYYYYMMDD = (date: Date | string): string => {
  if (typeof date === 'string') return date;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Gestion de la soumission
const handleSubmit = async (data: Record<string, any>) => {
  loading.value = true;

  try {
    // Formater la date de naissance si présente
    const dateNaissance = data.dateNaissance instanceof Date
      ? formatDateToYYYYMMDD(data.dateNaissance)
      : data.dateNaissance;

    // Mettre à jour l'employé
    await updateEmployee(employeeId, {
      fullName: data.fullName,
      positionId: data.positionId,
      departmentId: data.departmentId,
      email: data.email || undefined,
      phoneNumber: data.phone || undefined,
      sexe: data.sexe || undefined,
      dateNaissance: dateNaissance || undefined,
      address: data.address || undefined,
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

// Annuler
const handleCancel = () => {
  navigateTo('/employees');
};

// Gérer le clic sur le bouton + d'un champ
const handleAddClick = (field: any) => {
  if (field.name === 'positionId') {
    showPosteDialog.value = true;
  } else if (field.name === 'departmentId') {
    showDepartmentDialog.value = true;
  }
};

// Champs pour le formulaire de poste
const posteFields = [
  {
    name: 'name',
    label: 'Nom du poste',
    type: 'text' as const,
    placeholder: 'Ex: Développeur, Manager, etc.',
    required: true
  }
];

// Champs pour le formulaire de département
const departmentFields = [
  {
    name: 'name',
    label: 'Nom du département',
    type: 'text' as const,
    placeholder: 'Ex: IT, RH, Finance, etc.',
    required: true
  }
];

// Créer un nouveau poste
const handleCreatePoste = async (data: Record<string, any>) => {
  loadingPoste.value = true;
  try {
    const newPoste = await createPoste({ name: data.name });
    
    // Vérifier que le poste a été créé avec succès
    if (!newPoste) {
      throw new Error('Échec de la création du poste');
    }
    
    // Ajouter le nouveau poste à la liste
    postes.value.push(newPoste);
    
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Poste créé avec succès',
      life: 3000
    });
    
    // Fermer le dialog
    showPosteDialog.value = false;
    
    // Sélectionner automatiquement après un court délai
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

// Créer un nouveau département
const handleCreateDepartment = async (data: Record<string, any>) => {
  loadingDepartment.value = true;
  try {
    const newDepartment = await createDepartement({ name: data.name });
    
    // Vérifier que le département a été créé avec succès
    if (!newDepartment) {
      throw new Error('Échec de la création du département');
    }
    
    // Ajouter le nouveau département à la liste
    departements.value.push(newDepartment);
    
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Département créé avec succès',
      life: 3000
    });
    
    // Fermer le dialog
    showDepartmentDialog.value = false;
    
    // Sélectionner automatiquement après un court délai
    await nextTick();
    if (formRef.value && (formRef.value as any).formData) {
      (formRef.value as any).formData.departmentId = newDepartment.id;
    }
  } catch (error: any) {
    console.error('Erreur création département:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors de la création du département',
      life: 3000
    });
  } finally {
    loadingDepartment.value = false;
  }
};

// Charger au montage
onMounted(async () => {
  await Promise.all([
    loadEmployee(),
    loadPostesAndDepartements()
  ]);
});
</script>