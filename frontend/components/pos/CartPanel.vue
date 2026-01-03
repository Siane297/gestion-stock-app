<template>
  <div class="flex flex-col h-[600px] bg-bleu/40 border-2 rounded-lg p-3 border-gris/40">
    <!-- Header Panier -->
    <div class="p-4 border-b border-gray-100 rounded-t-lg bg-primary flex justify-between items-center">
      <h2 class="font-bold text-white flex items-center gap-2">
        <i class="pi pi-shopping-cart text-white"></i>
        Panier 
        <span v-if="store.currentMagasin" class="text-xs bg-white/20 px-2 py-0.5 rounded font-normal">
            {{ store.currentMagasin.nom }}
        </span>
      </h2>
      <button 
        v-if="store.cartCount > 0"
        @click="store.clearCart" 
        class="text-xs text-red-500 bg-red-50 hover:bg-red-50 py-2 px-3 rounded transition-colors"
      >
        <i class="pi pi-trash"></i> Vider
      </button>
    </div>

    <!-- Client Selector (Placeholder) -->
    <div class="p-3 border-b border-gray-100 rounded-lg">
        <div class="relative">
            <Dropdown 
                v-model="store.selectedClientId" 
                :options="store.clients" 
                optionLabel="nom" 
                optionValue="id" 
                placeholder="Client divers (Défaut)" 
                class="w-full"
                filter
                showClear
            >
                <template #value="slotProps">
                    <div v-if="slotProps.value" class="flex items-center">
                        <i class="pi pi-user mr-2 text-primary"></i>
                        <div>{{ store.clients.find(c => c.id === slotProps.value)?.nom }}</div>
                    </div>
                    <div v-else class="flex items-center text-gray-500">
                        <i class="pi pi-user mr-2"></i>
                        <div>{{ slotProps.placeholder }}</div>
                    </div>
                </template>
                <template #option="slotProps">
                    <div class="flex items-center">
                        <i class="pi pi-user mr-2 text-gray-400"></i>
                        <div>{{ slotProps.option.nom }}</div>
                    </div>
                </template>
            </Dropdown>
        </div>
    </div>

    <!-- Liste Items -->
    <div class="flex-1 overflow-y-auto p-2 space-y-2 rounded-lg">
      <div v-if="store.cart.length === 0" class="h-full flex bg-white border-2 border-dashed flex-col py-5 items-center justify-center text-gray-400 rounded-lg">
        <i class="pi pi-shopping-bag text-3xl mb-4"></i>
        <p>Le panier est vide</p>
        <p class="text-sm">Sélectionnez des articles à gauche</p>
      </div>

      <transition-group name="list">
        <div 
            v-for="item in store.cart" 
            :key="item.uniqueId"
            class="bg-white border z-50 overflow-visible border-gray-100 rounded-xl p-2 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2.5 relative group"
        >
            <!-- Image (Left) -->
            <div class="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                <i v-else class="pi pi-image text-gray-400 text-lg"></i>
            </div>

            <!-- Detail (Middle) -->
            <div class="flex-1 min-w-0 flex flex-col justify-center gap-0.5 pr-6">
                <div class="font-bold text-gray-800 truncate text-sm leading-tight" :title="item.name">
                    {{ item.name }}
                </div>
                <!-- Badge & Unit Price -->
                <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-500">
                     <span v-if="item.isPack" class="text-primary bg-primary/10 px-1 py-0.5 rounded font-bold whitespace-nowrap">{{ item.packLabel }} (x{{ item.quantityInBase }})</span>
                     <span v-else class="text-orange-600 bg-orange-50 px-1 py-0.5 rounded font-bold whitespace-nowrap">Unité</span>
                     <span class="text-gray-400 whitespace-nowrap">{{ formatPrice(item.price) }}</span>
                </div>
            </div>

            <!-- Total & Qty (Right) -->
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
                <span class="font-bold text-primary text-sm whitespace-nowrap">{{ formatPrice(item.total) }}</span>
                
                <div class="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200/50">
                    <button 
                        @click="store.updateQuantity(item.uniqueId, -1)" 
                        class="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-white rounded-md transition-all"
                    >
                        <i class="pi pi-minus text-[8px] font-bold"></i>
                    </button>
                    
                    <span class="w-6 text-center font-bold text-[11px] text-gray-800">{{ item.quantity }}</span>
                    
                    <button 
                        @click="store.updateQuantity(item.uniqueId, 1)" 
                        class="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-white rounded-md transition-all"
                    >
                        <i class="pi pi-plus text-[8px] font-bold"></i>
                    </button>
                </div>
            </div>

            <!-- Absolute Delete Button -->
             <button 
                @click="store.removeFromCart(item.uniqueId)"
                class="absolute -top-3 -right-1 w-6 h-6 bg-red-500 flex items-center  justify-center text-white rounded-md transition-all"
                title="Retirer du panier"
             >
                <i class="pi pi-times text-xs"></i>
             </button>
        </div>
      </transition-group>
    </div>

    <!-- Footer Totaux -->
    <div class="p-4 bg-white rounded-lg border-2 border-gray-200 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10">
      <div v-if="store.heldOrders.length > 0" class="mb-3">
          <AppButton 
            :label="`Commandes en attente (${store.heldOrders.length})`"
            variant="outline"
            icon="pi pi-list"
            size="sm"
            class="w-full !border-primary/30 !text-primary hover:!bg-primary/5"
            @click="showHeldOrders = true"
          />
      </div>

      <div class="flex justify-between items-end mb-4">
        <span class="text-noir text-sm">Total à payer</span>
        <span class="text-xl font-bold text-primary leading-none">{{ formatPrice(store.cartTotal) }}</span>
      </div>
      
      <div class="grid grid-cols-2 gap-3">
        <AppButton 
            label="Attente" 
            variant="outline" 
            icon="pi pi-clock" 
            size="sm"
            @click="handleHold"
            :disabled="store.cart.length === 0"
        />
        <AppButton 
            label="Encaisser" 
            variant="primary" 
            icon="pi pi-check-circle" 
            size="sm"
            class=""
            @click="handleCheckoutClick"
            :disabled="store.cart.length === 0"
        />
      </div>
    </div>

    <PaymentModal 
        v-model:visible="showPayment"
        :total="store.cartTotal"
        :loading="isSubmitting"
        :successData="paymentSuccessData"
        @confirm="handlePaymentConfirm"
    />

    <HeldOrdersModal 
        v-model:visible="showHeldOrders"
    />

    <!-- Dialog Reference Commande en attente -->
    <Dialog v-model:visible="showHoldDialog" header="Mettre en attente" modal :style="{ width: '400px' }" class="p-fluid">
        <div class="flex flex-col gap-4 pt-2">
            <span class="text-gray-600">Ajouter une référence pour retrouver cette commande facilement (optionnel).</span>
            <div class="flex flex-col gap-2">
                <label for="ref" class="font-bold text-sm">Nom / Référence</label>
                <InputText id="ref" v-model="holdReference" placeholder="Ex: Entrer une référence..." autofocus @keyup.enter="confirmHold" />
            </div>
        </div>
        <template #footer>
            <div class="flex justify-end gap-2 pt-2">
                <AppButton label="Annuler" variant="secondary" @click="showHoldDialog = false" />
                <AppButton label="Confirmer" variant="primary" icon="pi pi-check" @click="confirmHold" />
            </div>
        </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePos } from '~/composables/api/usePos';
import { useToast } from 'primevue/usetoast';
import { useCurrency } from '~/composables/useCurrency';
import AppButton from '~/components/button/AppButton.vue';
import PaymentModal from './PaymentModal.vue';
import HeldOrdersModal from './HeldOrdersModal.vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';

const store = usePos();
const toast = useToast();
const { formatPrice } = useCurrency();

const showPayment = ref(false);
const showHeldOrders = ref(false);
const showHoldDialog = ref(false);
const holdReference = ref('');
const isSubmitting = ref(false);
const paymentSuccessData = ref<{ venteId: string; change: number } | null>(null);

const handleHold = () => {
    if (store.cart.length === 0) return;
    holdReference.value = '';
    showHoldDialog.value = true;
};

const confirmHold = () => {
    store.holdCurrentCart(holdReference.value);
    showHoldDialog.value = false;
    toast.add({ 
        severity: 'info', 
        summary: 'Mis en attente', 
        detail: 'La commande a été mise de côté avec succès', 
        life: 3000 
    });
};

const handleCheckoutClick = () => {
    paymentSuccessData.value = null; // Reset previous success
    showPayment.value = true;
};

const handlePaymentConfirm = async (paymentData: any) => {
    isSubmitting.value = true;
    try {
        const result = await store.submitSale(paymentData);
        if (result && result.venteId) {
            // Succès : On passe les données à la modale pour afficher l'écran de succès
            paymentSuccessData.value = {
                venteId: result.venteId,
                change: paymentData.change
            };
            
            toast.add({ 
                severity: 'success', 
                summary: 'Vente terminée', 
                detail: `Monnaie à rendre : ${formatPrice(paymentData.change)}`, 
                life: 5000 
            });
        }
    } catch (e: any) {
        console.error('Erreur validation vente:', e);
        
        let errorMessage = 'Impossible de valider la vente';
        
        if (e.response && e.response._data && e.response._data.message) {
            errorMessage = e.response._data.message;
        } else if (e.data && e.data.message) {
            errorMessage = e.data.message;
        } else if (e.message) {
            errorMessage = e.message;
        }

        toast.add({ 
            severity: 'error', 
            summary: 'Erreur vente', 
            detail: errorMessage, 
            life: 5000 
        });
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style scoped>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
