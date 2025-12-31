<template>
  <div class="space-y-8">
    <SimplePageHeader
      title="Historique des Ventes"
      description="Consultez, filtrez et analysez l'historique de vos transactions commerciales."
    />

    <!-- Cartes de Statistiques -->
    <VenteStatsCards :stats="stats" :loading="loading" />

    <!-- Filtres -->
    <VenteFilters 
      v-model:magasinId="selectedMagasinId"
      v-model:statut="selectedStatut"
      v-model:paiement="selectedPaiement"
      :magasins="magasins"
      :loading="loading"
      @refresh="loadData"
    />

    <!-- Table des Ventes -->
    <div class="space-y-4">
        <TableGeneric
            :data="ventes"
            :columns="columns"
            :loading="loading"
            :search-fields="['client.nom', 'utilisateur.employee.fullName', 'id']"
            :show-edit="false"
            :show-delete="false"
            :show-view="hasPermission('ventes', 'voir')"
            @action:view="data => router.push(`/vente/detail-vente/${data.id}`)"
        >
            <!-- Date -->
            <template #column-date_creation="{ data }">
                <div class="flex flex-col text-xs">
                    <span class="font-medium text-gray-700">{{ formatDate((data as any).date_creation) }}</span>
                    <span class="text-gray-400 font-mono">{{ formatTime((data as any).date_creation) }}</span>
                </div>
            </template>

            <!-- Caisse -->
            <template #column-session_caisse="{ data }">
                <div v-if="(data as any).session_caisse?.caisse" class="flex items-center gap-2">
                    <div class="p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <Icon icon="tabler:cash-register" class="text-gray-400" />
                    </div>
                    <div class="flex flex-col">
                        <span class="font-bold text-gray-800 text-xs">{{ (data as any).session_caisse?.caisse?.nom }}</span>
                        <span class="text-[10px] text-gray-500">{{ (data as any).session_caisse?.caisse?.code }}</span>
                    </div>
                </div>
                <Tag v-else value="Back Office" severity="secondary" class="!text-[10px]" />
            </template>

            <!-- Produits / Cond. -->
            <template #column-produits="{ data }">
                <div class="flex flex-col gap-1">
                    <div v-for="detail in (data as any).details?.slice(0, 2)" :key="detail.id" class="flex items-center gap-1 text-xs">
                        <span class="font-semibold text-gray-700 truncate max-w-[120px]">{{ detail.produit?.nom }}</span>
                        <span class="text-gray-400 italic">x{{ detail.quantite }}</span>
                    </div>
                    <span v-if="(data as any).details?.length > 2" class="text-[10px] text-primary font-bold">
                        + {{ (data as any).details.length - 2 }} autres articles
                    </span>
                    <span v-if="!(data as any).details?.length" class="text-gray-300 italic text-xs">Aucun article</span>
                </div>
            </template>
    
            <!-- Statut -->
            <template #column-statut="{ data }">
                <Badge :value="(data as any).statut" :severity="getSeverity((data as any).statut)" class="!rounded-lg !text-[10px]" />
            </template>
    
            <!-- Paiement -->
            <template #column-methode_paiement="{ data }">
                <div class="flex items-center gap-1 text-xs font-medium text-gray-600">
                    <Icon :icon="getPaiementIcon((data as any).methode_paiement)" class="text-gray-400" />
                    <span>{{ (data as any).methode_paiement }}</span>
                </div>
            </template>

            <!-- VUE MOBILE (Slot) -->
            <template #mobile-item="{ data }">
                <MobileCard>
                    <template #header>
                         <div class="flex flex-col">
                            <span class="font-bold text-gray-800 text-sm">Vente #{{ data.id.substring(0, 8) }}</span>
                            <span class="text-xs text-gray-500">{{ formatDate(data.date_creation) }} à {{ formatTime(data.date_creation) }}</span>
                        </div>
                        <Badge :value="data.statut" :severity="getSeverity(data.statut)" class="!rounded-lg !text-[10px]" />
                    </template>

                    <!-- Body -->
                    <div class="flex flex-col gap-3 mt-1">
                        <!-- Produits summary -->
                        <div class="text-xs text-gray-600">
                             <div v-if="data.details?.length > 0">
                                {{ data.details[0].produit?.nom }} 
                                <span v-if="data.details.length > 1" class="font-semibold text-primary">+ {{ data.details.length - 1 }} autres</span>
                             </div>
                             <div v-else class="italic text-gray-400">Aucun article</div>
                        </div>

                         <!-- Price + Vendeur -->
                         <div class="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                             <div class="flex flex-col gap-1">
                                 <!-- Seller -->
                                 <div class="flex items-center gap-1 text-[10px] text-noir">
                                     <Icon icon="mdi:account" /> {{ data.utilisateur?.employee?.fullName || 'Vendeur inconnu' }}
                                 </div>
                                 <!-- Source -->
                                 <span v-if="data.session_caisse" class="text-[10px] text-noir flex items-center gap-1">
                                     <Icon icon="mdi:store" /> {{ data.session_caisse.caisse?.nom }}
                                 </span>
                             </div>
                             <div class="text-right">
                                 <div class="text-lg font-bold text-primary">{{ formatPrice(data.montant_total) }}</div>
                                 <div class="text-[10px] text-gray-500 flex items-center justify-end gap-1">
                                     <Icon :icon="getPaiementIcon(data.methode_paiement)" /> {{ data.methode_paiement }}
                                 </div>
                             </div>
                         </div>
                    </div>

                    <template #footer>
                        <AppButton 
                            label="Voir le détail" 
                            icon="pi pi-file-invoice" 
                            variant="secondary" 
                            size="sm" 
                            full-width 
                            @click="router.push(`/vente/detail-vente/${data.id}`)" 
                        />
                    </template>
                </MobileCard>
            </template>

        </TableGeneric>
    </div>

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import AppButton from '~/components/button/AppButton.vue';
import TableGeneric, { type TableColumn } from '~/components/table/TableGeneric.vue';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import VenteFilters from '~/components/vente/VenteFilters.vue';
import VenteStatsCards from '~/components/vente/VenteStatsCards.vue';
import { useVenteApi, type Vente, type VenteStats } from '~/composables/api/useVenteApi';
import { useMagasinApi } from '~/composables/api/useMagasinApi';
import { useGlobalLoading } from '~/composables/useGlobalLoading';
import { useCurrency } from '~/composables/useCurrency'; // Import currency formatter
import Badge from 'primevue/badge';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import MobileCard from '~/components/mobile/MobileCard.vue';

const { getVentes, getVenteStats, updateVenteStatut, getVenteById } = useVenteApi();
const { getMagasins } = useMagasinApi();
const { hasPermission } = usePermissions();
const toast = useToast();
const router = useRouter();
const { startLoading, stopLoading } = useGlobalLoading();
const { formatPrice } = useCurrency(); // Use currency formatter

// État
const ventes = ref<Vente[]>([]);
const stats = ref<VenteStats | null>(null);
const magasins = ref<any[]>([]);
const loading = ref(false);

// Filtres
const selectedMagasinId = ref<string | null>(null);
const selectedStatut = ref<string | null>(null);
const selectedPaiement = ref<string | null>(null);

const columns: TableColumn[] = [
  { field: 'date_creation', header: 'Date / Heure', sortable: true, customRender: true },
  { field: 'session_caisse', header: 'Source / Caisse', sortable: true, customRender: true },
  { field: 'produits', header: 'Articles (Aperçu)', sortable: false, customRender: true },
  { field: 'montant_total', header: 'Montant TTC', sortable: true, type: 'price' },
  { field: 'methode_paiement', header: 'Paiement', sortable: true, customRender: true },
  { field: 'statut', header: 'Statut', sortable: true, customRender: true },
  { field: 'utilisateur.employee.fullName', header: 'Vendeur', sortable: true },
];

const loadData = async () => {
    loading.value = true;
    startLoading();
    try {
        const [ventesData, statsData, magasinsData] = await Promise.all([
            getVentes({ 
                magasin_id: selectedMagasinId.value || undefined 
                // Note: Le backend filtrera par défaut via useMagasinStore si undefined
            }),
            getVenteStats({ magasin_id: selectedMagasinId.value || undefined }),
            getMagasins()
        ]);
        
        let filteredVentes = ventesData;
        
        // Filtrage frontend pour Statut et Paiement si nécessaire (ou si le backend ne le fait pas encore via query params)
        if (selectedStatut.value) {
            filteredVentes = filteredVentes.filter(v => v.statut === selectedStatut.value);
        }
        if (selectedPaiement.value) {
            filteredVentes = filteredVentes.filter(v => v.methode_paiement === selectedPaiement.value);
        }

        ventes.value = filteredVentes;
        stats.value = statsData;
        magasins.value = magasinsData;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les données', life: 3000 });
    } finally {
        loading.value = false;
        stopLoading();
    }
};

const navigateTo = (path: string) => {
    return useRouter().push(path);
};

// Utils
const getSeverity = (status: string) => {
    switch (status) {
        case 'PAYEE': return 'success';
        case 'EN_ATTENTE': return 'warning';
        case 'ANNULEE': return 'danger';
        default: return 'info';
    }
};

const getPaiementIcon = (method: string) => {
    switch (method) {
        case 'ESPECES': return 'tabler:coin';
        case 'CARTE': return 'tabler:credit-card';
        case 'MOBILE_MONEY': return 'tabler:device-mobile';
        case 'CHEQUE': return 'tabler:clipboard-check';
        default: return 'tabler:currency-dollar';
    }
};

const formatDate = (date: string) => new Date(date).toLocaleDateString();
const formatTime = (date: string) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

onMounted(() => {
  loadData();
});

// Recharger quand les filtres changent
watch([selectedMagasinId, selectedStatut, selectedPaiement], () => {
    loadData();
});
</script>
