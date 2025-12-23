<template>
  <div class="w-full bg-white border-2 border-gris/40 rounded-xl p-7 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <h3 class="font-semibold text-lg text-noir flex items-center gap-2">
        Ventes Récentes
      </h3>
      <NuxtLink to="/vente" class="text-sm text-primary hover:underline font-semibold">
        Voir tout l'historique
      </NuxtLink>
    </div>

    <!-- Table (Inspirée de TableGeneric) -->
    <DataTable
      :value="sales"
      responsiveLayout="scroll"
      stripedRows
      class="custom-table"
      :loading="loading"
    >
      <!-- Empty State -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16">
          <Icon icon="tabler:database-x" class="text-6xl text-gray-300 mb-4" />
          <p class="text-gray-500 text-lg font-medium">Aucune vente récente</p>
        </div>
      </template>

      <!-- Date -->
      <Column field="date_creation" header="Date" sortable headerClass="!bg-bleu text-black text-[14px] font-semibold py-3 px-4">
        <template #body="{ data }">
          <div class="flex flex-col text-xs">
            <span class="font-medium text-gray-700">{{ formatDate(data.date_creation) }}</span>
            <span class="text-gray-400 font-mono">{{ formatTime(data.date_creation) }}</span>
          </div>
        </template>
      </Column>

      <!-- Client -->
      <Column field="client.nom" header="Client" sortable headerClass="!bg-bleu text-black text-[14px] font-semibold py-3 px-4">
        <template #body="{ data }">
          <span class="text-xs font-medium text-gray-700">
            {{ data.client?.nom || 'Client Anonyme' }}
          </span>
        </template>
      </Column>

      <!-- Boutique -->
      <Column field="magasin.nom" header="Boutique" sortable headerClass="!bg-bleu text-black text-[14px] font-semibold py-3 px-4">
        <template #body="{ data }">
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-primary/40"></div>
            <span class="text-xs text-gray-600 font-medium">{{ data.magasin?.nom }}</span>
          </div>
        </template>
      </Column>

      <!-- Source / Caisse -->
      <Column field="session_caisse" header="Caisse" sortable headerClass="!bg-bleu text-black text-[14px] font-semibold py-3 px-4">
        <template #body="{ data }">
          <div v-if="data.session_caisse?.caisse" class="flex items-center gap-2">
            <div class="p-1.5 bg-gray-50 rounded-lg border border-gray-100">
              <Icon icon="tabler:cash-register" class="text-gray-400 text-sm" />
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-gray-800 text-[11px]">{{ data.session_caisse?.caisse?.nom }}</span>
              <span class="text-[9px] text-gray-500 uppercase">{{ data.session_caisse?.caisse?.code }}</span>
            </div>
          </div>
          <Tag v-else value="Back Office" severity="secondary" class="!text-[9px] !px-2" />
        </template>
      </Column>

      <!-- Vendeur -->
      <Column field="utilisateur.employee.fullName" header="Vendeur" sortable headerClass="!bg-bleu text-black text-[14px] font-semibold py-3 px-4">
        <template #body="{ data }">
           <span class="text-xs text-gray-600">{{ data.utilisateur?.employee?.fullName }}</span>
        </template>
      </Column>

      <!-- Montant -->
      <Column field="montant_total" header="Montant" sortable headerClass="!bg-bleu text-black text-[14px] font-semibold py-3 px-4">
        <template #body="{ data }">
          <span class="font-bold text-primary">{{ formatPrice(data.montant_total) }}</span>
        </template>
      </Column>

      <!-- Paiement -->
      <Column field="methode_paiement" header="Paiement" sortable headerClass="!bg-bleu text-black text-[14px] font-semibold py-3 px-4">
         <template #body="{ data }">
          <div class="flex items-center gap-1 text-[11px] font-medium text-gray-600">
            <Icon :icon="getPaiementIcon(data.methode_paiement)" class="text-gray-400" />
            <span>{{ data.methode_paiement }}</span>
          </div>
        </template>
      </Column>

      <!-- Statut -->
      <Column field="statut" header="Statut" sortable headerClass="!bg-bleu text-black text-[14px] font-semibold py-3 px-4">
        <template #body="{ data }">
          <Badge :value="data.statut" :severity="getSeverity(data.statut)" class="!rounded-lg !text-[10px] !px-2" />
        </template>
      </Column>

      <!-- Actions -->
      <Column
        header="Actions"
        :style="{ width: '80px' }"
        headerClass="!bg-bleu text-black text-[14px] font-semibold py-3 px-4"
        alignFrozen="right"
        frozen
      >
        <template #body="{ data }">
          <div class="flex justify-center">
            <button
              @click="toggleActionMenu($event, data)"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon icon="mdi:dots-vertical" class="text-xl text-gray-600" />
            </button>
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Dropdown Menu (Teleport) -->
    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="activeMenuSaleId !== null"
          :style="dropdownStyle"
          class="fixed z-[9999] w-[180px] bg-white rounded-2xl shadow-lg border border-gris p-2"
        >
             <button
               @click="handleMenuAction(activeMenuSale)"
               class="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-bleu/40 transition-colors text-left text-gray-600"
             >
               <Icon icon="tabler:eye" class="w-5 h-auto" />
               <span class="text-sm font-medium">Voir Détails</span>
             </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import type { RecentSale } from '~/composables/api/useDashboardApi';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Badge from 'primevue/badge';
import Tag from 'primevue/tag';
import { useCurrency } from '~/composables/useCurrency';

defineProps<{
  loading: boolean;
  sales: RecentSale[];
}>();

const emit = defineEmits<{
  'action:view': [sale: any]
}>();

const { formatPrice: globalFormatPrice } = useCurrency();

const activeMenuSaleId = ref<string | null>(null);
const activeMenuSale = ref<any>(null);
const dropdownStyle = ref({});

const toggleActionMenu = (event: MouseEvent, sale: any) => {
  if (activeMenuSaleId.value === sale.id) {
    activeMenuSaleId.value = null;
    activeMenuSale.value = null;
  } else {
    activeMenuSaleId.value = sale.id;
    activeMenuSale.value = sale;

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    dropdownStyle.value = {
      top: `${rect.bottom + 5}px`,
      left: `${rect.left - 180 + rect.width}px`,
    };
  }
};

const handleMenuAction = (sale: any) => {
    activeMenuSaleId.value = null;
    activeMenuSale.value = null;
    emit('action:view', sale);
};

// Fermer le menu si on clique en dehors
if (typeof window !== 'undefined') {
  onMounted(() => {
    document.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('button') && !target.closest('[style*="fixed"]')) {
         activeMenuSaleId.value = null;
         activeMenuSale.value = null;
      }
    });
  });
}

const formatDate = (date: string) => new Date(date).toLocaleDateString();
const formatTime = (date: string) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatPrice = (value: number) => globalFormatPrice(value);

const getPaiementIcon = (method: string) => {
  switch (method) {
    case 'ESPECES': return 'tabler:coin';
    case 'CARTE': return 'tabler:credit-card';
    case 'MOBILE_MONEY': return 'tabler:device-mobile';
    case 'CHEQUE': return 'tabler:clipboard-check';
    default: return 'tabler:currency-dollar';
  }
};

const getSeverity = (status: string) => {
  switch (status) {
    case 'PAYEE': return 'success';
    case 'EN_ATTENTE': return 'warning';
    case 'ANNULEE': return 'danger';
    default: return 'info';
  }
};
</script>

<style scoped>
:deep(.custom-table) {
  @apply rounded-lg border overflow-hidden shadow-sm;
}
:deep(.custom-table .p-datatable-tbody > tr > td) {
    @apply text-sm py-3 border-b border-gray-100;
}

/* Animation du dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
