<template>
  <div class="space-y-6">
    <!-- Header & Filtres -->
    <div class="flex flex-col relative overflow-hidden bg-side p-5 rounded-lg justify-between gap-4">
      <!-- Background Abstract -->
      <div class="absolute inset-0 z-0">
         <img src="~/assets/images/dashboard-header-bg.png" alt="Background" class="w-full h-full object-cover opacity-40" />
         <div class="absolute inset-0 bg-gradient-to-r from-side/50 to-side/40"></div>
      </div>

      <div class="flex items-center justify-between relative z-10">
        <div class=" space-y-1">
          <h1 class="text-2xl font-bold text-white">Tableau de bord</h1>
          <p class="text-white/70 text-sm">Vue d'ensemble de votre activité</p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Période Selector (PrimeVue) -->
          <Dropdown v-model="selectedPeriod" :options="periodOptions" optionLabel="label" optionValue="value"
            class="w-48" @change="fetchDashboardStats" />
            
          <button @click="fetchDashboardStats"
              class="p-3 bg-white hover:bg-primary border border-white/20 rounded-lg text-noir transition-colors shadow-sm"
              title="Rafraîchir">
              <Icon icon="tabler:refresh" :class="{ 'animate-spin': loading }" />
          </button>
        </div>
      </div>
      
      <!-- KPI Cards Grid -->
      <div class="grid grid-cols-1 z-20 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardStat :label="`CA (${periodLabel})`" :value="formatPriceCompact(stats.revenue.value)" 
          icon="tabler:coin" variant="primary" :loading="loading" 
          :trend="stats.revenue.trend" :trend-label="trendComparisonLabel" />
          
        <CardStat :label="`Ventes (${periodLabel})`" :value="stats.sales_count.value" 
          icon="tabler:shopping-cart" variant="success" :loading="loading" 
          :trend="stats.sales_count.trend" :trend-label="trendComparisonLabel" />
          
        <CardStat label="Achats en Attente" :value="stats.pending_purchases" icon="tabler:truck-delivery"
          variant="warning" :loading="loading" />
          
        <CardStat label="Stock Faible" :value="stats.low_stock_count" icon="tabler:alert-triangle" variant="danger"
          :loading="loading" />
      </div>
    </div>
    
    <!-- Charts & Tables Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Chart: Sales Evolution -->
      <SalesEvolutionChart :loading="loading" :sales-data="salesData" :period="selectedPeriod" class="lg:col-span-2" />

      <!-- Top Products -->
      <TopProductsList :loading="loading" :products="topProducts" />
    </div>

    <!-- Recent Sales Table (Full Width) -->
    <div class="grid grid-cols-1">
      <RecentSalesList :loading="loading" :sales="recentSales" @action:view="viewDetails" />
    </div>

    <!-- Modale Détail Vente -->
    <VenteDetailModal 
        v-model:visible="showDetailModal"
        :vente="selectedVente"
        :loading="detailLoading"
        @status-updated="fetchDashboardStats"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Icon } from '@iconify/vue';
import Dropdown from 'primevue/dropdown';
import CardStat from '~/components/card/CardStat.vue';
import SalesEvolutionChart from '~/components/chart/SalesEvolutionChart.vue';
import TopProductsList from '~/components/TopProductsList.vue';
import RecentSalesList from '~/components/dashboard/RecentSalesList.vue';
import VenteDetailModal from '~/components/vente/VenteDetailModal.vue';
import { useMagasinStore } from '~/stores/magasin';
import { useDashboardApi } from '~/composables/api/useDashboardApi';
import { useVenteApi, type Vente } from '~/composables/api/useVenteApi';
import { useCurrency } from '~/composables/useCurrency';

// Initialiser les valeurs par défaut avec la nouvelle structure
const stats = ref({
  revenue: { value: 0, previous: 0, trend: 0 },
  sales_count: { value: 0, previous: 0, trend: 0 },
  low_stock_count: 0,
  pending_purchases: 0
});

const periodOptions = [
  { label: '7 derniers jours', value: 'DAY' },
  { label: '4 dernières semaines', value: 'WEEK' },
  { label: 'Mois en cours', value: 'MONTH' }
];

const selectedPeriod = ref('DAY');

const periodLabel = computed(() => {
  if (selectedPeriod.value === 'DAY') return 'Jour';
  if (selectedPeriod.value === 'WEEK') return 'Semaine';
  return 'Mois';
});

const trendComparisonLabel = computed(() => {
  if (selectedPeriod.value === 'DAY') return 'vs hier';
  if (selectedPeriod.value === 'WEEK') return 'vs sem. der.';
  return 'vs mois der.';
});

const topProducts = ref<any[]>([]);
const recentSales = ref<any[]>([]);
const salesData = ref<{ date: string, amount: number }[]>([]);
const loading = ref(true);

// Détail Vente
const showDetailModal = ref(false);
const detailLoading = ref(false);
const selectedVente = ref<Vente | null>(null);

const store = useMagasinStore();
const { currentMagasinId } = storeToRefs(store);
const { getDashboardStats } = useDashboardApi();
const { getVenteById } = useVenteApi();
const { formatPrice, formatPriceCompact } = useCurrency();

// Methods
const fetchDashboardStats = async () => {
  loading.value = true;
  try {
    const data = await getDashboardStats(currentMagasinId.value || undefined, selectedPeriod.value);
    if (data) {
      stats.value = data.stats;
      salesData.value = data.charts.sales;
      topProducts.value = data.top_products;
      recentSales.value = data.recent_sales;
    }
  } catch (error) {
    console.error("Erreur chargement dashboard:", error);
  } finally {
    loading.value = false;
  }
};

const viewDetails = async (vente: any) => {
    selectedVente.value = vente;
    showDetailModal.value = true;
    detailLoading.value = true;
    try {
        // Recharger l'objet complet avec les détails si nécessaire
        const fullVente = await getVenteById(vente.id);
        if (fullVente) selectedVente.value = fullVente as any;
    } catch (e) {
        console.error("Erreur lors du chargement des détails de la vente:", e);
    } finally {
        detailLoading.value = false;
    }
};

// Recharger quand le magasin change
watch(currentMagasinId, () => {
    fetchDashboardStats();
});

onMounted(async () => {
  await store.initialize();
  await fetchDashboardStats();
});
</script>

<style scoped>
:deep(.dashboard-dropdown) {
  
}

:deep(.dashboard-dropdown .p-dropdown-label) {
  color: white;
  font-size: 0.875rem;
  padding-left: 1rem;
}

:deep(.dashboard-dropdown .p-dropdown-trigger) {
  color: white;
}

:deep(.dashboard-dropdown:hover) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}
</style>
