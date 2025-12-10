<template>
  <!-- Skeleton Loading State -->
  <BannerSkeleton v-if="loading" />
  
  <!-- Actual Banner -->
  <div v-else
    class="relative py-10 rounded-xl overflow-hidden mb-6"
    :style="{ backgroundImage: `url(${bannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }"
  >
    <!-- Overlay sombre pour améliorer la lisibilité -->
    <div class="absolute inset-0 bg-gradient-to-r from-black/20"></div>

    <!-- Contenu de la bannière (à gauche) -->
    <div class="relative h-full flex flex-col justify-center px-8">
      <h1 class="text-4xl font-bold text-white mb-2">{{ title }}</h1>
      <p class="text-lg text-white/90">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import BannerSkeleton from '~/components/skeleton/BannerSkeleton.vue';

interface Props {
  title: string;
  description: string;
  bannerImage?: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  bannerImage: '/assets/image/bg-connect.jpg',
  loading: false,
});
</script>
