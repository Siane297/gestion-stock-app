<template>
  <div class="w-full h-full flex flex-col space-y-4">
    <!-- Chart Title Skeleton -->
    <div v-if="showTitle" class="space-y-2">
      <Skeleton class="h-6 w-48" />
      <Skeleton class="h-4 w-32" />
    </div>
    
    <!-- Chart Area Skeleton -->
    <div class="relative bg-gray-50 rounded-lg overflow-hidden" :class="chartClasses">
      <!-- Grid pattern simulation -->
      <div class="absolute inset-0 opacity-20">
        <div v-for="i in gridLines" :key="`h-${i}`" 
             class="absolute left-0 right-0 border-t border-gray-300" 
             :style="{ top: `${(i * 100) / gridLines}%` }" />
        <div v-for="i in gridLines" :key="`v-${i}`" 
             class="absolute top-0 bottom-0 border-l border-gray-300" 
             :style="{ left: `${(i * 100) / gridLines}%` }" />
      </div>
      
      <!-- Chart Content Skeleton -->
      <div class="relative w-full h-full flex items-end justify-around p-4">
        <!-- Bars/Lines simulation -->
        <div v-if="chartType === 'bar'" 
             v-for="bar in 7" 
             :key="bar" 
             class="flex flex-col items-center space-y-1">
          <Skeleton 
            :class="`w-8 rounded-t-sm animate-pulse`" 
            :style="{ height: `${Math.random() * 60 + 20}%` }" 
          />
          <Skeleton class="h-3 w-6" />
        </div>
        
        <div v-else-if="chartType === 'line'" class="w-full h-full relative">
          <svg class="w-full h-full">
            <path 
              :d="generateRandomPath" 
              stroke="currentColor" 
              stroke-width="3" 
              fill="none" 
              class="text-gray-300 animate-pulse"
            />
          </svg>
          <!-- Data points -->
          <div v-for="point in 6" :key="point" 
               class="absolute w-2 h-2 bg-gray-300 rounded-full animate-pulse"
               :style="{ 
                 left: `${point * 16}%`, 
                 bottom: `${Math.random() * 60 + 20}%` 
               }" />
        </div>
        
        <div v-else-if="chartType === 'radial'" class="flex items-center justify-center w-full h-full">
          <div class="relative">
            <Skeleton class="w-32 h-32 rounded-full" />
            <div class="absolute inset-0 flex items-center justify-center">
              <Skeleton class="h-6 w-12" />
            </div>
          </div>
        </div>
        
        <!-- Default rectangular chart -->
        <Skeleton v-else class="w-full h-3/4 rounded-lg" />
      </div>
    </div>
    
    <!-- Legend Skeleton -->
    <div v-if="showLegend" class="flex justify-center space-x-6">
      <div v-for="item in legendItems" :key="item" class="flex items-center space-x-2">
        <Skeleton class="w-4 h-4 rounded-sm" />
        <Skeleton class="h-4 w-16" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton';

interface Props {
  chartType?: 'bar' | 'line' | 'radial' | 'area' | 'default';
  height?: string;
  showTitle?: boolean;
  showLegend?: boolean;
  legendItems?: number;
}

const props = withDefaults(defineProps<Props>(), {
  chartType: 'default',
  height: 'h-64',
  showTitle: true,
  showLegend: true,
  legendItems: 3,
});

const gridLines = 5;

const chartClasses = computed(() => {
  return `${props.height} min-h-[200px]`;
});

const generateRandomPath = computed(() => {
  const points = [];
  const width = 100;
  const height = 60;
  
  for (let i = 0; i <= 6; i++) {
    const x = (i / 6) * width;
    const y = height - (Math.random() * height * 0.8);
    points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  
  return points.join(' ');
});
</script>
