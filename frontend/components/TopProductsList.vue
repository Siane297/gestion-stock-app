<template>
  <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
    <div class="flex items-center justify-between mb-6">
      <h3 class="font-semibold text-lg text-noir flex items-center gap-2">
        Meilleurs Produits
      </h3>
      <span class="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded">Top 5</span>
    </div>

    <div class="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4">
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-center gap-3 animate-pulse">
          <div class="w-12 h-12 bg-gray-100 rounded-xl"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-100 rounded w-3/4"></div>
            <div class="h-3 bg-gray-50 rounded w-1/2"></div>
          </div>
        </div>
      </div>
      
      <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center h-full py-10 text-gray-400 opacity-60">
        <Icon icon="tabler:package-off" class="text-5xl mb-3" />
        <p class="text-sm font-medium">Aucune vente enregistrée</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="(prod, index) in products" :key="index" 
          class="group flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100">
          
          <!-- Rang & Image Wrapper -->
          <div class="relative shrink-0">
            <div class="w-14 h-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden border-2 border-gray-50 shadow-sm group-hover:scale-105 transition-transform duration-300">
                <img v-if="prod.image_url" :src="prod.image_url" :alt="prod.name" class="w-full h-full object-cover">
                <span v-else class="text-2xl">📦</span>
            </div>
            <!-- Badge de Rang -->
            <div class="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shadow-md z-10"
                 :class="getRankClass(index)">
                {{ index + 1 }}
            </div>
          </div>

          <!-- Infos Produit -->
          <div class="flex-1 min-w-0 flex flex-col justify-center">
            <h4 class="font-bold text-sm text-gray-800 truncate mb-0.5 group-hover:text-primary transition-colors" :title="prod.name">
              {{ prod.name }}
            </h4>
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                {{ prod.quantity }} ventes
              </span>
              <div class="w-1 h-1 rounded-full bg-gray-300"></div>
              <span class="text-[11px] font-bold text-primary">
                {{ formatCurrency(prod.total) }}
              </span>
            </div>
          </div>

          <!-- Action Rapide (Optionnel) -->
          <!-- <button class="p-2 opacity-0 group-hover:opacity-100 bg-white shadow-sm border border-gray-100 rounded-xl transition-all duration-300">
            <Icon icon="tabler:chevron-right" class="text-gray-400" />
          </button> -->
        </div>
      </div>
    </div>

    <!-- Pied de Carte -->
    <div class="mt-6 pt-5 border-t border-gray-50 flex items-center justify-center">
      <NuxtLink to="/vente" class="group/btn relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-primary hover:text-white transition-all duration-300 overflow-hidden shadow-sm">
        <span class="text-sm font-bold relative z-10 transition-colors">Voir tous les rapports</span>
        <Icon icon="tabler:arrow-right" class="text-base relative z-10 transition-transform group-hover/btn:translate-x-1" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useCurrency } from '~/composables/useCurrency';

interface ProductStat {
  name: string;
  quantity: number;
  total: number;
  image_url?: string;
}

defineProps<{
  loading: boolean;
  products: ProductStat[];
}>();

const { formatPrice: globalFormatPrice } = useCurrency();

const formatCurrency = (value: number) => {
  return globalFormatPrice(value);
};

const getRankClass = (index: number) => {
  if (index === 0) return 'bg-amber-400'; // Or
  if (index === 1) return 'bg-slate-400'; // Argent
  if (index === 2) return 'bg-orange-400'; // Bronze
  return 'bg-blue-400'; // Autres
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
