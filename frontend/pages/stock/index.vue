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
            :global-action="hasPermission('stock', 'creer') ? {
                label: 'Nouveau Mouvement',
                icon: 'pi pi-plus',
                variant: 'primary',
                link: '/stock/ajouter'
            } : undefined"
            :show-edit="false"
            :show-delete="false"
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
                     <span class="">
                       ({{ data.produit.unite?.nom }})
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
 
    <!-- Modal Détails des Lots -->
    <Dialog v-model:visible="showLotsModal" :header="'Détails des Lots - ' + (selectedStock?.produit?.nom || '')" modal :style="{ width: '50vw' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <div v-if="loadingLots" class="flex justify-center p-8">
            <ProgressSpinner style="width: 50px; height: 50px" />
        </div>
        <div v-else-if="lots.length === 0" class="p-8 text-center text-gray-500">
            Aucun lot spécifique enregistré pour ce produit dans ce magasin.
        </div>
        <div v-else>
            <DataTable :value="lots" stripedRows class="mt-4">
                <Column field="lot.numero_lot" header="Numéro de Lot"></Column>
                <Column field="lot.date_peremption" header="Date de péremption">
                    <template #body="{ data }">
                        {{ formatDate(data.lot.date_peremption) }}
                        <Tag v-if="isExpired(data.lot.date_peremption)" severity="danger" value="Expiré" class="ml-2" />
                    </template>
                </Column>
                <Column field="quantite" header="Quantité en Stock">
                    <template #body="{ data }">
                        <span class="font-bold">{{ data.quantite }}</span>
                    </template>
                </Column>
            </DataTable>
        </div>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import TableGeneric, { type TableColumn } from '~/components/table/TableGeneric.vue';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import { useStockApi, type StockMagasin } from '~/composables/api/useStockApi';
import { usePermissions } from '~/composables/usePermissions';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner';

const { getStocks } = useStockApi();
const { hasPermission } = usePermissions();
const toast = useToast();
const router = useRouter();

const stocks = ref<StockMagasin[]>([]);
const loading = ref(false);
const showOnlyAlerts = ref(false);

// Modal Lots
const showLotsModal = ref(false);
const loadingLots = ref(false);
const selectedStock = ref<StockMagasin | null>(null);
const lots = ref<any[]>([]);
const { getLotsByStock } = useStockApi();
const { formatDate } = useDate();

const columns: TableColumn[] = [
    { field: 'magasin.nom', header: 'Boutique', sortable: true },
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

const handleView = async (s: StockMagasin) => {
    selectedStock.value = s;
    showLotsModal.value = true;
    loadingLots.value = true;
    try {
        lots.value = await getLotsByStock(s.magasin_id, s.produit_id);
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les détails des lots', life: 3000 });
    } finally {
        loadingLots.value = false;
    }
};

const isExpired = (date: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
};

const handleEdit = (s: StockMagasin) => {
    // router.push(`/stock/modifier/${s.id}`);
};

const handleDelete = (s: StockMagasin) => {
     toast.add({ severity: 'warn', summary: 'Attention', detail: `Impossible de supprimer une ligne de stock. Faites un ajustement à 0 si nécessaire.`, life: 5000 });
};



const getStockColorClass = (qty: number, min: number) => {
    if (qty <= min) return 'text-red-600';
    if (qty <= min * 1.5) return 'text-orange-500';
    return 'text-primary';
};

onMounted(() => {
    loadStocks();
});
</script>