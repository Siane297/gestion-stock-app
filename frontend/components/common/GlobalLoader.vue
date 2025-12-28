<template>
  <div v-if="loading" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-300">
    <div class="relative flex flex-col items-center">
      <!-- Logo avec animation de pulsation -->
      <img src="~/assets/images/logo-2.png" alt="Chargement..." class="w-32 h-auto mb-4 animate-pulse" />
      
      <!-- Spinner PrimeVue ou CSS simple -->
      <i class="pi pi-spin pi-spinner text-primary text-4xl"></i>
      
      <p class="mt-4 text-gray-500 font-medium">Chargement...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean;
}>();
</script>

<style scoped>
.bg-white\/90 {
    background-color: rgba(255, 255, 255, 0.95);
}
</style>
