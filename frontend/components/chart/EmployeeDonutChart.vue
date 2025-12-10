<template>
  <div class="bg-white rounded-xl p-6 border-2 border-gris/40">
    <!-- Header avec titre, description et tag du mois -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h3 class="text-lg font-bold text-noir">Taux de présence</h3>
        <p class="text-sm text-gray-500 mt-1">Répartition par statut</p>
      </div>
      <span class="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full w-fit">
        {{ formattedMonth }}
      </span>
    </div>

    <!-- Chart centré -->
    <component
      v-if="!isLoading && apexchart && hasData"
      :is="apexchart"
      type="donut"
      height="280"
      :options="chartOptions"
      :series="series"
    />

    <div v-else-if="isLoading" class="flex items-center justify-center h-[280px]">
      <div class="text-gray-400">Chargement...</div>
    </div>

    <div v-else class="flex items-center justify-center h-[280px]">
      <div class="text-gray-400">Aucune donnée disponible</div>
    </div>

    <!-- Légende en bas -->
    <div v-if="hasData" class="flex flex-wrap justify-center gap-6 mt-4">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
        <span class="text-sm text-gray-600">À l'heure</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-amber-500"></span>
        <span class="text-sm text-gray-600">En retard</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-red-500"></span>
        <span class="text-sm text-gray-600">Absent</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-cyan-500"></span>
        <span class="text-sm text-gray-600">Incomplet</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { BilanPresence } from "~/composables/api/useHistoriqueApi";

const apexchart = ref<any>(null);

interface Props {
  data: BilanPresence[];
  selectedMonth: Date;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const isLoading = computed(() => props.loading);

// Formater le mois sélectionné
const formattedMonth = computed(() => {
  if (!props.selectedMonth) return '';
  return props.selectedMonth.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  }).replace(/^\w/, (c) => c.toUpperCase());
});

// Filtrer les données par mois sélectionné
const filteredData = computed(() => {
  if (!props.data || !props.selectedMonth) return [];
  
  const month = props.selectedMonth.getMonth();
  const year = props.selectedMonth.getFullYear();
  
  return props.data.filter(item => {
    const date = new Date(item.createdAt);
    return date.getMonth() === month && date.getFullYear() === year;
  });
});

// Calculer les statistiques - 4 catégories séparées
const stats = computed(() => {
  let aLHeure = 0;
  let enRetard = 0;
  let absence = 0;
  let incomplet = 0;

  filteredData.value.forEach(item => {
    switch (item.statut) {
      case 'A_L_HEURE':
        aLHeure++;
        break;
      case 'EN_RETARD':
        enRetard++;
        break;
      case 'ABSENT':
        absence++;
        break;
      case 'INCOMPLET':
        incomplet++;
        break;
      // EN_CONGE n'est pas compté
    }
  });

  return { aLHeure, enRetard, absence, incomplet };
});

// Calculer les pourcentages pour chaque catégorie
const percentages = computed(() => {
  const total = stats.value.aLHeure + stats.value.enRetard + stats.value.absence + stats.value.incomplet;
  if (total === 0) {
    return { aLHeure: 0, enRetard: 0, absence: 0, incomplet: 0 };
  }
  return {
    aLHeure: Math.round((stats.value.aLHeure / total) * 100),
    enRetard: Math.round((stats.value.enRetard / total) * 100),
    absence: Math.round((stats.value.absence / total) * 100),
    incomplet: Math.round((stats.value.incomplet / total) * 100),
  };
});

// Trouver la catégorie avec le plus grand pourcentage
const maxCategory = computed(() => {
  const categories = [
    { label: "À l'heure", value: percentages.value.aLHeure },
    { label: "En retard", value: percentages.value.enRetard },
    { label: "Absent", value: percentages.value.absence },
    { label: "Incomplet", value: percentages.value.incomplet },
  ];
  
  const defaultCategory = { label: "À l'heure", value: 0 };
  return categories.reduce((max, cat) => (cat.value > (max?.value ?? 0) ? cat : max), defaultCategory);
});

// Vérifier si on a des données
const hasData = computed(() => {
  const total = stats.value.aLHeure + stats.value.enRetard + stats.value.absence + stats.value.incomplet;
  return total > 0;
});

// Séries de données (valeurs brutes) - 4 catégories
const series = computed(() => [
  stats.value.aLHeure,
  stats.value.enRetard,
  stats.value.absence,
  stats.value.incomplet,
]);

// Options du chart - Donut avec label central (catégorie max)
const chartOptions = computed(() => ({
  chart: {
    type: "donut" as const,
    height: 280,
    fontFamily: "inherit",
  },
  plotOptions: {
    pie: {
      startAngle: 0,
      endAngle: 360,
      donut: {
        size: "70%",
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: "14px",
            fontWeight: 600,
            color: "#6b7280",
            offsetY: -10,
          },
          value: {
            show: true,
            fontSize: "28px",
            fontWeight: 700,
            color: "#111827",
            offsetY: 5,
            formatter: (val: number) => `${val}%`,
          },
          total: {
            show: true,
            showAlways: true,
            label: maxCategory.value?.label || '',
            fontSize: "14px",
            fontWeight: 600,
            color: "#6b7280",
            formatter: () => `${maxCategory.value?.value || 0}%`,
          },
        },
      },
    },
  },
  colors: ["#10b981", "#f59e0b", "#ef4444", "#06b6d4"],
  labels: ["À l'heure", "En retard", "Absent", "Incomplet"],
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false, // Légende personnalisée à gauche
  },
  stroke: {
    width: 2,
    colors: ["#fff"],
  },
  tooltip: {
    y: {
      formatter: (val: number) => {
        const total = stats.value.aLHeure + stats.value.enRetard + stats.value.absence + stats.value.incomplet;
        const percent = total > 0 ? Math.round((val / total) * 100) : 0;
        return `${percent}%`;
      },
    },
  },
  responsive: [
    {
      breakpoint: 768,
      options: {
        chart: {
          height: 240,
          width: 240,
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
