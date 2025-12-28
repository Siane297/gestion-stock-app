<template>
  <div class="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <h3 class="font-semibold text-lg text-noir flex items-center gap-2">
        Évolution des Ventes
      </h3>
      <span class="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded">{{ periodLabel }}</span>
    </div>

    <div class="h-[350px] w-full" v-if="!loading">
      <ClientOnly>
        <apexchart type="area" height="100%" :options="chartOptions" :series="chartSeries"></apexchart>
      </ClientOnly>
    </div>
    <div v-else class="h-[350px] w-full flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
      <span class="text-gray-400">Chargement du graphique...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  loading: boolean;
  salesData: { date: string; amount: number }[];
  period?: string; // 'DAY', 'WEEK', 'MONTH'
}>();

const periodLabel = computed(() => {
  if (props.period === 'WEEK') return '4 dernières semaines';
  if (props.period === 'MONTH') return 'Mois en cours';
  return '7 derniers jours';
});

const formatCurrency = (value: number) => {
  const truncatedAmount = Math.trunc(value);
  return `${truncatedAmount.toLocaleString('fr-FR')} KMF`;
};

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    fontFamily: 'inherit',
    toolbar: { show: false },
    animations: { enabled: true },
    zoom: { enabled: false }
  },
  colors: ['#3b82f6'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100]
    }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: {
    categories: props.salesData.map(d => {
      const date = new Date(d.date);
      if (props.period === 'WEEK') {
        // Show "Sem. dd/mm"
        return `Sem. ${date.getDate()}/${date.getMonth() + 1}`;
      }
      return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    }),
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#9ca3af', fontSize: '11px' } }
  },
  yaxis: {
    labels: { 
      style: { colors: '#9ca3af', fontSize: '11px' },
      formatter: (value: number) => value >= 1000 ? `${Math.trunc(value/1000)}K` : Math.trunc(value)
    }
  },
  grid: {
    borderColor: '#f3f4f6',
    strokeDashArray: 4,
    padding: { top: 0, right: 0, bottom: 0, left: 10 }
  },
  tooltip: {
    theme: 'light',
    y: { formatter: (val: number) => formatCurrency(val) }
  }
}));

const chartSeries = computed(() => [{
  name: "Chiffre d'Affaires",
  data: props.salesData.map(d => d.amount)
}]);
</script>
