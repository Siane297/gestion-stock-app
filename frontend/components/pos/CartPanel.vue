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
            class="bg-white border rounded-lg p-2 shadow-sm flex gap-3 relative overflow-hidden group"
        >
            <!-- Qty Control -->
            <div class="flex flex-col items-center justify-center gap-1 bg-gray-50 rounded-md px-1 w-8">
                <button @click="store.updateQuantity(item.uniqueId, 1)" class="hover:text-primary transition-colors"><i class="pi pi-plus text-xs"></i></button>
                <span class="font-bold text-sm">{{ item.quantity }}</span>
                <button @click="store.updateQuantity(item.uniqueId, -1)" class="hover:text-red-500 transition-colors"><i class="pi pi-minus text-xs"></i></button>
            </div>

            <!-- Detail -->
            <div class="flex-1 min-w-0 flex flex-col justify-center">
                <div class="font-medium text-gray-800 truncate text-sm">
                    {{ item.name }}
                </div>
                <div class="flex items-center gap-2 text-xs">
                     <span v-if="item.isPack" class="text-orange-600 bg-orange-50 px-1.5 rounded text-[10px] font-bold">{{ item.packLabel }} (x{{ item.quantityInBase }})</span>
                     <span v-else class="text-orange-600 bg-orange-50 px-1.5 rounded text-[10px] font-bold">Unité</span>
                     <!-- <span class="text-gray-400">x {{ formatPrice(item.price) }}</span> -->
                </div>
            </div>

            <!-- Total Item -->
            <div class="flex flex-col justify-center items-end min-w-[60px]">
                <span class="font-bold text-primary">{{ formatPrice(item.total) }}</span>
            </div>

            <!-- Remove Button Slide -->
             <button 
                @click="store.removeFromCart(item.uniqueId)"
                class="absolute right-0 top-0 bottom-0 w-8 bg-red-50 text-red-500 flex items-center justify-center translate-x-full group-hover:translate-x-0 transition-transform shadow-l"
             >
                <i class="pi pi-times"></i>
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
            class="shadow-lg shadow-primary/30"
            @click="handleCheckoutClick"
            :disabled="store.cart.length === 0"
        />
      </div>
    </div>

    <PaymentModal 
        v-model:visible="showPayment"
        :total="store.cartTotal"
        :successData="paymentSuccessData"
        @confirm="handlePaymentConfirm"
    />

    <HeldOrdersModal 
        v-model:visible="showHeldOrders"
    />

    <Toast />
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

const store = usePos();
const toast = useToast();
const { formatPrice } = useCurrency();

const showPayment = ref(false);
const showHeldOrders = ref(false);
const paymentSuccessData = ref<{ venteId: string; change: number } | null>(null);

const handleHold = () => {
    if (store.cart.length === 0) return;
    
    store.holdCurrentCart();
    toast.add({ 
        severity: 'info', 
        summary: 'Mis en attente', 
        detail: 'La commande a été mise de côté pour plus tard', 
        life: 3000 
    });
};

const handleCheckoutClick = () => {
    paymentSuccessData.value = null; // Reset previous success
    showPayment.value = true;
};

const handlePaymentConfirm = async (paymentData: any) => {
    try {
        const result = await store.submitSale(paymentData);
        if (result && result.venteId) {
            // Succès : On passe les données à la modale pour afficher l'écran de succès
            paymentSuccessData.value = {
                venteId: result.venteId,
                change: paymentData.change
            };
            
            // On ne ferme PAS la modale ici via showPayment = false
            // La modale passera automatiquement à l'étape 'success' grâce au watcher sur successData
            
            toast.add({ 
                severity: 'success', 
                summary: 'Vente terminée', 
                detail: `Monnaie à rendre : ${formatPrice(paymentData.change)}`, 
                life: 5000 
            });
            // Le panier est déjà vidé par store.clearCart() dans submitSale
        }
    } catch (e: any) {
        console.error('Erreur validation vente:', e);
        // Extraction du message d'erreur spécifique du backend
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
