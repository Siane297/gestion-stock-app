<template>
  <div>
    <!-- <SimplePageHeader
      title="Modifier Client"
      description="Mettre à jour les informations du client"
    /> -->

    <div class="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gris">
         <div v-if="loadingInitial" class="flex justify-center p-8">
            <span class="text-gray-500">Chargement...</span>
        </div>

        <FormulaireDynamique
            v-else
            title="Détails Client"
            description="Modifiez les informations ci-dessous."
            :fields="fields"
            submit-label="Enregistrer les modifications"
            cancel-label="Annuler"
            :loading="loading"
            @submit="handleSubmit"
            @cancel="handleCancel"
        />
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import { useClientApi, type Client, type UpdateClientDto } from '~/composables/api/useClientApi';
import Toast from 'primevue/toast';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const { getClientById, updateClient } = useClientApi();
const { extractErrorMessage } = useErrorHandler();

const clientId = route.params.id as string;
const client = ref<Client | null>(null);
const loading = ref(false);
const loadingInitial = ref(true);
const pageTitleOverride = useState<string | null>('pageTitleOverride');

// Load Data
const loadData = async () => {
    loadingInitial.value = true;
    try {
        const data = await getClientById(clientId);
        if (!data) {
             toast.add({ severity: 'error', summary: 'Erreur', detail: 'Client introuvable', life: 3000 });
             setTimeout(() => router.push('/client'), 1500);
             return;
        }
        client.value = data;
        pageTitleOverride.value = `Modifier ${data.nom}`;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger le client', life: 3000 });
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
    if (!client.value) return [];
    
    return [
    {
        name: 'nom',
        label: 'Nom complet',
        type: 'text' as const,
        placeholder: 'Ex: Société ABC ou Jean Dupont',
        required: true,
        value: client.value.nom
    },
    {
        name: 'telephone',
        label: 'Téléphone',
        type: 'text' as const,
        placeholder: 'Ex: +269 ...',
        required: false,
        value: client.value.telephone
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email' as const,
        placeholder: 'contact@exemple.com',
        required: false,
        value: client.value.email
    },
    {
        name: 'adresse',
        label: 'Adresse',
        type: 'text' as const,
        placeholder: 'Adresse physique...',
        required: false,
        value: client.value.adresse
    },
    {
        name: 'limite_credit',
        label: 'Limite de crédit (KMF)',
        type: 'number' as const,
        placeholder: '0',
        required: false,
        value: client.value.limite_credit,
        helpText: 'Plafond maximum de dettes autorisé pour ce client.'
    },
    {
        name: 'est_actif',
        label: 'Compte Actif',
        type: 'checkbox' as const,
        required: false,
        value: client.value.est_actif,
        helpText: 'Décochez pour désactiver ce compte client.'
    }
]});

const handleSubmit = async (data: any) => {
    loading.value = true;
    try {
        const payload: UpdateClientDto = {
            nom: data.nom,
            email: data.email || undefined,
            telephone: data.telephone || undefined,
            adresse: data.adresse || undefined,
            limite_credit: data.limite_credit ? Number(data.limite_credit) : undefined,
            est_actif: data.est_actif
        };

        await updateClient(clientId, payload);
        
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Client mis à jour', life: 3000 });
        
        setTimeout(() => {
            router.push('/client');
        }, 1000);
        
    } catch (error: any) {
        console.error("Erreur modification client", error);
        const errorMsg = extractErrorMessage(error, 'Impossible de modifier le client');
        toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 5000 });
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    router.push('/client');
};
</script>