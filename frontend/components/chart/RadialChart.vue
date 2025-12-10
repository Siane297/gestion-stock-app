<template>
    <!-- Skeleton Loading State -->
    <ChartSkeleton 
      v-if="loading" 
      chart-type="radial" 
      height="h-80"
      :show-title="true"
      :show-legend="true"
    />
    
    <!-- Actual Chart -->
    <div v-else class="bg-white rounded-xl p-6 border-2 border-gris/40">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
                <h3 class="text-lg font-bold text-noir">Répartition des Statuts</h3>
                <p class="text-sm text-gray-500 mt-1">Taux de présence</p>
            </div>
            
            <!-- Filtre par mois -->
            <div class="flex gap-3">
                <DatePicker
                    v-model="selectedMonth"
                    view="month"
                    dateFormat="mm/yy"
                    placeholder="Sélectionner un mois"
                    showIcon
                    :showButtonBar="true"
                    class=""
                />
            </div>
        </div>

        <component
            v-if="!isLoading && hasData && apexchart"
            :is="apexchart"
            type="radialBar"
            :height="chartHeight"
            :options="chartOptions"
            :series="series"
        />
        
        <div v-else-if="isLoading" class="flex items-center justify-center h-[380px]">
            <div class="text-gray-400">Chargement...</div>
        </div>
        
        <div v-else class="flex items-center justify-center h-[380px]">
            <div class="text-gray-400">Aucune donnée disponible</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import DatePicker from 'primevue/datepicker';
import ChartSkeleton from "~/components/skeleton/ChartSkeleton.vue";

// Définir apexchart comme null par défaut (sera chargé côté client)
const apexchart = ref<any>(null);

onMounted(async () => {
    // Charger ApexCharts côté client uniquement
    if (process.client) {
        const VueApexCharts = (await import('vue3-apexcharts')).default;
        apexchart.value = VueApexCharts;
    }
});

interface Props {
    data?: {
        presences: number;
        retards: number;
        absences: number;
        incomplets: number;
        total: number;
    };
    loading?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'month-change', date: Date): void;
}>();

const isLoading = ref(false);
const selectedMonth = ref<Date | null>(null);

// Hauteur responsive du graphique
const chartHeight = computed(() => {
  if (process.client) {
    return window.innerWidth < 768 ? 320 : 380;
  }
  return 380;
});

// Watcher pour le mois
watch(selectedMonth, (newMonth) => {
    if (newMonth) {
        emit('month-change', newMonth);
    }
});

// Calcul des pourcentages
const percentages = computed(() => {
    if (!props.data || props.data.total === 0) {
        return {
            presences: 0,
            retards: 0,
            absences: 0,
            incomplets: 0,
        };
    }

    return {
        presences: Math.round((props.data.presences / props.data.total) * 100),
        retards: Math.round((props.data.retards / props.data.total) * 100),
        absences: Math.round((props.data.absences / props.data.total) * 100),
        incomplets: Math.round((props.data.incomplets / props.data.total) * 100),
    };
});

// Vérifier si on a des données
const hasData = computed(() => {
    return props.data && props.data.total > 0;
});

// Séries de données (pourcentages)
const series = computed(() => [
    percentages.value.presences,
    percentages.value.retards,
    percentages.value.absences,
    percentages.value.incomplets,
]);

// Options du chart
const chartOptions = computed(() => ({
    chart: {
        height: 380,
        type: 'radialBar' as const,
        fontFamily: 'inherit',
    },
    plotOptions: {
        radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 270,
            hollow: {
                margin: 5,
                size: '30%',
                background: 'transparent',
            },
            dataLabels: {
                name: {
                    show: true,
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                },
                value: {
                    show: true,
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#111827',
                    formatter: (val: number) => `${val}%`,
                },
                total: {
                    show: true,
                    label: 'Total',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#6b7280',
                    formatter: () => `${props.data?.total || 0}`,
                },
            },
            track: {
                background: '#f3f4f6',
                strokeWidth: '97%',
                margin: 5,
            },
        },
    },
    colors: ['#10b981', '#f59e0b', '#ef4444', '#06b6d4'],
    labels: ['A l\'heure', 'Retards', 'Absents', 'Incomplets'],
    legend: {
        show: true,
        floating: true,
        fontSize: '14px',
        fontWeight: 500,
        position: 'left' as const,
        offsetX: 10,
        offsetY: 15,
        labels: {
            colors: '#374151',
            useSeriesColors: false,
        },
        markers: {
            size: 6,
            radius: 4,
        },
        formatter: (seriesName: string, opts: any) => {
            const values = [
                props.data?.presences || 0,
                props.data?.retards || 0,
                props.data?.absences || 0,
                props.data?.incomplets || 0,
            ];
            return `${seriesName}: ${values[opts.seriesIndex]}`;
        },
        itemMargin: {
            vertical: 3,
        },
    },
    responsive: [
        {
            breakpoint: 768,
            options: {
                chart: {
                    height: 320,
                },
                plotOptions: {
                    radialBar: {
                        hollow: {
                            margin: 3,
                            size: '25%',
                        },
                        dataLabels: {
                            name: {
                                fontSize: '12px',
                            },
                            value: {
                                fontSize: '18px',
                            },
                            total: {
                                fontSize: '12px',
                            },
                        },
                    },
                },
                legend: {
                    show: true,
                    floating: false,
                    position: 'bottom' as const,
                    offsetX: 0,
                    offsetY: 0,
                    fontSize: '12px',
                    horizontalAlign: 'center' as const,
                },
            },
        },
        {
            breakpoint: 480,
            options: {
                chart: {
                    height: 300,
                },
                plotOptions: {
                    radialBar: {
                        hollow: {
                            margin: 2,
                            size: '20%',
                        },
                        dataLabels: {
                            name: {
                                fontSize: '11px',
                            },
                            value: {
                                fontSize: '16px',
                            },
                            total: {
                                fontSize: '11px',
                            },
                        },
                    },
                },
                legend: {
                    show: true,
                    floating: false,
                    position: 'bottom' as const,
                    offsetX: 0,
                    offsetY: 0,
                    fontSize: '11px',
                    horizontalAlign: 'center' as const,
                },
            },
        },
    ],
}));
</script>
