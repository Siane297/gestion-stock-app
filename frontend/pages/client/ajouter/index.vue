<template>
  <div>
    <!-- <SimplePageHeader
      title="Nouveau Client"
      description="Ajouter un client à votre base de données"
    /> -->

    <div class="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gris">
        <FormulaireDynamique
            title="Informations Client"
            description="Saisissez les coordonnées du client."
            :fields="fields"
            submit-label="Créer le client"
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
definePageMeta({
    middleware: ['auth', 'permissions'],
    permission: 'clients:creer'
});

import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import { useClientApi, type CreateClientDto } from '~/composables/api/useClientApi';
import Toast from 'primevue/toast';

const { createClient } = useClientApi();
const { extractErrorMessage } = useErrorHandler();
const toast = useToast();
const router = useRouter();
const loading = ref(false);

const fields = computed(() => [
    {
        name: 'nom',
        label: 'Nom complet',
        type: 'text' as const,
        placeholder: 'Ex: Société ABC ou Jean Dupont',
        required: true
    },
    {
        name: 'telephone',
        label: 'Téléphone',
        type: 'text' as const,
        placeholder: 'Ex: +269 ...',
        required: false
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email' as const,
        placeholder: 'contact@exemple.com',
        required: false
    },
    {
        name: 'adresse',
        label: 'Adresse',
        type: 'text' as const,
        placeholder: 'Adresse physique...',
        required: false
    },
    {
        name: 'limite_credit',
        label: 'Limite de crédit (KMF)',
        type: 'number' as const,
        placeholder: '0',
        required: false,
        helpText: 'Plafond maximum de dettes autorisé pour ce client.'
    }
]);

const handleSubmit = async (data: any) => {
    loading.value = true;
    try {
        const payload: CreateClientDto = {
            nom: data.nom,
            email: data.email || undefined,
            telephone: data.telephone || undefined,
            adresse: data.adresse || undefined,
            limite_credit: data.limite_credit ? Number(data.limite_credit) : undefined
        };

        await createClient(payload);
        
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Client créé avec succès', life: 3000 });
        
        setTimeout(() => {
            router.push('/client');
        }, 1000);
        
    } catch (error: any) {
        console.error("Erreur création client", error);
        const errorMsg = extractErrorMessage(error, 'Impossible de créer le client');
        toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg , life: 5000 });
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    router.push('/client');
};
</script>