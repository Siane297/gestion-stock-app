<template>
  <div>
    <!-- <SimplePageHeader
      title="Paramètres du Stock"
      description="Définissez les seuils d'alerte et plafonds pour ce produit"
    /> -->

    <div class="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gris">
        <div v-if="stock" class="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg flex flex-col gap-2">
            <h2 class="font-bold text-lg">{{ stock.produit?.nom }}</h2>
            <div class="flex gap-4 text-sm">
                <span>Magasin: <strong>{{ stock.magasin?.nom }}</strong></span>
                <span>Stock Actuel: <strong>{{ stock.quantite }} {{ stock.produit?.unite?.nom }}</strong></span>
            </div>
        </div>

        <FormulaireDynamique
            title="Seuils de Stock"
            description="Configuration des alertes de réapprovisionnement"
            :fields="fields"
            :loading="loading"
           
            submit-label="Sauvegarder les paramètres"
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
    permission: 'stock:modifier'
});

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import { useStockApi, type StockMagasin, type SetMinimumStockDto } from '~/composables/api/useStockApi';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { getStockById, setMinimumStock } = useStockApi();

const loading = ref(false);
const stock = ref<StockMagasin | null>(null);

const stockId = route.params.id as string;


const pageTitleOverride = useState<string | null>('pageTitleOverride');

const loadData = async () => {
    loading.value = true;
    try {
        const data = await getStockById(stockId);
        if (!data) {
            toast.add({ severity: 'error', summary: 'Erreur', detail: 'Stock introuvable', life: 3000 });
            setTimeout(() => router.push('/stock'), 1500);
            return;
        }
        stock.value = data;
        // set breadcrumb title
        if (stock.value.produit) {
            pageTitleOverride.value = `${stock.value.produit.nom}`;
        }
    } catch (e) {
        console.error("Erreur chargement stock", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur chargement', life: 3000 });
    } finally {
        loading.value = false;
    }
};
// Reset breadcrumb on leave
onUnmounted(() => {
    pageTitleOverride.value = null;
});

const fields = computed(() => {
    // On attend que les données soient chargées pour pré-remplir
    if (!stock.value) return [];
    
    return [
        {
            name: 'quantite_minimum',
            label: 'Seuil d\'Alerte Minimum',
            type: 'number' as const,
            required: true,
            min: 0,
            value: stock.value.quantite_minimum,
            helpText: 'Vous serez notifié si le stock tombe sous cette quantité.'
        },
        // {
        //     name: 'quantite_maximum',
        //     label: 'Stock Maximum (Plafond)',
        //     type: 'number' as const,
        //     required: false,
        //     min: 0,
        //     value: stock.value.quantite_maximum, // Si ajouté au modèle
        //     helpText: 'Quantité cible pour le réapprovisionnement.'
        // }
    ];
});

const handleSubmit = async (data: any) => {
    if (!stock.value) return;

    loading.value = true;
    try {
        const payload: SetMinimumStockDto = {
            magasin_id: stock.value.magasin_id,
            produit_id: stock.value.produit_id,
            quantite_minimum: Number(data.quantite_minimum)
        };

        await setMinimumStock(payload);
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Seuils mis à jour', life: 3000 });
        setTimeout(() => {
            router.push('/stock');
        }, 1000);
    } catch (e: any) {
        console.error("Erreur mise à jour seuils", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: e.message || 'Erreur mise à jour', life: 5000 });
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    router.push('/stock');
};

onMounted(() => {
    if (stockId) {
        loadData();
    }
});
</script>