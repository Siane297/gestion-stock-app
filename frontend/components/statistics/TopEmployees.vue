<template>
  <div class="bg-white border-2 border-gris/40 rounded-lg p-6 h-full">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <div>
        <h3 class="text-lg font-bold text-noir">Top Employés</h3>
        <p class="text-sm text-gray-500 mt-1">Les plus assidus du mois</p>
      </div>
      <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{{ monthLabel }}</span>
    </div>

    <div v-if="loading" class="space-y-3">
      <Skeleton v-for="i in 5" :key="i" height="3rem" class="rounded-lg" />
    </div>

    <div v-else-if="employees.length === 0" class="text-center py-8 text-gray-500">
      Aucune donnée disponible
    </div>

    <div v-else class="space-y-4">
      <div v-for="(employee, index) in employees" :key="employee.id" class="flex items-center gap-3">
        <!-- Avatar de l'employé -->
        <AvatarInitials :name="employee.fullName" size="sm" :show-name="false" />

        <div class="flex-1">
          <div class="flex justify-between items-center mb-1">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-sm text-gray-900">{{ employee.fullName }}</span>
              <p class="text-xs text-primary">{{ employee.poste || 'Non assigné' }}</p>
            </div>
            <!-- Tag jour et pourcentage -->
            <div class="flex bg-gris/40 px-4 py-1 rounded-full items-center gap-2">
              <p class="text-xs font-semibold text-noir">{{ employee.presenceCount }} jour{{ employee.presenceCount >
                1 ? 's' : '' }}</p>
              <span class="font-bold text-sm text-noir">{{ employee.presenceRate }}%</span>
            </div>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-primary h-2 rounded-full transition-all duration-500"
              :style="{ width: `${employee.presenceRate}%` }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Skeleton from 'primevue/skeleton';
import AvatarInitials from '~/components/avatar/AvatarInitials.vue';
import { useStatsApi } from '~/composables/api/useStatsApi';

interface Props {
  selectedDate?: Date;
}

const props = defineProps<Props>();

const { getTopEmployees } = useStatsApi();
const employees = ref<any[]>([]);
const loading = ref(true);

// Calculer le label du mois affiché
const monthLabel = computed(() => {
  if (!props.selectedDate) return 'Ce mois';

  const month = props.selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return month.charAt(0).toUpperCase() + month.slice(1);
});

const loadTopEmployees = async () => {
  try {
    loading.value = true;
    employees.value = await getTopEmployees(props.selectedDate);
  } catch (error) {
    console.error('Erreur chargement top employés:', error);
  } finally {
    loading.value = false;
  }
};

const getRankColor = (index: number) => {
  switch (index) {
    case 0: return 'text-yellow-500';
    case 1: return 'text-gray-400';
    case 2: return 'text-amber-700';
    default: return 'text-gray-400';
  }
};

// Watch date changes
watch(() => props.selectedDate, () => {
  loadTopEmployees();
});

onMounted(() => {
  loadTopEmployees();
});
</script>
