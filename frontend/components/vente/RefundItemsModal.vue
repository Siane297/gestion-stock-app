<template>
    <Dialog 
        v-model:visible="visible" 
        header="Sélectionner les articles à rembourser" 
        modal 
        :style="{ width: '600px', maxWidth: '95vw' }"
        :draggable="false"
        class="p-fluid"
        @hide="close"
    >
        <div class="flex flex-col gap-4 py-2">
            <div class="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm border border-blue-100 flex gap-2">
                <i class="pi pi-info-circle mt-0.5"></i>
                <p>
                    Veuillez ajuster les quantités des articles retournés. 
                    Supprimez les articles qui ne sont pas concernés par le remboursement.
                </p>
            </div>

            <div class="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
                <div v-if="localItems.length === 0" class="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                    <p>Aucun article sélectionné</p>
                </div>

                <div 
                    v-for="item in localItems" 
                    :key="item.venteDetailId"
                    class="bg-white border text-left border-gray-100 rounded-xl p-3 shadow-sm flex items-center gap-3 relative group"
                >
                    <!-- Image Produit -->
                    <div class="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden flex-shrink-0">
                        <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.nom" class="w-full h-full object-cover" />
                        <i v-else class="pi pi-box text-gray-400 text-xl"></i>
                    </div>

                    <!-- Infos -->
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-gray-800 text-sm truncate">{{ item.nom }}</h4>
                        <div class="flex flex-col gap-1">
                            <div class="flex items-center gap-2 text-xs text-gray-500">
                                <span class="bg-orange-100 px-1.5 py-0.5 rounded text-orange-600 font-medium">{{ item.conditionnement }}</span>
                                <span>x{{ item.originalQuantity }} vendus</span>
                            </div>
                            <!-- <div class="text-[11px] font-bold text-primary flex items-center gap-1">
                                <span class="opacity-70">{{ item.quantity }} × {{ formatPrice(item.unitPrice) }} =</span>
                                <span class="bg-primary/5 px-1.5 rounded">{{ formatPrice(item.quantity * item.unitPrice) }}</span>
                            </div> -->
                        </div>
                    </div>

                    <!-- Quantité Control -->
                    <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                        <button 
                            @click="updateQuantity(item, -1)" 
                            class="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
                            :disabled="item.quantity <= 1"
                        >
                            <i class="pi pi-minus text-[10px]"></i>
                        </button>
                        
                        <span class="w-8 text-center font-bold text-sm text-gray-900">{{ item.quantity }}</span>
                        
                        <button 
                            @click="updateQuantity(item, 1)" 
                            class="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary transition-colors disabled:opacity-50"
                            :disabled="item.quantity >= item.originalQuantity"
                        >
                            <i class="pi pi-plus text-[10px]"></i>
                        </button>
                    </div>

                    <!-- Delete Btn -->
                    <button 
                        @click="removeItem(item.venteDetailId)"
                        class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                        title="Ne pas rembourser cet article"
                    >
                        <i class="pi pi-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="flex flex-col gap-1 items-end pt-2 border-t border-gray-100 mt-2">
                <span class="text-xs text-gray-500">Total à rembourser (estimation)</span>
                <span class="text-xl font-black text-primary">{{ formatPrice(totalRefundAmount) }}</span>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2 pt-4">
                <AppButton label="Annuler" variant="secondary" @click="close" />
                <AppButton 
                    label="Confirmer le remboursement" 
                    icon="pi pi-check" 
                    @click="confirm" 
                    :disabled="localItems.length === 0"
                    variant="danger"
                />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import Dialog from 'primevue/dialog';
import AppButton from '~/components/button/AppButton.vue';
import { useCurrency } from '~/composables/useCurrency';
import type { VenteDetail } from '~/composables/api/useVenteApi';

const props = defineProps<{
    visible: boolean;
    saleDetails: VenteDetail[];
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'confirm', items: { venteDetailId: string; quantity: number }[]): void;
}>();

const { formatPrice } = useCurrency();

interface RefundItem {
    venteDetailId: string;
    nom: string;
    conditionnement: string;
    originalQuantity: number;
    quantity: number;
    unitPrice: number;
    imageUrl?: string;
}

const localItems = ref<RefundItem[]>([]);

const visible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
});

const initItems = () => {
    if (!props.saleDetails) return;
    localItems.value = props.saleDetails.map(d => ({
        venteDetailId: d.id,
        nom: d.produit?.nom || 'Produit inconnu',
        conditionnement: d.conditionnement?.nom || 'Unité',
        originalQuantity: d.quantite,
        quantity: d.quantite, // Default to full refund
        unitPrice: d.prix_unitaire,
        imageUrl: d.produit?.image_url
    }));
};

watch(() => props.visible, (newVal) => {
    if (newVal) {
        initItems();
    }
});

onMounted(() => {
    if (props.visible) {
        initItems();
    }
});

const updateQuantity = (item: RefundItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty > 0 && newQty <= item.originalQuantity) {
        item.quantity = newQty;
    }
};

const removeItem = (id: string) => {
    localItems.value = localItems.value.filter(i => i.venteDetailId !== id);
};

const totalRefundAmount = computed(() => {
    return localItems.value.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
});

const close = () => {
    visible.value = false;
};

const confirm = () => {
    const payload = localItems.value.map(i => ({
        venteDetailId: i.venteDetailId,
        quantity: i.quantity
    }));
    emit('confirm', payload);
    close();
};
</script>
