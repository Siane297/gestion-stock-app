<template>
  <div class="flex flex-col bg-transparent">
    <!-- Stylized Banner -->
    <div class="relative w-full rounded-2xl overflow-hidden bg-side2 shadow-md mb-6 min-h-[140px]">
      <!-- Decorative Background Shapes -->
      <div class="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      <div class="absolute top-10 right-1/4 w-24 h-24 bg-blue-400/10 rounded-full blur-xl"></div>
      
      <!-- Subtle Wave Pattern -->
      <div class="absolute inset-0 opacity-[0.08] pointer-events-none">
        <svg viewBox="0 0 500 200" preserveAspectRatio="none" class="w-full h-full">
          <path d="M0,150 C150,200 350,100 500,150 L500,0 L0,0 Z" fill="white"></path>
          <path d="M0,120 C200,180 300,80 500,120 L500,0 L0,0 Z" fill="white" opacity="0.5"></path>
        </svg>
      </div>

      <div
        class="absolute bottom-0 -right-20 top-[230px]  h-full  flex items-end justify-end overflow-visible pointer-events-none">
        <img src="~/assets/images/illustration-homme.png" alt="Illustration"
          class=" w-96 object-contain object-bottom transform translate-x-4 opacity-90" />
      </div>

      <div class="z-10 relative p-6 flex flex-col gap-1">
        <span class="text-xs font-medium uppercase tracking-wider text-white/60">Bienvenue</span>
        <h1 class="text-2xl font-bold text-white">
          {{ userName }}
        </h1>
        <p class="text-sm mt-1 text-white/80 ">Accédez rapidement à vos outils de gestion.</p>
      </div>

      <!-- Decorative bottom line -->
      <div class="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80"></div>
    </div>

    <!-- Search Bar -->
    <MobileProductSearch class="mb-6" />

    <!-- Quick Actions Section -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border-2 border-gris/40">
      <!-- Section Title -->
      <div class="flex items-center gap-2 mb-6 px-1">
        <div class="h-5 w-1 bg-side rounded-full"></div>
        <h2 class="text-lg font-bold text-gray-800">Actions Rapides</h2>
      </div>

      <!-- Quick Actions Grid -->
      <div class="grid grid-cols-2 gap-4">
        <div v-for="action in actions" :key="action.label" @click="handleAction(action)" :class="[
          'group relative overflow-hidden rounded-2xl p-5 flex flex-col items-start justify-start gap-4 transition-all duration-300 active:scale-95 hover:shadow-sm hover:-translate-y-1 border border-transparent cursor-pointer',
          action.bgClass
        ]">
          <!-- Decorative Gradient Blob -->
          <div
            :class="['absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500', action.blobClass]">
          </div>

          <!-- Decorative Curved Line -->
           <div class="absolute bottom-0 left-10 -rotate-[42deg] w-full h-16 opacity-20 pointer-events-none overflow-hidden rounded-b-4xl">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" class="w-full h-full">
                  <path d="M-10,40 Q50,0 110,40" fill="none" class="stroke-current" :class="action.textClass" stroke-width="20" />
              </svg>
           </div>

          <!-- Icon Container -->
          <div :class="[
            'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-3d-icon',
            action.solidBgClass,
            'text-white'
          ]">
            <Icon :icon="action.icon" class="w-6 h-6" />
          </div>

          <!-- Content -->
          <div class="flex flex-col items-start gap-1 z-10">
            <span class="text-sm font-bold text-gray-800 group-hover:text-gray-900 leading-tight">
              {{ action.label }}
            </span>
            <span class="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              {{ action.subtitle }}
            </span>
          </div>

          <!-- Action Button/Indicator -->
          <div :class="[
            'absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:opacity-100 group-hover:scale-110 shadow-sm border bg-white border-white/50',
            action.bgClass,
            action.textClass
          ]">
            <Icon icon="tabler:chevron-right" class="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>

    <!-- Top Products Section -->
    <!-- <div class="mt-6 bg-white rounded-2xl p-6 shadow-sm border-2 border-gris/40 mb-6">
      <div class="flex items-center justify-between mb-4 px-1">
        <div class="flex items-center gap-2">
           <div class="h-5 w-1 bg-side rounded-full"></div>
           <h2 class="text-lg font-bold text-gray-800">Top 5 Produits</h2>
        </div>
        <button @click="router.push('/produits')" class="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">Voir tout</button>
      </div>
      
      <div class="space-y-1">
       
        <div v-if="loading" class="flex justify-center py-8">
           <Icon icon="svg-spinners:3-dots-fade" class="text-3xl text-gray-400" />
        </div>
        
        <div v-else-if="topProducts.length === 0" class="flex flex-col items-center justify-center py-8 text-gray-400">
           <Icon icon="tabler:package-off" class="text-4xl mb-2 opacity-50" />
           <span class="text-sm font-medium">Aucune donnée disponible</span>
        </div>
        
       
        <div v-else v-for="(prod, index) in topProducts.slice(0, 5)" :key="index" class="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
          
           <div class="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              <img v-if="prod.image_url" :src="prod.image_url" class="w-full h-full object-cover" />
              <Icon v-else icon="tabler:package" class="text-gray-300 text-xl" />
           </div>
           
        
           <div class="flex-1 min-w-0">
              <h4 class="text-sm font-bold text-gray-800 truncate">{{ prod.name }}</h4>
              <p class="text-xs font-medium text-gray-500">{{ prod.quantity }} ventes</p>
           </div>
           
          
           <div class="text-right">
              <p class="text-[12px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">{{ formatPrice(prod.total) }}</p>
           </div>
        </div>
      </div>
    </div> -->
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { useCurrentUser } from '~/composables/api/useUserApi';
import { useCurrency } from '~/composables/useCurrency';
import MobileProductSearch from '~/components/mobile/MobileProductSearch.vue';
import type { ProductStat } from '~/composables/api/useDashboardApi';

const router = useRouter();
const { user, fetchUser } = useCurrentUser();
const { formatPrice } = useCurrency();

interface Props {
  topProducts?: ProductStat[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  topProducts: () => [],
  loading: false
});

onMounted(async () => {
  if (!user.value) {
    await fetchUser();
  }
});

const userName = computed(() => {
  if (!user.value) return 'Utilisateur';
  // Pour les TenantUsers, utiliser employee.fullName
  if (user.value.employee) {
    return user.value.employee.fullName;
  }
  // Pour les Admin, utiliser name
  return user.value.name || 'Utilisateur';
});

const emit = defineEmits(['open-stats']);

const actions = [
    {
    label: 'Produits',
    subtitle: 'Catalogue',
    icon: 'tabler:package',
    route: '/produits',
    bgClass: 'bg-emerald-100',
    solidBgClass: 'bg-emerald-500',
    textClass: 'text-emerald-600',
    blobClass: 'bg-emerald-500'
  },
  {
    label: 'Point de Vente',
    subtitle: 'Vendre',
    icon: 'tabler:shopping-cart',
    route: '/point-vente',
    bgClass: 'bg-blue-100',
    solidBgClass: 'bg-blue-500',
    textClass: 'text-blue-600',
    blobClass: 'bg-blue-500'
  },

  {
    label: 'Stocks',
    subtitle: 'Inventaire',
    icon: 'tabler:box-seam',
    route: '/stock',
    bgClass: 'bg-orange-100',
    solidBgClass: 'bg-orange-500',
    textClass: 'text-orange-600',
    blobClass: 'bg-orange-500'
  },
  {
    label: 'Statistiques',
    subtitle: 'Analyses',
    icon: 'tabler:chart-bar',
    route: null,
    bgClass: 'bg-pink-100',
    solidBgClass: 'bg-pink-500',
    textClass: 'text-pink-600',
    blobClass: 'bg-pink-500'
  }
];

const handleAction = (action: any) => {
  if (action.route) {
    router.push(action.route);
  } else if (action.label === 'Statistiques') {
    emit('open-stats');
  }
};
</script>

<style scoped>
/* Optional: Add smooth tap highlight removal for mobile */
div {
  -webkit-tap-highlight-color: transparent;
}

/* Effet 3D pour l'icône (inspiré de CardStat) */
.shadow-3d-icon {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.shadow-3d-icon:hover {
  box-shadow:
    0 6px 8px -1px rgba(0, 0, 0, 0.15),
    0 3px 5px -1px rgba(0, 0, 0, 0.08),
    inset 0 -2px 4px rgba(0, 0, 0, 0.25),
    inset 0 2px 4px rgba(255, 255, 255, 0.4);
}
</style>
