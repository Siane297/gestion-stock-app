<template>
  <div class="relative py-10 rounded-xl overflow-hidden mb-6 bg-gray-200">
    <!-- Overlay skeleton -->
    <div class="absolute inset-0 bg-gradient-to-r from-gray-300/50 to-gray-200/30"></div>

    <!-- Contenu de la bannière skeleton -->
    <div class="relative h-full flex flex-col justify-center px-8 space-y-3">
      <!-- Titre skeleton -->
      <Skeleton class="h-8 w-64 md:w-80" />
      
      <!-- Description skeleton -->
      <Skeleton class="h-5 w-48 md:w-60" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton';
</script>
