<template>
  <div class="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
    <div class="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4 w-full sm:w-auto">
      <!-- Filtre Boutique -->
      <div class="flex flex-col gap-1 w-full sm:w-auto">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Boutique</span>
        <Select 
          :model-value="magasinId" 
          :options="magasins" 
          optionLabel="nom" 
          optionValue="id" 
          placeholder="Toutes les boutiques" 
          class="w-full sm:w-56 !bg-gray-50/50 !border-gray-200"
          showClear
          @update:model-value="(val) => { $emit('update:magasinId', val); $emit('refresh'); }"
        />
      </div>
      
      <!-- Filtre Statut -->
      <div class="flex flex-col gap-1 w-full sm:w-auto">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Statut</span>
        <Select 
          :model-value="statut" 
          :options="statutOptions" 
          optionLabel="label" 
          optionValue="value" 
          placeholder="Tous les statuts" 
          class="w-full sm:w-44 !bg-gray-50/50 !border-gray-200"
          showClear
          @update:model-value="(val) => { $emit('update:statut', val); $emit('refresh'); }"
        />
      </div>

      <!-- Filtre Paiement -->
      <div class="flex flex-col gap-1 w-full sm:w-auto">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Paiement</span>
        <Select 
          :model-value="paiement" 
          :options="paiementOptions" 
          optionLabel="label" 
          optionValue="value" 
          placeholder="Tous les modes" 
          class="w-full sm:w-44 !bg-gray-50/50 !border-gray-200"
          showClear
          @update:model-value="(val) => { $emit('update:paiement', val); $emit('refresh'); }"
        />
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
        <!-- Bouton Actualiser -->
        <button 
          @click="$emit('refresh')" 
          class="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto"
        >
          <Icon icon="tabler:refresh" :class="{ 'animate-spin': loading }" />
        </button>

        <!-- Nouvelle Vente -->
        <AppButton 
            label="Nouvelle Vente" 
            icon="pi pi-plus" 
            @click="router.push('/point-vente')" 
            class="w-full sm:w-auto"
        />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Select from 'primevue/select';
import AppButton from '~/components/button/AppButton.vue';
import { useRouter } from 'vue-router';

interface Props {
  magasins: any[];
  magasinId: string | null;
  statut: string | null;
  paiement: string | null;
  loading?: boolean;
}

defineProps<Props>();
const router = useRouter();

const statutOptions = [
  { label: 'Payée', value: 'PAYEE' },
  { label: 'En attente', value: 'EN_ATTENTE' },
  { label: 'Annulée', value: 'ANNULEE' },
  { label: 'Remboursée', value: 'REMBOURSEE' }
];

const paiementOptions = [
  { label: 'Espèces', value: 'ESPECES' },
  { label: 'Carte Bancaire', value: 'CARTE' },
  { label: 'Virement', value: 'VIREMENT' },
  { label: 'Chèque', value: 'CHEQUE' },
  { label: 'Mobile Money', value: 'MOBILE_MONEY' },
  { label: 'Crédit', value: 'CREDIT' }
];

defineEmits(['update:magasinId', 'update:statut', 'update:paiement', 'refresh']);
</script>
