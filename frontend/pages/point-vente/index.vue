<template>
    <div
        class="flex flex-col lg:flex-row bg-white p-4 rounded-lg border-2 border-gris/40 gap-4 relative min-h-screen pb-24 lg:pb-4">
        <!-- Overlay Verrouillage -->
        <div v-if="caisseStore.isLocked"
            class="absolute inset-0  z-[30] bg-white flex flex-col items-center justify-center p-4">
            <div class="text-center mb-8">
                <div class="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                    <Iconify icon="tabler:lock" class="text-3xl text-white" />
                </div>
                <h2 class="text-2xl font-bold text-noir mb-2">Interface Verrouillée</h2>
                <p class="text-noir/60">Saisissez votre PIN pour continuer</p>
            </div>

            <PinPad :loading="unlocking" :error="pinError" @submit="handleUnlock" />

            <!-- Bouton Accès Admin (pour ADMIN/SUPER_ADMIN uniquement) -->
            <div v-if="isAdminUser" class="pt-4  w-[385px] flex justify-center border-t">
                <AppButton label="Déverrouiller (Admin)" variant="outline" icon="pi pi-shield" size="md" full-width
                    :loading="unlocking" @click="handleAdminUnlock" class="!bg-orange-500  text-white" />
            </div>
        </div>

        <!-- Zone Marge Gauche (Catalogue) -->
        <div class="flex-1 flex flex-col min-w-0" :class="activeMobileTab === 'catalog' ? 'block' : 'hidden lg:flex'">
            
            <!-- Banner User -->
            <PosUserBanner 
                @lock="caisseStore.lock()" 
                @logout="handleLogout" 
            />

            <!-- Grid Content -->
            <div class="flex-1 overflow-y-auto ">

                <!-- Top Bar (With Search, Scanner) -->
                <div
                    class="bg-white border-2 border-gris/40 p-4  z-10 flex items-center gap-4 justify-between rounded-xl mb-6 sticky top-0">
                    <!-- Search -->
                    <div class="relative flex-1 flex gap-2">
                        <div class="relative flex-1">
                            <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input v-model="store.searchQuery" type="text"
                                placeholder="Rechercher un produit (Nom, code barre)..."
                                class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                autofocus />
                        </div>
                        <AppButton 
                            icon="pi pi-barcode" 
                            variant="primary" 
                            class="!h-auto !py-3 !px-4"
                            @click="showScanner = true"
                        />
                    </div>
                </div>

                <!-- Filter Categories -->
                <div class="flex gap-2 border-b border-gray-200 overflow-x-auto max-w-4xl pb-4 scrollbar-hide mb-4">
                    <button @click="store.selectedCategory = null" :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                        !store.selectedCategory ? 'bg-side2 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
                    ]">
                        Tout
                    </button>
                    <button v-for="cat in uniqueCategories" :key="cat" @click="store.selectedCategory = cat" :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                        store.selectedCategory === cat ? 'bg-side2 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
                    ]">
                        {{ cat }}
                    </button>
                </div>

                <div v-if="store.loading" class="flex justify-center items-center h-full">
                    <ProgressSpinner strokeWidth="2" />
                </div>

                <div v-else-if="store.filteredItems.length === 0"
                    class="flex flex-col items-center justify-center h-64 text-gray-400">
                    <i class="pi pi-search text-4xl mb-2"></i>
                    <p>Aucun produit trouvé</p>
                </div>

                <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3">
                    <ProductCard v-for="item in store.filteredItems" :key="item.uniqueId" :item="item"
                        @add="handleAddToCart" />
                </div>
            </div>
        </div>

        <!-- Zone Droite (Panier) -->
        <div class="w-full lg:w-[350px]" :class="activeMobileTab === 'cart' ? 'block' : 'hidden lg:block'">
            <CartPanel />
        </div>

        <!-- Mobile Bottom Navigation -->
        <div
            class="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex gap-2 bg-white/95 backdrop-blur-md p-5 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <AppButton @click="activeMobileTab = 'catalog'" class="flex-1"
                :variant="activeMobileTab === 'catalog' ? 'primary' : 'secondary'" icon="pi pi-list"
                label="Catalogue" />
            <AppButton @click="activeMobileTab = 'cart'" class="flex-1 !overflow-visible"
                :variant="activeMobileTab === 'cart' ? 'primary' : 'secondary'">
                <div class="flex items-center justify-center gap-2 relative w-full">
                    <Iconify icon="tabler:shopping-cart" class="text-xl" />
                    <span>Panier</span>
                    <div v-if="store.cart.length > 0"
                        class="absolute -top-4 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-20">
                        {{ store.cart.length }}
                    </div>
                </div>
            </AppButton>
        </div>

        <!-- Dialogue de Clôture (Nouveau Composant) -->
        <ClosureDialog 
            v-model:visible="showClosureDialog"
            :session="caisseStore.activeSession"
            @success="onClosureSuccess"
        />
            
        <!-- Scanner -->
        <BarcodeScanner 
            v-model="showScanner" 
            :auto-close="false"
            @scan="handleScanResult" 
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { Icon as Iconify } from '@iconify/vue';
import AppButton from '~/components/button/AppButton.vue';
import { usePos } from '~/composables/api/usePos';
import { useCaisseApi } from '~/composables/api/useCaisseApi';
import { useCaisseStore } from '~/stores/caisse';
import ProductCard from '~/components/pos/ProductCard.vue';
import CartPanel from '~/components/pos/CartPanel.vue';
import PinPad from '~/components/pos/PinPad.vue';
import ProgressSpinner from 'primevue/progressspinner';
import BarcodeScanner from '~/components/form/BarcodeScanner.vue';
import PosUserBanner from '~/components/caisse/PosUserBanner.vue';
import ClosureDialog from '~/components/pos/ClosureDialog.vue';
import { useToast } from 'primevue/usetoast';
import { useGlobalLoading } from '~/composables/useGlobalLoading';
import { useSecureAuth } from '~/composables/useSecureAuth';
import { useSound } from '~/composables/useSound';

definePageMeta({
    layout: 'default',
    middleware: ['auth', 'permissions', 'caisse-session'],
    permission: 'ventes:creer',
    hideBreadcrumb: true
});


const store = usePos();
const caisseStore = useCaisseStore();
const { ouvrirSessionParPin } = useCaisseApi(); 
const router = useRouter();
const toast = useToast();
const { startLoading, stopLoading } = useGlobalLoading();
const { user } = useSecureAuth();
const { playSuccessBeep, playErrorBeep } = useSound();

// État de clôture de session
const showClosureDialog = ref(false);
const activeMobileTab = ref<'catalog' | 'cart'>('catalog');

// Vérifier si l'utilisateur est Admin (peut bypasser le PIN)
const isAdminUser = computed(() => {
    const role = user.value?.role;
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
});

// Déverrouillage Admin sans PIN
const handleAdminUnlock = () => {
    caisseStore.unlock();
};

// État du verrouillage (PIN overlay)
const pinError = ref<string | null>(null);
const unlocking = ref(false);

const handleUnlock = async (pin: string) => {
    unlocking.value = true;
    pinError.value = null;
    
    // Si pas de session active, erreur technique
    if (!caisseStore.activeSession?.caisse_id) {
        pinError.value = "Impossible de vérifier : aucune session active";
        unlocking.value = false;
        return;
    }

    try {
        const session = await ouvrirSessionParPin(caisseStore.activeSession.caisse_id, {
            pin,
            fond_initial: caisseStore.activeSession.fond_initial || 0, 
            notes: `Déverrouillage session le ${new Date().toLocaleString()}`
        });

        if (session) {
            // PIN Correct -> On déverrouille l'interface locale
            caisseStore.unlock();
            toast.add({ severity: 'success', summary: 'Déverrouillé', detail: 'Reprise de la vente', life: 1500 });
        } else {
             pinError.value = "PIN incorrect";
        }
    } catch (err: any) {
        // Extraire le message d'erreur
        const msg = err.data?.message || err.response?._data?.message || err.message || '';
        if (msg.includes('PIN incorrect')) {
            pinError.value = "Code PIN incorrect";
        } else {
            pinError.value = "Erreur vérification PIN";
            console.error("Unlock Error:", err);
        }
    } finally {
        unlocking.value = false;
    }
};

const handleLogout = () => {
    showClosureDialog.value = true;
};

const onClosureSuccess = (rapport: any) => {
    toast.add({
        severity: 'success',
        summary: 'Session clôturée',
        detail: 'La session a été fermée avec succès. Redirection...',
        life: 2000
    });

    // Nettoyer et rediriger
    setTimeout(() => {
        caisseStore.reset();
        router.push('/point-vente/session');
    }, 1500);
};

onMounted(async () => {
    startLoading();
    try {
        await store.loadCatalog();
    } finally {
        stopLoading();
    }
});

const uniqueCategories = computed(() => {
    const cats = new Set<string>();
    store.posItems.forEach((i: any) => {
        if (i.categoryName) cats.add(i.categoryName);
    });
    return Array.from(cats);
});

// Scanner
const showScanner = ref(false);

const handleScanResult = (code: string) => {
    // Chercher le produit correspondant
    const item = store.posItems.find(i => i.code_barre === code);
    
    if (item) {
        handleAddToCart(item);
        playSuccessBeep();
        toast.add({ severity: 'success', summary: 'Produit trouvé', detail: `${item.name} ajouté au panier`, life: 2000 });
        // Optionnel : fermer le scanner après un succès ? 
        // showScanner.value = false; 
    } else {
        playErrorBeep();
        toast.add({ severity: 'warn', summary: 'Introuvable', detail: `Aucun produit trouvé pour le code ${code}`, life: 3000 });
    }
};

const handleAddToCart = (item: any) => {
    // Add sound effect?
    store.addToCart(item);
    // Optionnel : Notification visuelle sur mobile
    if (window.innerWidth < 1024) {
        toast.add({ severity: 'success', summary: 'Ajouté', detail: 'Produit ajouté au panier', life: 1000 });
    }
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>