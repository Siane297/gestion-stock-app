<template>
  <div class="min-h-screen rounded-lg bg-white">
    <!-- Container responsive -->
    <div class="flex flex-col lg:flex-row lg:h-screen">
      <!-- Navigation des paramètres - Mobile: Haut, Desktop: Gauche -->
      <div class="w-full lg:w-64 border-r border-gris/40  flex-shrink-0">
        <!-- Header -->
        <div class="p-4 lg:p-6 border-b border-gray-200">
          <h2 class="text-lg lg:text-xl font-semibold text-gray-900">Paramètres</h2>
          <p class="text-xs lg:text-sm text-gray-500 mt-1">Configuration du système</p>
        </div>
        
        <!-- Navigation -->
        <nav class="p-3 lg:mt-6">
          <!-- Mobile: Navigation horizontale scrollable -->
          <div class="lg:hidden">
            <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                v-for="navItem in navigationItems" 
                :key="navItem.key"
                @click="activeTab = navItem.key"
                class="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 group border-2 text-sm font-medium whitespace-nowrap"
                :class="activeTab === navItem.key 
                  ? 'bg-primary text-white border-primary/20 shadow-3d-sidebar-active' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-transparent hover:border-gray-200'"
              >
                <Icon 
                  :icon="navItem.icon" 
                  class="w-4 h-4 transition-transform group-hover:scale-110" 
                />
                <span>{{ navItem.label }}</span>
              </button>
            </div>
          </div>

          <!-- Desktop: Navigation verticale -->
          <div class="hidden lg:block">
            <ul class="space-y-2">
              <li v-for="navItem in navigationItems" :key="navItem.key">
                <button
                  @click="activeTab = navItem.key"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group border-2 text-sm font-medium"
                  :class="activeTab === navItem.key 
                    ? 'bg-primary text-white border-primary/20 shadow-3d-sidebar-active' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-transparent hover:border-gray-200'"
                >
                  <Icon 
                    :icon="navItem.icon" 
                    class="w-5 h-5 transition-transform group-hover:scale-110" 
                  />
                  <span>{{ navItem.label }}</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <!-- Contenu principal -->
      <div class="flex-1 overflow-hidden">
        <div class="h-full overflow-y-auto">
          <div class="p-4 lg:px-4">
            <!-- Contenu dynamique selon l'onglet actif -->
            <ParametreAdministrateur v-if="activeTab === 'administrateur'" />
            <ParametreOrganisation v-else-if="activeTab === 'organisation'" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';

import ParametreAdministrateur from '~/components/parametre/content/ParametreProfil.vue';
import ParametreOrganisation from '~/components/parametre/content/ParametreOrganisation.vue';

// Onglet actif
const activeTab = ref<'administrateur' | 'organisation' | 'badge'>('administrateur');

// Configuration de la navigation
const navigationItems = [
  {
    key: 'administrateur',
    label: 'Administrateur',
    icon: 'lucide:users'
  },
  {
    key: 'organisation',
    label: 'Organisation',
    icon: 'lucide:building'
  },
] as const;

// Middleware d'authentification
definePageMeta({
  middleware: ['auth', 'permissions'],
});
</script>

<style scoped>
/* Styles personnalisés pour le sidebar des paramètres */
/* Effet 3D pour le lien actif */
.shadow-3d-sidebar-active {
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 2px 4px -1px rgba(0, 0, 0, 0.1),
    inset 0 -2px 4px rgba(0, 0, 0, 0.15),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.shadow-3d-sidebar-active:hover {
  box-shadow: 
    0 6px 8px -1px rgba(0, 0, 0, 0.25),
    0 3px 5px -1px rgba(0, 0, 0, 0.12),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

/* Masquer la scrollbar horizontale sur mobile */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>
