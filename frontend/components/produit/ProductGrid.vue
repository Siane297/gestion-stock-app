<template>
    <div class="bg-white p-5 rounded-xl border-2 border-gris/40">
        <!-- Barre d'actions (Recherche + Bouton) -->
        <div class="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
            <div class="w-full lg:w-96">
                <IconField iconPosition="left">
                    <InputIcon>
                        <i class="pi pi-search"></i>
                    </InputIcon>
                    <InputText 
                        v-model="searchQuery" 
                        placeholder="Rechercher (nom, code barre, catégorie)..." 
                        class="w-full !rounded-lg" 
                    />
                </IconField>
            </div>

            <slot name="actions"></slot>
        </div>
        
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
                <i class="pi pi-spin pi-spinner text-4xl text-primary mb-2"></i>
                <p class="text-gray-500">Chargement...</p>
        </div>
        
        <div v-else-if="filteredProduits.length === 0" class="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <img src="~/assets/images/no-data.png" alt="Aucun produit" class="w-40 h-auto opacity-90" />
            <p class="text-gray-500 font-medium text-lg">Aucun produit trouvé</p>
        </div>

        <div v-else>
            <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                <ProductGridItem 
                    v-for="prod in paginatedProduits" 
                    :key="prod.id" 
                    :produit="prod"
                    :server-url="serverUrl"
                    :can-edit="canEdit"
                    :can-delete="canDelete"
                    @view="val => $emit('view', val)"
                    @edit="val => $emit('edit', val)"
                    @delete="val => $emit('delete', val)"
                />
            </div>

            <!-- Pagination -->
            <div class="mt-8 border-t border-gris/60 pt-4">
                <Paginator 
                    v-model:first="first" 
                    v-model:rows="rows" 
                    :totalRecords="filteredProduits.length" 
                    :rowsPerPageOptions="[10, 20, 50]"
                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
                    currentPageReportTemplate="{first} à {last} sur {totalRecords} produits"
                    class="!bg-transparent"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Paginator from 'primevue/paginator';
import ProductGridItem from '~/components/produit/ProductGridItem.vue';
import type { Produit } from '~/composables/api/useProduitApi';

const props = defineProps<{
    produits: Produit[];
    loading: boolean;
    serverUrl?: string;
    canEdit?: boolean;
    canDelete?: boolean;
}>();

const emit = defineEmits<{
    view: [produit: Produit];
    edit: [produit: Produit];
    delete: [produit: Produit];
}>();

const searchQuery = ref('');
const first = ref(0);
const rows = ref(20);

// Computed filtered products
const filteredProduits = computed(() => {
    if (!searchQuery.value) return props.produits;
    const query = searchQuery.value.toLowerCase();
    return props.produits.filter(p => 
        p.nom.toLowerCase().includes(query) || 
        (p.code_barre && p.code_barre.toLowerCase().includes(query)) ||
        (p.categorie?.nom && p.categorie.nom.toLowerCase().includes(query))
    );
});

// Computed paginated products
const paginatedProduits = computed(() => {
    return filteredProduits.value.slice(first.value, first.value + rows.value);
});

// Reset pagination on search
watch(searchQuery, () => {
    first.value = 0;
});
</script>
