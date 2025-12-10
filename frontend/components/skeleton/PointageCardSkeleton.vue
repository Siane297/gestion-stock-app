<template>
  <div class="bg-white rounded-xl p-8 border-2 border-gris/40 transition-all duration-300">
    <div class="flex flex-col space-y-4">
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <!-- Section gauche avec icône et titre -->
        <div class="flex flex-col text-left items-start gap-4 w-full lg:w-auto">
          <!-- Icône Skeleton -->
          <Skeleton class="w-16 h-16 rounded-lg" />
          
          <!-- Titre Skeleton -->
          <Skeleton class="h-8 w-48" />
        </div>

        <!-- Chart Skeleton - caché en mobile/tablet -->
        <div class="hidden lg:block w-full lg:w-80 xl:w-96 mt-4 lg:mt-0">
          <Skeleton class="h-32 w-full rounded-lg" />
        </div>
      </div>
      
      <!-- Description Skeleton -->
      <div class="space-y-2">
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-3/4" />
      </div>
      
      <!-- Button Skeleton -->
      <Skeleton class="h-12 w-full rounded-lg" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton';
</script>
