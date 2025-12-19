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
        <div>
          <h1 class="text-2xl font-bold text-white">Tableau de bord</h1>
          <p class="text-white/70 text-sm">Vue d'ensemble de votre activité</p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Sélecteur de Magasin -->
          <div class="relative">
            <select v-if="magasins.length > 1" v-model="currentMagasinId" @change="fetchDashboardStats"
              class="appearance-none bg-white border border-gray-300 text-noir py-2 pl-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium shadow-sm transition-all hover:bg-gray-50 cursor-pointer">
              <option v-for="m in magasins" :key="m.id" :value="m.id">
                {{ m.nom }}
              </option>
            </select>
            <div v-if="magasins.length > 1"
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <Icon icon="tabler:chevron-down" class="text-xs" />
            </div>
            <div v-else-if="currentMagasin"
              class="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 shadow-sm flex items-center gap-2">
              <Icon icon="tabler:building-store" class="text-gray-400" />
              {{ currentMagasin.nom }}
            </div>
          </div>

          <button @click="fetchDashboardStats"
            class="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
            title="Rafraîchir">
            <Icon icon="tabler:refresh" :class="{ 'animate-spin': loading }" />
          </button>
        </div>
      </div>
      <!-- KPI Cards Grid -->
      <div class="grid grid-cols-1 z-40 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardStat label="Chiffre d'Affaires (J)" :value="formatCurrency(stats.revenue_today)" icon="tabler:coin"
          variant="primary" :loading="loading" />
        <CardStat label="Ventes (J)" :value="stats.sales_count_today" icon="tabler:shopping-cart" variant="success"
          :loading="loading" />
        <CardStat label="Achats en Attente" :value="stats.pending_purchases" icon="tabler:truck-delivery"
          variant="warning" :loading="loading" />
        <CardStat label="Stock Faible" :value="stats.low_stock_count" icon="tabler:alert-triangle" variant="danger"
          :loading="loading" />
      </div>
    </div>
    <!-- Charts & Tables Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Main Chart: Sales Evolution -->
      <SalesEvolutionChart :loading="loading" :sales-data="salesData" />

      <!-- Top Products -->
      <TopProductsList :loading="loading" :products="topProducts" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import CardStat from '~/components/card/CardStat.vue';
import SalesEvolutionChart from '~/components/chart/SalesEvolutionChart.vue';
import TopProductsList from '~/components/TopProductsList.vue';
import { useMagasinApi } from '~/composables/api/useMagasinApi';
import { useDashboardApi } from '~/composables/api/useDashboardApi';

// Initialiser les valeurs par défaut
const stats = ref({
  revenue_today: 0,
  revenue_month: 0,
  sales_count_today: 0,
  low_stock_count: 0,
  pending_purchases: 0
});
const topProducts = ref<any[]>([]);
const salesData = ref<{ date: string, amount: number }[]>([]);
const magasins = ref<any[]>([]);
const currentMagasinId = ref<string>('');
const loading = ref(true);

const { getMagasins } = useMagasinApi();
const { getDashboardStats } = useDashboardApi();

const currentMagasin = computed(() => magasins.value.find(m => m.id === currentMagasinId.value));

// Methods
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'KMF', maximumFractionDigits: 0 }).format(value);
};

const fetchDashboardStats = async () => {
  if (!currentMagasinId.value) return;

  loading.value = true;
  try {
    const data = await getDashboardStats(currentMagasinId.value);
    if (data) {
      stats.value = data.stats;
      salesData.value = data.charts.sales;
      topProducts.value = data.top_products;
    }
  } catch (error) {
    console.error("Erreur chargement dashboard:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    const mags = await getMagasins({ est_actif: true });
    magasins.value = mags || [];

    if (magasins.value.length > 0) {
      // Logique de sélection par défaut (Principal ou 1er)
      const principal = magasins.value.find(m => m.nom.toLowerCase().includes('principal'));
      currentMagasinId.value = principal ? principal.id : magasins.value[0].id;

      await fetchDashboardStats();
    }
  } catch (e) {
    console.error("Erreur init dashboard", e);
    loading.value = false;
  }
});
</script>