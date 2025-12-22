<template>
  <div>
    <SimplePageHeader
      title="Modifier le Fournisseur"
      description="Mettre à jour les informations du partenaire"
    />

    <div class="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gris">
        <div v-if="loadingInitial" class="flex justify-center p-8">
            <span class="text-gray-500">Chargement...</span>
        </div>

        <FormulaireDynamique
            v-else
            title="Détails Fournisseur"
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
definePageMeta({
    middleware: ['auth', 'permissions'],
    permission: 'fournisseurs:modifier'
});

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import { useFournisseurApi, type Fournisseur, type UpdateFournisseurDto } from '~/composables/api/useFournisseurApi';
import Toast from 'primevue/toast';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { getFournisseurById, updateFournisseur } = useFournisseurApi();

const fournisseurId = route.params.id as string;
const fournisseur = ref<Fournisseur | null>(null);
const loading = ref(false);
const loadingInitial = ref(true);
const pageTitleOverride = useState<string | null>('pageTitleOverride');

const loadData = async () => {
    loadingInitial.value = true;
    try {
        const data = await getFournisseurById(fournisseurId);
        if (!data) {
            toast.add({ severity: 'error', summary: 'Erreur', detail: 'Fournisseur introuvable', life: 3000 });
            setTimeout(() => router.push('/fournisseur'), 1500);
            return;
        }
        fournisseur.value = data;
        pageTitleOverride.value = `Modifier ${data.nom_entreprise}`;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger le fournisseur', life: 3000 });
    } finally {
        loadingInitial.value = false;
    }
};

const fields = computed(() => {
    if (!fournisseur.value) return [];
    
    return [
        {
            name: 'nom_entreprise',
            label: 'Nom de l\'entreprise',
            type: 'text' as const,
            required: true,
            value: fournisseur.value.nom_entreprise
        },
        {
            name: 'responsable',
            label: 'Nom du responsable',
            type: 'text' as const,
            required: true,
            value: fournisseur.value.responsable
        },
        {
            name: 'email',
            label: 'Email',
            type: 'email' as const,
            required: false,
            value: fournisseur.value.email
        },
        {
            name: 'telephone',
            label: 'Téléphone',
            type: 'text' as const,
            required: false,
            value: fournisseur.value.telephone
        },
        {
            name: 'delai_livraison',
            label: 'Délai de livraison estimé (jours)',
            type: 'number' as const,
            required: false,
            value: fournisseur.value.delai_livraison
        }
    ];
});

const handleSubmit = async (data: any) => {
    loading.value = true;
    try {
        const payload: UpdateFournisseurDto = {
            nom_entreprise: data.nom_entreprise,
            responsable: data.responsable,
            email: data.email,
            telephone: data.telephone,
            delai_livraison: Number(data.delai_livraison)
        };

        await updateFournisseur(fournisseurId, payload);
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Fournisseur mis à jour', life: 3000 });
        setTimeout(() => router.push('/fournisseur'), 1000);
    } catch (e: any) {
        const errorMsg = e.message || 'Erreur lors de la modification';
        toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 5000 });
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    router.push('/fournisseur');
};

onMounted(loadData);
onUnmounted(() => {
    pageTitleOverride.value = null;
});
</script>
