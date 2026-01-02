<template>
  <Dialog 
    :visible="visible" 
    modal 
    header="Encaisser la commande" 
    :style="{ width: '500px' }" 
    :breakpoints="{ '960px': '75vw', '640px': '95vw' }"
    :closable="true"
    @update:visible="val => $emit('update:visible', val)"
  >
    <div v-if="step === 'payment'" class="flex flex-col gap-6">
      
      <!-- Total Display -->
      <div class="bg-[#064654] text-white p-6 rounded-xl text-center shadow-lg">
        <div class="text-sm opacity-80 uppercase tracking-widest font-medium">Net à Payer</div>
        <div class="text-4xl font-bold mt-2">{{ formatPrice(localTotal) }}</div>
      </div>

      <!-- Payment Methods -->
      <div class="flex gap-2">
        <button 
          v-for="method in paymentMethods" 
          :key="method.id"
          @click="selectedMethod = method.id"
          :class="[
            'flex-1 py-3 rounded-lg border font-medium transition-all flex flex-col items-center gap-1',
            selectedMethod === method.id 
              ? 'bg-primary text-white border-primary shadow-md' 
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          ]"
        >
          <i :class="method.icon"></i>
          <span class="text-sm">{{ method.label }}</span>
        </button>
      </div>

      <!-- Calculator / Input -->
      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <label class="font-semibold text-gray-700">Montant Reçu</label>
          <InputGroup>
            <InputGroupAddon v-if="currentCurrency?.symbolPosition === 'before'" 
              class="font-bold text-gray-600 bg-gray-50 border-r-0">
              {{ currentCurrency?.symbol }}
            </InputGroupAddon>

            <InputNumber 
              v-model="amountReceived" 
              :useGrouping="false" :maxFractionDigits="currencyDecimals"
              :minFractionDigits="0"
              class="w-full text-lg"
              :class="{ 'p-invalid': amountReceived < localTotal }"
              inputClass="text-center font-bold text-xl"
              autofocus
              @keyup.enter="handlePayment"
              @input="(e) => amountReceived = Number(e.value) || 0"
            />

            <InputGroupAddon v-if="currentCurrency?.symbolPosition !== 'before'" 
              class="font-bold text-gray-600 bg-gray-50 border-l-0">
              {{ currentCurrency?.symbol }}
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div v-if="changeAmount >= 0" class="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-100">
          <span class="text-green-800 font-medium">Monnaie à rendre</span>
          <span class="text-2xl font-bold text-green-700">{{ formatPrice(changeAmount) }}</span>
        </div>
        <div v-else class="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-100">
           <span class="text-red-800 font-medium">Manque</span>
           <span class="text-xl font-bold text-red-700">{{ formatPrice(Math.abs(changeAmount)) }}</span>
        </div>
      </div>

      <!-- Action -->
      <div class="flex gap-3 pt-2">
         <AppButton 
            label="Annuler" 
            variant="outline" 
             fullWidth
             @click="$emit('update:visible', false)"
         />
         <AppButton 
            label="Valider le paiement" 
            variant="primary" 
            icon="pi pi-check"
            fullWidth
            :disabled="amountReceived < localTotal"
            :loading="loading"
            @click="handlePayment"
         />
      </div>

    </div>

    <!-- ÉTAPE SUCCÈS -->
    <div v-else-if="step === 'success'" class="flex flex-col gap-6 items-center text-center py-4">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <i class="pi pi-check text-4xl text-green-600"></i>
        </div>
        
        <div>
            <h3 class="text-2xl font-bold text-gray-800 mb-1">Vente Validée !</h3>
            <p class="text-gray-500">La transaction a été enregistrée avec succès.</p>
        </div>

        <div class="bg-gray-50 p-6 rounded-xl w-full border border-gray-100">
            <div class="text-sm  text-gray-500 uppercase tracking-wider mb-1">Monnaie à rendre</div>
            <div class="text-3xl font-bold text-primary">{{ formatPrice(successData?.change || 0) }}</div>
        </div>

        <div class="grid grid-cols-2 gap-4 w-full mt-2">
            <AppButton 
                label="Imprimer Ticket" 
                icon="pi pi-print" 
                variant="outline"
                size="sm"
                :loading="processingAction === 'print'"
                class="shadow-sm !bg-orange-500 !text-white"
                @click="handlePrint"
            />
            <AppButton 
                label="Télécharger PDF" 
                icon="pi pi-download" 
                variant="outline" 
                :loading="processingAction === 'download'"
                size="sm"
                class="shadow-sm !bg-blue-700 !text-white"
                @click="handleDownload"
            />
        </div>

        <div class="w-full pt-2">
            <AppButton 
                label="Terminer (Nouvelle Vente)" 
                variant="primary" 
                fullWidth
                size="sm"
                @click="handleCloseSuccess"
            />
        </div>
    </div>
</Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import AppButton from '~/components/button/AppButton.vue';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import { useCurrency } from '~/composables/useCurrency';

const props = defineProps<{
  visible: boolean;
  total: number;
  loading?: boolean;
  successData?: { venteId: string; change: number } | null;
}>();

const emit = defineEmits(['update:visible', 'confirm']);

const { generateReceiptPdf } = useSecurePdf();
const { currentCurrency, formatPrice } = useCurrency();

const paymentMethods = [
  { id: 'ESPECES', label: 'Espèces', icon: 'pi pi-money-bill' },
  { id: 'MOBILE_MONEY', label: 'Mobile', icon: 'pi pi-mobile' },
  { id: 'CARTE', label: 'Carte', icon: 'pi pi-credit-card' },
];

const selectedMethod = ref('ESPECES');
const amountReceived = ref(0);
const processingAction = ref<string | null>(null);
const step = ref<'payment' | 'success'>('payment'); // 'payment' ou 'success'

// Snapshot du total pour éviter le glitch visuel quand le panier est vidé (total -> 0) pendant la fermeture
const localTotal = ref(0);

const changeAmount = computed(() => amountReceived.value - localTotal.value);

// Watch pour détecter le passage en mode succès via les props
watch(() => props.successData, (newData) => {
    if (newData) {
        step.value = 'success';
        processingAction.value = null;
    }
}, { deep: true });

// Reset amount when modal opens
watch(() => props.visible, (newVal) => {
  if (newVal) {
    processingAction.value = null; // Reset loading state
    // Si on rouvre et qu'il n'y a pas de successData, on est en mode paiement
    if (!props.successData) {
        step.value = 'payment';
        localTotal.value = props.total;
        amountReceived.value = props.total;
        selectedMethod.value = 'ESPECES';
    }
  }
});

const currencyCode = computed(() => currentCurrency.value?.code || 'KMF');
const currencySuffix = computed(() => ` ${currentCurrency.value?.symbol || 'KMF'}`);
const currencyDecimals = computed(() => {
    return currentCurrency.value !== null ? currentCurrency.value.decimalPlaces : 2;
});


const handlePayment = () => {
  if (amountReceived.value < localTotal.value) return;
  
  // On émet juste la confirmation. Le parent va traiter et envoyer successData s'il réussit
  emit('confirm', {
    method: selectedMethod.value,
    amountReceived: amountReceived.value,
    change: changeAmount.value
  });
};

const handlePrint = async () => {
    if (!props.successData?.venteId) return;
    processingAction.value = 'print';
    try {
        await generateReceiptPdf(props.successData.venteId, 'print');
    } finally {
        processingAction.value = null;
    }
};

const handleDownload = async () => {
    if (!props.successData?.venteId) return;
    processingAction.value = 'download';
    try {
        await generateReceiptPdf(props.successData.venteId, 'download');
    } finally {
        processingAction.value = null;
    }
};

const handleCloseSuccess = () => {
    emit('update:visible', false);
    // Petit delai pour reset le step après animation
    setTimeout(() => {
        step.value = 'payment';
    }, 300);
};
</script>
