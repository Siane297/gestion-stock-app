<template>
  <Dialog v-model:visible="visible" modal header="Détails du Produit" :style="{ width: '60rem' }" class="p-fluid">
    <div v-if="loading" class="flex flex-col items-center justify-center p-12 gap-4">
      <Icon icon="tabler:loader-2" class="text-4xl text-primary animate-spin" />
      <p class="text-gray-500 font-medium">Chargement des détails...</p>
    </div>
    
    <div v-else-if="produit" class="space-y-6 pt-4">
      <!-- En-tête : Image + Infos générales -->
      <div class="grid grid-cols-3 gap-6 bg-bleu/70 border-2 border-bleu p-6 rounded-3xl">
        <!-- Image du produit -->
        <div class="flex items-center justify-center">
          <div class=" rounded-2xl bg-white border-2 border-gray-100 overflow-hidden flex items-center justify-center">
            <img v-if="produit.image_url" :src="getFullImageUrl(produit.image_url)" :alt="produit.nom" class="w-full h-full object-contain" />
            <Icon v-else icon="tabler:box" class="text-6xl text-gray-300" />
          </div>
        </div>

        <!-- Infos principales -->
        <div class="col-span-2 space-y-3">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-2xl font-black text-noir">{{ produit.nom }}</h3>
              <p v-if="produit.description" class="text-sm text-gray-600 mt-1">{{ produit.description }}</p>
            </div>
            <Tag :severity="produit.est_actif ? 'success' : 'danger'" :value="produit.est_actif ? 'Actif' : 'Inactif'" class="!text-xs" />
          </div>

          <div class="flex flex-col gap-4 pt-3">
            <div class="p-3 bg-white rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Catégorie</p>
              <p class="font-bold text-noir">{{ produit.categorie?.nom || 'Non définie' }}</p>
            </div>
            <div class="p-3 bg-white rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Unité de base</p>
              <p class="font-bold text-noir">{{ produit.unite?.nom || 'Non définie' }}</p>
            </div>
            <div v-if="produit.gere_peremption" class="col-span-2 p-3 bg-orange-50 rounded-xl border border-orange-200 flex items-center gap-2">
              <Icon icon="tabler:calendar-exclamation" class="text-orange-600 text-xl" />
              <p class="text-sm font-medium text-orange-700">Ce produit nécessite un suivi de péremption</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Conditionnements -->
      <div class="space-y-3">
        <h4 class="font-bold text-gray-700 px-1 border-l-4 border-primary ml-1">Conditionnements & Prix</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="cond in produit.conditionnements" :key="cond.id" class="p-4 bg-gradient-to-br from-bleu/30 to-transparent border-2 border-bleu rounded-2xl hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-noir">{{ cond.nom }}</span>
              <Tag v-if="cond.quantite_base === 1" value="Base" severity="info" class="!text-[10px] !px-2" />
            </div>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Quantité base:</span>
                <span class="font-semibold">{{ cond.quantite_base }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Prix vente:</span>
                <span class="font-bold text-primary">{{ formatPrice(cond.prix_vente) }}</span>
              </div>
              <div v-if="cond.code_barre" class="pt-1 border-t border-gray-200">
                <p class="text-xs text-gray-500">Code barre:</p>
                <p class="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1">{{ cond.code_barre }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stocks par magasin -->
      <div v-if="produit.stocks && produit.stocks.length > 0" class="space-y-3">
        <h4 class="font-bold text-gray-700 px-1 border-l-4 border-primary ml-1">Stock par Magasin</h4>
        <div class="overflow-hidden border border-gray-100 rounded-xl">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-bleu text-xs uppercase tracking-wider font-black text-noir">
                <th class="px-4 py-3">Magasin</th>
                <th class="px-4 py-3 text-center">Quantité</th>
                <th class="px-4 py-3 text-center">Min.</th>
                <th class="px-4 py-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="stock in produit.stocks" :key="stock.id" class="text-sm hover:bg-gray-50/50">
                <td class="px-4 py-3 font-medium text-gray-700">{{ stock.magasin?.nom || 'N/A' }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="font-bold" :class="getStockColor(stock.quantite, stock.quantite_minimum)">
                    {{ stock.quantite }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center text-gray-500">{{ stock.quantite_minimum || 0 }}</td>
                <td class="px-4 py-3 text-center">
                  <Tag 
                    :value="getStockStatus(stock.quantite, stock.quantite_minimum)" 
                    :severity="getStockSeverity(stock.quantite, stock.quantite_minimum)"
                    class="!text-[10px]"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center">
        <Icon icon="tabler:box-off" class="text-4xl text-gray-300 mb-2" />
        <p class="text-sm text-gray-400">Aucun stock disponible pour ce produit</p>
      </div>
    </div>

    <template #footer>
      <AppButton label="Fermer" variant="outline" icon="pi pi-times" @click="visible = false" />
      <AppButton 
        label="Modifier" 
        icon="pi pi-pencil" 
        variant="primary" 
        @click="handleEdit"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import Dialog from 'primevue/dialog';
import AppButton from '~/components/button/AppButton.vue';
import Tag from 'primevue/tag';
import type { Produit } from '~/composables/api/useProduitApi';
import { useCurrency } from '~/composables/useCurrency';

const props = defineProps<{
  produit: Produit | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  'edit': [produit: Produit];
}>();

const visible = defineModel<boolean>('visible');
const { formatPrice } = useCurrency();
const config = useRuntimeConfig();

const apiBase = config.public.apiBase as string;
let serverUrl = '';
try {
  if (apiBase.startsWith('http')) {
    serverUrl = new URL(apiBase).origin;
  }
} catch (e) {
  console.error("Erreur parsing API Base URL", e);
}

const getFullImageUrl = (path?: string) => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${serverUrl}${path}`;
};

const getStockColor = (quantite: number, min: number) => {
  if (quantite === 0) return 'text-red-600';
  if (quantite <= min) return 'text-orange-600';
  return 'text-green-600';
};

const getStockStatus = (quantite: number, min: number) => {
  if (quantite === 0) return 'Rupture';
  if (quantite <= min) return 'Alerte';
  return 'OK';
};

const getStockSeverity = (quantite: number, min: number) => {
  if (quantite === 0) return 'danger';
  if (quantite <= min) return 'warning';
  return 'success';
};

const handleEdit = () => {
  if (props.produit) {
    emit('edit', props.produit);
  }
};
</script>

<style scoped>
:deep(.p-dialog-content) {
  background-color: transparent !important;
}
:deep(.p-dialog-header) {
  background: #fdfdfd;
}
:deep(.p-dialog-footer) {
  border-top: 1px solid #f3f4f6;
  background: #fdfdfd;
  padding: 1.5rem;
}
</style>
