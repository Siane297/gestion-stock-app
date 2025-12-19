<template>
  <div class="h-screen overflow-hidden bg-slot">
    <!-- Sidebar -->
    <AppSidebar :is-open="isSidebarOpen" @close="closeSidebar" />

    <!-- Main Content Area -->
    <div class="ml-0 lg:ml-64 h-screen flex flex-col transition-all duration-300">
      <!-- Header -->
      <AppHeader @toggle-sidebar="toggleSidebar" />

      <!-- Page Content (scrollable) -->
      <main class="flex-1 overflow-y-auto mt-[90px]  p-4 lg:px-9 lg:py-6">
        <AppBreadcrumb v-if="!isAccueilPage" />
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SpeedInsights } from "@vercel/speed-insights/nuxt"
import AppSidebar from '~/components/sidebar/AppSidebar.vue';
import AppHeader from '~/components/header/AppHeader.vue';
import AppBreadcrumb from '~/components/common/AppBreadcrumb.vue'; // Import Breadcrumb

// Gérer l'état du sidebar pour mobile
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

// Fermer le sidebar lors du changement de route (mobile)
const route = useRoute();
watch(() => route.path, () => {
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    closeSidebar();
  }
});

// Check if current page is 'accueil' to hide breadcrumb
const isAccueilPage = computed(() => {
  return route.path === '/accueil' || route.path === '/';
});
</script>
