<template>
  <div class="w-full bg-bleu border-2 border-[#a7d2e1] p-6 rounded-lg mx-auto mb-8 shadow-3d-header relative overflow-hidden">
    <div class="relative z-10">
      <h1 class="text-2xl md:text-4xl font-bold text-noir mb-2" :class="titleClass">
        {{ title }}
      </h1>
      <p class="text-noir" :class="descriptionClass">
        {{ description }}
      </p>
    </div>
    
    <!-- Icone décorative
    <div v-if="icon" class="absolute right-2 -bottom-1 transform rotate-5 pointer-events-none">
      <Icon :icon="icon" class="text-[100px] text-noir/50" />
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface Props {
  title: string;
  description: string;
  titleClass?: string;
  descriptionClass?: string;
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  titleClass: '',
  descriptionClass: '',
  icon: '',
});
</script>

<style scoped>
/* Effet 3D pour le header */
.shadow-3d-header {
  box-shadow: 
    /* 0 6px 12px -2px rgba(0, 0, 0, 0.1), */
    0 4px 8px -2px rgba(0, 0, 0, 0.06),
    inset 0 -3px 6px rgba(140, 140, 140, 0.1),
    inset 0 3px 6px rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

/* .shadow-3d-header:hover {
  box-shadow: 
    0 8px 16px -2px rgba(0, 0, 0, 0.15),
    0 6px 10px -2px rgba(0, 0, 0, 0.08),
    inset 0 -3px 6px rgba(0, 0, 0, 0.15),
    inset 0 3px 6px rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
} */
</style>
