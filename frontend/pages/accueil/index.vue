<template>
  <div class="space-y-6">
    <OnboardingPopup v-model="showOnboarding" />
    <!-- Header avec salutation -->
    <HeaderSkeleton v-if="isLoading" />
    <div v-else
      class="mb-6 bg-bleu shadow-sm border-2 min-h-[120px] border-[#a7d2e1] px-4 py-3 sm:px-6 sm:py-4 rounded-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative overflow-visible">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 relative z-10">
        <!-- Avatar avec effet 3D -->
        <AvatarInitials :name="userName" size="lg" :show-name="false" :shadow3d="true" />

        <!-- Salutation et message -->
        <div class="min-w-0  sm:text-left">
          <h1 class="text-lg sm:text-xl font-bold text-noir flex items-center sm:justify-start gap-2 flex-wrap">
            {{ greeting }} {{ userName }}! 👋
          </h1>
          <p class="text-sm sm:text-base text-gray-600 mt-1">{{ motivationalMessage }}</p>
        </div>
      </div>
      <!-- Image de l'équipe -->
      <div class="absolute right-8 bottom-0 pointer-events-none">
        <img src="~/assets/images/equipe.png" alt="Équipe" class=" w-60 h-auto object-contain" />
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="border-2 border-gris/40 bg-white px-5 py-6 rounded-lg space-y-6">
      <!-- En-tête et boutons d'action -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-noir">Statistiques du Jour</h3>
          <p class="text-sm text-gray-500 mt-1">Aperçu rapide des présences</p>
        </div>
        
        <!-- Boutons d'action -->
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
        <div class="w-full sm:w-auto">
          <DatePicker v-model="selectedDate" dateFormat="dd/mm/yy" :maxDate="new Date()" showIcon fluid
            placeholder="Sélectionner une date" class="w-full sm:w-48" />
        </div>
        <AppButton label="Générer un rapport" variant="outline" size="sm" iconLeft="pi pi-file-pdf" :loading="false"
          class="bg-white w-full sm:w-auto" />
        <AppButton label="Ajouter un employé" variant="primary" size="sm" iconLeft="pi pi-plus" :loading="false"
          @click="navigateToAddEmployee" class="w-full sm:w-auto" />
        </div>
      </div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <!-- Total Employés -->
        <CardStat icon="lucide:users" :value="stats?.totalEmployes || 0" label="Total Employés" variant="primary"
          :loading="isLoading" />

        <!-- Présences du jour -->
        <CardStat icon="lucide:user-check" :value="stats?.presencesDuJour || 0" :label="formattedDateLabels.presences"
          variant="success" :loading="isLoading" />

        <!-- Retards du jour -->
        <CardStat icon="lucide:clock" :value="stats?.retardsDuJour || 0" :label="formattedDateLabels.retards"
          variant="warning" :loading="isLoading" />

        <!-- Incomplets du jour -->
        <CardStat icon="lucide:user-minus" :value="stats?.incompletsDuJour || 0" :label="formattedDateLabels.incomplets"
          variant="info" :loading="isLoading" />

        <!-- Congés approuvés -->
        <CardStat icon="lucide:calendar-check" :value="stats?.congesApprouvesDuJour || 0" :label="formattedDateLabels.conges"
          variant="danger" :loading="isLoading" />
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <!-- Chart des pointages -->
      <StackedAreaChart :data="pointagesData" :loading="isLoading" />

      <!-- Répartition des Statuts -->
      <PieChart :data="stats" :loading="isLoading" />
    </div>

    <!-- Widgets Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <!-- Activité Récente -->
      <RecentActivity :selected-date="selectedDate" />

      <!-- Top Employés -->
      <TopEmployees :selected-date="selectedDate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import CardStat from "~/components/card/CardStat.vue";
import StackedAreaChart from "~/components/chart/StackedAreaChart.vue";
import PieChart from "~/components/chart/PieChart.vue";
import RecentActivity from "~/components/statistics/RecentActivity.vue";
import TopEmployees from "~/components/statistics/TopEmployees.vue";
import DatePicker from "primevue/datepicker";
import AppButton from "~/components/button/AppButton.vue";
import HeaderSkeleton from "~/components/skeleton/HeaderSkeleton.vue";
import OnboardingPopup from "~/components/onboarding/OnboardingPopup.vue";
import AvatarInitials from "~/components/avatar/AvatarInitials.vue";
import { useStatsApi, type DashboardStats } from "~/composables/api/useStatsApi";
import { useChartsApi, type PointagesChartData, type StatutsChartData } from "~/composables/api/useChartsApi";
import { useCurrentUser } from "~/composables/api/useUserApi";
import { useSecureAuth } from "~/composables/useSecureAuth";

// Middleware d'authentification
definePageMeta({
  middleware: ['auth', 'permissions'],
});

// Debug de l'authentification
onMounted(() => {
  const { user, isAuthenticated } = useSecureAuth();
  console.log('🏠 Page Accueil - User:', user.value);
  console.log('🏠 Page Accueil - isAuthenticated:', isAuthenticated.value);
});

// Onboarding logic
const showOnboarding = ref(false);
const route = useRoute();
const router = useRouter();

onMounted(() => {
  if (route.query.onboarding === 'true') {
    showOnboarding.value = true;
    
    // Clean up query param
    const query = { ...route.query };
    delete query.onboarding;
    router.replace({ query });
  }
});


const { getDashboardStats } = useStatsApi();
const { getPointagesChart, getStatutsChart } = useChartsApi();
const { user, fetchUser } = useCurrentUser();

// ... rest of the code remains the same ...
// Informations utilisateur
const userName = computed(() => {
  if (!user.value) return "Utilisateur";
  // Pour les TenantUsers, utiliser employee.fullName
  if (user.value.employee) {
    return user.value.employee.fullName;
  }
  // Pour les Admin, utiliser name
  return user.value.name || "Utilisateur";
});

// Salutation dynamique selon l'heure
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bonjour";
  if (hour >= 12 && hour < 18) return "Bon après-midi";
  return "Bonsoir";
});

// Messages motivationnels aléatoires
const motivationalMessages = [
  "Nous espérons que vous passez une excellente journée.",
  "Prêt à gérer les présences d'aujourd'hui ?",
  "Votre équipe compte sur vous !",
  "Une nouvelle journée, de nouvelles opportunités.",
  "Continuez votre excellent travail !",
  "Ensemble, nous accomplissons de grandes choses.",
];

const motivationalMessage = computed(() => {
  const index = new Date().getDate() % motivationalMessages.length;
  return motivationalMessages[index];
});

// Formatage des labels avec date du jour
const formattedDateLabels = computed(() => {
  const dateToUse = selectedDate.value || new Date();
  const dayName = dateToUse.toLocaleDateString('fr-FR', { weekday: 'long' });
  const dateStr = dateToUse.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long'
  });

  const prefix = isToday(dateToUse) ? 'du jour' : `du ${dateStr}`;

  return {
    presences: `Présences ${prefix}`,
    retards: `Retards ${prefix}`,
    incomplets: `Incomplets ${prefix}`,
    conges: `Congés ${prefix}`,
  };
});

const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

// État des statistiques
const stats = ref<DashboardStats | null>(null);
const pointagesData = ref<PointagesChartData | undefined>(undefined);
const statutsData = ref<StatutsChartData | undefined>(undefined);
const isLoading = ref(true); // Initialiser à true pour afficher les skeletons d'abord
const error = ref<string | null>(null);
const selectedDate = ref(new Date());

// Rafraîchissement automatique des données toutes les 20 s
const REFRESH_MS = 20_000;
let refreshTimer: ReturnType<typeof setInterval> | null = null;

// Charger les statistiques
const loadStats = async () => {
  try {
    error.value = null;
    stats.value = await getDashboardStats(selectedDate.value);
  } catch (err: any) {
    console.error("Erreur lors du chargement des stats:", err);
    error.value = err.message || "Erreur lors du chargement des statistiques";
  }
};

// Charger les données du chart des pointages
const loadPointagesChart = async (date?: Date) => {
  try {
    const result = await getPointagesChart("day", date);
    pointagesData.value = result || undefined;
  } catch (err: any) {
    console.error("Erreur lors du chargement du chart pointages:", err);
    pointagesData.value = undefined;
  }
};

// Charger les données du chart des statuts
const loadStatutsChart = async (month?: Date) => {
  try {
    const result = await getStatutsChart(month, selectedDate.value);
    statutsData.value = result || undefined;
  } catch (err: any) {
    console.error("Erreur lors du chargement du chart statuts:", err);
    statutsData.value = undefined;
  }
};

// Navigation vers la page d'ajout d'employé
const navigateToAddEmployee = () => {
  navigateTo("/employees/ajouter");
};

// Charger les données au montage
onMounted(async () => {
  try {
    await fetchUser();
    await loadStats();
    await loadPointagesChart(selectedDate.value);
    await loadStatutsChart();
  } finally {
    // Masquer les skeletons une fois toutes les données chargées
    isLoading.value = false;

    // ⏱ Démarrer le polling automatique
    refreshTimer = setInterval(() => {
      loadPointagesChart(selectedDate.value);
      loadStatutsChart();
      loadStats();
    }, REFRESH_MS);
  }
});

// Watch date change
watch(selectedDate, async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      loadStats(),
      loadPointagesChart(selectedDate.value),
      loadStatutsChart()
    ]);
  } finally {
    isLoading.value = false;
  }
});

// Nettoyer le timer lorsque la page est détruite
onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>
