<template>
  <Dialog v-model:visible="visible" modal header="Commandes en attente" :style="{ width: '40rem' }" class="p-fluid">
    <div v-if="store.heldOrders.length === 0" class="flex flex-col items-center justify-center p-12 gap-4">
      <Icon icon="tabler:shopping-cart-x" class="text-5xl text-gray-300" />
      <p class="text-gray-500 font-medium">Aucune commande en attente</p>
    </div>
    
    <div v-else class="space-y-4 pt-4">
      <div v-for="order in store.heldOrders" :key="order.id" class="p-4 border-2 border-gris/40 rounded-2xl bg-white hover:border-primary/30 transition-all flex justify-between items-center group">
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-bleu/40 rounded-xl flex items-center justify-center text-primary font-bold">
                <Icon icon="tabler:clock" class="text-2xl" />
            </div>
            <div>
                <div class="flex items-center gap-2">
                    <span class="font-bold text-noir text-sm">{{ formatTime(order.timestamp) }}</span>
                    <span class="text-xs text-gray-400 font-mono">#{{ order.id }}</span>
                </div>
                <p class="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                    {{ order.cart.length }} article(s) • {{ getClientName(order.clientId) }}
                </p>
            </div>
        </div>
        
        <div class="flex items-center gap-3">
            <div class="text-right mr-2">
                <p class="text-xs text-gray-400 font-semibold uppercase">Total</p>
                <p class="font-bold text-primary">{{ formatPrice(order.total) }}</p>
            </div>
            
            <AppButton 
                icon="pi pi-refresh" 
                variant="primary" 
                size="sm" 
                @click="resume(order.id)"
                class="!w-10 !h-10 !p-0"
            />
            <AppButton 
                icon="pi pi-trash" 
                variant="outline" 
                size="sm" 
                @click="store.removeHeldOrder(order.id)"
                class="!w-10 !h-10 !p-0 !text-red-500 !border-red-100 hover:!bg-red-50"
            />
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

const visible = defineModel<boolean>('visible');
const store = usePos();
const { formatPrice } = useCurrency();

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
