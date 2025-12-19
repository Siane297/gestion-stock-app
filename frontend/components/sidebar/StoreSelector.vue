<template>
  <div class="px-4 pt-3">
    <div class="relative" ref="selectorRef">
      <button 
        @click="isOpen = !isOpen"
        class="w-full flex items-center justify-between bg-white/10 hover:bg-white/15 transition-colors text-white rounded-lg p-3 group border border-white/5"
      >
        <div class="flex items-center gap-3 overflow-visible">
          <div class="w-8 h-8 rounded-md bg-white flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
            <Icon icon="tabler:building-store" class="text-noir text-lg" />
          </div>
          <div class="flex flex-col items-start overflow-hidden">
             <span class="text-xs text-white/50 font-medium uppercase tracking-wider">Boutique active</span>
             <span class="text-sm font-bold truncate w-full text-left" :title="currentMagasin?.nom || 'Chargement...'">
                {{ currentMagasin?.nom || 'Chargement...' }}
             </span>
          </div>
        </div>
        <Icon 
            icon="tabler:chevron-down" 
            class="text-white/50 transition-transform duration-300"
            :class="{ 'rotate-180': isOpen }" 
        />
      </button>

      <!-- Dropdown -->
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div v-if="isOpen" class="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
            <div class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Changer de boutique
            </div>
            
            <div class="max-h-60 overflow-y-auto">
                <button
                    v-for="magasin in magasins"
                    :key="magasin.id"
                    @click="selectMagasin(magasin.id)"
                    class="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors relative"
                    :class="{ 'bg-blue-50 text-blue-700': currentMagasinId === magasin.id }"
                >
                    <Icon 
                        :icon="currentMagasinId === magasin.id ? 'tabler:circle-check-filled' : 'tabler:building-store'" 
                        :class="currentMagasinId === magasin.id ? 'text-blue-600' : 'text-gray-400'"
                    />
                    <span class="font-medium text-sm">{{ magasin.nom }}</span>
                </button>
            </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { Icon } from '@iconify/vue';
import { useMagasinStore } from '~/stores/magasin';

const store = useMagasinStore();
const { magasins, currentMagasin, currentMagasinId } = storeToRefs(store);

const isOpen = ref(false);
const selectorRef = ref<HTMLElement | null>(null);

const selectMagasin = (id: string) => {
    store.setMagasin(id);
    isOpen.value = false;
    // Rafraîchir l'application pour appliquer le contexte partout
    window.location.reload();
};

// Fermer le dropdown si on clique ailleurs
const handleClickOutside = (event: MouseEvent) => {
    if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
        isOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    // Initialiser le store si ce n'est pas déjà fait
    if (magasins.value.length === 0) {
        store.initialize();
    }
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>
