<template>
  <div>
    <SimplePageHeader
      title="Catalogue Produits"
      description="Gérez votre catalogue de produits et leurs conditionnements"
    />

    <div class="mt-6">
        <TableGeneric
            :columns="columns"
            :data="produits"
            :loading="loading"
            :global-action="{
                label: 'Nouveau Produit',
                icon: 'pi pi-plus',
                variant: 'primary',
                link: '/produits/ajouter'
            }"
            :search-fields="['nom', 'code_barre', 'categorie.nom']"
            delete-label-field="nom"
            @action:view="handleView"
            @action:edit="handleEdit"
            @action:delete="handleDelete"
        >
             <!-- Custom rendering pour nom (Image + Nom) -->
             <template #column-nom="{ data }: { data: any }">
                 <div class="flex items-center gap-3">
                     <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden flex-shrink-0">
                         <img v-if="data.image_url" :src="getFullImageUrl(data.image_url)" :alt="data.nom" class="w-full h-full object-cover" />
                         <i v-else class="pi pi-image text-gray-400 text-lg"></i>
                     </div>
                     <span class="font-medium text-gray-800">{{ data.nom }}</span>
                 </div>
             </template>

             <!-- Custom rendering pour status (exemple) -->
             <template #column-est_actif="{ data }: { data: any }">
                 <Tag :severity="data.est_actif ? 'success' : 'danger'" :value="data.est_actif ? 'Actif' : 'Inactif'" />
             </template>
        </TableGeneric>
    </div>

    <!-- Toast pour notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import TableGeneric, { type TableColumn } from '~/components/table/TableGeneric.vue';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import BannerHeader from '~/components/banner/BannerHeader.vue';
import { useProduitApi, type Produit } from '~/composables/api/useProduitApi';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';

const { getProduits, deleteProduit } = useProduitApi();
const toast = useToast();
const router = useRouter();
const config = useRuntimeConfig();

const produits = ref<Produit[]>([]);
const loading = ref(false);

const columns: TableColumn[] = [
    { field: 'nom', header: 'Nom du Produit', sortable: true, customRender: true },
    { field: 'categorie.nom', header: 'Catégorie', sortable: true, type: 'tag' },
    { field: 'unite.nom', header: 'Unité', sortable: true },
    { field: 'est_actif', header: 'Statut', sortable: true, customRender: true }, // Utilise le slot #column-est_actif
];

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
    try {
        produits.value = await getProduits();
    } catch (e: any) {
        console.error("Erreur chargement produits", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les produits', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const handleView = (prod: Produit) => {
    // Redirection vers page détail (à créer si besoin, ou utiliser modifier pour l'instant)
    // router.push(`/produits/${prod.id}`);
    toast.add({ severity: 'info', summary: 'Info', detail: `Détails de ${prod.nom} (Bientôt disponible)`, life: 3000 });
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
         toast.add({ severity: 'error', summary: 'Erreur', detail: e.message || 'Impossible de supprimer', life: 5000 });
    }
};

onMounted(() => {
    loadProduits();
});
</script>
