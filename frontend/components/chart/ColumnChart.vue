<template>
  <div class="bg-white rounded-xl p-6 border-2 border-gris/40">
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
    >
      <div>
        <h3 class="text-lg font-bold text-noir">Pointages Entrée/Sortie</h3>
        <p class="text-sm text-gray-500 mt-1">Statistiques des pointages</p>
      </div>

      <!-- Filtres -->
      <div class="flex flex-col sm:flex-row gap-3">
        <Select
          v-model="selectedFilter"
          :options="filters"
          optionLabel="label"
          optionValue="value"
          placeholder="Période"
          class=""
        />

        <DatePicker
          v-model="selectedDate"
          dateFormat="dd/mm/yy"
          placeholder="Date précise"
          showIcon
          :showButtonBar="true"
          class=""
        />
      </div>
    </div>

    <component
      v-if="!isLoading && apexchart"
      :is="apexchart"
      type="bar"
      height="350"
      :options="chartOptions"
      :series="series"
    />

    <div v-else class="flex items-center justify-center h-[350px]">
      <div class="text-gray-400">Chargement...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";

// Définir apexchart comme null par défaut (sera chargé côté client)
const apexchart = ref<any>(null);

interface Props {
  data?: {
    categories: string[];
    entrees: number[];
    sorties: number[];
  };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "filter-change", filter: string, date?: Date): void;
}>();

const filters = [
  { label: "Jour", value: "day" },
  { label: "Semaine", value: "week" },
  { label: "Mois", value: "month" },
];

const selectedFilter = ref("day");
const selectedDate = ref<Date | null>(null);
const isLoading = ref(false);

// Séries de données
const series = computed(() => [
  {
    name: "Entrées",
    data: props.data?.entrees || [],
    color: "#10b981",
  },
  {
    name: "Sorties",
    data: props.data?.sorties || [],
    color: "#3b82f6",
  },
]);

// Largeur des colonnes selon le filtre
const columnWidth = computed(() => {
  if (selectedFilter.value === "day") return "20%";
  if (selectedFilter.value === "week") return "60%";
  if (selectedFilter.value === "month") return "85%";
  return "55%";
});

// Options du chart
const chartOptions = computed(() => ({
  chart: {
    type: "bar" as const,
    height: 350,
    toolbar: {
      show: false,
    },
    fontFamily: "inherit",
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: columnWidth.value,
      borderRadius: 8,
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

// Watcher pour le filtre
watch(selectedFilter, (newFilter) => {
  emit("filter-change", newFilter, selectedDate.value || undefined);
});

// Watcher pour la date
watch(selectedDate, (newDate) => {
  if (newDate) {
    emit("filter-change", selectedFilter.value, newDate);
  }
});

onMounted(async () => {
  // Charger ApexCharts côté client uniquement
  if (process.client) {
    const VueApexCharts = (await import("vue3-apexcharts")).default;
    apexchart.value = VueApexCharts;
  }
  emit("filter-change", selectedFilter.value);
});
</script>
