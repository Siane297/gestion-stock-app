<template>
  <!-- Skeleton Loading State -->
  <ChartSkeleton 
    v-if="loading" 
    chart-type="default" 
    height="h-80"
    :show-title="true"
  />
  
  <!-- Actual Chart -->
  <div v-else class="bg-white rounded-xl p-6 border-2 border-gris/40">
    <div class="mb-6">
      <h3 class="text-lg font-bold text-noir">Répartition des Statuts</h3>
      <p class="text-sm text-gray-500 mt-1">Présences, Absences et Congés</p>
    </div>

    <component
      v-if="!loading && hasData && apexchart"
      :is="apexchart"
      type="donut"
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
import ChartSkeleton from "~/components/skeleton/ChartSkeleton.vue";

// Définir apexchart comme null par défaut (sera chargé côté client)
const apexchart = ref<any>(null);

interface Props {
  data?: {
    presencesDuJour: number;
    retardsDuJour: number;
    absencesDuJour: number;
    incompletsDuJour: number;
    congesDuJour: number;
    totalEmployes: number;
  } | null;
  loading?: boolean;
}

const props = defineProps<Props>();

// Vérifier si on a des données
const hasData = computed(() => {
  return props.data && props.data.totalEmployes > 0;
});

// Séries de données pour le donut chart
// NOTE: presencesDuJour contient DÉJÀ les retards (A_L_HEURE + EN_RETARD)
// donc on ne doit PAS additionner retardsDuJour
const series = computed(() => {
  if (!props.data) return [];
  
  return [
    props.data.presencesDuJour,  // Déjà inclut A_L_HEURE + EN_RETARD
    props.data.absencesDuJour,
    props.data.congesDuJour,
  ];
});

// Options du chart
const chartOptions = computed(() => ({
  chart: {
    type: "donut" as const,
    height: 350,
    fontFamily: "inherit",
  },
  labels: ["Présences", "Absences", "Congés"],
  colors: ["#10b981", "#ef4444", "#f59e0b"],
  legend: {
    position: "bottom" as const,
    fontSize: "14px",
    fontWeight: 500,
    labels: {
      colors: "#374151",
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(1)}%`,
    style: {
      fontSize: "14px",
      fontWeight: 600,
      colors: ["#fff"],
    },
    dropShadow: {
      enabled: false,
    },
  },
  tooltip: {
    y: {
      formatter: (val: number) => `${val} employé${val > 1 ? 's' : ''}`,
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: "65%",
      },
    },
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 300,
        },
        legend: {
          position: "bottom" as const,
        },
      },
    },
  ],
}));

onMounted(async () => {
  // Charger ApexCharts côté client uniquement
  if (process.client) {
    const VueApexCharts = (await import("vue3-apexcharts")).default;
    apexchart.value = VueApexCharts;
  }
});
</script>
