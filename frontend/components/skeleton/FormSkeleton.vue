<template>
  <div class="space-y-6">
    <!-- Header Skeleton -->
    <div v-if="showHeader" class="space-y-2">
      <Skeleton class="h-8 w-64" />
      <Skeleton class="h-4 w-48" />
    </div>
    
    <!-- Form Fields Skeleton -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="field in fields" 
        :key="field"
        :class="field % 3 === 0 ? 'md:col-span-2' : ''"
        class="space-y-2"
      >
        <!-- Label Skeleton -->
        <Skeleton class="h-4 w-24" />
        
        <!-- Input Skeleton -->
        <Skeleton 
          :class="getFieldSkeletonClass(field)"
        />
        
        <!-- Helper text skeleton (randomly shown) -->
        <Skeleton 
          v-if="Math.random() > 0.7"
          class="h-3 w-32" 
        />
      </div>
    </div>
    
    <!-- Action Buttons Skeleton -->
    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
      <Skeleton v-if="showCancel" class="h-10 w-20 rounded-md" />
      <Skeleton class="h-10 w-28 rounded-md" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton';

interface Props {
  fields?: number;
  showHeader?: boolean;
  showCancel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  fields: 6,
  showHeader: true,
  showCancel: true,
});

const getFieldSkeletonClass = (fieldIndex: number) => {
  // Simuler différents types de champs
  const types = ['h-12', 'h-20', 'h-12', 'h-12', 'h-16'];
  const type = types[fieldIndex % types.length];
  return `${type} w-full rounded-md`;
};
</script>
