<template>
  <div>
    <SimplePageHeader
      title="Catalogue Produits"
      description="Gérez votre catalogue de produits et leurs conditionnements"
    />

    <div class="mt-6">
        <ProductGrid
            :produits="produits"
            :loading="loading"
            :server-url="serverUrl"
            :can-edit="hasPermission('produits', 'modifier')"
            :can-delete="hasPermission('produits', 'supprimer')"
            @view="handleView"
            @edit="handleEdit"
            @delete="handleDelete"
        >
            <template #actions>
                <AppButton 
                    v-if="hasPermission('produits', 'creer')"
                    label="Nouveau Produit" 
                    icon="pi pi-plus" 
                    variant="primary"
                    class="w-full lg:w-auto"
                    @click="router.push('/produits/ajouter')"
                />
            </template>
        </ProductGrid>
    </div>

    <!-- Modal Détail Produit -->
    <ProduitDetailModal 
      v-model:visible="showDetailModal"
      :produit="selectedProduit"
      :loading="detailLoading"
      @edit="handleEdit"
    />

    <!-- Toast pour notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import ProduitDetailModal from '~/components/produit/ProduitDetailModal.vue';
import ProductGrid from '~/components/produit/ProductGrid.vue';
import AppButton from '~/components/button/AppButton.vue';
import { useProduitApi, type Produit } from '~/composables/api/useProduitApi';
import { usePermissions } from '~/composables/usePermissions';
import { useGlobalLoading } from '~/composables/useGlobalLoading';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';

const { getProduits, getProduitById, deleteProduit } = useProduitApi();
const { hasPermission } = usePermissions();
const toast = useToast();
const router = useRouter();
const config = useRuntimeConfig();
const { startLoading, stopLoading } = useGlobalLoading();

const produits = ref<Produit[]>([]);
const loading = ref(false);

// Détail
const showDetailModal = ref(false);
const detailLoading = ref(false);
const selectedProduit = ref<Produit | null>(null);

const apiBase = config.public.apiBase as string;
let serverUrl = '';
try {
    if (apiBase.startsWith('http')) {
        serverUrl = new URL(apiBase).origin;
    }
} catch (e) {
    console.error("Erreur parsing API Base URL", e);
}

const getFullImageUrl = (path?: string) => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path; // Déjà absolu
    return `${serverUrl}${path}`;
};

const loadProduits = async () => {
    loading.value = true;
    startLoading();
    try {
        produits.value = await getProduits();
    } catch (e: any) {
        console.error("Erreur chargement produits", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les produits', life: 3000 });
    } finally {
        loading.value = false;
        stopLoading();
    }
};

const handleView = async (prod: Produit) => {
    selectedProduit.value = prod;
    showDetailModal.value = true;
    detailLoading.value = true;
    try {
        // Recharger l'objet complet avec les détails
        const fullProduit = await getProduitById(prod.id);
        if (fullProduit) selectedProduit.value = fullProduit;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les détails du produit', life: 3000 });
    } finally {
        detailLoading.value = false;
    }
};

const handleEdit = (prod: Produit) => {
    router.push(`/produits/modifier/${prod.id}`);
};

const handleDelete = async (prod: Produit) => {
    try {
        await deleteProduit(prod.id);
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Produit supprimé', life: 3000 });
        await loadProduits();
    } catch (e: any) {
         let errorMessage = 'Impossible de supprimer';
         if (e.response && e.response._data && e.response._data.message) {
             errorMessage = e.response._data.message;
         } else if (e.message) {
             errorMessage = e.message;
         }
         toast.add({ severity: 'error', summary: 'Erreur', detail: errorMessage, life: 5000 });
    }
};

onMounted(() => {
    loadProduits();
});
</script>
