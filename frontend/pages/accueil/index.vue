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

        <button @click="fetchDashboardStats"
            class="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors shadow-sm"
            title="Rafraîchir">
            <Icon icon="tabler:refresh" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
      <!-- KPI Cards Grid -->
      <div class="grid grid-cols-1 z-20 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Icon } from '@iconify/vue';
import CardStat from '~/components/card/CardStat.vue';
import SalesEvolutionChart from '~/components/chart/SalesEvolutionChart.vue';
import TopProductsList from '~/components/TopProductsList.vue';
import { useMagasinStore } from '~/stores/magasin';
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
const loading = ref(true);

const store = useMagasinStore();
const { currentMagasinId } = storeToRefs(store);
const { getDashboardStats } = useDashboardApi();

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

// Recharger quand le magasin change
watch(currentMagasinId, () => {
    fetchDashboardStats();
});

onMounted(async () => {
  await store.initialize();
  if (currentMagasinId.value) {
    await fetchDashboardStats();
  }
});
</script>