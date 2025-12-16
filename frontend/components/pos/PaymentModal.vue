<template>
  <Dialog 
    :visible="visible" 
    modal 
    header="Encaisser la commande" 
    :style="{ width: '500px' }" 
    :closable="true"
    @update:visible="val => $emit('update:visible', val)"
  >
    <div class="flex flex-col gap-6">
      
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
          <InputNumber 
            v-model="amountReceived" 
            mode="currency" 
            currency="KMF" 
            locale="fr-FR"
            class="w-full text-lg"
            :class="{ 'p-invalid': amountReceived < localTotal }"
            inputClass="text-center font-bold text-xl"
            autofocus
            @keyup.enter="handlePayment"
            @input="(e) => amountReceived = Number(e.value) || 0"
          />
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
            :loading="processing"
            @click="handlePayment"
         />
      </div>

    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import AppButton from '~/components/button/AppButton.vue';

const props = defineProps<{
  visible: boolean;
  total: number;
}>();

const emit = defineEmits(['update:visible', 'confirm']);

const paymentMethods = [
  { id: 'ESPECES', label: 'Espèces', icon: 'pi pi-money-bill' },
  { id: 'MOBILE_MONEY', label: 'Mobile', icon: 'pi pi-mobile' },
  { id: 'CARTE', label: 'Carte', icon: 'pi pi-credit-card' },
];

const selectedMethod = ref('ESPECES');
const amountReceived = ref(0);
const processing = ref(false);
// Snapshot du total pour éviter le glitch visuel quand le panier est vidé (total -> 0) pendant la fermeture
const localTotal = ref(0);

const changeAmount = computed(() => amountReceived.value - localTotal.value);

// Reset amount when modal opens
watch(() => props.visible, (newVal) => {
  if (newVal) {
    localTotal.value = props.total;
    amountReceived.value = props.total;
    selectedMethod.value = 'ESPECES';
  }
});

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'KMF',
    minimumFractionDigits: 0 
  }).format(amount);
};

const handlePayment = () => {
  if (amountReceived.value < localTotal.value) return;
  
  processing.value = true;
  
  setTimeout(() => {
    emit('confirm', {
      method: selectedMethod.value,
      amountReceived: amountReceived.value,
      change: changeAmount.value
    });
    processing.value = false;
  }, 800);
};
</script>
