<template>
  <div>
    <SimplePageHeader
      title="Inventaires"
      description="Gérez les inventaires physiques de vos stocks"
    />

    <div class="mt-6">
      <!-- Filtres -->
      <div class="flex flex-wrap gap-4 mb-6">
        <Select
          v-model="selectedStatut"
          :options="statutOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Filtrer par statut"
          showClear
          class="w-48"
        />
      </div>

      <TableGeneric
        :columns="columns"
        :data="filteredInventaires"
        :loading="loading"
        :search-fields="['numero', 'magasin.nom']"
        delete-label-field="numero"
        :global-action="hasPermission('inventaire', 'creer') ? {
          label: 'Nouvel Inventaire',
          icon: 'pi pi-plus',
          variant: 'primary',
          link: '/inventaire/ajouter'
        } : undefined"
        :show-edit="false"
        :show-delete="hasPermission('inventaire', 'supprimer')"
        @action:view="handleView"
        @action:delete="handleDelete"
      >
        <!-- Statut avec badge coloré -->
        <template #column-statut="{ data }: { data: Inventaire }">
          <Badge :value="getStatutLabel(data.statut)" :severity="getStatutSeverity(data.statut)" />
        </template>

        <!-- Progression -->
        <template #column-progression="{ data }: { data: Inventaire }">
          <div class="flex items-center gap-2">
            <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-primary rounded-full transition-all duration-300" 
                :style="{ width: `${data.stats?.progression || 0}%` }"
              ></div>
            </div>
            <span class="text-sm text-gray-600">{{ data.stats?.progression || 0 }}%</span>
          </div>
        </template>

        <!-- Date création formatée -->
        <template #column-date_creation="{ data }: { data: Inventaire }">
          <span>{{ formatDate(data.date_creation) }}</span>
        </template>

        <!-- Nombre de produits -->
        <template #column-nb_produits="{ data }: { data: Inventaire }">
          <span class="font-medium">{{ data.stats?.total_produits || data._count?.details || 0 }}</span>
        </template>
      </TableGeneric>
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import TableGeneric, { type TableColumn } from '~/components/table/TableGeneric.vue';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import { useInventaireApi, type Inventaire, type StatutInventaire } from '~/composables/api/useInventaireApi';
import { usePermissions } from '~/composables/usePermissions';
import Tag from 'primevue/tag';
import Select from 'primevue/select';
import Toast from 'primevue/toast';

const { getInventaires, deleteInventaire } = useInventaireApi();
const { hasPermission } = usePermissions();
const toast = useToast();
const router = useRouter();

const inventaires = ref<Inventaire[]>([]);
const loading = ref(false);
const selectedStatut = ref<StatutInventaire | null>(null);

const columns: TableColumn[] = [
  { field: 'numero', header: 'N° Inventaire', sortable: true },
  { field: 'magasin.nom', header: 'Boutique', sortable: true },
  { field: 'statut', header: 'Statut', sortable: true, customRender: true },
  { field: 'progression', header: 'Progression', sortable: false, customRender: true },
  { field: 'nb_produits', header: 'Produits', sortable: false, customRender: true },
  { field: 'date_creation', header: 'Date', sortable: true, customRender: true },
];

const statutOptions = [
  { label: 'Brouillon', value: 'BROUILLON' },
  { label: 'En cours', value: 'EN_COURS' },
  { label: 'Terminé', value: 'TERMINE' },
  { label: 'Validé', value: 'VALIDE' },
];

const filteredInventaires = computed(() => {
  if (!selectedStatut.value) return inventaires.value;
  return inventaires.value.filter(inv => inv.statut === selectedStatut.value);
});

const loadInventaires = async () => {
  loading.value = true;
  try {
    inventaires.value = await getInventaires();
  } catch (e: any) {
    console.error("Erreur chargement inventaires", e);
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les inventaires', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const handleView = (inv: Inventaire) => {
  // Rediriger vers la page appropriée selon le statut
  if (inv.statut === 'BROUILLON') {
    router.push(`/inventaire/ajouter?id=${inv.id}`);
  } else if (inv.statut === 'EN_COURS') {
    router.push(`/inventaire/execution/${inv.id}`);
  } else {
    router.push(`/inventaire/rapport/${inv.id}`);
  }
};

const handleDelete = async (inv: Inventaire) => {
  if (inv.statut !== 'BROUILLON') {
    toast.add({ 
      severity: 'warn', 
      summary: 'Attention', 
      detail: 'Seuls les inventaires en brouillon peuvent être supprimés', 
      life: 3000 
    });
    return;
  }

  try {
    await deleteInventaire(inv.id);
    toast.add({ severity: 'success', summary: 'Succès', detail: 'Inventaire supprimé', life: 3000 });
    await loadInventaires();
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: e.message || 'Impossible de supprimer l\'inventaire', life: 3000 });
  }
};

const getStatutLabel = (statut: StatutInventaire): string => {
  const labels: Record<StatutInventaire, string> = {
    BROUILLON: 'Brouillon',
    EN_COURS: 'En cours',
    TERMINE: 'Terminé',
    VALIDE: 'Validé'
  };
  return labels[statut] || statut;
};

const getStatutSeverity = (statut: StatutInventaire): string => {
  const severities: Record<StatutInventaire, string> = {
    BROUILLON: 'secondary',
    EN_COURS: 'info',
    TERMINE: 'warn',
    VALIDE: 'success'
  };
  return severities[statut] || 'secondary';
};

const formatDate = (date: string): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

onMounted(() => {
  loadInventaires();
});
</script>