<template>
  <div>
    <SimplePageHeader
      title="Modifier le Magasin"
      description="Mettre à jour les informations du point de vente"
    />

    <div class="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gris">
        <FormulaireDynamique
            title="Détails du Magasin"
            description="Modifiez les informations ci-dessous."
            :fields="magasinFields"
            :loading="loading"
            :show-header="false"
            submit-label="Enregistrer les modifications"
            cancel-label="Retour"
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
import { useMagasinApi, type UpdateMagasinDto, type Magasin } from '~/composables/api/useMagasinApi';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { getMagasinById, updateMagasin } = useMagasinApi();

const loading = ref(false);
const magasin = ref<Magasin | null>(null);
const magasinId = route.params.id as string;

// Breadcrumb override
const pageTitleOverride = useState<string | null>('pageTitleOverride');

const loadData = async () => {
    loading.value = true;
    try {
        const data = await getMagasinById(magasinId);
        if (!data) {
            toast.add({ severity: 'error', summary: 'Erreur', detail: 'Magasin introuvable', life: 3000 });
            setTimeout(() => router.push('/store'), 1500);
            return;
        }
        magasin.value = data;
        pageTitleOverride.value = `Modifier ${data.nom}`;
    } catch (e: any) {
        console.error("Erreur chargement magasin", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger le magasin', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const magasinFields = computed(() => {
    if (!magasin.value) return [];

    return [
        {
            name: 'nom',
            label: 'Nom du Magasin',
            type: 'text' as const,
            required: true,
            value: magasin.value.nom,
            placeholder: 'Ex: Boutique Centre-Ville'
        },
        {
            name: 'localisation',
            label: 'Adresse / Localisation',
            type: 'text' as const,
            required: false,
            value: magasin.value.localisation,
            placeholder: 'Ex: 12 Rue du Commerce, Cotonou'
        },
        {
            name: 'email',
            label: 'Email de contact',
            type: 'email' as const,
            required: false,
            value: magasin.value.email,
            placeholder: 'contact@magasin.com'
        },
        {
            name: 'telephone',
            label: 'Téléphone',
            type: 'text' as const,
            required: false,
            value: magasin.value.telephone,
            placeholder: '+229 00 00 00 00'
        },
        {
            name: 'est_actif',
            label: 'Magasin Actif',
            type: 'checkbox' as const,
            required: false,
            value: magasin.value.est_actif,
            helpText: 'Décochez pour désactiver ce magasin (archivage)'
        }
        // Horaires temporairement masqués comme dans le formulaire d'ajout
        // { ... }
    ];
});

const handleSubmit = async (data: any) => {
    loading.value = true;
    try {
        const payload: UpdateMagasinDto = {
            nom: data.nom,
            localisation: data.localisation,
            email: data.email,
            telephone: data.telephone,
            est_actif: data.est_actif
        };

        await updateMagasin(magasinId, payload);
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Modifications enregistrées', life: 3000 });
        setTimeout(() => {
            router.push('/store');
        }, 1500);
    } catch (e: any) {
        console.error("Erreur modification magasin", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: e.message || 'Erreur lors de la modification', life: 5000 });
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    router.push('/store');
};

onMounted(() => {
    loadData();
});

onUnmounted(() => {
    pageTitleOverride.value = null;
});
</script>
