<template>
  <div>
    <SimplePageHeader
      title="État du Stock"
      description="Consultez les niveaux de stock par magasin et produit"
    />

    <div class="mt-6">


        <TableGeneric
            :columns="columns"
            :data="stocks"
            :loading="loading"
            :search-fields="['magasin.nom', 'produit.nom', 'produit.code_barre']"
            delete-label-field="produit.nom"
            :global-action="{
                label: 'Nouveau Mouvement',
                icon: 'pi pi-plus',
                variant: 'primary',
                link: '/stock/ajouter'
            }"
            @action:view="handleView"
            @action:edit="handleEdit"
            @action:delete="handleDelete"
        >
             <!-- Quantité avec indicateur couleur -->
             <template #column-quantite="{ data }: { data: any }">
                 <div class="flex items-center gap-2">
                     <span :class="getStockColorClass(data.quantite, data.quantite_minimum)" class="font-bold text-lg">
                        {{ data.quantite }}
                     </span>
                     <span class="text-xs text-gray-400">
                        {{ data.produit.unite?.nom }}
                     </span>
                     <Tag v-if="data.quantite <= data.quantite_minimum" severity="danger" value="Bas" class="text-xs py-0 px-2" />
                 </div>
             </template>

             <!-- Seuil Min -->
             <template #column-quantite_minimum="{ data }: { data: any }">
                 <span class="text-gray-500">{{ data.quantite_minimum }}</span>
             </template>

        </TableGeneric>
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import TableGeneric, { type TableColumn } from '~/components/table/TableGeneric.vue';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import { useStockApi, type StockMagasin } from '~/composables/api/useStockApi';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import Checkbox from 'primevue/checkbox';

const { getStocks } = useStockApi();
const toast = useToast();
const router = useRouter();

const stocks = ref<StockMagasin[]>([]);
const loading = ref(false);
const showOnlyAlerts = ref(false);

const columns: TableColumn[] = [
    { field: 'magasin.nom', header: 'Magasin', sortable: true },
    { field: 'produit.nom', header: 'Produit', sortable: true },
    { field: 'quantite', header: 'Quantité Disponible', sortable: true, customRender: true },
    { field: 'quantite_minimum', header: 'Seuil Alerte', sortable: true, customRender: true },
];

const loadStocks = async () => {
    loading.value = true;
    try {
        stocks.value = await getStocks({ alerte: showOnlyAlerts.value ? true : undefined });
    } catch (e: any) {
        console.error("Erreur chargement stocks", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les stocks', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const handleView = (s: StockMagasin) => {
    toast.add({ severity: 'info', summary: 'Mouvements', detail: `Historique pour ${s.produit?.nom} (Bientôt disponible)`, life: 3000 });
};

const handleEdit = (s: StockMagasin) => {
    router.push(`/stock/modifier/${s.id}`);
};

const handleDelete = (s: StockMagasin) => {
     toast.add({ severity: 'warn', summary: 'Attention', detail: `Impossible de supprimer une ligne de stock. Faites un ajustement à 0 si nécessaire.`, life: 5000 });
};



const getStockColorClass = (qty: number, min: number) => {
    if (qty <= min) return 'text-red-600';
    if (qty <= min * 1.5) return 'text-orange-500';
    return 'text-green-600';
};

onMounted(() => {
    loadStocks();
});
</script>