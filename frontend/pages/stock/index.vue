<template>
  <div>
    <SimplePageHeader
      title="État du Stock"
      description="Consultez les niveaux de stock par magasin et produit"
    />

    <div class="mt-6">


        <TableGeneric
            :columns="columns"
            :data="filteredStocks"
            :loading="loading"
            :search-fields="['magasin.nom', 'produit.nom', 'produit.code_barre']"
            delete-label-field="produit.nom"
            :mobile-grid="true"
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
             <!-- Filtre par Statut -->
             <template #filters>
                <div class="flex items-center gap-3">
                    <Select 
                        v-model="selectedStatus" 
                        :options="statusOptions" 
                        optionLabel="label" 
                        optionValue="value" 
                        placeholder="Filtrer par statut"
                        class="w-full md:w-56"
                    >
                        <template #option="slotProps">
                            <div class="flex items-center gap-2">
                                <span>{{ slotProps.option.label }}</span>
                            </div>
                        </template>
                    </Select>
                </div>
             </template>
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
                <MobileCard class="!p-3.5 h-full flex flex-col">
                    <!-- Produit Header Section -->
                    <div class="mb-3">
                        <h3 class="font-bold text-noir text-[15px] leading-snug line-clamp-2  mb-1" :title="data.produit.nom">
                            {{ data.produit.nom }}
                        </h3>
                        <div class="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                            <Icon icon="mdi:barcode" class="shrink-0" />
                            <span class="truncate">{{ data.produit.code_barre || 'Sans code' }}</span>
                        </div>
                    </div>

                    <!-- Main Info Grid -->
                    <div class="flex-grow flex flex-col gap-2.5">
                         <!-- Magasin -->
                         <div class="flex flex-col bg-bleu/50 p-2 rounded-lg border border-gris/40">
                             <span class="text-[9px] text-gray-400 tracking-wider uppercase font-black mb-1">Boutique</span>
                             <div class="flex items-center gap-2 text-[11px] text-noir font-semibold truncate">
                                 <Icon icon="tabler:building-store" class="text-primary/70 shrink-0 text-xs" />
                                 <span class="truncate">{{ data.magasin.nom }}</span>
                             </div>
                         </div>

                         <!-- Stock & Status -->
                         <div class="flex flex-col">
                              <div class="flex items-center justify-between mb-1">
                                  <span class="text-[9px] text-gray-400 uppercase font-black">Stock</span>
                                  <Badge v-if="data.quantite === 0" severity="danger" value="Rupture" size="small" class="!text-[8px] !px-1.5 !font-bold" />
                                  <Badge v-else-if="data.quantite <= data.quantite_minimum" severity="warn" value="Faible" size="small" class="!text-[8px] !px-1.5 !font-bold" />
                                  <Badge v-else severity="success" value="En stock" size="small" class="!text-[8px] !px-1.5 !font-bold" />
                              </div>
                              <div class="flex items-baseline gap-1">
                                  <span class="text-xl font-black tracking-tighter" :class="getStockColorClass(data.quantite, data.quantite_minimum)">
                                      {{ data.quantite }}
                                  </span>
                                  <span class="text-[10px] text-gray-500 font-medium truncate max-w-[45px] lowercase">{{ data.produit.unite?.nom }}</span>
                              </div>
                         </div>
                    </div>
                    
                    <template #footer>
                        <AppButton 
                            label="Détails" 
                            icon="pi pi-chart-line" 
                            variant="secondary" 
                            size="sm" 
                            full-width 
                            class="!text-[10px] !py-2 !h-auto !rounded-lg mt-1"
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
import Select from 'primevue/select';
import { Icon } from '@iconify/vue';
import AppButton from '~/components/button/AppButton.vue';

const { getStocks } = useStockApi();
const { hasPermission } = usePermissions();
const toast = useToast();
const router = useRouter();
const { startLoading, stopLoading } = useGlobalLoading();

const stocks = ref<StockMagasin[]>([]);
const loading = ref(false);
const selectedStatus = ref('all');

const columns: TableColumn[] = [
    { field: 'magasin.nom', header: 'Boutique', sortable: true },
    { field: 'produit.nom', header: 'Produit', sortable: true },
    { field: 'quantite', header: 'Quantité', sortable: true, customRender: true },
    { field: 'quantite_minimum', header: 'Seuil Alerte', sortable: true, customRender: true },
    { field: 'statut', header: 'Statut', sortable: false, customRender: true },
];

const statusOptions = [
    { label: 'Tous les stocks', value: 'all' },
    { label: 'En rupture', value: 'rupture' },
    { label: 'Stock faible', value: 'faible' },
    { label: 'En stock', value: 'ok' },
];

const filteredStocks = computed(() => {
    if (selectedStatus.value === 'all') return stocks.value;
    
    return stocks.value.filter(s => {
        const isRupture = s.quantite === 0;
        const isFaible = s.quantite <= s.quantite_minimum && s.quantite > 0;
        const isOk = s.quantite > s.quantite_minimum;

        if (selectedStatus.value === 'rupture') return isRupture;
        if (selectedStatus.value === 'faible') return isFaible;
        if (selectedStatus.value === 'ok') return isOk;
        return true;
    });
});

const loadStocks = async () => {
    loading.value = true;
    startLoading();
    try {
        stocks.value = await getStocks();
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