<template>

  <div class="h-screen overflow-hidden bg-slot">
    <GlobalLoader :loading="pageLoading" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="isSidebarOpen" @close="closeSidebar" />

    <!-- Main Content Area -->
    <div class="ml-0 lg:ml-72 h-screen flex flex-col transition-all duration-300">
      <!-- Header -->
      <AppHeader @toggle-sidebar="toggleSidebar" />

      <!-- Page Content (scrollable) -->
      <main class="flex-1 overflow-y-auto mt-[90px]  p-4 lg:px-8 lg:py-6">
        <AppBreadcrumb v-if="showBreadcrumb" />
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">

import AppSidebar from '~/components/sidebar/AppSidebar.vue';
import AppHeader from '~/components/header/AppHeader.vue';
import AppBreadcrumb from '~/components/common/AppBreadcrumb.vue'; // Import Breadcrumb
import GlobalLoader from '~/components/common/GlobalLoader.vue';

const pageLoading = ref(false);
const nuxtApp = useNuxtApp();

// Gestion du chargement page
nuxtApp.hook('page:start', () => {
  pageLoading.value = true;
});

nuxtApp.hook('page:finish', () => {
  // Petit délai pour éviter le flash trop rapide et assurer une transition fluide
  setTimeout(() => {
    pageLoading.value = false;
  }, 500);
});

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
const showBreadcrumb = computed(() => {
  const isAccueil = route.path === '/accueil' || route.path === '/';
  const explicitlyHidden = route.meta.hideBreadcrumb === true;
  return !isAccueil && !explicitlyHidden;
});
</script>
