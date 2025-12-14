<template>
  <div class="bg-[#064654] shadow-sm rounded-xl py-5 px-8">
    <div class="container mx-auto">
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
        {{ title }}
      </h1>
      <p v-if="description" class="text-white/50">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  description?: string;
}

defineProps<Props>();
</script>
