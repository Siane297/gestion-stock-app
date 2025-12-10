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
                    <div class="mb-1">
                        <h3 class="text-3xl font-bold text-noir">{{ value }}</h3>
                    </div>

                    <!-- Label -->
                    <p class="text-[11px] uppercase text-gray-500 font-semibold">{{ label }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import CardStatSkeleton from '~/components/skeleton/CardStatSkeleton.vue';

interface Props {
    icon: string;
    value: string | number;
    label: string;
    variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
    showMenu?: boolean;
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    showMenu: false,
    loading: false,
});

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
