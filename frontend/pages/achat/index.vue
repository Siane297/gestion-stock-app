<template>
  <div>
    <SimplePageHeader
      title="Historique des Achats"
      description="Suivez vos commandes d'approvisionnement et réceptions"
    />

    <div class="mt-6">
        <TableGeneric
            :columns="columns"
            :data="achats"
            :loading="loading"
            :global-action="hasPermission('achats', 'creer') ? {
                label: 'Nouvel Achat',
                icon: 'pi pi-plus',
                variant: 'primary',
                link: '/achat/ajouter'
            } : undefined"
            :show-edit="hasPermission('achats', 'modifier')"
            :show-delete="hasPermission('achats', 'supprimer')"
            :search-fields="['numero_commande', 'fournisseur.nom_entreprise', 'statut']"
            delete-label-field="numero_commande"
            @action:view="handleView"
            @action:edit="handleEdit"
            @action:delete="handleDelete"
        >
             <!-- Statut -->
             <template #column-statut="{ data }: { data: any }">
                 <Tag :severity="getStatutSeverity(data.statut)" :value="formatStatut(data.statut)" />
             </template>

             <!-- Date -->
             <template #column-date_commande="{ data }: { data: any }">
                {{ new Date(data.date_commande).toLocaleDateString('fr-FR') }}
             </template>
        </TableGeneric>
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { storeToRefs } from 'pinia';
import TableGeneric, { type TableColumn } from '~/components/table/TableGeneric.vue';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import { useAchatApi, type Achat, type StatutAchat } from '~/composables/api/useAchatApi';
import { usePermissions } from '~/composables/usePermissions';
import { useMagasinStore } from '~/stores/magasin';
import { useGlobalLoading } from '~/composables/useGlobalLoading';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';

const { getAchats, deleteAchat } = useAchatApi();
const { hasPermission } = usePermissions();
const toast = useToast();
const router = useRouter();
const { startLoading, stopLoading } = useGlobalLoading();

const magasinStore = useMagasinStore();
const { currentMagasinId } = storeToRefs(magasinStore);

const achats = ref<Achat[]>([]);
const loading = ref(false);

const columns: TableColumn[] = [
    { field: 'numero_commande', header: 'N° Commande', sortable: true },
    { field: 'fournisseur.nom_entreprise', header: 'Fournisseur', sortable: true },
    { field: 'date_commande', header: 'Date', sortable: true, customRender: true },
    { field: 'montant_total', header: 'Total', sortable: true, type: 'price' },
    { field: 'statut', header: 'Statut', sortable: true, customRender: true },
];

const loadAchats = async () => {
    loading.value = true;
    startLoading();
    try {
        // Filtrage par le magasin actif
        achats.value = await getAchats(currentMagasinId.value || undefined);
    } catch (e: any) {
        console.error("Erreur chargement achats", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les achats', life: 3000 });
    } finally {
        loading.value = false;
        stopLoading();
    }
};

// Recharger quand le magasin change
watch(currentMagasinId, () => {
    loadAchats();
});

const handleView = (a: Achat) => {
    // router.push(`/achat/${a.id}`);
    toast.add({ severity: 'info', summary: 'Info', detail: `Détail commande ${a.numero_commande} (Bientôt disponible)`, life: 3000 });
};

const handleEdit = (a: Achat) => {
    router.push(`/achat/modifier/${a.id}`);
};

const handleDelete = async (a: Achat) => {
    try {
        await deleteAchat(a.id);
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Achat supprimé', life: 3000 });
        await loadAchats();
    } catch (e: any) {
         toast.add({ severity: 'error', summary: 'Erreur', detail: e.message || 'Impossible de supprimer', life: 5000 });
    }
};

const getStatutSeverity = (statut: StatutAchat) => {
    switch (statut) {
        case 'COMMANDE': return 'info';
        case 'CONFIRMEE': return 'primary';
        case 'EN_LIVRAISON': return 'warn';
        case 'RECU_COMPLET': return 'success';
        case 'RECU_PARTIELLEMENT': return 'warn';
        case 'ANNULEE': return 'danger';
        default: return 'secondary';
    }
};

const formatStatut = (statut: string) => {
    return statut.replace(/_/g, ' ');
};

onMounted(() => {
    loadAchats();
});
</script>