<template>
  <div class="w-full bg-white border-2 border-gris/40 rounded-xl p-7">
    <!-- Barre de recherche et actions -->
    <div class="mb-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
      <div class="w-full lg:w-96">
        <IconField iconPosition="left">
          <InputIcon>
            <i class="pi pi-search"></i>
          </InputIcon>
          <InputText
            v-model="searchQuery"
            :placeholder="`Rechercher ${entityLabel}...`"
            class="w-full"
          />
        </IconField>
      </div>

      <!-- Bouton d'ajout -->
      <div class="lg:w-auto">
        <AppButton
          :label="`Ajouter ${entityLabel}`"
          icon="pi pi-plus"
          variant="primary"
          :full-width="true"
          class="w-full sm:w-auto"
          @click="emit('add')"
        />
      </div>
    </div>

    <!-- Table -->
    <DataTable
      :value="filteredData"
      :paginator="true"
      :rows="rowsPerPage"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      responsiveLayout="scroll"
      stripedRows
      class="custom-table"
      :loading="loading"
    >
      <!-- Message vide -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16">
          <Icon :icon="emptyIcon" class="text-6xl text-gray-300 mb-4" />
          <p class="text-gray-500 text-lg font-medium">Aucun {{ entityLabel }}</p>
          <p class="text-gray-400 text-sm mt-2">Créez votre premier {{ entityLabel }}</p>
        </div>
      </template>

      <!-- Colonne Nom -->
      <Column 
        field="name" 
        header="Nom" 
        sortable 
        headerClass="bg-primary text-white font-semibold"
      />

      <!-- Colonne Date de création -->
      <Column 
        field="createdAt" 
        header="Date de création" 
        sortable 
        headerClass="bg-primary text-white font-semibold"
      >
        <template #body="slotProps">
          <span class="text-sm text-gray-600">
            {{ formatDate(slotProps.data.createdAt) }}
          </span>
        </template>
      </Column>

      <!-- Colonne Statut -->
      <!-- <Column 
        header="Statut" 
        headerClass="bg-primary text-white font-semibold"
      >
        <template #body="slotProps">
          <span 
            class="px-3 py-1 rounded-full text-xs font-semibold"
            :class="slotProps.data.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
          >
            {{ slotProps.data.isActive ? 'Actif' : 'Inactif' }}
          </span>
        </template>
      </Column> -->

      <!-- Colonne Actions -->
      <Column
        header="Actions"
        :style="{ width: '120px' }"
        headerClass="bg-primary text-white font-semibold"
      >
        <template #body="slotProps">
          <div class="flex justify-center gap-2">
            <button
              @click="emit('edit', slotProps.data)"
              class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Modifier"
            >
              <Icon icon="lucide:pencil" class="w-4 h-4 text-gray-600" />
            </button>
            <button
              @click="confirmDelete(slotProps.data)"
              class="p-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              title="Supprimer"
            >
              <Icon icon="lucide:trash-2" class="w-4 h-4 text-red-600" />
            </button>
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Toast -->
    <Toast />

    <!-- Dialog de confirmation suppression -->
    <ConfirmationDialog
      v-model:visible="showConfirmDialog"
      :message="confirmMessage"
      :header="confirmHeader"
      accept-label="Oui, supprimer"
      reject-label="Annuler"
      variant="danger"
      @accept="onConfirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Toast from 'primevue/toast';
import { Icon } from '@iconify/vue';
import { useToast } from 'primevue/usetoast';
import AppButton from '~/components/button/AppButton.vue';
import ConfirmationDialog from '~/components/dialog/ConfirmationDialog.vue';

interface Props {
  data: any[];
  loading?: boolean;
  rowsPerPage?: number;
  entityLabel?: string;
  emptyIcon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rowsPerPage: 10,
  entityLabel: 'élément',
  emptyIcon: 'tabler:database-x',
});

const emit = defineEmits<{
  (e: 'add'): void;
  (e: 'edit', data: any): void;
  (e: 'delete', id: string): void;
}>();

const toast = useToast();
const searchQuery = ref('');
const showConfirmDialog = ref(false);
const confirmMessage = ref('');
const confirmHeader = ref('');
const itemToDelete = ref<any>(null);

// Filtrer les données selon la recherche
const filteredData = computed(() => {
  if (!searchQuery.value) return props.data;

  const query = searchQuery.value.toLowerCase();
  return props.data.filter((item) => {
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(query)
    );
  });
});

// Formater la date
const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Confirmer la suppression
const confirmDelete = (data: any) => {
  itemToDelete.value = data;
  confirmHeader.value = 'Confirmer la suppression';
  confirmMessage.value = `Êtes-vous sûr de vouloir supprimer "${data.name}" ?`;
  showConfirmDialog.value = true;
};

// Exécuter la suppression
const onConfirmDelete = () => {
  if (itemToDelete.value) {
    emit('delete', itemToDelete.value.id);
    itemToDelete.value = null;
  }
};
</script>

<style scoped>
/* Personnalisation table */
:deep(.custom-table) {
  @apply rounded-lg border overflow-hidden shadow-sm;
}

:deep(.custom-table .p-datatable-thead > tr > th) {
  @apply bg-bleu text-noir font-semibold py-4 px-4;
}

:deep(.custom-table .p-datatable-thead > tr > th.p-sortable-column:hover) {
  @apply bg-primary/90;
}

:deep(.custom-table .p-datatable-tbody > tr) {
  @apply transition-colors;
}

:deep(.custom-table .p-datatable-tbody > tr > td) {
  @apply py-3 px-4;
}

:deep(.custom-table .p-paginator) {
  @apply bg-bleu rounded-none border-t border-gray-200;
}

:deep(.custom-table .p-paginator .p-paginator-current) {
  @apply text-noir;
}

:deep(.custom-table .p-paginator .p-paginator-page.p-highlight) {
  @apply bg-primary text-white;
}
</style>
