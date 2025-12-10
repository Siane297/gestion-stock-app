<template>
  <div class="bg-white border-2 border-gris/40 rounded-lg p-6 h-full">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <div>
        <h3 class="text-lg font-bold text-noir">Activité Récente</h3>
        <p class="text-sm text-gray-500 mt-1">Derniers pointages effectués</p>
      </div>
      <NuxtLink to="/pointage" class="text-sm text-primary hover:underline">Voir tout</NuxtLink>
    </div>

    <div v-if="loading" class="space-y-3">
      <Skeleton v-for="i in 4" :key="i" height="3rem" class="rounded-lg" />
    </div>

    <div v-else-if="activities.length === 0" class="text-center py-8 text-gray-500">
      Aucune activité récente
    </div>

    <div v-else class="space-y-3">
      <div v-for="activity in activities" :key="activity.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-blue-50 transition-colors">
        <div class="flex items-center gap-3">
          <AvatarInitials 
            :name="activity.employee?.fullName || 'Inconnu'" 
            :subtitle="activity.employee?.matricule"
            size="sm" 
            :show-name="true"
          />
        </div>
        <div class="text-right">
          <span 
            :class="getBadgeClasses(activity.type)"
            class="px-3 py-1 text-xs font-semibold rounded-full border inline-block"
          >
            {{ activity.type }} | {{ formatTime(activity.createdAt) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Skeleton from 'primevue/skeleton';
import AvatarInitials from '~/components/avatar/AvatarInitials.vue';
import { useAttendanceApi, type Attendance } from '~/composables/api/useAttendanceApi';

interface Props {
  selectedDate?: Date;
}

const props = defineProps<Props>();

const { getAttendances } = useAttendanceApi();
const activities = ref<Attendance[]>([]);
const loading = ref(true);

const loadActivities = async () => {
  try {
    loading.value = true;
    
    // Préparer les paramètres de filtre
    const params: any = { limit: 4 };
    
    if (props.selectedDate) {
      // Filtrer par jour sélectionné
      const startOfDay = new Date(props.selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(props.selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      params.startDate = startOfDay.toISOString();
      params.endDate = endOfDay.toISOString();
    }
    
    // Récupérer les pointages
    activities.value = await getAttendances(params);
  } catch (error) {
    console.error('Erreur chargement activités:', error);
  } finally {
    loading.value = false;
  }
};

const getBadgeClasses = (type: string) => {
  // ENTREE : vert vif avec background atténué
  // SORTIE : rouge vif avec background atténué
  if (type === 'ENTREE') {
    return 'border-green-600 text-green-600 bg-green-50';
  } else {
    return 'border-red-600 text-red-600 bg-red-50';
  }
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

let refreshInterval: NodeJS.Timeout;

// Watch date changes
watch(() => props.selectedDate, () => {
  loadActivities();
});

onMounted(() => {
  loadActivities();
  // Rafraîchir toutes les 30 secondes
  refreshInterval = setInterval(loadActivities, 30000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>
