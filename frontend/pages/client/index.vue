<template>
  <div>
    <SimplePageHeader
      title="Gestion des Clients"
      description="Consultez et gérez votre base de clients et leurs crédits"
    />

    <div class="mt-6">
        <TableGeneric
            :columns="columns"
            :data="clients"
            :loading="loading"
            :global-action="hasPermission('clients', 'creer') ? {
                label: 'Nouveau Client',
                icon: 'pi pi-plus',
                variant: 'primary',
                link: '/client/ajouter'
            } : undefined"
            :show-edit="hasPermission('clients', 'modifier')"
            :show-delete="hasPermission('clients', 'supprimer')"
            :search-fields="['nom', 'email', 'telephone']"
            delete-label-field="nom"
            @action:edit="handleEdit"
            @action:delete="handleDelete"
        >
             <template #column-solde_credit="{ data }: { data: any }">
                 <span :class="{
                    'text-red-600 font-bold': data.solde_credit > 0, 
                    'text-green-600 font-bold': data.solde_credit < 0,
                    'text-gray-600': data.solde_credit === 0
                 }">
                     {{ data.solde_credit ? Number(data.solde_credit).toFixed(2) : '0.00' }} KMF
                 </span>
             </template>

             <template #column-est_actif="{ data }: { data: any }">
                 <Tag :severity="data.est_actif ? 'success' : 'danger'" :value="data.est_actif ? 'Actif' : 'Inactif'" />
             </template>
        </TableGeneric>
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import TableGeneric, { type TableColumn } from '~/components/table/TableGeneric.vue';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import { useClientApi, type Client } from '~/composables/api/useClientApi';
import { usePermissions } from '~/composables/usePermissions';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';

const { getClients, deleteClient } = useClientApi();
const { hasPermission } = usePermissions();
const { extractErrorMessage } = useErrorHandler();
const toast = useToast();
const router = useRouter();

const clients = ref<Client[]>([]);
const loading = ref(false);

const columns: TableColumn[] = [
    { field: 'nom', header: 'Nom', sortable: true },
    { field: 'telephone', header: 'Téléphone', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'solde_credit', header: 'Solde Crédit', sortable: true, customRender: true },
    { field: 'est_actif', header: 'Statut', sortable: true, customRender: true },
];

const loadData = async () => {
    loading.value = true;
    try {
        clients.value = await getClients();
    } catch (e: any) {
        console.error("Erreur chargement clients", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les clients', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const handleEdit = (client: Client) => {
    router.push(`/client/modifier/${client.id}`);
};

const handleDelete = async (client: Client) => {
    try {
        await deleteClient(client.id);
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Client supprimé', life: 3000 });
        await loadData();
    } catch (e: any) {
         const errorMsg = extractErrorMessage(e, 'Impossible de supprimer ce client');
         toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 5000 });
    }
};

onMounted(() => {
    loadData();
});
</script>