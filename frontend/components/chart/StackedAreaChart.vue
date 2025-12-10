<template>
  <!-- Skeleton Loading State -->
  <ChartSkeleton 
    v-if="loading" 
    chart-type="area" 
    height="h-80"
    :show-title="true"
    :show-legend="true"
  />
  
  <!-- Actual Chart -->
  <div v-else class="bg-white rounded-xl p-6 border-2 border-gris/40">
    <div class="mb-6">
      <h3 class="text-lg font-bold text-noir">Pointages Entrée/Sortie</h3>
      <p class="text-sm text-gray-500 mt-1">Évolution des pointages</p>
    </div>

    <component
      v-if="!loading && hasData && apexchart"
      :is="apexchart"
      type="area"
      height="350"
      :options="chartOptions"
      :series="series"
    />
    
    <div v-else-if="loading" class="flex items-center justify-center h-[350px]">
      <div class="text-gray-400">Chargement...</div>
    </div>
    
    <div v-else class="flex items-center justify-center h-[350px]">
      <div class="text-gray-400">Aucune donnée disponible</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import ChartSkeleton from "~/components/skeleton/ChartSkeleton.vue";

// Définir apexchart comme null par défaut (sera chargé côté client)
const apexchart = ref<any>(null);

interface Props {
  data?: {
    categories: string[];
    entrees: number[];
    sorties: number[];
  };
  loading?: boolean;
}

const props = defineProps<Props>();

// Vérifier si on a des données
const hasData = computed(() => {
  console.log('📊 StackedAreaChart - Debug hasData:', {
    hasData: !!props.data,
    hasCategories: !!(props.data?.categories),
    categoriesLength: props.data?.categories?.length || 0,
    hasEntrees: !!(props.data?.entrees),
    entreesLength: props.data?.entrees?.length || 0,
    hassorties: !!(props.data?.sorties),
    sortiesLength: props.data?.sorties?.length || 0,
    loading: props.loading,
    data: props.data
  });
  
  return props.data && 
         props.data.categories && 
         props.data.categories.length > 0 &&
         props.data.entrees && 
         props.data.sorties &&
         props.data.entrees.length > 0 &&
         props.data.sorties.length > 0;
});

// Séries de données pour le stacked area chart
const series = computed(() => [
  {
    name: "Entrées",
    data: props.data?.entrees || [],
  },
  {
    name: "Sorties",
    data: props.data?.sorties || [],
  },
]);

// Options du chart
const chartOptions = computed(() => ({
  chart: {
    type: "area" as const,
    height: 350,
    stacked: false,
    toolbar: {
      show: false,
    },
    fontFamily: "inherit",
    zoom: {
      enabled: false,
    },
  },
  colors: ["#10b981", "#3b82f6"],
  dataLabels: {
    enabled: true,
    dropShadow: { enabled: false },
    style: { fontSize: '12px' },
  },
  stroke: {
    curve: "smooth" as const,
    width: 3,
  },
  markers: {
    size: 5,
    strokeWidth: 2,
    hover: { sizeOffset: 2 },
  },
  fill: {
    type: "gradient",
    gradient: {
      opacityFrom: 0.6,
      opacityTo: 0.2,
      stops: [0, 90, 100],
    },
  },
  xaxis: {
    categories: props.data?.categories || [],
    labels: {
      style: {
        colors: "#6b7280",
        fontSize: "12px",
      },
    },
  },
  yaxis: {
    title: {
      text: "Nombre de pointages",
      style: {
        color: "#6b7280",
        fontSize: "12px",
        fontWeight: 500,
      },
    },
    labels: {
      style: {
        colors: "#6b7280",
        fontSize: "12px",
      },
    },
  },
  tooltip: {
    y: {
      formatter: (val: number) => `${val} pointage${val > 1 ? "s" : ""}`,
    },
  },
  legend: {
    position: "top" as const,
    horizontalAlign: "right" as const,
    fontSize: "14px",
    fontWeight: 500,
    labels: {
      colors: "#374151",
    },
    markers: {
      size: 6,
      radius: 4,
    },
  },
  grid: {
    borderColor: "#f3f4f6",
    strokeDashArray: 4,
  },
}));

onMounted(async () => {
  // Charger ApexCharts côté client uniquement
  if (process.client) {
    const VueApexCharts = (await import("vue3-apexcharts")).default;
    apexchart.value = VueApexCharts;
  }
});
</script>
