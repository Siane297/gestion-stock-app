<template>
  <div class="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
    <div class="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4 w-full sm:w-auto">
      <!-- Filtre Boutique -->
      <div class="flex flex-col gap-1 w-full sm:w-auto">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Boutique</span>
        <Select 
          :model-value="magasinId" 
          :options="magasins" 
          optionLabel="nom" 
          optionValue="id" 
          placeholder="Toutes les boutiques" 
          class="w-full sm:w-64 !bg-gray-50/50 !border-gray-200"
          showClear
          @update:model-value="(val) => { magasinId = val; $emit('refresh'); }"
        />
      </div>
      
      <!-- Filtre Statut -->
      <div class="flex flex-col gap-1 w-full sm:w-auto">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Statut</span>
        <Select 
          :model-value="statut" 
          :options="statutOptions" 
          optionLabel="label" 
          optionValue="value" 
          placeholder="Tous les statuts" 
          class="w-full sm:w-48 !bg-gray-50/50 !border-gray-200"
          showClear
          @update:model-value="(val) => { statut = val; $emit('refresh'); }"
        />
      </div>
    </div>

    <!-- Bouton Actualiser -->
    <button 
      @click="$emit('refresh')" 
      class="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto mt-2 sm:mt-0"
    >
      <Icon icon="tabler:refresh" :class="{ 'animate-spin': loading }" />
      <span class="font-medium">Actualiser</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Select from 'primevue/select';

interface Props {
  magasins: any[];
  loading?: boolean;
}

defineProps<Props>();

const magasinId = defineModel<string | null>('magasinId');
const statut = defineModel<string | null>('statut');

const statutOptions = [
  { label: 'En cours', value: 'OUVERTE' },
  { label: 'Clôturées', value: 'FERMEE' }
];

defineEmits<{
  refresh: [];
}>();
</script>
