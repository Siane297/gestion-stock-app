<template>
  <div>
    <SimplePageHeader
      title="Liste des Fournisseurs"
      description="Gérez vos partenaires et fournisseurs"
    />

    <div class="mt-6">
        <TableGeneric
            :columns="columns"
            :data="fournisseurs"
            :loading="loading"
            :global-action="hasPermission('fournisseurs', 'creer') ? {
                label: 'Nouveau Fournisseur',
                icon: 'pi pi-plus',
                variant: 'primary',
                link: '/fournisseur/ajouter'
            } : undefined"
            :show-edit="hasPermission('fournisseurs', 'modifier')"
            :show-delete="hasPermission('fournisseurs', 'supprimer')"
            :search-fields="['nom_entreprise', 'email', 'responsable', 'telephone']"
            delete-label-field="nom_entreprise"
            @action:view="handleView"
            @action:edit="handleEdit"
            @action:delete="handleDelete"
        />
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import TableGeneric, { type TableColumn } from '~/components/table/TableGeneric.vue';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import { useFournisseurApi, type Fournisseur } from '~/composables/api/useFournisseurApi';
import { usePermissions } from '~/composables/usePermissions';
import Toast from 'primevue/toast';

const { getFournisseurs, deleteFournisseur } = useFournisseurApi();
const { hasPermission } = usePermissions();
const { extractErrorMessage } = useErrorHandler();
const toast = useToast();
const router = useRouter();

const fournisseurs = ref<Fournisseur[]>([]);
const loading = ref(false);

const columns: TableColumn[] = [
    { field: 'nom_entreprise', header: 'Entreprise', sortable: true },
    { field: 'responsable', header: 'Contact', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'telephone', header: 'Téléphone', sortable: false },
    { field: 'delai_livraison', header: 'Délai (jours)', sortable: true },
];

const loadFournisseurs = async () => {
    loading.value = true;
    try {
        fournisseurs.value = await getFournisseurs();
    } catch (e: any) {
        console.error("Erreur chargement fournisseurs", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les fournisseurs', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const handleView = (f: Fournisseur) => {
    // router.push(`/fournisseur/${f.id}`);
     toast.add({ severity: 'info', summary: 'Info', detail: `Détails de ${f.nom_entreprise} (Bientôt disponible)`, life: 3000 });
};

const handleEdit = (f: Fournisseur) => {
    router.push(`/fournisseur/modifier/${f.id}`);
};

const handleDelete = async (f: Fournisseur) => {
    try {
        await deleteFournisseur(f.id);
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Fournisseur supprimé', life: 3000 });
        await loadFournisseurs();
    } catch (e: any) {
         const errorMsg = extractErrorMessage(e, 'Impossible de supprimer ce fournisseur');
         toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 5000 });
    }
};

onMounted(() => {
    loadFournisseurs();
});
</script>