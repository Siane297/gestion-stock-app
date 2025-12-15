<template>
  <div class="flex bg-white p-4 rounded-lg border-2 border-gris/40 gap-4"> 
  <!-- Note: -m-6 to counteract default padding of main layout if any, aiming for full screen feel -->
    
    <!-- Zone Marge Gauche (Catalogue) -->
    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- Grid Content -->
      <div class="flex-1 overflow-y-auto ">
        
        <!-- Top Bar (Moved) -->
        <div class="bg-white border-2 border-gris/40 p-4  z-10 flex gap-4 items-center justify-between rounded-xl mb-6 sticky top-0">
            <!-- Search -->
            <div class="relative flex-1 max-w-xl">
                <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input 
                    v-model="store.searchQuery"
                    type="text" 
                    placeholder="Rechercher un produit (Nom, code barre)..." 
                    class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    autofocus
                />
            </div>

            <!-- Filter Categories -->
            <div class="flex gap-2 overflow-x-auto max-w-md pb-1 scrollbar-hide">
                <button 
                    @click="store.selectedCategory = null"
                    :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                        !store.selectedCategory ? 'bg-[#064654] text-white shadow-md' : 'bg-white text-gray-600 border hover:bg-gray-50'
                    ]"
                >
                    Tout
                </button>
                <button 
                    v-for="cat in uniqueCategories" 
                    :key="cat"
                    @click="store.selectedCategory = cat"
                    :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                        store.selectedCategory === cat ? 'bg-[#064654] text-white shadow-md' : 'bg-white text-gray-600 border hover:bg-gray-50'
                    ]"
                >
                    {{ cat }}
                </button>
            </div>
        </div>

        <div v-if="store.loading" class="flex justify-center items-center h-full">
            <ProgressSpinner strokeWidth="4" />
        </div>

        <div v-else-if="store.filteredItems.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-400">
             <i class="pi pi-search text-4xl mb-2"></i>
             <p>Aucun produit trouvé</p>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
             <ProductCard 
                v-for="item in store.filteredItems" 
                :key="item.uniqueId" 
                :item="item"
                @add="handleAddToCart"
             />
        </div>
      </div>
    </div>

    <!-- Zone Droite (Panier) -->
    <div class="w-[400px]">
      <CartPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { usePos } from '~/composables/api/usePos';
import ProductCard from '~/components/pos/ProductCard.vue';
import CartPanel from '~/components/pos/CartPanel.vue';
import ProgressSpinner from 'primevue/progressspinner';

definePageMeta({
  layout: 'default', // Or specific POS layout if needed 
  // Assuming Sidebar is present but we want full height look
});

const store = usePos();

onMounted(() => {
    store.loadCatalog();
});

const uniqueCategories = computed(() => {
    const cats = new Set<string>();
    store.posItems.forEach((i: any) => {
        if (i.categoryName) cats.add(i.categoryName);
    });
    return Array.from(cats);
});

const handleAddToCart = (item: any) => {
    // Add sound effect?
    store.addToCart(item);
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>