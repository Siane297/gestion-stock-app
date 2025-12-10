<template>
    <!-- Skeleton Loading State -->
    <PointageCardSkeleton v-if="loading" />
    
    <!-- Actual Content -->
    <div v-else class="bg-white rounded-xl p-8  border-2 border-gris/40 transition-all duration-300 group">
        <!-- :class="hoverBorderClass" -->
        <div class="flex flex-col space-y-4">
            <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <!-- Section gauche avec icône et titre -->
                <div
                    class="flex flex-col  sm:items-center sm:justify-start items-start gap-4 w-full lg:w-auto">
                    <!-- Icône avec effet 3D -->
                    <div class="w-16 h-16 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center transition-all duration-200 shadow-3d-icon"
                        :class="iconBgClass">
                        <Icon :icon="icon" class="text-3xl sm:text-4xl" :class="iconColorClass" />
                    </div>

                    <!-- Titre aligné à gauche en mobile/tablet -->
                    <h2 class="text-xl text-left sm:text-2xl font-bold text-gray-800">{{ title }}</h2>
                    
                </div>

                <!-- Chart de la semaine - caché en mobile/tablet -->
                <div class="hidden lg:block w-full lg:w-80 xl:w-96 mt-4 lg:mt-0">
                    <WeeklyAttendanceChart :type="chartType" :data="weekData" :loading="loading" />
                </div>
            </div>
            <p class="text-gray-600">{{ description }}</p>
            <AppButton :label="buttonLabel" icon-right="pi pi-arrow-right" :variant="variant" size="md" full-width
                @click="handleClick" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import AppButton from '~/components/button/AppButton.vue';
import WeeklyAttendanceChart from '~/components/chart/WeeklyAttendanceChart.vue';
import PointageCardSkeleton from '~/components/skeleton/PointageCardSkeleton.vue';

interface Props {
    title: string;
    description: string;
    icon: string;
    variant: 'success' | 'danger' | 'primary' | 'secondary';
    route: string;
    buttonLabel?: string;
    weekData?: Array<{ date: string; count: number }>;
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    buttonLabel: 'Commencer',
    weekData: () => [],
    loading: false,
});

// Déterminer le type de chart selon le variant
const chartType = computed(() => {
    return props.variant === 'success' ? 'ENTREE' : 'SORTIE';
});

const handleClick = () => {
    navigateTo(props.route);
};

// const hoverBorderClass = computed(() => {
//   const classes: Record<string, string> = {
//     success: 'hover:border-green-500',
//     danger: 'hover:border-red-500',
//     primary: 'hover:border-blue-500',
//     secondary: 'hover:border-gray-500',
//   };
//   return classes[props.variant] || 'hover:border-primary';
// });

const iconBgClass = computed(() => {
    const bgClasses: Record<string, string> = {
        success: 'bg-green-500',
        danger: 'bg-red-500',
        primary: 'bg-blue-500',
        secondary: 'bg-gray-500',
    };
    return bgClasses[props.variant] || 'bg-gray-500';
});

const iconColorClass = computed(() => {
    const colorClasses: Record<string, string> = {
        success: 'text-white',
        danger: 'text-white',
        primary: 'text-white',
        secondary: 'text-white',
    };
    return colorClasses[props.variant] || 'text-white';
});
</script>

<style scoped>
/* Effet 3D pour l'icône - identique à CardStat.vue */
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
