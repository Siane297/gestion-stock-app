<template>
  <div 
    class="bg-white rounded-lg shadow-sm border border-gris/90 p-3 flex flex-col gap-1.5 h-full relative overflow-hidden group transition-all"
    :class="[
        isOutOfStock ? 'opacity-60 cursor-not-allowed border-red-200 bg-red-50/10' : 'cursor-pointer hover:shadow-md hover:border-primary/50'
    ]"
    @click="handleClick"
  >
    <!-- Badge Pack -->
    <div v-if="item.packLabel" class="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 shadow-sm">
      {{ item.packLabel }}
    </div>

    <!-- Image / Placeholder -->
    <div class="h-20 w-full bg-bleu/50 rounded-lg flex items-center justify-center overflow-hidden mb-0.5 relative">
      <img v-if="item.image" :src="item.image" alt="Product" class="h-full w-full object-cover" :class="{ 'grayscale': isOutOfStock }" />
      <span v-else class="text-xl opacity-50">📦</span>
      
      <!-- Overlay Add -->
      <div v-if="!isOutOfStock" class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div class="bg-white rounded-full p-2 text-primary shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
          <i class="pi pi-plus font-bold"></i>
        </div>
      </div>
      <!-- Overlay Out of Stock -->
      <div v-else class="absolute inset-0 bg-red-100/20 flex items-center justify-center">
           <span class="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm">Épuisé</span>
      </div>
    </div>

    <!-- Info -->
    <div class="flex-1 flex flex-col justify-between">
      <div>
        <h3 class="font-semibold text-gray-800 text-sm leading-tight line-clamp-2" :title="item.name">
            {{ item.name }}
        </h3>
        <p v-if="item.isPack" class="text-xs text-orange-600 font-medium mt-0.5">{{ item.packLabel }} (x{{ item.quantityInBase }})</p>
        <p v-else-if="item.packLabel" class="text-xs text-orange-600 font-medium mt-0.5">{{ item.packLabel }}</p>
      </div>

      <div class="mt-1.5 flex items-end justify-between">
        <span class="font-bold md:text-[12px] text-[14px] text-[#064654]" :class="{ 'text-gray-500': isOutOfStock }">{{ formatPrice(item.price) }}</span>
        <!-- Stock indicator (opt) -->
        <span 
            class="text-[10px] px-1.5 py-0.5 rounded-full font-bold border" 
            :class="[
                isOutOfStock 
                    ? 'bg-red-100 border-red-500 text-red-700' 
                    : 'bg-green-100 border-green-500 text-green-700'
            ]"
            title="Stock estimé"
        >
          {{ item.stockAvailable }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PosProductItem } from '~/composables/api/usePos';
import { useCurrency } from '~/composables/useCurrency';

const props = defineProps<{
  item: PosProductItem
}>();

const emit = defineEmits(['add']);

const { formatPrice } = useCurrency();

const isOutOfStock = computed(() => {
    return (props.item.stockAvailable || 0) <= 0;
});

const handleClick = () => {
    if (!isOutOfStock.value) {
        emit('add', props.item);
    }
};
</script>
