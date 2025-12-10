<template>
  <div class="mb-6 bg-bleu shadow-sm border-2 border-[#a7d2e1] px-4 py-6 sm:px-6 sm:py-8 rounded-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
    <div class="flex items-center gap-3 sm:gap-4">
      <!-- Photo de profil skeleton -->
      <Skeleton class="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />

      <!-- Salutation et message skeleton -->
      <div class="min-w-0 space-y-2">
        <Skeleton class="h-6 w-40 sm:w-48" />
        <Skeleton class="h-4 w-32 sm:w-40" />
      </div>
    </div>
    
    <!-- Boutons d'action skeleton -->
    <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
      <Skeleton class="h-10 w-full sm:w-40 rounded-lg" />
      <Skeleton class="h-10 w-full sm:w-40 rounded-lg" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton';
</script>
