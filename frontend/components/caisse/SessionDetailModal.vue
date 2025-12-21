<template>
  <Dialog v-model:visible="visible" modal header="Rapport détaillé de session" :style="{ width: '50rem' }" class="p-fluid">
    <div v-if="loading" class="flex flex-col items-center justify-center p-12 gap-4">
      <Icon icon="tabler:loader-2" class="text-4xl text-primary animate-spin" />
      <p class="text-gray-500 font-medium">Récupération du rapport complet...</p>
    </div>
    
    <div v-else-if="rapport" class="space-y-6 pt-4">
      <!-- Header rapport -->
      <div class="grid grid-cols-2 gap-6  bg-bleu/50 border-bleu  p-6 rounded-3xl border-2">
        <div class="space-y-3">
          <div class="flex items-center gap-2 text-primary">
            <Icon icon="tabler:cash-register" class="text-xl" />
            <span class="font-bold uppercase tracking-widest text-xs">Informations Terminal</span>
          </div>
          <div>
            <h3 class="text-xl font-black text-gray-800">{{ rapport.caisse.nom }}</h3>
            <p class="text-sm text-gray-500">Code: {{ rapport.caisse.code }}</p>
          </div>
          <div class="pt-2 border-t border-gray-200">
            <p class="text-[10px] text-gray-400 uppercase font-bold">Responsable de session</p>
            <p class="font-bold text-gray-700">{{ rapport.utilisateur.fullName || rapport.utilisateur.email }}</p>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center gap-2 text-primary">
            <Icon icon="tabler:clock" class="text-xl" />
            <span class="font-bold uppercase tracking-widest text-xs">Chronologie</span>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500">Ouverture</span>
              <span class="font-bold text-gray-700">{{ formatDate(rapport.date_ouverture) }} {{ formatTime(rapport.date_ouverture) }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500">Fermeture</span>
              <span v-if="rapport.date_fermeture" class="font-bold text-gray-700">
                {{ formatDate(rapport.date_fermeture) }} {{ formatTime(rapport.date_fermeture) }}
              </span>
              <span v-else class="text-green-600 font-bold italic">En cours</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Totaux Financiers -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
          <span class="text-[10px] text-gray-400 uppercase font-black">Fond Initial</span>
          <p class="text-lg font-bold text-gray-800">{{ formatPrice(rapport.fond_initial) }}</p>
        </div>
        <div class="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
          <span class="text-[10px] text-gray-400 uppercase font-black">Ventes (CA)</span>
          <p class="text-lg font-bold text-primary">{{ formatPrice(rapport.chiffre_affaires) }}</p>
        </div>
        <div class="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
          <span class="text-[10px] text-gray-400 uppercase font-black">Fond Final</span>
          <p class="text-lg font-bold text-gray-800">{{ formatPrice(rapport.fond_final || 0) }}</p>
        </div>
        <div class="p-4 border rounded-2xl shadow-sm text-center" 
          :class="(rapport.ecart || 0) === 0 ? 'bg-gray-50 border-gray-100' : ((rapport.ecart || 0) > 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100')">
          <span class="text-[10px] uppercase font-black" :class="(rapport.ecart || 0) === 0 ? 'text-gray-400' : ((rapport.ecart || 0) > 0 ? 'text-green-500' : 'text-red-500')">Écart</span>
          <p class="text-lg font-bold" :class="(rapport.ecart || 0) === 0 ? 'text-gray-600' : ((rapport.ecart || 0) > 0 ? 'text-green-700' : 'text-red-700')">
            {{ (rapport.ecart || 0) > 0 ? '+' : '' }}{{ formatPrice(rapport.ecart || 0) }}
          </p>
        </div>
      </div>

      <!-- Détail par paiement -->
      <div class="space-y-4">
        <h4 class="font-bold text-gray-700 px-1">Répartition des encaissements</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="(val, key) in paiementDetails" :key="key" 
            class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-colors">
            <div class="flex items-center gap-2">
              <Icon :icon="getPaiementIcon(key)" class="text-gray-400 text-lg" />
              <span class="text-sm text-gray-500 font-medium">{{ getPaiementLabel(key) }}</span>
            </div>
            <span class="font-bold text-gray-700">{{ formatPrice(val) }}</span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="rapport.notes_ouverture || rapport.notes_fermeture" class="space-y-4 pt-2">
        <div v-if="rapport.notes_ouverture" class="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
          <div class="flex items-center gap-2 text-blue-600 mb-1">
            <Icon icon="tabler:note" />
            <span class="text-[10px] font-bold uppercase tracking-widest">Note d'ouverture</span>
          </div>
          <p class="text-sm text-blue-800 italic">{{ rapport.notes_ouverture }}</p>
        </div>
        <div v-if="rapport.notes_fermeture" class="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
          <div class="flex items-center gap-2 text-orange-600 mb-1">
            <Icon icon="tabler:note" />
            <span class="text-[10px] font-bold uppercase tracking-widest">Note de fermeture</span>
          </div>
          <p class="text-sm text-orange-800 italic">{{ rapport.notes_fermeture }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <AppButton label="Fermer" variant="secondary" icon="pi pi-times" @click="visible = false" />
      <AppButton v-if="rapport?.statut === 'FERMEE'" label="Imprimer Rapport" icon="pi pi-print" variant="primary" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import Dialog from 'primevue/dialog';
import AppButton from '~/components/button/AppButton.vue';
import type { RapportSession } from '~/composables/api/useCaisseApi';
import { useCurrency } from '~/composables/useCurrency';

const props = defineProps<{
  rapport: RapportSession | null;
  loading: boolean;
}>();

const visible = defineModel<boolean>('visible');

const { formatPrice } = useCurrency();

const paiementDetails = computed(() => {
  if (!props.rapport) return {};
  return {
    ESPECES: props.rapport.total_especes,
    CARTE: props.rapport.total_carte,
    MOBILE: props.rapport.total_mobile,
    CHEQUE: props.rapport.total_cheque,
    AUTRE: props.rapport.total_autre
  };
});

const formatDate = (date: string) => new Date(date).toLocaleDateString();
const formatTime = (date: string) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const getPaiementIcon = (key: string) => {
  const icons: any = {
    ESPECES: 'tabler:coin',
    CARTE: 'tabler:credit-card',
    MOBILE: 'tabler:device-mobile',
    CHEQUE: 'tabler:clipboard-check',
    AUTRE: 'tabler:dots'
  };
  return icons[key] || 'tabler:currency-dollar';
};

const getPaiementLabel = (key: string) => {
  const labels: any = {
    ESPECES: 'Espèces',
    CARTE: 'Carte Bancaire',
    MOBILE: 'Mobile Money',
    CHEQUE: 'Chèque',
    AUTRE: 'Autres / Virements'
  };
  return labels[key] || key;
};
</script>

<style scoped>
:deep(.p-dialog-content) {
    background-color: transparent !important;
}

:deep(.p-dialog-header) {
    background: #fdfdfd;
    padding-bottom: 0.5rem;
}

:deep(.p-dialog-footer) {
    border-top: 1px solid #f3f4f6;
    background: #fdfdfd;
    padding: 1.5rem;
}
</style>
