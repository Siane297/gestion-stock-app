<template>
  <div>
   

    <div class="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gris">
        <div v-if="loadingInitial" class="flex justify-center p-8">
            <span class="text-gray-500">Chargement...</span>
        </div>

        <FormulaireDynamique
            v-else
            title="Détails Employé"
            description="Modifiez les informations ci-dessous."
            :fields="fields"
            submit-label="Enregistrer les modifications"
            cancel-label="Annuler"
            :loading="loading"
            @submit="handleSubmit"
            @cancel="handleCancel"
            @addClick="handleAddClick"
            ref="formRef"
        />
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

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useToast } from 'primevue/usetoast';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import FormPopupDynamique from '~/components/form/FormPopupDynamique.vue';
import { useEmployeeApi } from '~/composables/api/useEmployeeApi';
import { usePosteApi } from '~/composables/api/usePosteApi';
import Toast from 'primevue/toast';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const { getEmployeeById, updateEmployee } = useEmployeeApi();
const { getPostes, createPoste } = usePosteApi();
const { extractErrorMessage } = useErrorHandler();

const employeeId = route.params.id as string;
const employee = ref<any>(null);
const loading = ref(false);
const loadingInitial = ref(true);
const postes = ref<any[]>([]);
const pageTitleOverride = useState<string | null>('pageTitleOverride');
const formRef = ref<any>(null);

// Dialog state
const showPosteDialog = ref(false);
const loadingPoste = ref(false);

// Load Data
const loadData = async () => {
    loadingInitial.value = true;
    try {
        const [empData, postesData] = await Promise.all([
            getEmployeeById(employeeId),
            getPostes()
        ]);
        
        if (!empData) {
             toast.add({ severity: 'error', summary: 'Erreur', detail: 'Employé introuvable', life: 3000 });
             setTimeout(() => router.push('/employees'), 1500);
             return;
        }
        
        employee.value = empData;
        postes.value = postesData;
        pageTitleOverride.value = `Modifier ${empData.fullName}`;
        
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les données', life: 3000 });
    } finally {
        loadingInitial.value = false;
    }
};

onMounted(() => {
    loadData();
});

onUnmounted(() => {
    pageTitleOverride.value = null;
});


const fields = computed(() => {
    if (!employee.value) return [];
    
    return [
    {
        name: 'fullName',
        label: 'Nom complet',
        type: 'text' as const,
        placeholder: 'Ex: Jean Dupont',
        required: true,
        value: employee.value.fullName
    },
    {
        name: 'matricule',
        label: 'Matricule',
        type: 'text' as const,
        value: employee.value.matricule,
        disabled: true, 
        required: true
    },
    {
        name: 'positionId',
        label: 'Poste / Fonction',
        type: 'select-with-add' as const, // Changed to select-with-add
        options: postes.value,
        optionLabel: 'name',
        optionValue: 'id',
        placeholder: 'Sélectionner un poste',
        required: true,
        value: employee.value.positionId
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email' as const,
        placeholder: 'email@entreprise.com',
        required: false,
        value: employee.value.email
    },
    {
        name: 'phoneNumber',
        label: 'Téléphone',
        type: 'text' as const,
        placeholder: 'Ex: +269 ...',
        required: false,
        value: employee.value.phoneNumber
    },
    {
        name: 'sexe',
        label: 'Sexe',
        type: 'select' as const,
        options: [
            { label: 'Masculin', value: 'MASCULIN' },
            { label: 'Féminin', value: 'FEMININ' }
        ],
        required: false,
        placeholder: 'Selectionner le sexe',
        value: employee.value.sexe
    },
    {
        name: 'dateNaissance',
        label: 'Date de Naissance',
        type: 'date' as const,
        required: false,
        placeholder: 'Selectionner la date de naissance',
        value: employee.value.dateNaissance ? new Date(employee.value.dateNaissance) : undefined
    },
    {
        name: 'address',
        label: 'Adresse',
        type: 'text' as const,
        placeholder: 'Adresse complète...',
        required: false,
        value: employee.value.address
    },
    {
        name: 'isActive',
        label: 'Employé Actif',
        type: 'checkbox' as const,
        required: false,
        value: employee.value.isActive !== undefined ? employee.value.isActive : true,
        helpText: 'Décochez pour désactiver l\'accès ou archiver ce profil.'
    }
]});

const posteFields = [
    {
        name: 'name',
        label: 'Nom du poste',
        type: 'text' as const,
        placeholder: 'Ex: Vendeur, Manager...',
        required: true
    }
];

const handleAddClick = (field: any) => {
    if (field.name === 'positionId') {
        showPosteDialog.value = true;
    }
};

const handleCreatePoste = async (data: any) => {
    loadingPoste.value = true;
    try {
        const newPoste = await createPoste({ name: data.name });
        if (newPoste) {
            postes.value.push(newPoste);
            toast.add({ severity: 'success', summary: 'Succès', detail: 'Poste créé', life: 3000 });
            showPosteDialog.value = false;
             // Auto-select optional logic if needed but form pre-fill might override or reactivity handles it
             // Re-finding updated value might be needed if form doesn't auto-update options deeply
             // But usually options computed property updates fine.
             
             await nextTick();
             if(formRef.value && formRef.value.formData) {
                 formRef.value.formData.positionId = newPoste.id;
             }
        }
    } catch (e: any) {
         const errorMsg = extractErrorMessage(e, 'Impossible de créer le poste');
         toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 5000 });
    } finally {
        loadingPoste.value = false;
    }
};

const handleSubmit = async (data: any) => {
    loading.value = true;
    try {
        const payload = {
            fullName: data.fullName,
            positionId: data.positionId,
            email: data.email || undefined,
            phoneNumber: data.phoneNumber || undefined,
            address: data.address || undefined,
            sexe: data.sexe || undefined,
            dateNaissance: data.dateNaissance || undefined,
            isActive: data.isActive
        };

        await updateEmployee(employeeId, payload);
        
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Employé mis à jour', life: 3000 });
        
        setTimeout(() => {
            router.push('/employees');
        }, 1000);
        
    } catch (error: any) {
        console.error("Erreur modification employé", error);
        const errorMsg = extractErrorMessage(error, 'Impossible de modifier l\'employé');
        toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 5000 });
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    router.push('/employees');
};
</script>