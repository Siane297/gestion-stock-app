<template>
  <div class="flex flex-col h-full bg-bleu/20 border-2 rounded-lg p-3 border-gris/40">
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
        <i class="pi pi-shopping-bag text-5xl mb-4"></i>
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
                     <span v-if="item.isPack" class="text-orange-600 bg-orange-50 px-1.5 rounded text-[10px] font-bold">{{ item.packLabel }}</span>
                     <span v-else class="text-gray-400">Unité</span>
                     <span class="text-gray-400">x {{ formatPrice(item.price) }}</span>
                </div>
            </div>

            <!-- Total Item -->
            <div class="flex flex-col justify-center items-end min-w-[60px]">
                <span class="font-bold text-[#064654]">{{ formatPrice(item.total) }}</span>
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
      <div class="flex justify-between items-end mb-4">
        <span class="text-gray-500 text-sm">Total à payer</span>
        <span class="text-3xl font-bold text-[#064654] leading-none">{{ formatPrice(store.cartTotal) }}</span>
      </div>
      
      <div class="grid grid-cols-2 gap-3">
        <AppButton 
            label="Attente" 
            variant="secondary" 
            icon="pi pi-clock" 
            size="md"
            @click="handleHold"
            :disabled="store.cart.length === 0"
        />
        <AppButton 
            label="ENCAISSER" 
            variant="primary" 
            icon="pi pi-check-circle" 
            size="md"
            class="shadow-lg shadow-primary/30"
            @click="handleCheckoutClick"
            :disabled="store.cart.length === 0"
        />
      </div>
    </div>

    <PaymentModal 
        v-model:visible="showPayment"
        :total="store.cartTotal"
        @confirm="handlePaymentConfirm"
    />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePos } from '~/composables/api/usePos';
import { useToast } from 'primevue/usetoast';
import AppButton from '~/components/button/AppButton.vue';
import PaymentModal from '~/components/pos/PaymentModal.vue';

const store = usePos();
const toast = useToast();

const showPayment = ref(false);

const formatPrice = (p: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'KMF', maximumFractionDigits: 0 }).format(p);
};

const handleHold = () => {
    if (store.cart.length === 0) return;
    // TODO: Implement actual Hold logic (save to local storage or backend)
    // For now, just simulate
    toast.add({ severity: 'info', summary: 'Mis en attente', detail: 'La commande a été mise de côté', life: 3000 });
    store.clearCart();
};

const handleCheckoutClick = () => {
    showPayment.value = true;
};

const handlePaymentConfirm = async (paymentData: any) => {
    try {
        const success = await store.submitSale(paymentData);
        if (success) {
            toast.add({ 
                severity: 'success', 
                summary: 'Vente terminée', 
                detail: `Monnaie à rendre : ${formatPrice(paymentData.change)}`, 
                life: 5000 
            });
            showPayment.value = false;
            store.clearCart();
        }
    } catch (e: any) {
        toast.add({ 
            severity: 'error', 
            summary: 'Erreur vente', 
            detail: e.message || 'Impossible de valider la vente', 
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
