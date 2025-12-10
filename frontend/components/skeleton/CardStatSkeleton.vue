<template>
  <div class="bg-white rounded-xl w-full px-5 py-4 border-2 border-gris/40 transition-all duration-300">
    <div class="flex items-start justify-between">
      <!-- Left Section: Icon + Stats Skeleton -->
      <div class="flex items-center justify-center gap-5">
        <div class="flex items-center">
          <!-- Icon Skeleton -->
          <Skeleton class="w-12 h-12 rounded-lg" />
        </div>

        <div class="space-y-2">
          <!-- Value Skeleton -->
          <Skeleton class="h-8 w-16" />
          
          <!-- Label Skeleton -->
          <Skeleton class="h-3 w-24" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton';
</script>
