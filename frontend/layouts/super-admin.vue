<template>
  <div class="h-screen overflow-hidden bg-slot">
    <!-- Main Content Area -->
    <div class="h-screen flex flex-col transition-all duration-300">
      <!-- Header -->
      <AppHeader :full-width="true" />

      <!-- Page Content (scrollable) -->
      <main class="flex-1 overflow-y-auto mt-[90px] p-4 lg:px-8 lg:py-6 relative">
        <GlobalLoader :loading="isLoading" />
        <div class="container mx-auto max-w-7xl">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/header/AppHeader.vue';
import GlobalLoader from '~/components/common/GlobalLoader.vue';
import { useGlobalLoading } from '~/composables/useGlobalLoading';

const { isLoading, startLoading, stopLoading } = useGlobalLoading();
const nuxtApp = useNuxtApp();

// Gestion du chargement page
nuxtApp.hook('page:start', () => {
  startLoading();
});

nuxtApp.hook('page:finish', () => {
  setTimeout(() => {
    stopLoading();
  }, 500);
});
</script>
