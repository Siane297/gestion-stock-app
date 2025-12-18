<template>
  <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
    <h3 class="font-semibold text-lg text-noir mb-4 flex items-center gap-2">
      Meilleurs Produits
    </h3>

    <div class="flex-1 overflow-y-auto pr-1 custom-scrollbar">
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-10 bg-gray-100 rounded animate-pulse"></div>
      </div>
      <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center h-40 text-gray-400">
        <Icon icon="tabler:package-off" class="text-3xl mb-2" />
        <p class="text-sm">Aucune vente récente</p>
      </div>
      <div v-else class="">
        <div v-for="(prod, index) in products" :key="index" class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
          <div class="flex items-center gap-3">
            <!-- Image / Icon / Rank -->
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 relative shrink-0">
                <img v-if="prod.image_url" :src="prod.image_url" :alt="prod.name" class="w-full h-full object-cover">
                <span v-else class="text-lg">📦</span>
                
                <!-- Petit badge de rang -->
                <!-- <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                     :class="getRequestRankClass(index)">
                    {{ index + 1 }}
                </div> -->
            </div>

            <div class="flex flex-col">
                <span class="font-medium text-sm text-gray-800 line-clamp-1" :title="prod.name">{{ prod.name }}</span>
                <span class="text-xs text-gray-500">{{ prod.quantity }} ventes effectuées</span>
            </div>
          </div>
          <span class="font-bold text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
            {{ formatCurrency(prod.total) }}
          </span>
        </div>
      </div>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-100 text-center">
      <NuxtLink to="/vente" class="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1">
        Voir toutes les ventes
        <Icon icon="tabler:arrow-right" class="text-xs" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'KMF', maximumFractionDigits: 0 }).format(value);
};

const getRequestRankClass = (index: number) => {
  if (index === 0) return 'bg-yellow-100 text-yellow-700';
  if (index === 1) return 'bg-gray-100 text-gray-700';
  if (index === 2) return 'bg-orange-100 text-orange-800';
  return 'bg-blue-50 text-blue-600';
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d4d4d4;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a3a3a3;
}
</style>
