<template>
  <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-lg text-noir flex items-center gap-2">
        Ventes par Catégorie
      </h3>
      <span class="text-xs font-medium bg-purple-50 text-purple-600 px-2 py-1 rounded">Top 5</span>
    </div>

    <div class="flex-1 flex flex-col justify-center h-[350px]" v-if="!loading">
      <ClientOnly>
        <apexchart 
          type="donut" 
          height="100%" 
          :options="chartOptions" 
          :series="chartSeries"
        ></apexchart>
      </ClientOnly>
    </div>
    <div v-else class="flex-1 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse h-[350px]">
      <span class="text-gray-400">Chargement...</span>
    </div>

    <!-- Légende personnalisée si besoin, ou vide si intégrée à ApexCharts -->
    <div v-if="!loading && categories.length === 0" class="flex flex-col items-center justify-center py-10 opacity-40">
       <Icon icon="tabler:category-2" class="text-4xl mb-2" />
       <p class="text-sm">Aucune donnée</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useCurrency } from '~/composables/useCurrency';

interface CategoryStat {
  name: string;
  value: number;
}

const props = defineProps<{
  loading: boolean;
  categories: CategoryStat[];
}>();

const { formatPrice } = useCurrency();

const chartSeries = computed(() => props.categories.map(c => c.value));

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'inherit',
    animations: { enabled: true }
  },
  labels: props.categories.map(c => c.name),
  colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981'],
  stroke: { show: false },
  dataLabels: { enabled: false },
  legend: {
    position: 'bottom',
    fontSize: '12px',
    labels: { colors: '#6b7280' },
    itemMargin: { horizontal: 10, vertical: 5 }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            fontSize: '14px',
            color: '#6b7280',
            formatter: (w: any) => {
              const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
              // Formatage compact pour le centre du donut si trop grand
              return total >= 1000000 ? `${(total/1000000).toFixed(1)}M` : `${(total/1000).toFixed(0)}k`;
            }
          }
        }
      }
    }
  },
  tooltip: {
    y: {
      formatter: (val: number) => formatPrice(val)
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      legend: { position: 'bottom' }
    }
  }]
}));
</script>
