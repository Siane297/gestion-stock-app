<template>
  <div 
    class="caisse-card bg-white rounded-xl border-2 border-gris/40 p-4 cursor-pointer transition-all hover:border-primary/30 hover:shadow-md"
    :class="{ 
      'opacity-60 cursor-not-allowed hover:border-gris/40 hover:shadow-none': isOccupied && !isMySession,
      'ring-2 ring-primary/20': isMySession
    }"
    @click="handleClick"
  >
    <div class="flex items-center gap-4">
      <!-- Icône -->
      <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon icon="tabler:cash-register" class="text-2xl text-primary" />
      </div>

      <!-- Infos -->
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-gray-800 truncate">{{ caisse.nom }}</h3>
        <div class="flex flex-col gap-0.5">
          <p class="text-xs text-gray-500">{{ caisse.code }}</p>
          <p v-if="caisse.occupant" class="text-[10px] font-medium text-amber-600 flex items-center gap-1">
            <Icon icon="tabler:user" class="flex-shrink-0" />
            <span class="truncate">Occupée par {{ caisse.occupant }}</span>
          </p>
        </div>
      </div>

      <!-- Badge Statut -->
      <div class="text-right flex-shrink-0">
        <Badge 
          :value="statusLabel" 
          :severity="statusSeverity"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import Badge from 'primevue/badge';

export interface CaisseCardData {
  id: string;
  nom: string;
  code: string;
  displayStatut: 'OUVERTE' | 'OCCUPEE' | 'FERMEE';
  isMySession?: boolean;
  occupant?: string;
}

const props = defineProps<{
  caisse: CaisseCardData;
}>();

const emit = defineEmits<{
  (e: 'select', caisse: CaisseCardData): void;
}>();

// Computed
const isOccupied = computed(() => props.caisse.displayStatut === 'OCCUPEE');
const isMySession = computed(() => props.caisse.isMySession === true);

const statusLabel = computed(() => {
  switch (props.caisse.displayStatut) {
    case 'OUVERTE': return 'Disponible';
    case 'OCCUPEE': return 'Occupée';
    case 'FERMEE': return 'Fermée';
    default: return 'Inconnu';
  }
});

const statusSeverity = computed(() => {
  switch (props.caisse.displayStatut) {
    case 'OUVERTE': return 'success';
    case 'OCCUPEE': return 'warn';
    case 'FERMEE': return 'danger';
    default: return 'secondary';
  }
});

// Handlers
function handleClick() {
  // Permettre le clic seulement si la caisse est disponible ou si c'est notre propre session
  if (!isOccupied.value || isMySession.value) {
    emit('select', props.caisse);
  }
}
</script>

<style scoped>
.caisse-card {
  -webkit-tap-highlight-color: transparent;
}
</style>
