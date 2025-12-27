<template>
  <div>
    <div class="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gris">
        <FormulaireDynamique
            title="Nouvelle Caisse"
            description="Définissez les informations de votre nouvelle caisse (terminal de point de vente)."
            :fields="caisseFields"
            :loading="loading"
            submit-label="Créer la caisse"
            cancel-label="Retour"
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
    permission: 'caisses:creer'
});

import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import { useCaisseApi, type CreateCaisseDto } from '~/composables/api/useCaisseApi';
import { useMagasinApi, type Magasin } from '~/composables/api/useMagasinApi';
import { useErrorHandler } from '~/composables/useErrorHandler';

const router = useRouter();
const toast = useToast();
const { createCaisse } = useCaisseApi();
const { getMagasins } = useMagasinApi();
const { extractErrorMessage } = useErrorHandler();

const loading = ref(false);
const magasins = ref<Magasin[]>([]);

// Charger les magasins au montage
onMounted(async () => {
    try {
        magasins.value = await getMagasins();
    } catch (e) {
        console.error("Erreur chargement magasins", e);
    }
});

const caisseFields = computed(() => [
    {
        name: 'magasin_id',
        label: 'Boutique',
        type: 'select' as const,
        required: true,
        placeholder: 'Sélectionnez une boutique',
        options: magasins.value.map(m => ({ label: m.nom, value: m.id })),
        optionLabel: 'label',
        optionValue: 'value'
    },
    {
        name: 'code',
        label: 'Code de la Caisse',
        type: 'text' as const,
        required: true,
        placeholder: 'Ex: CAISSE-01'
    },
    {
        name: 'nom',
        label: 'Nom de la Caisse',
        type: 'text' as const,
        required: true,
        placeholder: 'Ex: Caisse Principale'
    },
    {
        name: 'description',
        label: 'Description',
        type: 'textarea' as const,
        required: false,
        placeholder: 'Description ou notes sur cette caisse (optionnel)'
    }
]);

const handleSubmit = async (data: any) => {
    loading.value = true;
    try {
        const payload: CreateCaisseDto = {
            code: data.code,
            nom: data.nom,
            magasin_id: data.magasin_id,
            description: data.description || undefined
        };

        await createCaisse(payload);
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Caisse créée avec succès', life: 3000 });
        setTimeout(() => {
            router.push('/caisse');
        }, 1500);
    } catch (e: any) {
        console.error("Erreur création caisse", e);
        const errorMsg = extractErrorMessage(e, 'Impossible de créer la caisse');
        toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 5000 });
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    router.push('/caisse');
};
</script>