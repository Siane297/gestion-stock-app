<template>
  <div class="bg-white rounded-xl p-6 border-2 border-gris/40">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h3 class="text-lg font-bold text-noir">Pointages du mois</h3>
        <p class="text-sm text-gray-500 mt-1">Entrées et sorties par jour</p>
      </div>

      <!-- Sélecteur de mois -->
      <div class="flex gap-3">
        <DatePicker
          v-model="selectedMonth"
          view="month"
          dateFormat="MM yy"
          placeholder="Sélectionner un mois"
          showIcon
          :showButtonBar="true"
        />
      </div>
    </div>

    <!-- Container avec scroll horizontal -->
    <div class="overflow-x-auto">
      <div :style="{ minWidth: chartWidth + 'px' }">
        <component
          v-if="!isLoading && apexchart && hasData"
          :is="apexchart"
          type="bar"
          height="300"
          :options="chartOptions"
          :series="series"
        />
      </div>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center h-[300px]">
      <div class="text-gray-400">Chargement...</div>
    </div>

    <div v-if="!isLoading && !hasData" class="flex items-center justify-center h-[300px]">
      <div class="text-gray-400">Aucune donnée disponible</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import DatePicker from "primevue/datepicker";
import type { BilanPresence } from "~/composables/api/useHistoriqueApi";

const apexchart = ref<any>(null);

interface Props {
  data: BilanPresence[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  "month-change": [date: Date];
}>();

const isLoading = computed(() => props.loading);
const selectedMonth = ref<Date>(new Date());

// Émettre le mois au montage et quand il change
watch(selectedMonth, (newMonth) => {
  if (newMonth) {
    emit("month-change", newMonth);
  }
}, { immediate: true });

// Filtrer les données par mois sélectionné
const filteredData = computed(() => {
  if (!props.data || !selectedMonth.value) return [];
  
  const month = selectedMonth.value.getMonth();
  const year = selectedMonth.value.getFullYear();
  
  return props.data.filter(item => {
    const date = new Date(item.createdAt);
    return date.getMonth() === month && date.getFullYear() === year;
  });
});

// Vérifier si on a des données
const hasData = computed(() => filteredData.value.length > 0);

// Calculer la largeur du chart (30px par jour pour permettre le scroll)
const chartWidth = computed(() => {
  const daysInMonth = new Date(
    selectedMonth.value.getFullYear(),
    selectedMonth.value.getMonth() + 1,
    0
  ).getDate();
  return Math.max(600, daysInMonth * 35); // 35px par jour, min 600px
});

// Calculer les entrées/sorties par jour
const chartData = computed(() => {
  const daysInMonth = new Date(
    selectedMonth.value.getFullYear(),
    selectedMonth.value.getMonth() + 1,
    0
  ).getDate();

  const categories: string[] = [];
  const entrees: number[] = [];
  const sorties: number[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    categories.push(day.toString());
    
    const dayData = filteredData.value.filter(item => {
      const date = new Date(item.createdAt);
      return date.getDate() === day;
    });

    // Compter les entrées (heureEntree non null)
    entrees.push(dayData.filter(d => d.heureEntree).length);
    
    // Compter les sorties (heureSortie non null)
    sorties.push(dayData.filter(d => d.heureSortie).length);
  }

  return { categories, entrees, sorties };
});

// Séries de données
const series = computed(() => [
  {
    name: "Entrées",
    data: chartData.value.entrees,
    color: "#10b981",
  },
  {
    name: "Sorties",
    data: chartData.value.sorties,
    color: "#3b82f6",
  },
]);

// Options du chart
const chartOptions = computed(() => ({
  chart: {
    type: "bar" as const,
    height: 300,
    toolbar: {
      show: false,
    },
    fontFamily: "inherit",
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "70%",
      borderRadius: 4,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 2,
    colors: ["transparent"],
  },
  xaxis: {
    categories: chartData.value.categories,
    labels: {
      style: {
        colors: "#6b7280",
        fontSize: "11px",
      },
    },
    title: {
      text: "Jours du mois",
      style: {
        color: "#6b7280",
        fontSize: "12px",
        fontWeight: 500,
      },
    },
  },
  yaxis: {
    title: {
      text: "Nb pointages",
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
  fill: {
    opacity: 1,
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
