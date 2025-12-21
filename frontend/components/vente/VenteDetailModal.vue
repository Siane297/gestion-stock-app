<template>
  <Dialog v-model:visible="visible" modal header="Détail de la vente" :style="{ width: '55rem' }" class="p-fluid">
    <div v-if="loading" class="flex flex-col items-center justify-center p-12 gap-4">
      <Icon icon="tabler:loader-2" class="text-4xl text-primary animate-spin" />
      <p class="text-gray-500 font-medium">Chargement des détails...</p>
    </div>
    
    <div v-else-if="vente" class="space-y-6 pt-4">
      <!-- En-tête : Infos générales -->
      <div class="grid grid-cols-2 gap-6 bg-bleu/70 border-2 border-bleu p-6 rounded-3xl">
        <div class="space-y-3">
          <div class="flex items-center gap-2 text-primary">
            <Icon icon="tabler:shopping-cart" class="text-xl" />
            <span class="font-bold uppercase tracking-widest text-xs">Vente #{{ vente.id.substring(0, 8).toUpperCase() }}</span>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium text-gray-700">Date: {{ formatDate(vente.date_creation) }} {{ formatTime(vente.date_creation) }}</p>
            <p class="text-sm font-medium text-gray-700">Magasin: {{ vente.magasin?.nom }}</p>
            <p class="text-sm font-medium text-gray-700">Vendeur: {{ vente.utilisateur?.email || vente.utilisateur?.employee?.fullName }}</p>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center gap-2 text-primary">
            <Icon icon="tabler:user" class="text-xl" />
            <span class="font-bold uppercase tracking-widest text-xs">Client & Statut</span>
          </div>
          <div class="p-3 bg-white border border-bleu/50 rounded-2xl flex justify-between items-center">
            <div>
                <p class="font-bold text-noir">{{ vente.client?.nom || 'Client de passage' }}</p>
                <p class="text-[10px] text-primary font-medium mt-1">Mode : {{ vente.methode_paiement }}</p>
            </div>
            <Badge :value="vente.statut" :severity="getSeverity(vente.statut)" class="!text-[10px] !px-3 !py-1 !rounded-full" />
          </div>
        </div>
      </div>

      <!-- Section Actions Rapides (Nouveau) -->
      <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
              <Icon icon="tabler:settings" class="text-gray-400 text-xl" />
              <span class="text-sm font-bold text-gray-600">Modifier le statut :</span>
              <Select 
                v-model="localStatut" 
                :options="statutOptions" 
                optionLabel="label" 
                optionValue="value"
                placeholder="Changer le statut"
                class="w-48 !rounded-xl !text-sm"
              />
          </div>
          <AppButton 
            label="Mettre à jour" 
            :loading="updating" 
            :disabled="localStatut === vente.statut"
            variant="primary" 
            size="sm"
            class="!w-auto !px-6"
            @click="handleStatusUpdate"
          />
      </div>

      <!-- Tableau des produits -->
      <div class="space-y-4">
        <h4 class="font-bold text-gray-700 px-1 border-l-4 border-primary ml-1">Lignes de commande</h4>
        <div class="overflow-hidden border border-gray-100 rounded-xl">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-bleu text-[11px] uppercase tracking-wider font-black text-noir">
                        <th class="px-4 py-3">Produit</th>
                        <th class="px-4 py-3 text-center">Qté / Cond.</th>
                        <th class="px-4 py-3 text-right">Unit.</th>
                        <th class="px-4 py-3 text-right">Remise</th>
                        <th class="px-4 py-3 text-right">Total</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    <tr v-for="detail in vente.details" :key="detail.id" class="text-sm hover:bg-gray-50/50">
                        <td class="px-4 py-3 font-medium text-gray-700">{{ detail.produit?.nom }}</td>
                        <td class="px-4 py-3 text-center text-gray-500">
                            {{ detail.quantite }} <span class="text-xs opacity-70">({{ detail.conditionnement?.nom || 'Unité' }})</span>
                        </td>
                        <td class="px-4 py-3 text-right text-gray-600">{{ formatPrice(detail.prix_unitaire) }}</td>
                        <td class="px-4 py-3 text-right text-red-500 font-medium">
                            {{ detail.remise > 0 ? '-' + formatPrice(detail.remise) : '-' }}
                        </td>
                        <td class="px-4 py-3 text-right font-bold text-gray-800">{{ formatPrice(detail.prix_total) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

      <!-- Récapitulatif financier -->
      <div class="flex justify-end pt-4">
        <div class="w-72 space-y-3 bg-bleu/20 p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">Sous-total</span>
                <span class="font-medium text-gray-700">{{ formatPrice(vente.montant_total + (vente.montant_remise || 0)) }}</span>
            </div>
            <div v-if="vente.montant_remise > 0" class="flex justify-between items-center text-sm text-red-500">
                <span class="font-medium">Remise Globale</span>
                <span class="font-bold">-{{ formatPrice(vente.montant_remise) }}</span>
            </div>
            <div class="flex justify-between items-center pt-3 border-t border-gray-200">
                <span class="text-lg font-black text-gray-800 uppercase tracking-widest">Total</span>
                <span class="text-2xl font-black text-primary">{{ formatPrice(vente.montant_total) }}</span>
            </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="vente.notes" class="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
        <div class="flex items-center gap-2 text-orange-600 mb-1">
          <Icon icon="tabler:note" />
          <span class="text-[10px] font-bold uppercase tracking-widest">Notes de vente</span>
        </div>
        <p class="text-sm text-orange-800 italic">{{ vente.notes }}</p>
      </div>
    </div>

    <template #footer>
      <AppButton label="Fermer" variant="outline" icon="pi pi-times" @click="visible = false" />
      <AppButton 
        label="Ticket" 
        icon="pi pi-receipt" 
        variant="outline" 
        :loading="printingReceipt"
        @click="handlePrintReceipt"
      />
      <AppButton 
        label="Proforma (A4)" 
        icon="pi pi-print" 
        variant="primary" 
        :loading="printingProforma"
        @click="handlePrintProforma"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import AppButton from '~/components/button/AppButton.vue';
import Badge from 'primevue/badge';
import type { Vente, StatutVente } from '~/composables/api/useVenteApi';
import { useVenteApi } from '~/composables/api/useVenteApi';
import { useCurrency } from '~/composables/useCurrency';
import { useSecurePdf } from '~/composables/useSecurePdf';
import { useToast } from 'primevue/usetoast';

const props = defineProps<{
  vente: Vente | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  'statusUpdated': [];
}>();

const visible = defineModel<boolean>('visible');
const { formatPrice } = useCurrency();
const { updateVenteStatut } = useVenteApi();
const { generateReceiptPdf, generateProformaPdf } = useSecurePdf();
const toast = useToast();

const updating = ref(false);
const printingReceipt = ref(false);
const printingProforma = ref(false);
const localStatut = ref<StatutVente | null>(null);

const statutOptions = [
    { label: 'Payée', value: 'PAYEE' },
    { label: 'En attente', value: 'EN_ATTENTE' },
    { label: 'Annulée', value: 'ANNULEE' },
    { label: 'Remboursée', value: 'REMBOURSEE' },
];

const handlePrintReceipt = async () => {
    if (!props.vente) return;
    printingReceipt.value = true;
    try {
        await generateReceiptPdf(props.vente.id, 'download');
    } finally {
        printingReceipt.value = false;
    }
};

const handlePrintProforma = async () => {
    if (!props.vente) return;
    printingProforma.value = true;
    try {
        await generateProformaPdf(props.vente.id, 'download');
    } finally {
        printingProforma.value = false;
    }
};

watch(() => props.vente, (newVente) => {
    if (newVente) {
        localStatut.value = newVente.statut;
    }
}, { immediate: true });

const handleStatusUpdate = async () => {
    if (!props.vente || !localStatut.value || localStatut.value === props.vente.statut) return;
    
    updating.value = true;
    try {
        await updateVenteStatut(props.vente.id, localStatut.value);
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Le statut a été mis à jour', life: 3000 });
        emit('statusUpdated');
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de mettre à jour le statut', life: 3000 });
    } finally {
        updating.value = false;
    }
};

const getSeverity = (status: string) => {
    switch (status) {
        case 'PAYEE': return 'success';
        case 'EN_ATTENTE': return 'warning';
        case 'ANNULEE': return 'danger';
        case 'REMBOURSEE': return 'info';
        default: return 'secondary';
    }
};

const formatDate = (date: string) => new Date(date).toLocaleDateString();
const formatTime = (date: string) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
