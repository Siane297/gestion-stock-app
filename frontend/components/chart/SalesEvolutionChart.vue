<template>
  <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
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
import { useCurrency } from '~/composables/useCurrency';

const props = defineProps<{
  loading: boolean;
  salesData: { date: string; amount: number; count: number; profit: number }[];
  period?: string; // 'DAY', 'WEEK', 'MONTH'
}>();

const { formatPrice, currentCurrency } = useCurrency();

const periodLabel = computed(() => {
  if (props.period === 'WEEK') return '4 dernières semaines';
  if (props.period === 'MONTH') return 'Mois en cours';
  return '7 derniers jours';
});

const chartOptions = computed(() => ({
  chart: {
    type: 'line', // Changé en line pour supporter plusieurs types
    fontFamily: 'inherit',
    toolbar: { show: false },
    animations: { enabled: true },
    zoom: { enabled: false }
  },
  colors: ['#3b82f6', '#10b981', '#f59e0b'], // Bleu (CA), Vert (Bénéfice), Orange (Ventes)
  fill: {
    type: ['gradient', 'gradient', 'solid'],
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100]
    }
  },
  dataLabels: { enabled: false },
  stroke: { 
    curve: 'smooth', 
    width: [3, 3, 2],
    dashArray: [0, 0, 5] // Ventes en pointillés pour distinguer
  },
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'center',
  },
  xaxis: {
    categories: props.salesData.map(d => {
      const date = new Date(d.date);
      if (props.period === 'WEEK') {
        return `Sem. ${date.getDate()}/${date.getMonth() + 1}`;
      }
      return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    }),
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#9ca3af', fontSize: '11px' } }
  },
  yaxis: [
    {
      seriesName: "Chiffre d'Affaires",
      title: { 
        text: `Montants (${currentCurrency.value?.symbol || 'KMF'})`, 
        style: { color: '#3b82f6' } 
      },
      labels: { 
        style: { colors: '#9ca3af', fontSize: '11px' },
        formatter: (value: number) => value >= 1000 ? `${Math.trunc(value/1000)}K` : Math.trunc(value)
      }
    },
    {
      seriesName: "Bénéfice",
      show: false // Masquer l'axe mais utiliser le même côté (gauche)
    },
    {
      seriesName: "Nombre de Ventes",
      opposite: true,
      title: { text: "Nombre de Ventes", style: { color: '#f59e0b' } },
      labels: { 
        style: { colors: '#f59e0b', fontSize: '11px' },
        formatter: (value: number) => Math.trunc(value).toString()
      },
      min: 0,
      forceNiceScale: true
    }
  ],
  grid: {
    borderColor: '#f3f4f6',
    strokeDashArray: 4,
    padding: { top: 0, right: 0, bottom: 0, left: 10 }
  },
  tooltip: {
    theme: 'light',
    shared: true,
    intersect: false,
    y: [
      { formatter: (val: number) => formatPrice(val) },
      { formatter: (val: number) => formatPrice(val) },
      { formatter: (val: number) => `${Math.trunc(val)} ventes` }
    ]
  }
}));

const chartSeries = computed(() => [
  {
    name: "Chiffre d'Affaires",
    type: 'area',
    data: props.salesData.map(d => d.amount)
  },
  {
    name: "Bénéfice",
    type: 'area',
    data: props.salesData.map(d => d.profit)
  },
  {
    name: "Nombre de Ventes",
    type: 'line',
    data: props.salesData.map(d => d.count)
  }
]);
</script>
