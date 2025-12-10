<template>
  <div class="space-y-4">
    <!-- Header avec filtres skeleton -->
    <div class="bg-white rounded-lg p-6 border-2 border-gris/40">
      <!-- Barre de recherche skeleton -->
      <div class="mb-4">
        <Skeleton class="h-12 w-full rounded-lg" />
      </div>
      
      <!-- Filtres skeleton -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
        <!-- Filtres à gauche -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
          <Skeleton class="h-12 w-full lg:w-48 rounded-lg" />
          <Skeleton class="h-12 w-full lg:w-48 rounded-lg" />
        </div>

        <!-- Boutons à droite -->
        <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Skeleton class="h-12 w-full sm:w-32 rounded-lg" />
          <Skeleton class="h-12 w-full sm:w-32 rounded-lg" />
        </div>
      </div>
    </div>

    <!-- Table skeleton -->
    <div class="bg-white rounded-lg border-2 border-gris/40 overflow-hidden">
      <!-- Table header -->
      <div class="border-b border-gray-200 p-4">
        <div class="grid" :class="headerGridClass">
          <Skeleton 
            v-for="col in columns" 
            :key="col" 
            class="h-6 rounded-md"
          />
        </div>
      </div>
      
      <!-- Table rows -->
      <div class="divide-y divide-gray-200">
        <div 
          v-for="row in rows" 
          :key="row" 
          class="p-4"
        >
          <div class="grid gap-4" :class="headerGridClass">
            <Skeleton 
              v-for="col in columns" 
              :key="col" 
              class="h-5 rounded-md"
            />
          </div>
        </div>
      </div>
      
      <!-- Pagination skeleton -->
      <div class="border-t border-gray-200 p-4">
        <div class="flex justify-between items-center">
          <Skeleton class="h-6 w-32" />
          <div class="flex gap-2">
            <Skeleton class="h-8 w-8 rounded" />
            <Skeleton class="h-8 w-8 rounded" />
            <Skeleton class="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton';

interface Props {
  columns?: number;
  rows?: number;
  showFilters?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  columns: 5,
  rows: 10,
  showFilters: true,
});

const headerGridClass = computed(() => {
  const gridCols: Record<number, string> = {
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
  };
  return gridCols[props.columns] || 'grid-cols-5';
});
</script>
