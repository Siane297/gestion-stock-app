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

const produits = ref<Produit[]>([]);
const loading = ref(false);

const columns: TableColumn[] = [
    { field: 'nom', header: 'Nom du Produit', sortable: true },
    { field: 'categorie.nom', header: 'Catégorie', sortable: true, type: 'tag' },
    { field: 'unite', header: 'Unité', sortable: true },
    { field: 'est_actif', header: 'Statut', sortable: true, customRender: true }, // Utilise le slot #column-est_actif
];

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
