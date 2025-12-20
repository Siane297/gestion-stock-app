<template>
  <div class="px-4 py-3">
    <div class="relative" ref="selectorRef">
      <button 
        @click="toggleDropdown"
        class="w-full flex items-center justify-between bg-white/10 transition-colors text-white rounded-lg p-3 group border border-white/5"
        :class="canSwitch ? 'hover:bg-white/15 cursor-pointer' : 'cursor-default'"
      >
        <div class="flex items-center gap-3 overflow-visible">
          <div class="w-8 h-8 rounded-md bg-white flex items-center justify-center shrink-0 shadow-lg" :class="canSwitch ? 'group-hover:scale-105 transition-transform' : ''">
            <Icon icon="tabler:building-store" class="text-noir text-lg" />
          </div>
          <div class="flex flex-col items-start overflow-hidden w-full">
               <span class="text-xs text-white/50 font-medium uppercase tracking-wider">Boutique active</span>
               
               <!-- Loading / Skeleton state -->
               <div v-if="loading || isSwitching" class="space-y-1 w-full mt-0.5">
                  <div class="h-3.5 bg-white/20 rounded animate-pulse w-3/4"></div>
               </div>
               
               <!-- Info Magasin -->
               <span v-else class="text-sm font-bold truncate w-full text-left" :title="currentMagasin?.nom || (currentMagasinId === null ? 'Toutes les boutiques' : 'Chargement...')">
                  {{ currentMagasin?.nom || (currentMagasinId === null ? 'Toutes les boutiques' : 'Chargement...') }}
               </span>
          </div>
        </div>
        <Icon 
            v-if="canSwitch && !loading && !isSwitching"
            icon="tabler:chevron-down" 
            class="text-white/50 transition-transform duration-300"
            :class="{ 'rotate-180': isOpen }" 
        />
        <Icon 
            v-else-if="loading || isSwitching"
            icon="tabler:loader-2" 
            class="text-white/50 animate-spin"
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
        <div v-if="isOpen" class="absolute px-2  left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
            <div class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Changer de boutique
            </div>
            
            <div class="max-h-60 overflow-y-auto">
                <!-- Option 'Toutes les boutiques' pour l'admin -->
                <button
                    v-if="user?.role === 'ADMIN'"
                    @click="selectMagasin(null)"
                    class="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors relative border-b border-gray-50"
                    :class="{ 'bg-blue-50  text-blue-700 font-bold': currentMagasinId === null }"
                >
                    <Icon 
                        :icon="currentMagasinId === null ? 'tabler:circle-check-filled' : 'tabler:world'" 
                        :class="currentMagasinId === null ? 'text-blue-600' : 'text-gray-400'"
                    />
                    <span class="font-medium tracking-wide text-sm">Toutes les boutiques</span>
                </button>

                <button
                    v-for="magasin in filteredMagasins"
                    :key="magasin.id"
                    @click="selectMagasin(magasin.id)"
                    class="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors relative"
                    :class="{ 'bg-blue-50 text-blue-700': currentMagasinId === magasin.id }"
                >
                    <Icon 
                        :icon="currentMagasinId === magasin.id ? 'tabler:circle-check-filled' : 'tabler:building-store'" 
                        :class="currentMagasinId === magasin.id ? 'text-blue-600' : 'text-gray-400'"
                    />
                    <span class="font-medium tracking-wide text-sm">{{ magasin.nom }}</span>
                </button>
            </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Icon } from '@iconify/vue';
import { useMagasinStore } from '~/stores/magasin';
import { useSecureAuth } from '~/composables/useSecureAuth';

const store = useMagasinStore();
const { magasins, currentMagasin, currentMagasinId, loading } = storeToRefs(store);

const isOpen = ref(false);
const isSwitching = ref(false);
const selectorRef = ref<HTMLElement | null>(null);

const { user, isAuthenticated } = useSecureAuth();

// Vérifier si l'utilisateur peut changer de boutique (Seulement ADMIN)
const canSwitch = computed(() => {
    if (!user.value) return false;
    // Si ADMIN, peut changer
    if (user.value.role === 'ADMIN') return true;
    // Sinon, non (même si pas de boutique assignée, un utilisateur standard ne devrait pas switcher librement sans droit)
    return false;
});

// Liste filtrée (optionnel, mais propre)
const filteredMagasins = computed(() => {
    if (canSwitch.value) return magasins.value;
    // Si pas de droit, on ne montre que le magasin courant (ou assigné)
    if (currentMagasinId.value) {
        return magasins.value.filter(m => m.id === currentMagasinId.value);
    }
    return [];
});

const toggleDropdown = () => {
    if (canSwitch.value) {
        isOpen.value = !isOpen.value;
    }
};

const selectMagasin = (id: string | null) => {
    isSwitching.value = true;
    store.setMagasin(id);
    isOpen.value = false;
    
    // Rafraîchir l'application après un court délai pour montrer le chargement
    setTimeout(() => {
        window.location.reload();
    }, 300);
};

// Fermer le dropdown si on clique ailleurs
const handleClickOutside = (event: MouseEvent) => {
    if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
        isOpen.value = false;
    }
};

// Réagir à l'authentification
watch(isAuthenticated, (newVal) => {
    if (newVal && magasins.value.length === 0) {
        store.initialize();
    }
}, { immediate: true });

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>
