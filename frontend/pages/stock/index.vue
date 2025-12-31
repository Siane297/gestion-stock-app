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
             <!-- Quantité -->
             <template #column-quantite="{ data }: { data: any }">
                 <div class="flex items-center gap-1">
                     <span :class="getStockColorClass(data.quantite, data.quantite_minimum)" class="font-bold">
                        {{ data.quantite }}
                     </span>
                     <span class="text-xs text-gray-500">
                       {{ data.produit.unite?.nom }}
                     </span>
                 </div>
             </template>

             <!-- Statut avec Badges -->
             <template #column-statut="{ data }: { data: any }">
                <Badge v-if="data.quantite === 0" severity="danger" value="Rupture" />
                <Badge v-else-if="data.quantite <= data.quantite_minimum" severity="warn" value="Faible" />
                <Badge v-else severity="success" value="En Stock" />
             </template>

             <!-- Seuil Min -->
             <template #column-quantite_minimum="{ data }: { data: any }">
                 <span class="text-gray-500">{{ data.quantite_minimum }}</span>
             </template>

            <!-- VUE MOBILE (Slot) -->
            <template #mobile-item="{ data }">
                <MobileCard>
                    <template #header>
                        <div>
                            <h3 class="font-bold text-noir text-lg leading-tight">{{ data.produit.nom }}</h3>
                            <div class="text-xs text-noir mt-1 flex items-center gap-1">
                                <Icon icon="mdi:barcode" /> {{ data.produit.code_barre || 'Sans code' }}
                            </div>
                        </div>
                         <div class="flex-shrink-0">
                             <Badge v-if="data.quantite === 0" severity="danger" value="Rupture" />
                             <Badge v-else-if="data.quantite <= data.quantite_minimum" severity="warn" value="Faible" />
                             <Badge v-else severity="success" value="En stock" />
                        </div>
                    </template>

                    <!-- Body -->
                    <div class="flex justify-between items-center mt-2">
                        <div class="flex flex-col">
                             <span class="text-xs text-gray-400 uppercase tracking-wider font-semibold">Boutique</span>
                             <span class="font-medium text-noir flex items-center gap-1">
                                 <Icon icon="tabler:building-store" class="text-noir" /> {{ data.magasin.nom }}
                             </span>
                        </div>

                        <div class="text-right">
                             <span class="text-xs text-gray-400 uppercase tracking-wider font-semibold">Stock</span>
                             <div class="flex items-center justify-end gap-1">
                                 <span class="text-2xl font-bold" :class="getStockColorClass(data.quantite, data.quantite_minimum)">
                                     {{ data.quantite }}
                                 </span>
                                 <span class="text-sm text-gray-500">{{ data.produit.unite?.nom }}</span>
                             </div>
                        </div>
                    </div>
                    
                    <template #footer>
                        <AppButton 
                            label="Détails & Mouvements" 
                            icon="pi pi-chart-line" 
                            variant="secondary" 
                            size="sm" 
                            full-width 
                            @click="handleView(data)" 
                        />
                    </template>
                </MobileCard>
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
import MobileCard from '~/components/mobile/MobileCard.vue';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import { useStockApi, type StockMagasin } from '~/composables/api/useStockApi';
import { usePermissions } from '~/composables/usePermissions';
import { useGlobalLoading } from '~/composables/useGlobalLoading';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast'; // Duplicate import, removing one
import Badge from 'primevue/badge'; // Ensure Badge is imported if used
import { Icon } from '@iconify/vue';
import AppButton from '~/components/button/AppButton.vue';

const { getStocks } = useStockApi();
const { hasPermission } = usePermissions();
const toast = useToast();
const router = useRouter();
const { startLoading, stopLoading } = useGlobalLoading();

const stocks = ref<StockMagasin[]>([]);
const loading = ref(false);
const showOnlyAlerts = ref(false);

const columns: TableColumn[] = [
    { field: 'magasin.nom', header: 'Boutique', sortable: true },
    { field: 'produit.nom', header: 'Produit', sortable: true },
    { field: 'quantite', header: 'Quantité', sortable: true, customRender: true },
    { field: 'quantite_minimum', header: 'Seuil Alerte', sortable: true, customRender: true },
    { field: 'statut', header: 'Statut', sortable: false, customRender: true },
];

const loadStocks = async () => {
    loading.value = true;
    startLoading();
    try {
        stocks.value = await getStocks({ alerte: showOnlyAlerts.value ? true : undefined });
    } catch (e: any) {
        console.error("Erreur chargement stocks", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les stocks', life: 3000 });
    } finally {
        loading.value = false;
        stopLoading();
    }
};

const handleView = (s: StockMagasin) => {
    router.push(`/stock/detail-stock/${s.produit_id}`);
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