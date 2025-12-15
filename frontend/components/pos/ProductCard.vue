<template>
  <div 
    class="bg-white rounded-xl shadow-sm border border-gris/90 p-3 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all flex flex-col gap-2 h-full relative overflow-hidden group"
    @click="$emit('add', item)"
  >
    <!-- Badge Pack -->
    <div v-if="item.packLabel" class="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 shadow-sm">
      {{ item.packLabel }}
    </div>

    <!-- Image / Placeholder -->
    <div class="h-24 w-full bg-bleu/50 rounded-lg flex items-center justify-center overflow-hidden mb-1 relative">
      <img v-if="item.image" :src="item.image" alt="Product" class="h-full w-full object-cover" />
      <span v-else class="text-2xl opacity-50">📦</span>
      
      <!-- Overlay Add -->
      <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div class="bg-white rounded-full p-2 text-primary shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
          <i class="pi pi-plus font-bold"></i>
        </div>
      </div>
    </div>

    <!-- Info -->
    <div class="flex-1 flex flex-col justify-between">
      <div>
        <h3 class="font-semibold text-gray-800 text-sm leading-tight line-clamp-2" :title="item.name">
            {{ item.name }}
        </h3>
        <p v-if="item.isPack" class="text-xs text-orange-600 font-medium mt-0.5">{{ item.packLabel }} (x{{ item.quantityInBase }})</p>
        <p v-else class="text-xs text-orange-600 font-medium mt-0.5">Unité</p>
      </div>

      <div class="mt-2 flex items-end justify-between">
        <span class="font-bold text-lg text-[#064654]">{{ formatPrice(item.price) }}</span>
        <!-- Stock indicator (opt) -->
        <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700" title="Stock estimé">
          {{ item.stockAvailable }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PosProductItem } from '~/composables/api/usePos';

const props = defineProps<{
  item: PosProductItem
}>();

const formatPrice = (p: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'KMF', maximumFractionDigits: 0 }).format(p);
};
</script>
