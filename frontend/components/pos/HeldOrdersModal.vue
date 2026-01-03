<template>
  <Dialog v-model:visible="visible" modal header="Commandes en attente" :style="{ width: '40rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" class="p-fluid">
    <div v-if="store.heldOrders.length === 0" class="flex flex-col items-center justify-center p-12 gap-4">
      <Icon icon="tabler:shopping-cart-x" class="text-5xl text-gray-300" />
      <p class="text-gray-500 font-medium">Aucune commande en attente</p>
    </div>
    
    <div v-else class="space-y-4 pt-4">
      <div v-for="(order, index) in store.heldOrders" :key="order.id" class="flex flex-col">
        <div class="p-3 sm:p-4 border-2 border-gris/40 rounded-2xl bg-white hover:border-primary/30 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 group relative z-10">
            <div class="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-bleu/40 rounded-xl flex items-center justify-center text-primary font-bold flex-shrink-0">
                    <Icon icon="tabler:clock" class="text-xl sm:text-2xl" />
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span class="font-bold text-noir text-sm">{{ formatTime(order.timestamp) }}</span>
                        <span v-if="order.reference" class="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider truncate max-w-[150px]">{{ order.reference }}</span>
                        <span v-else class="text-xs text-noir font-bold bg-gray-300 px-2 py-0.5 rounded-full">Commande N°{{ store.heldOrders.length - index }}</span>
                    </div>
                    <p class="text-[10px] sm:text-[11px] text-gray-500 font-medium uppercase tracking-wider truncate">
                        {{ order.cart.length }} article(s) • {{ getClientName(order.clientId) }}
                    </p>
                </div>
            </div>
            
            <div class="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-3 sm:pl-4 sm:border-l sm:border-gray-100">
                <div class="text-left sm:text-right mr-auto sm:mr-3">
                    <p class="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase">Total</p>
                    <p class="font-bold text-primary">{{ formatPrice(order.total) }}</p>
                </div>
                
                <div class="flex items-center gap-1">
                    <AppButton 
                        :icon="expandedOrders.includes(order.id) ? 'pi pi-chevron-up' : 'pi pi-eye'" 
                        variant="secondary" 
                        size="sm" 
                        @click="toggleDetails(order.id)"
                        class="!w-9 !h-9 !p-0 !bg-gray-100 !text-gray-600"
                        title="Voir les produits"
                    />

                    <AppButton 
                        icon="pi pi-refresh" 
                        variant="primary" 
                        size="sm" 
                        @click="resume(order.id)"
                        class="!w-9 !h-9 !p-0"
                        title="Reprendre la commande"
                    />
                    <AppButton 
                        icon="pi pi-trash" 
                        variant="outline" 
                        size="sm" 
                        @click="store.removeHeldOrder(order.id)"
                        class="!w-9 !h-9 !p-0 !text-red-500 !border-red-100 hover:!bg-red-50"
                        title="Supprimer"
                    />
                </div>
            </div>
        </div>

        <!-- Détails Produits (Accordeon) -->
        <div v-if="expandedOrders.includes(order.id)" class="bg-gray-50 border-x-2 border-b-2 border-gris/40 rounded-b-2xl mx-1 pt-6 pb-3 px-4 -mt-4 z-0 text-sm">
            <ul class="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                <li v-for="item in order.cart" :key="item.uniqueId" class="flex justify-between items-center border-b border-gray-200 pb-1 last:border-0 last:pb-0">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-primary bg-primary/10 px-1.5 rounded text-xs">{{ item.quantity }}x</span>
                        <span class="text-gray-700 text-sm truncate max-w-[200px]">
                            {{ item.name }} <span class="text-primary font-normal">({{ item.isPack ? item.packLabel : 'Unité' }})</span>
                        </span>
                    </div>
                    <span class="font-medium text-xs">{{ formatPrice(item.total) }}</span>
                </li>
            </ul>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end pt-4">
        <AppButton label="Fermer" variant="secondary" @click="visible = false" class="!w-auto px-8" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Dialog from 'primevue/dialog';
import AppButton from '~/components/button/AppButton.vue';
import { usePos } from '~/composables/api/usePos';
import { useCurrency } from '~/composables/useCurrency';
import { ref } from 'vue';

const visible = defineModel<boolean>('visible');
const store = usePos();
const { formatPrice } = useCurrency();
const expandedOrders = ref<string[]>([]);

const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getClientName = (clientId?: string | null) => {
    if (!clientId) return 'Client divers';
    const client = store.clients.find(c => c.id === clientId);
    return client ? client.nom : 'Client inconnu';
};

const resume = (id: string) => {
    store.resumeHeldOrder(id);
    visible.value = false;
};

const toggleDetails = (id: string) => {
    const index = expandedOrders.value.indexOf(id);
    if (index === -1) {
        expandedOrders.value.push(id);
    } else {
        expandedOrders.value.splice(index, 1);
    }
};
</script>

<style scoped>
:deep(.p-dialog-header) {
    background: #fdfdfd;
}
:deep(.p-dialog-footer) {
    border-top: 1px solid #f3f4f6;
    background: #fdfdfd;
}
</style>
