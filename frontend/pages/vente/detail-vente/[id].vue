<template>
    <div class="flex flex-col gap-6 w-full">
        <!-- 1. Header de Page (Navigation et Actions Rapides) -->
        <div class="w-full flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm gap-4">
            <div class="flex items-center gap-4 w-full md:w-auto">
                <button @click="router.back()" class="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 flex-shrink-0"
                    title="Retour">
                    <Icon icon="lucide:arrow-left" class="text-xl" />
                </button>
                <div class="min-w-0">
                    <h1 class="text-lg md:text-xl font-bold text-noir truncate">Détail de la vente</h1>
                    <p class="text-xs text-gray-500 truncate">Consultez et gérez les informations</p>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                <AppButton label="Ticket" icon="pi pi-receipt" variant="outline" size="sm" :loading="printingReceipt"
                    class="w-full sm:w-auto" @click="handlePrintReceipt" />
                <AppButton label="Proforma (A4)" icon="pi pi-print" variant="primary" size="sm"
                    class="w-full sm:w-auto" :loading="printingProforma" @click="handlePrintProforma" />
            </div>
        </div>

        <!-- 2. États de Chargement -->
        <div v-if="loading"
            class="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Icon icon="tabler:loader-2" class="text-5xl text-primary animate-spin" />
            <p class="text-gray-500 font-medium">Chargement des détails de la vente...</p>
        </div>

        <!-- 3. Contenu de la Vente -->
        <div v-else-if="vente" class="flex flex-col gap-6">
            <!-- 3.1 Informations Générales (Prend 100% de la largeur) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-side2 p-6 rounded-3xl">
                <!-- Bloc Vente -->
                <div class="space-y-4">
                    <div class="flex items-center gap-2 text-white">
                        <Icon icon="tabler:info-circle" class="text-xl" />
                        <span class="font-bold uppercase tracking-widest text-[10px]">Informations Vente</span>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between border-b border-white/10 pb-1">
                            <span class="text-xs text-white/70">ID Vente</span>
                            <span class="text-xs font-bold text-white">#{{ vente.id.substring(0, 8).toUpperCase() }}</span>
                        </div>
                        <div class="flex justify-between border-b border-white/10 pb-1">
                            <span class="text-xs text-white/70">Date & Heure</span>
                            <span class="text-xs font-bold text-white">{{ formatDate(vente.date_creation) }} à {{ formatTime(vente.date_creation) }}</span>
                        </div>
                        <div class="flex justify-between border-b border-white/10 pb-1">
                            <span class="text-xs text-white/70">Boutique</span>
                            <span class="text-xs font-bold text-white">{{ vente.magasin?.nom }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-xs text-white/70">Vendeur</span>
                            <span class="text-xs font-bold text-white">{{ vente.utilisateur?.employee?.fullName || vente.utilisateur?.email }}</span>
                        </div>
                    </div>
                </div>

                <!-- Bloc Client -->
                <div class="space-y-4">
                    <div class="flex items-center gap-2 text-white/60">
                        <Icon icon="tabler:user" class="text-xl" />
                        <span class="font-bold uppercase tracking-widest text-[10px]">Client & Paiement</span>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between border-b border-white/10 pb-1">
                            <span class="text-xs text-white/70">Client</span>
                            <span class="text-xs font-bold text-white">{{ vente.client?.nom || 'Client de passage' }}</span>
                        </div>
                        <div class="flex justify-between border-b border-white/10 pb-1">
                            <span class="text-xs text-white/70">Méthode</span>
                            <span class="text-xs font-bold text-white">{{ vente.methode_paiement }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-white/70">Statut actuel</span>
                            <Badge :value="vente.statut" :severity="getSeverity(vente.statut)" class="!text-[10px] !px-2 !py-0.5 !rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3.2 Détails et Sidebar -->
            <!-- 3.2 Détails et Sidebar (Utilisation du grid order pour le responsive) -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                <!-- 1. Gestion du statut (Mobile: 1er | Desktop: Colonne Droite Haut) -->
                <div class="order-1 lg:order-2 lg:col-start-3 lg:row-start-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div class="flex items-center gap-2 text-noir">
                        <Icon icon="tabler:settings" class="text-xl text-primary" />
                        <span class="font-bold text-sm">Gestion du statut</span>
                    </div>
                    <div class="space-y-3">
                        <Select v-model="localStatut" :options="statutOptions" optionLabel="label" optionValue="value"
                            placeholder="Changer le statut" class="w-full !rounded-xl !text-sm !bg-gray-50" />
                        <AppButton label="Mettre à jour" :loading="updating" :disabled="localStatut === vente.statut"
                            variant="primary" fullWidth @click="handleStatusUpdate" />
                    </div>
                </div>

                <!-- 2. Colonne Gauche : Liste des Produits (Mobile: 2ème | Desktop: Colonne Gauche) -->
                <div class="order-2 lg:order-1 lg:col-span-2 lg:row-span-2 space-y-6">
                    <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div class="flex items-center justify-between border-l-4 border-primary pl-3">
                            <h4 class="font-bold text-noir text-sm uppercase tracking-wider">Produits commandés</h4>
                            <span class="text-xs text-gray-500 font-medium">{{ vente.details?.length || 0 }} articles</span>
                        </div>

                        <!-- Vue Table (Desktop) -->
                        <TableSimple :columns="columns" :data="vente.details || []" :showActions="false"
                            class="hidden md:block !rounded-2xl overflow-visible">
                            <template #column-produit_info="{ data }">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden flex-shrink-0">
                                        <img v-if="data.produit?.image_url" :src="data.produit.image_url" :alt="data.produit?.nom" class="w-full h-full object-cover" />
                                        <i v-else class="pi pi-box text-gray-400"></i>
                                    </div>
                                    <span class="font-bold text-gray-800 text-sm">{{ data.produit?.nom }}</span>
                                </div>
                            </template>
                            <template #column-quantite_display="{ data }">
                                <div class="flex flex-col gap-0.5">
                                    <div class="flex items-center gap-4">
                                        <span class="font-bold text-noir">{{ data.quantite }}</span>
                                        <span class=" text-[13px] text-vert font-medium">{{ data.conditionnement?.nom || 'Unité' }}</span>
                                    </div>
                                    <div v-if="data.quantite_remboursee > 0" class="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full w-fit">
                                        <Icon icon="tabler:arrow-back-up" />
                                        <span>{{ data.quantite_remboursee }} remboursé(s)</span>
                                    </div>
                                </div>
                            </template>
                            <template #column-remise="{ data }">
                                <span v-if="data.remise > 0" class="text-red-500 font-bold text-xs">-{{ formatPrice(data.remise) }}</span>
                                <span v-else class="text-gray-300">-</span>
                            </template>
                            <template #column-prix_total="{ data }">
                                <span class="text-primary font-black text-sm">{{ formatPrice(data.prix_total) }}</span>
                            </template>
                        </TableSimple>

                        <!-- Vue Cartes (Mobile) -->
                        <div class="grid grid-cols-2 gap-3 md:hidden">
                            <MobileCard v-for="item in vente.details" :key="item.id">
                                <template #header>
                                    <div class="flex items-center gap-3">
                                        <div class="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden flex-shrink-0">
                                            <img v-if="item.produit?.image_url" :src="item.produit.image_url" :alt="item.produit?.nom" class="w-full h-full object-cover" />
                                            <i v-else class="pi pi-box text-gray-400 text-xl"></i>
                                        </div>
                                        <div class="flex flex-col">
                                            <span class="font-bold text-noir text-sm">{{ item.produit?.nom }}</span>
                                            <span class="text-xs text-gray-500">{{ item.conditionnement?.nom || 'Unité' }}</span>
                                        </div>
                                    </div>
                                </template>

                                <div class="flex flex-col gap-2">
                                    <div class="flex justify-between items-center text-sm">
                                        <span class="text-gray-500">Quantité vendue</span>
                                        <span class="font-bold text-noir">{{ item.quantite }}</span>
                                    </div>
                                    <div v-if="item.quantite_remboursee > 0" class="flex justify-between items-center bg-red-50 p-2 rounded-lg border border-red-100">
                                        <span class="text-[11px] font-bold text-red-600 flex items-center gap-1">
                                            <Icon icon="tabler:arrow-back-up" />
                                            Remboursé
                                        </span>
                                        <span class="text-xs font-black text-red-600">{{ item.quantite_remboursee }} unités</span>
                                    </div>
                                    <div class="flex justify-between items-center text-sm border-t border-gray-50 pt-2">
                                        <span class="text-gray-500">Prix unitaire</span>
                                        <span class="text-gray-700 font-medium">{{ formatPrice(item.prix_unitaire) }}</span>
                                    </div>
                                    <div class="flex justify-between items-center text-sm border-t border-gray-100 pt-2 bg-gray-50/50 -mx-4 -mb-4 p-3 rounded-b-xl">
                                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</span>
                                        <span class="text-primary font-black">
                                            {{ formatPrice(item.prix_total) }}
                                        </span>
                                    </div>
                                </div>
                            </MobileCard>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div v-if="vente.notes" class="p-5 bg-orange-50 border border-orange-100 rounded-3xl">
                        <div class="flex items-center gap-2 text-orange-600 mb-2">
                            <Icon icon="tabler:note" class="text-xl" />
                            <span class="text-[10px] font-black uppercase tracking-widest">Observations</span>
                        </div>
                        <p class="text-sm text-orange-900 leading-relaxed italic">{{ vente.notes }}</p>
                    </div>
                </div>
                <!-- 3. Résumé Financier (Mobile: 3ème | Desktop: Colonne Droite Bas) -->
                <div class="order-3 lg:order-3 lg:col-start-3 lg:row-start-2 bg-primary p-6 rounded-[2rem] text-white space-y-6 relative overflow-hidden">
                    <div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                    <div class="flex items-center gap-2 mb-4">
                        <Icon icon="tabler:calculator" class="text-xl" />
                        <span class="font-bold uppercase tracking-widest text-[10px]">Résumé de la vente</span>
                    </div>
                    <div class="space-y-4">
                        <!-- <div class="flex justify-between items-center text-sm opacity-80">
                            <span>Sous-total</span>
                            <span class="font-bold">{{ formatPrice(vente.montant_total + (vente.montant_remise || 0)) }}</span>
                        </div> -->
                        <div v-if="vente.montant_remise > 0" class="flex justify-between items-center text-sm">
                            <span class="text-white/70">Remise Globale</span>
                            <span class="text-red-400 font-black">-{{ formatPrice(vente.montant_remise) }}</span>
                        </div>
                        
                        <div v-if="montantRembourse > 0" class="flex justify-between items-center text-sm">
                            <span class="text-white font-black uppercase tracking-widest">Total Remboursé</span>
                            <span class="text-orange-300 text-[17px] font-black">-{{ formatPrice(montantRembourse) }}</span>
                        </div>

                        <hr class="border-white/30" />
                        
                        <div class="flex flex-col gap-1">
                            <span class="text-[10px] font-black uppercase tracking-widest" :class="montantRembourse > 0 ? 'text-white' : 'text-white/80'">
                                {{ montantRembourse > 0 ? 'Total Initial' : 'Total Net' }}
                            </span>
                            <span class="font-black text-white" :class="montantRembourse > 0 ? 'text-2xl line-through' : 'text-2xl'">
                                {{ formatPrice(vente.montant_total) }}
                            </span>
                        </div>

                        <div v-if="montantRembourse > 0" class="flex flex-col gap-1 pt-2">
                            <span class="text-[10px] font-black uppercase tracking-widest text-orange-300">Total Net Restant</span>
                            <span class="text-2xl font-black text-white">{{ formatPrice(vente.montant_total - montantRembourse) }}</span>
                        </div>
                        <hr class="border-white/30" />
                        <div class="grid grid-cols-2 gap-4 pt-2">
                            <div class="flex flex-col gap-0.5">
                                <span class="text-[10px] font-bold text-white/80 uppercase">Payé</span>
                                <span class="text-sm font-bold">{{ formatPrice(vente.montant_paye) }}</span>
                            </div>
                            <div class="flex flex-col gap-0.5 items-end">
                                <span class="text-[10px] font-bold text-white/80 uppercase">Rendu</span>
                                <span class="text-sm font-bold text-green-400">{{ formatPrice(vente.montant_rendu) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <RefundItemsModal
                v-model:visible="showRefundModal"
                :sale-details="vente?.details || []"
                @confirm="handleRefundConfirm"
            />
        </div>

        <!-- 4. État Erreur / Non trouvé -->
        <div v-else class="bg-white py-20 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center text-center px-6">
            <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <Icon icon="tabler:alert-triangle" class="text-red-500 text-4xl" />
            </div>
            <h3 class="text-xl font-bold text-noir">Vente introuvable</h3>
            <p class="text-gray-500 mt-2 max-w-sm">Désolé, nous ne parvenons pas à récupérer les informations de cette vente.</p>
            <AppButton label="Retourner aux ventes" variant="outline" class="mt-8" @click="navigateTo('/vente')" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import Select from 'primevue/select';
import Badge from 'primevue/badge';
import { useToast } from 'primevue/usetoast';
import AppButton from '~/components/button/AppButton.vue';
import TableSimple from '~/components/table/TableSimple.vue';
import MobileCard from '~/components/mobile/MobileCard.vue';
import RefundItemsModal from '~/components/vente/RefundItemsModal.vue';
import { useVenteApi, type Vente, type StatutVente } from '~/composables/api/useVenteApi';
import { useCurrency } from '~/composables/useCurrency';
import { useSecurePdf } from '~/composables/useSecurePdf';

// --- Page Meta ---
definePageMeta({
    hideBreadcrumb: true
});

// --- State ---
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { getVenteById, updateVenteStatut } = useVenteApi();
const { formatPrice } = useCurrency();
const { generateReceiptPdf, generateProformaPdf } = useSecurePdf();

const vente = ref<Vente | null>(null);
const loading = ref(true);
const updating = ref(false);
const printingReceipt = ref(false);
const printingProforma = ref(false);
const localStatut = ref<StatutVente | null>(null);
const showRefundModal = ref(false);

const montantRembourse = computed(() => {
    if (!vente.value?.details) return 0;
    return vente.value.details.reduce((acc, detail) => acc + (detail.quantite_remboursee * detail.prix_unitaire), 0);
});

// Watch for status changes to trigger modal automatically
watch(localStatut, (newStatut) => {
    if (newStatut === 'REMBOURSEE') {
        showRefundModal.value = true;
    }
});

// Reset status if modal is closed without confirmation
watch(showRefundModal, (isVisible) => {
    // If modal is closed and the current displayed status is still not a refund status
    if (!isVisible && localStatut.value === 'REMBOURSEE') {
        const currentStatut = vente.value?.statut;
        if (currentStatut !== 'REMBOURSEE' && currentStatut !== 'PARTIELLEMENT_REMBOURSEE') {
            localStatut.value = currentStatut || null;
        }
    }
});

// --- Table Configuration ---
import { type TableColumn } from '~/components/table/TableSimple.vue';
const columns: TableColumn[] = [
    { field: 'produit_info', header: 'Produit', customRender: true },
    { field: 'quantite_display', header: 'Qté / Cond.', customRender: true },
    { field: 'prix_unitaire', header: 'Unit.', type: 'price' },
    // { field: 'remise', header: 'Remise', customRender: true },
    { field: 'prix_total', header: 'Total', customRender: true },
];

const statutOptions = [
    { label: 'Payée', value: 'PAYEE' },
    { label: 'En attente', value: 'EN_ATTENTE' },
    { label: 'Annulée', value: 'ANNULEE' },
    { label: 'Remboursée', value: 'REMBOURSEE' },
];

// --- Initialization ---
const fetchVenteDetails = async () => {
    const id = route.params.id as string;
    if (!id) return;

    loading.value = true;
    try {
        const data = await getVenteById(id);
        if (data) {
            vente.value = data;
            localStatut.value = data.statut;
        }
    } catch (error) {
        console.error('Erreur lors du chargement de la vente:', error);
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les détails', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// --- Actions ---
const handleStatusUpdate = async () => {
    if (!vente.value || !localStatut.value || localStatut.value === vente.value.statut) {
        return;
    }

    if (localStatut.value === 'REMBOURSEE') {
        showRefundModal.value = true;
        return;
    }

    await performStatusUpdate(localStatut.value);
};

const performStatusUpdate = async (statut: StatutVente, returnedItems?: { venteDetailId: string, quantity: number }[]) => {
    if (!vente.value) return;
    
    updating.value = true;
    try {
        const success = await updateVenteStatut(vente.value.id, statut, returnedItems);
        if (success) {
            toast.add({ severity: 'success', summary: 'Succès', detail: 'Statut mis à jour', life: 2000 });
            await fetchVenteDetails(); // Re-fetch to get updated details (quantite_remboursee)
        }
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Mise à jour échouée', life: 3000 });
    } finally {
        updating.value = false;
    }
};

const handleRefundConfirm = (items: { venteDetailId: string; quantity: number }[]) => {
    performStatusUpdate('REMBOURSEE', items);
};

const handlePrintReceipt = async () => {
    if (!vente.value) return;
    printingReceipt.value = true;
    try {
        await generateReceiptPdf(vente.value.id, 'download');
    } finally {
        printingReceipt.value = false;
    }
};

const handlePrintProforma = async () => {
    if (!vente.value) return;
    printingProforma.value = true;
    try {
        await generateProformaPdf(vente.value.id, 'download');
    } finally {
        printingProforma.value = false;
    }
};

// --- Formatters ---
const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
});
const formatTime = (date: string) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const getSeverity = (status: string) => {
    switch (status) {
        case 'PAYEE': return 'success';
        case 'EN_ATTENTE': return 'warning';
        case 'ANNULEE': return 'danger';
        case 'REMBOURSEE': return 'info';
        case 'PARTIELLEMENT_REMBOURSEE': return 'info';
        default: return 'secondary';
    }
};

onMounted(fetchVenteDetails);
</script>