<template>
  <div>
    <!-- <SimplePageHeader
      title="Nouveau Mouvement de Stock"
      description="Enregistrer une entrée, sortie ou ajustement de stock"
    /> -->

    <div class="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gris">
        <FormulaireDynamique
            title="Détails du Mouvement"
            description="Veuillez remplir les informations concernant le mouvement de stock."
            :fields="stockFields"
            :loading="loading"
            submit-label="Enregistrer le mouvement"
            cancel-label="Retour"
            @submit="handleSubmit"
            @cancel="handleCancel"
        />
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import { useStockApi, type CreateMouvementDto } from '~/composables/api/useStockApi';
import { useProduitApi } from '~/composables/api/useProduitApi';
import { useMagasinApi } from '~/composables/api/useMagasinApi';

const router = useRouter();
const toast = useToast();
const { createMouvement } = useStockApi();
const { getProduits } = useProduitApi();
const { getMagasins } = useMagasinApi(); 

const loading = ref(false);
const produits = ref<any[]>([]);
const magasins = ref<any[]>([]);

const loadData = async () => {
    try {
        produits.value = await getProduits();
        magasins.value = await getMagasins();
    } catch (e) {
        console.error("Erreur chargement données formulaire stock", e);
    }
};

const stockFields = computed(() => [
    {
        name: 'magasin_id',
        label: 'Magasin',
        type: 'select' as const,
        required: true,
        options: magasins.value,
        optionLabel: 'nom',
        optionValue: 'id',
        placeholder: 'Sélectionner un magasin'
    },
    {
        name: 'produit_id',
        label: 'Produit',
        type: 'select' as const,
        required: true,
        options: produits.value,
        optionLabel: 'nom',
        optionValue: 'id',
        placeholder: 'Sélectionner un produit',
        filter: true
    },
    {
        name: 'type',
        label: 'Type de Mouvement',
        type: 'select' as const,
        required: true,
        options: [
            { label: 'Achat', value: 'ENTREE_ACHAT' },
            { label: 'Retour', value: 'ENTREE_RETOUR' },
            { label: 'Vente', value: 'SORTIE_VENTE' },
            { label: 'Périssable', value: 'SORTIE_PERISSABLE' },
            { label: 'Ajustement', value: 'AJUSTEMENT' },
            { label: 'Transfert', value: 'TRANSFERT' },
        ],
        optionLabel: 'label',
        optionValue: 'value'
    },
    {
        name: 'quantite',
        label: 'Quantité',
        type: 'number' as const,
        required: true,
        min: 1,
        placeholder: 'Quantité concernée'
    },
    {
        name: 'raison',
        label: 'Raison / Commentaire',
        type: 'textarea' as const,
        required: false,
        placeholder: 'Justification du mouvement (optionnel)'
    }
]);

const handleSubmit = async (data: any) => {
    loading.value = true;
    try {
        const payload: CreateMouvementDto = {
            magasin_id: data.magasin_id,
            produit_id: data.produit_id,
            type: data.type,
            quantite: Number(data.quantite),
            raison: data.raison
        };

        await createMouvement(payload);
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Mouvement de stock enregistré', life: 3000 });
        setTimeout(() => {
            router.push('/stock');
        }, 1500);
    } catch (e: any) {
        console.error("Erreur création mouvement", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: e.message || 'Erreur lors de l\'enregistrement', life: 5000 });
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    router.push('/stock');
};

onMounted(() => {
    loadData();
});
</script>