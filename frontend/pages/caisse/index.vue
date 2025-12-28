<template>
  <div>
    <SimplePageHeader
      title="Gestion des Caisses"
      description="Consultez et gérez vos terminaux de point de vente"
    />

    <div class="mt-6">
      <TableGeneric
        :columns="columns"
        :data="caisses"
        :loading="loading"
        :global-action="hasPermission('caisses', 'creer') ? {
          label: 'Nouvelle Caisse',
          icon: 'pi pi-plus',
          link: '/caisse/ajouter'
        } : undefined"
        :show-edit="hasPermission('caisses', 'modifier')"
        :show-delete="hasPermission('caisses', 'supprimer')"
        search-placeholder="Rechercher une caisse..."
        :search-fields="['code', 'nom', 'magasin.nom']"
        delete-label-field="nom"
        @action:view="handleView"
        @action:edit="handleEdit"
        @action:delete="handleDelete"
      >
        <!-- Colonne Magasin -->
        <template #column-magasin="{ data }">
          <span class="font-medium text-gray-700">{{ (data as any).magasin?.nom || '-' }}</span>
        </template>

        <!-- Colonne Statut avec Tag coloré -->
        <template #column-statut="{ data }">
          <Tag 
            :value="getStatutLabel((data as any).statut)" 
            :severity="getStatutSeverity((data as any).statut)" 
          />
        </template>

        <!-- Colonne Session Active -->
        <template #column-sessionActive="{ data }">
          <div v-if="(data as any).sessions && (data as any).sessions.length > 0" class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span class="text-sm text-green-700 font-medium">
              {{ (data as any).sessions[0]?.utilisateur?.employee?.fullName || (data as any).sessions[0]?.utilisateur?.email }}
            </span>
          </div>
          <span v-else class="text-gray-400 text-sm">Libre</span>
        </template>
      </TableGeneric>
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import TableGeneric from '~/components/table/TableGeneric.vue';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import { useCaisseApi, type Caisse, type StatutCaisse } from '~/composables/api/useCaisseApi';
import { useErrorHandler } from '~/composables/useErrorHandler';
import { usePermissions } from '~/composables/usePermissions';
import { useGlobalLoading } from '~/composables/useGlobalLoading';

const { getCaisses, deleteCaisse } = useCaisseApi();
const { hasPermission } = usePermissions();
const { extractErrorMessage } = useErrorHandler();
const toast = useToast();
const router = useRouter();
const { startLoading, stopLoading } = useGlobalLoading();

const caisses = ref<Caisse[]>([]);
const loading = ref(false);

const loadData = async () => {
    loading.value = true;
    startLoading();
    try {
        caisses.value = await getCaisses();
    } catch (e: any) {
        console.error("Erreur chargement caisses", e);
        const errorMsg = extractErrorMessage(e, 'Impossible de charger les caisses');
        toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 3000 });
    } finally {
        loading.value = false;
        stopLoading();
    }
};

const columns = [
  { field: 'code', header: 'Code', sortable: true },
  { field: 'nom', header: 'Nom', sortable: true },
  { field: 'magasin', header: 'Magasin', customRender: true, sortable: true },
  { field: 'statut', header: 'Statut', customRender: true, sortable: true },
  { field: 'sessionActive', header: 'Session Active', customRender: true }
];

const getStatutLabel = (statut: StatutCaisse): string => {
  const labels: Record<StatutCaisse, string> = {
    'ACTIVE': 'Active',
    'INACTIVE': 'Inactive',
    'EN_MAINTENANCE': 'Maintenance'
  };
  return labels[statut] || statut;
};

const getStatutSeverity = (statut: StatutCaisse): string => {
  const severities: Record<StatutCaisse, string> = {
    'ACTIVE': 'success',
    'INACTIVE': 'secondary',
    'EN_MAINTENANCE': 'warn'
  };
  return severities[statut] || 'info';
};

onMounted(() => {
    loadData();
});

const handleView = (item: any) => {
    router.push(`/caisse/${item.id}`);
};

const handleEdit = (item: any) => {
    router.push(`/caisse/modifier/${item.id}`);
};

const handleDelete = async (item: any) => {
  try {
    await deleteCaisse(item.id);
    toast.add({ severity: 'success', summary: 'Succès', detail: 'Caisse supprimée', life: 3000 });
    loadData();
  } catch (error: any) {
    console.error('Erreur suppression:', error);
    const errorMsg = extractErrorMessage(error, 'Impossible de supprimer cette caisse');
    toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 5000 });
  }
};
</script>