<template>
  <div class="relative z-10">
    <!-- Search Bar Trigger/Input -->
    <div 
      class="relative flex items-center bg-white rounded-lg px-4 py-4 shadow-sm border-2 border-gris/40 transition-all duration-300"
      :class="{ 'ring-2 ring-primary/20 border-primary': isFocused }"
    >
      <Icon icon="tabler:search" class="text-gray-500 text-lg mr-3" />
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Rechercher un produit..." 
        class="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
        @focus="handleFocus"
        @input="handleInput"
      />
      
      <!-- Clear Button -->
      <div v-if="searchQuery" class="ml-2">
        <AppButton 
          @click="clearSearch"
          variant="secondary"
          size="sm"
          :rounded="true"
          class="w-6 h-6 !p-0 flex items-center justify-center bg-gray-100 border-none shadow-none"
        >
          <Icon icon="tabler:x" class="text-gray-500 text-xs" />
        </AppButton>
      </div>

      <!-- Loading Indicator -->
      <Icon 
        v-if="loading" 
        icon="svg-spinners:ring-resize" 
        class="text-primary text-lg ml-2" 
      />
    </div>

    <!-- Search Results / Overlay -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div 
          v-if="isFocused || (searchQuery && isActive)" 
          class="fixed inset-0 z-[60] bg-white  flex flex-col"
        >
          <!-- Results Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-100 bg-white shadow-sm gap-3">
            <div class="relative flex-1">
              <Icon icon="tabler:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
              <input 
                ref="overlayInput"
                v-model="searchQuery"
                type="text" 
                placeholder="Rechercher..." 
                class="w-full bg-gray-50 border-none rounded-lg pl-10 pr-4 py-2 text-base outline-none focus:ring-2 focus:ring-primary/20"
                @input="handleInput"
              />
            </div>
            <AppButton 
              @click="closeSearch" 
              variant="outline"
              label=""
              icon="pi pi-times"
              size="sm"
              class=" shadow-none bg-transparent hover:bg-gray-50 text-gray-500"
            />
          </div>

          <!-- Results List -->
          <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <!-- Loading -->
            <div v-if="loading && !results.length" class="flex flex-col items-center justify-center py-20 text-gray-400">
               <Icon icon="svg-spinners:3-dots-fade" class="text-4xl mb-4" />
               <p>Recherche en cours...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="searchQuery && !loading && results.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
               <Icon icon="tabler:box-off" class="text-5xl mb-4 opacity-50" />
               <p class="text-center px-8">Aucun produit trouvé pour "{{ searchQuery }}"</p>
            </div>

            <!-- Results -->
            <div v-else-if="results.length > 0" class="space-y-3">
              <p class="text-xs text-gray-500 uppercase tracking-widest font-medium mb-3 px-1">Produits trouvés ({{ results.length }})</p>
              <div 
                v-for="product in results" 
                :key="product.id"
                class="flex items-center gap-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <!-- Image -->
                <div class="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  <img v-if="product.image_url" :src="product.image_url" class="w-full h-full object-cover" />
                  <Icon v-else icon="tabler:package" class="text-gray-300 text-2xl" />
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-gray-800 text-base mb-1 truncate">{{ product.nom }}</h4>
                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <span class="bg-gray-100 px-2 py-0.5 rounded text-gray-600">Stock: {{ calculateStock(product) }}</span>
                    <span v-if="product.categorie" class="truncate opacity-75">• {{ product.categorie.nom }}</span>
                  </div>
                </div>

                <!-- Price -->
                <div class="font-bold text-primary text-sm whitespace-nowrap">
                  {{ formatPrice(product.prix_vente) }}
                </div>
              </div>
            </div>
            
            <!-- Recent Searches when empty -->
            <div v-if="!searchQuery && recentSearches.length > 0" class="py-6">
               <div class="flex items-center justify-between mb-4 px-2">
                 <p class="text-xs text-gray-400 uppercase tracking-widest font-medium">Recherches récentes</p>
                 <AppButton 
                    @click="clearRecentSearches" 
                    label="Tout effacer"
                    variant="danger"
                    size="sm"
                    class="!py-1 !px-2 text-xs border-none shadow-none bg-transparent hover:bg-red-50 text-red-400 font-medium"
                 />
               </div>
               
               <div class="space-y-1">
                  <div 
                    v-for="(term, index) in recentSearches" 
                    :key="index"
                    class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer group"
                    @click="applySearch(term)"
                  >
                    <div class="flex items-center gap-3 text-gray-600">
                      <div class="w-8 h-8 rounded-lg bg-bleu/50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <Icon icon="tabler:history" />
                      </div>
                      <span class="text-sm font-medium">{{ term }}</span>
                    </div>
                    <AppButton 
                      @click.stop="removeRecentSearch(index)"
                      variant="secondary"
                      size="sm"
                      :rounded="true"
                      class="w-7 h-7 !p-0 flex items-center justify-center border-none shadow-none bg-transparent hover:bg-red-50 text-gray-300 hover:text-red-500"
                    >
                      <Icon icon="tabler:x" class="text-xs" />
                    </AppButton>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { useProduitApi, type Produit } from '~/composables/api/useProduitApi';
import { useCurrency } from '~/composables/useCurrency';
import AppButton from '~/components/button/AppButton.vue';

const router = useRouter();
const { getProduits } = useProduitApi();
const { formatPrice } = useCurrency();

const searchQuery = ref('');
const isFocused = ref(false);
const isActive = ref(false);
const loading = ref(false);
const results = ref<Produit[]>([]);
const overlayInput = ref<HTMLInputElement | null>(null);
const recentSearches = ref<string[]>([]);
let searchTimeout: NodeJS.Timeout | null = null;
const STORAGE_KEY = 'recent_searches_mobile';

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      recentSearches.value = JSON.parse(stored);
    } catch {
      recentSearches.value = [];
    }
  }
});

const saveRecentSearch = (term: string) => {
  if (!term.trim()) return;
  const current = recentSearches.value.filter(s => s !== term);
  current.unshift(term);
  if (current.length > 5) current.pop();
  recentSearches.value = current;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches.value));
};

const removeRecentSearch = (index: number) => {
  recentSearches.value.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches.value));
};

const clearRecentSearches = () => {
  recentSearches.value = [];
  localStorage.removeItem(STORAGE_KEY);
};

const applySearch = (term: string) => {
  searchQuery.value = term;
  handleInput(); // Trigger search
};

const handleFocus = async () => {
  isFocused.value = true;
  isActive.value = true;
  // Focus the overlay input when it appears
  await nextTick();
  overlayInput.value?.focus();
  
  if (searchQuery.value && results.value.length === 0) {
    performSearch();
  }
};

const closeSearch = () => {
  isFocused.value = false;
  isActive.value = false;
};

const clearSearch = () => {
  searchQuery.value = '';
  results.value = [];
  overlayInput.value?.focus();
};

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    results.value = [];
    return;
  }

  loading.value = true;
  try {
    const products = await getProduits({ 
      search: searchQuery.value,
      est_actif: true 
    });
    results.value = products;
  } catch (error) {
    console.error('Search error:', error);
  } finally {
    loading.value = false;
  }
};

const handleInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performSearch();
  }, 300);
};

const calculateStock = (product: Produit) => {
  if (!product.stocks) return 0;
  return product.stocks.reduce((acc, stock) => acc + stock.quantite, 0);
};

const selectProduct = (product: Produit) => {
  // Save to history
  if (searchQuery.value) {
    saveRecentSearch(searchQuery.value);
  }
  
  closeSearch();
  router.push(`/produit`); 
};

</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 99px;
}
</style>
