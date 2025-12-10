<template>
  <!-- Banner Header -->
  <BannerHeader
    :title="title"
    :description="description"
    :banner-image="bannerImage"
    :loading="loading"
  />

  <!-- Skeleton Loading State -->
  <TableSkeleton v-if="loading" :columns="5" :rows="8" />
  
  <!-- Actual Content -->
  <div v-else class="w-full bg-white border-2 border-gris/40 rounded-xl p-7">
    <!-- Barre de recherche et actions -->
    <div class="mb-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
      <div class="w-full lg:w-96">
        <IconField iconPosition="left">
          <InputIcon>
            <i class="pi pi-search"></i>
          </InputIcon>
          <InputText
            v-model="searchQuery"
            placeholder="Rechercher un utilisateur..."
            class="w-full"
          />
        </IconField>
      </div>

      <!-- Boutons d'action -->
      <div class="flex flex-col sm:flex-row gap-3 lg:w-auto">
        <!-- Bouton PDF -->
        <AppButton
          label="Télécharger PDF"
          icon="pi pi-file-pdf"
          variant="outline"
          size="sm"
          :downloading="pdfLoading || false"
          :progress="pdfProgress || 0"
          :full-width="true"
          class="bg-white w-full sm:w-auto"
          @click="handleDownloadPdf"
        />
        
        <!-- Bouton d'ajout principal -->
        <AppButton
          v-if="actionButton"
          :label="actionButton.label"
          :icon="actionButton.icon"
          :variant="actionButton.variant || 'primary'"
          :full-width="true"
          class="w-full sm:w-auto"
          @click="handleActionClick"
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
          <Icon icon="tabler:database-x" class="text-6xl text-gray-300 mb-4" />
          <p class="text-gray-500 text-lg font-medium">Aucun utilisateur</p>
          <p class="text-gray-400 text-sm mt-2">Créez votre premier utilisateur</p>
        </div>
      </template>

      <!-- Colonnes -->
      <Column
        v-for="col in columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :sortable="col.sortable !== false"
        headerClass="bg-primary text-white font-semibold"
      >
        <template v-if="col.customRender" #body="slotProps">
          <slot :name="`column-${col.field}`" :data="slotProps.data"></slot>
        </template>
      </Column>

      <!-- Colonne Statut (Bloqué/Actif) -->
      <Column header="Statut" headerClass="bg-primary text-white font-semibold">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <ToggleSwitch
              v-if="!slotProps.data.isOwner"
              :modelValue="!slotProps.data.isBlocked"
              @update:modelValue="toggleBlockUser(slotProps.data, !$event)"
              class="scale-75"
            />
            <span 
              v-if="slotProps.data.isOwner"
              class="text-sm font-semibold text-primary flex items-center gap-2"
            >
              <Icon icon="lucide:shield-check" class="text-lg" />
              Propriétaire
            </span>
            <span 
              v-else
              class="text-sm" 
              :class="slotProps.data.isBlocked ? 'text-red-600' : 'text-green-600'"
            >
              {{ slotProps.data.isBlocked ? 'Bloqué' : 'Actif' }}
            </span>
          </div>
        </template>
      </Column>

      <!-- Colonne Actions -->
      <Column
        header="Actions"
        :style="{ width: '100px' }"
        headerClass="bg-primary text-white font-semibold"
      >
        <template #body="slotProps">
          <div class="flex justify-center">
            <button
              @click="toggleActionMenu($event, slotProps.data.id || slotProps.index, slotProps.data)"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon icon="mdi:dots-vertical" class="text-xl text-gray-600" />
            </button>
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Dropdown Menu Actions -->
    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="activeMenuId !== null"
          :style="dropdownStyle"
          class="fixed z-[9999] w-52 bg-white rounded-xl shadow-lg border border-gris p-2"
        >
          <button
            @click="handleEdit(activeMenuData)"
            class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slot transition-colors text-left"
          >
            <Icon icon="mdi:pencil" class="w-5 h-auto text-gray-600" />
            <span class="text-sm font-medium text-noir">Modifier</span>
          </button>
          
          <!-- Afficher le bouton Supprimer uniquement si ce n'est pas le propriétaire -->
          <template v-if="!activeMenuData?.isOwner">
            <hr class="my-2 border-gris" />
            
            <button
              @click="handleDelete(activeMenuData)"
              class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slot transition-colors text-left"
            >
              <Icon icon="lucide:trash-2" class="w-5 h-auto text-red-600" />
              <span class="text-sm font-medium text-red-600">Supprimer</span>
            </button>
          </template>
          
          <!-- Message pour le propriétaire -->
          <div v-else class="px-4 py-3 text-center">
            <Icon icon="lucide:shield-check" class="text-2xl text-primary mb-2" />
            <p class="text-xs text-gray-500">Le compte propriétaire ne peut pas être supprimé</p>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast -->
    <Toast />

    <!-- Dialog de confirmation suppression -->
    <ConfirmationDialog
      v-model:visible="showConfirmDialog"
      :message="confirmMessage"
      :header="confirmHeader"
      accept-label="Oui, supprimer"
      reject-label="Annuler"
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
import ToggleSwitch from 'primevue/toggleswitch';
import { Icon } from '@iconify/vue';
import { useToast } from 'primevue/usetoast';
import BannerHeader from '~/components/banner/BannerHeader.vue';
import AppButton from '~/components/button/AppButton.vue';
import ConfirmationDialog from '~/components/dialog/ConfirmationDialog.vue';
import TableSkeleton from "~/components/skeleton/TableSkeleton.vue";

interface Column {
  field: string;
  header: string;
  sortable?: boolean;
  customRender?: boolean;
}

interface ActionButton {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  link?: string;
}

interface Props {
  title?: string;
  description?: string;
  bannerImage?: string;
  data: any[];
  columns: Column[];
  loading?: boolean;
  rowsPerPage?: number;
  actionButton?: ActionButton;
  pdfLoading?: boolean; // État de chargement pour le PDF depuis le parent
  pdfProgress?: number; // Progression du téléchargement
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Gestion des utilisateurs',
  description: 'Gérez les comptes utilisateurs et leurs accès',
  loading: false,
  rowsPerPage: 10,
  pdfProgress: 0,
});

const emit = defineEmits<{
  (e: 'action-click'): void;
  (e: 'edit', data: any): void;
  (e: 'delete', id: string): void;
  (e: 'toggle-block', data: any): void;
  (e: 'action:download-pdf'): void;
}>();

const toast = useToast();
const searchQuery = ref('');
const showConfirmDialog = ref(false);
const confirmMessage = ref('');
const confirmHeader = ref('');
const userToDelete = ref<any>(null);

// États du dropdown menu
const activeMenuId = ref<string | number | null>(null);
const activeMenuData = ref<any>(null);
const dropdownStyle = ref({});

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

// Gérer le clic sur le bouton d'action principal
const handleActionClick = () => {
  if (props.actionButton?.link) {
    navigateTo(props.actionButton.link);
  } else {
    emit('action-click');
  }
};

// Confirmer la suppression
const confirmDelete = (data: any) => {
  userToDelete.value = data;
  confirmHeader.value = 'Confirmer la suppression';
  confirmMessage.value = `Êtes-vous sûr de vouloir supprimer le compte utilisateur de ${data.employee?.fullName || 'cet utilisateur'} ?`;
  showConfirmDialog.value = true;
};

// Exécuter la suppression
const onConfirmDelete = () => {
  if (userToDelete.value) {
    emit('delete', userToDelete.value.id);
    userToDelete.value = null;
  }
};

// Basculer le blocage d'un utilisateur
const toggleBlockUser = (data: any, isBlocked: boolean) => {
  emit('toggle-block', { ...data, isBlocked });
};

// Toggle du menu d'actions
const toggleActionMenu = (event: MouseEvent, id: string | number, data: any) => {
  if (activeMenuId.value === id) {
    activeMenuId.value = null;
    activeMenuData.value = null;
  } else {
    activeMenuId.value = id;
    activeMenuData.value = data;

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    dropdownStyle.value = {
      top: `${rect.bottom + 5}px`,
      left: `${rect.left - 208 + rect.width}px`, // 208px = w-52
    };
  }
};

// Gérer l'action Modifier
const handleEdit = (data: any) => {
  activeMenuId.value = null;
  activeMenuData.value = null;
  emit('edit', data);
};

// Gérer l'action Supprimer
const handleDelete = (data: any) => {
  activeMenuId.value = null;
  activeMenuData.value = null;
  confirmDelete(data);
};

// Gestion du téléchargement PDF
const handleDownloadPdf = () => {
  emit('action:download-pdf');
};

// Fermer le menu si on clique en dehors
if (process.client) {
  onMounted(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('button[class*="hover:bg-gray-100"]') &&
        !target.closest('[style*="fixed"]')
      ) {
        activeMenuId.value = null;
        activeMenuData.value = null;
      }
    };
    document.addEventListener('click', handleClickOutside);
  });
}
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

/* Animation du dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
