<template>
    <!-- Skeleton Loading State -->
    <CardStatSkeleton v-if="loading" />
    
    <!-- Actual Content -->
    <div v-else class="bg-white rounded-lg w-full px-5 py-4 border-2 border-gris/40 transition-all duration-300">
        <div class="flex items-start justify-between">
            <!-- Left Section: Icon + Stats -->
            <div class="flex items-center justify-center gap-5">
                <div class="flex items-center">
                    <!-- Icon -->
                    <div class="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 shadow-3d-icon"
                        :class="iconBgClass">
                        <Icon :icon="icon" class="text-2xl" :class="iconColorClass" />
                    </div>
                </div>

                <div>
                    <!-- Value -->
                    <div class="mb-1 flex items-baseline gap-2">
                        <h3 class="text-[17px] font-extrabold text-noir">
                            {{ displayNumber }}
                            <span v-if="displayCurrency" :class="currencyColorClass" class="ml-1">{{ displayCurrency }}</span>
                        </h3>
                        
                        <!-- Trend Badge -->
                        <div v-if="trend !== undefined" 
                             class="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold"
                             :class="trendClass">
                            <Icon :icon="trendIcon" />
                            <span>{{ Math.abs(trend) }}%</span>
                        </div>
                    </div>

                    <!-- Label -->
                    <div class="flex items-center gap-1">
                        <p class="text-[11px] uppercase text-gray-500 font-semibold leading-none">{{ label }}</p>
                        <span v-if="trendLabel" class="text-[10px] text-orange-500 font-medium ">({{ trendLabel }})</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import CardStatSkeleton from '~/components/skeleton/CardStatSkeleton.vue';

interface Props {
    icon: string;
    value: string | number;
    label: string;
    variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
    showMenu?: boolean;
    loading?: boolean;
    trend?: number;      // Variation value (ex: 12 for +12%, -5 for -5%)
    trendLabel?: string; // Optional label (ex: "vs hier")
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    showMenu: false,
    loading: false,
});

const trendClass = computed(() => {
    if (!props.trend || props.trend === 0) return 'bg-gray-100 text-gray-500';
    return props.trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';
});

const trendIcon = computed(() => {
    if (!props.trend || props.trend === 0) return 'tabler:minus';
    return props.trend > 0 ? 'tabler:trending-up' : 'tabler:trending-down';
});

// Smart number formatter for display
const displayValue = computed(() => {
    // If value is already a string (e.g., formatted currency), return as-is
    if (typeof props.value === 'string') {
        return props.value;
    }
    
    // If value is a number, use compact formatting
    return formatCompactNumber(props.value as number);
});

const formatCompactNumber = (num: number): string => {
    const absNum = Math.abs(num);
    const isNegative = num < 0;
    const sign = isNegative ? '-' : '';
    
    // Milliards (Billions)
    if (absNum >= 1_000_000_000) {
        return sign + Math.trunc(absNum / 1_000_000_000) + ' Md';
    }
    
    // Millions
    if (absNum >= 1_000_000) {
        return sign + Math.trunc(absNum / 1_000_000) + ' M';
    }
    
    // Milliers (Thousands)
    if (absNum >= 1_000) {
        return sign + Math.trunc(absNum / 1_000) + ' K';
    }
    
    // Less than 1000, show as-is tronqué
    return sign + Math.trunc(absNum).toString();
};

const iconBgClass = computed(() => {
    const bgClasses: Record<string, string> = {
        primary: 'bg-blue-500',
        success: 'bg-green-500',
        danger: 'bg-red-500',
        warning: 'bg-orange-500',
        info: 'bg-cyan-500',
    };
    return bgClasses[props.variant] || 'bg-gray-100';
});

const iconColorClass = computed(() => {
    const colorClasses: Record<string, string> = {
        primary: 'text-white',
        success: 'text-white',
        danger: 'text-white',
        warning: 'text-white',
        info: 'text-white',
    };
    return colorClasses[props.variant] || 'text-gray-600';
});

// Extract number and currency from displayValue
const displayNumber = computed(() => {
    const val = displayValue.value;
    
    // Check for suffix (ex: "0.00 E£")
    const suffixMatch = val.match(/^(.+?)\s*([A-Z$€£¥]{1,5})$/);
    if (suffixMatch && suffixMatch[1]) {
        return suffixMatch[1].trim();
    }
    
    // Check for prefix (ex: "E£ 0.00")
    const prefixMatch = val.match(/^([A-Z$€£¥]{1,5})\s*(.+?)$/);
    if (prefixMatch && prefixMatch[2]) {
        return prefixMatch[2].trim();
    }
    
    return val;
});


const displayCurrency = computed(() => {
    const val = displayValue.value;
    
    // Try suffix match
    const suffixMatch = val.match(/([A-Z$€£¥]{1,5})$/);
    if (suffixMatch && suffixMatch[1]) return suffixMatch[1];
    
    // Try prefix match
    const prefixMatch = val.match(/^([A-Z$€£¥]{1,5})/);
    if (prefixMatch && prefixMatch[1]) return prefixMatch[1];
    
    return null;
});


const currencyColorClass = computed(() => {
    const colorClasses: Record<string, string> = {
        primary: 'text-blue-500',
        success: 'text-green-500',
        danger: 'text-red-500',
        warning: 'text-orange-500',
        info: 'text-cyan-500',
    };
    return colorClasses[props.variant] || 'text-gray-600';
});
</script>

<style scoped>
/* Effet 3D pour l'icône */
.shadow-3d-icon {
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.4);
}

.shadow-3d-icon:hover {
  box-shadow: 
    0 6px 8px -1px rgba(0, 0, 0, 0.15),
    0 3px 5px -1px rgba(0, 0, 0, 0.08),
    inset 0 -2px 4px rgba(0, 0, 0, 0.15),
    inset 0 2px 4px rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}
</style>
