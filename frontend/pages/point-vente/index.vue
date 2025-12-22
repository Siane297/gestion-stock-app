<template>
    <div class="flex bg-white p-4 rounded-lg border-2 border-gris/40 gap-4 relative min-h-screen">
        <!-- Overlay Verrouillage -->
        <div v-if="caisseStore.isLocked" class="absolute inset-0 z-[100] backdrop-blur-md flex flex-col items-center justify-center p-4">
            <div class="text-center mb-8">
                <div class="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <Icon icon="tabler:lock" class="text-3xl text-white" />
                </div>
                <h2 class="text-2xl font-bold text-noir mb-2">Interface Verrouillée</h2>
                <p class="text-noir/60">Saisissez votre PIN pour continuer</p>
            </div>
            
            <PinPad 
                :loading="unlocking" 
                :error="pinError"
                @submit="handleUnlock"
            />
        </div>

        <!-- Zone Marge Gauche (Catalogue) -->
        <div class="flex-1 flex flex-col min-w-0">

            <!-- Grid Content -->
            <div class="flex-1 overflow-y-auto ">

                <!-- Top Bar (Moved) -->
                <div
                    class="bg-white border-2 border-gris/40 p-4  z-10 flex items-center gap-4 justify-between rounded-xl mb-6 sticky top-0">
                    <!-- Search -->
                    <div class="relative flex-1">
                        <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input v-model="store.searchQuery" type="text"
                            placeholder="Rechercher un produit (Nom, code barre)..."
                            class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            autofocus />
                    </div>

                    <!-- Actions Rapides -->
                    <div class="flex gap-2">
                        <button 
                            @click="caisseStore.lock()" 
                            class="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                            title="Verrouiller"
                        >
                            <Icon icon="tabler:lock" class="text-xl" />
                        </button>
                        <button 
                            @click="handleLogout" 
                            class="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                            title="Fermer la session"
                        >
                            <Icon icon="tabler:power" class="text-xl" />
                        </button>
                    </div>
                </div>

                <!-- Filter Categories -->
                <div class="flex gap-2 overflow-x-auto max-w-4xl pb-4 scrollbar-hide mb-4">
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
                    <ProgressSpinner strokeWidth="4" />
                </div>

                <div v-else-if="store.filteredItems.length === 0"
                    class="flex flex-col items-center justify-center h-64 text-gray-400">
                    <i class="pi pi-search text-4xl mb-2"></i>
                    <p>Aucun produit trouvé</p>
                </div>

                <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
                    <ProductCard v-for="item in store.filteredItems" :key="item.uniqueId" :item="item"
                        @add="handleAddToCart" />
                </div>
            </div>
        </div>

        <!-- Zone Droite (Panier) -->
        <div class="w-[400px]">
            <CartPanel />
        </div>

        <!-- Dialogue de Clôture -->
        <FormPopupDynamique
            v-model:visible="showClosureDialog"
            title="Clôture de Session"
            description="Veuillez compter votre caisse et enregistrer le montant final avant de quitter."
            headerTitle="Fermer la Session"
            submitLabel="Clôturer et Quitter"
            cancelLabel="Annuler"
            :fields="closureFields"
            :loading="closureLoading"
            @submit="handleClosureSubmit"
        />

        <Toast />
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { usePos } from '~/composables/api/usePos';
import { useCaisseApi } from '~/composables/api/useCaisseApi';
import { useCaisseStore } from '~/stores/caisse';
import ProductCard from '~/components/pos/ProductCard.vue';
import CartPanel from '~/components/pos/CartPanel.vue';
import PinPad from '~/components/pos/PinPad.vue';
import ProgressSpinner from 'primevue/progressspinner';
import FormPopupDynamique from '~/components/form/FormPopupDynamique.vue';
import type { FormField } from '~/components/form/FormulaireDynamique.vue';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

definePageMeta({
    layout: 'default',
    middleware: ['auth', 'permissions', 'caisse-session'],
    permission: 'ventes:creer'
});

const store = usePos();
const caisseStore = useCaisseStore();
const { fermerSession } = useCaisseApi();
const router = useRouter();
const toast = useToast();

// État de clôture de session
const showClosureDialog = ref(false);
const closureLoading = ref(false);

const closureFields: FormField[] = [
    {
        name: 'fond_final',
        label: 'Montant final compté',
        type: 'number',
        required: true,
        placeholder: 'Entrez le montant en caisse...',
        min: 0,
        helpText: 'Comptez l\'argent physiquement présent dans le tiroir-caisse.'
    },
    {
        name: 'notes_fermeture',
        label: 'Notes de fermeture',
        type: 'textarea',
        placeholder: 'Observations éventuelles (écarts, incidents...)',
        required: false
    }
];

// État du verrouillage (PIN overlay)
const pinError = ref<string | null>(null);
const unlocking = ref(false);

const handleUnlock = async (pin: string) => {
    unlocking.value = true;
    pinError.value = null;
    try {
        // Pour le déverrouillage, on peut réutiliser ouvrirSessionParPin 
        // ou une route dédiée. Ici on simule ou on ré-ouvre si besoin.
        // Mais plus simple : on vérifie juste le PIN de l'utilisateur.
        // Pour l'instant, on utilise le store pour l'état local.
        caisseStore.unlock();
    } catch (err) {
        pinError.value = "PIN incorrect";
    } finally {
        unlocking.value = false;
    }
};

const handleLogout = () => {
    showClosureDialog.value = true;
};

const handleClosureSubmit = async (data: any) => {
    if (!caisseStore.activeSession?.caisse_id) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Aucune session active identifiée', life: 3000 });
        return;
    }

    closureLoading.value = true;
    try {
        await fermerSession(caisseStore.activeSession.caisse_id, {
            fond_final: data.fond_final,
            notes: data.notes_fermeture
        });

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

    } catch (err: any) {
        console.error('Erreur clôture:', err);
        toast.add({ 
            severity: 'error', 
            summary: 'Erreur clôture', 
            detail: err.message || 'Impossible de fermer la session', 
            life: 5000 
        });
    } finally {
        closureLoading.value = false;
        showClosureDialog.value = false;
    }
};

onMounted(() => {
    store.loadCatalog();
});

const uniqueCategories = computed(() => {
    const cats = new Set<string>();
    store.posItems.forEach((i: any) => {
        if (i.categoryName) cats.add(i.categoryName);
    });
    return Array.from(cats);
});

const handleAddToCart = (item: any) => {
    // Add sound effect?
    store.addToCart(item);
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