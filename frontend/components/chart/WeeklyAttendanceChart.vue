<template>
  <!-- Skeleton Loading State -->
  <ChartSkeleton 
    v-if="loading" 
    chart-type="area" 
    height="h-20" 
    :show-title="false" 
    :show-legend="false"
  />
  
  <!-- Actual Chart -->
  <div v-else-if="hasData" class="weekly-attendance-chart">
    <ClientOnly>
      <VueApexCharts
        v-if="chartOptions"
        type="area"
        height="80"
        :options="chartOptions"
        :series="series"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import ChartSkeleton from '~/components/skeleton/ChartSkeleton.vue';

interface Props {
  type: 'ENTREE' | 'SORTIE';
  data?: Array<{ date: string; count: number }>;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
});

// Vérifier si des données existent
const hasData = computed(() => {
  return props.data && props.data.length > 0;
});

// Obtenir les dates de la semaine courante
const getCurrentWeekDates = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// Générer les données pour la semaine
const weekDates = getCurrentWeekDates();
const series = computed(() => {
  const dataMap = new Map(
    props.data.map(item => [item.date, item.count])
  );
  
  const weekData = weekDates.map(date => {
    const dateStr = date.toISOString().split('T')[0] || '';
    return {
      x: date.getTime(),
      y: dataMap.get(dateStr) || 0
    };
  });
  
  return [{
    name: props.type === 'ENTREE' ? 'Entrées' : 'Sorties',
    data: weekData
  }];
});

// Configuration du chart
const chartOptions = computed(() => {
  const color = props.type === 'ENTREE' ? '#018777' : '#ef4444';
  
  return {
    chart: {
      type: 'area' as const,
      height: 80,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      sparkline: {
        enabled: true
      }
    },
    colors: [color],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    fill: {
      type: 'gradient' as const,
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      type: 'datetime' as const,
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      show: false,
      min: 0
    },
    grid: {
      show: false
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy'
      },
      y: {
        formatter: (value: number) => `${value} ${props.type === 'ENTREE' ? 'entrée(s)' : 'sortie(s)'}`
      }
    },
    legend: {
      show: false
    }
  };
});
</script>

<style scoped>
.weekly-attendance-chart {
  margin-top: 1rem;
}
</style>
