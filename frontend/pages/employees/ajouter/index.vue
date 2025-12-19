<template>
  <div>

    <div class="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gris">
        <FormulaireDynamique
            title="Informations Personnelles"
            description="Saisissez les informations de l'employé."
            :fields="fields"
            submit-label="Créer l'employé"
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
import { ref, computed, onMounted, nextTick } from 'vue';
import { useToast } from 'primevue/usetoast';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import FormPopupDynamique from '~/components/form/FormPopupDynamique.vue';
import { useEmployeeApi } from '~/composables/api/useEmployeeApi';
import { usePosteApi } from '~/composables/api/usePosteApi';
import Toast from 'primevue/toast';

const { createEmployee } = useEmployeeApi();
const { getPostes, createPoste } = usePosteApi();
const { extractErrorMessage } = useErrorHandler();
const toast = useToast();
const router = useRouter();
const loading = ref(false);
const postes = ref<any[]>([]);
const formRef = ref<any>(null);

// Dialog state
const showPosteDialog = ref(false);
const loadingPoste = ref(false);

const loadPostes = async () => {
    try {
        postes.value = await getPostes();
    } catch (e) {
        console.error("Erreur chargement postes", e);
    }
};

onMounted(() => {
    loadPostes();
});

const generateMatricule = () => {
    const prefix = 'EMP';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
};

const tempMatricule = ref(generateMatricule());

const fields = computed(() => [
    {
        name: 'fullName',
        label: 'Nom complet',
        type: 'text' as const,
        placeholder: 'Ex: Jean Dupont',
        required: true
    },
    {
        name: 'matricule',
        label: 'Matricule',
        type: 'text' as const,
        value: tempMatricule.value,
        disabled: true,
        required: true,
        helpText: 'Généré automatiquement (peut être remplacé par le backend)'
    },
    {
        name: 'positionId',
        label: 'Poste / Fonction',
        type: 'select-with-add' as const, // Changed to select-with-add
        options: postes.value,
        optionLabel: 'name',
        optionValue: 'id',
        placeholder: 'Sélectionner un poste',
        required: true
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email' as const,
        placeholder: 'email@entreprise.com',
        required: false
    },
    {
        name: 'phoneNumber',
        label: 'Téléphone',
        type: 'text' as const,
        placeholder: 'Ex: +269 ...',
        required: false
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
        placeholder: 'Selectionner le sexe'
    },
    {
        name: 'dateNaissance',
        label: 'Date de Naissance',
        type: 'date' as const,
        required: false,
        placeholder: 'Selectionner la date de naissance'
    },
    {
        name: 'address',
        label: 'Adresse',
        type: 'text' as const,
        placeholder: 'Adresse complète...',
        required: false
    }
]);

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
            
            // Auto-select
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
            matricule: data.matricule,
            positionId: data.positionId,
            email: data.email || undefined,
            phoneNumber: data.phoneNumber || undefined,
            address: data.address || undefined,
            sexe: data.sexe || undefined,
            dateNaissance: data.dateNaissance || undefined,
            // Department removed
            departmentId: undefined
        };

        await createEmployee(payload);
        
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Employé créé avec succès', life: 3000 });
        
        setTimeout(() => {
            router.push('/employees');
        }, 1000);
        
    } catch (error: any) {
        console.error("Erreur création employé", error);
        const errorMsg = extractErrorMessage(error, 'Impossible de créer l\'employé');
        toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 5000 });
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    router.push('/employees');
};
</script>