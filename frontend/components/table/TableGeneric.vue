<template>
  <!-- Data Table Generic -->
  <div class="w-full bg-white border-2 border-gris/40 rounded-xl p-7">
    <!-- Barre de recherche et actions -->
    <div class="mb-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
      <div class="w-full lg:w-96" v-if="searchFields.length > 0">
        <IconField iconPosition="left">
          <InputIcon>
            <i class="pi pi-search"></i>
          </InputIcon>
          <InputText
            v-model="searchQuery"
            placeholder="Rechercher..."
            class="w-full"
          />
        </IconField>
      </div>

      <!-- Actions Globales (ex: Nouveau) -->
      <div v-if="globalAction" class="flex flex-col sm:flex-row gap-3 lg:w-auto">
        <AppButton
          :label="globalAction.label"
          :icon="globalAction.icon"
          :variant="globalAction.variant || 'primary'"
          :full-width="true"
          class="w-full sm:w-auto"
          @click="handleGlobalAction"
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
      <!-- Empty State -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16">
          <Icon icon="tabler:database-x" class="text-6xl text-gray-300 mb-4" />
          <p class="text-gray-500 text-lg font-medium">Aucune donnée disponible</p>
          <p class="text-gray-400 text-sm mt-2">Il n'y a aucun élément à afficher pour le moment</p>
        </div>
      </template>

      <!-- Colonnes Dynamiques -->
      <Column
        v-for="col in columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :sortable="col.sortable !== false"
        headerClass="bg-bleu text-black font-semibold py-3 px-4"
      >
        <template v-if="col.type === 'tag'" #body="{ data }">
            <Tag :value="getNestedValue(data, col.field)" severity="info" />
        </template>
        
        <template v-else-if="col.type === 'price'" #body="{ data }">
            <span class="font-mono">{{ formatPrice(getNestedValue(data, col.field)) }}</span>
        </template>

        <template v-else-if="col.customRender" #body="{ data }">
          <slot :name="`column-${col.field}`" :data="data">
             <!-- Fallback content if slot is not used -->
             {{ getNestedValue(data, col.field) }}
          </slot>
        </template>
        
        <template v-else #body="{ data }">
            {{ getNestedValue(data, col.field) }}
        </template>
      </Column>

      <!-- Colonne Actions (Dropdown) -->
      <Column
        header="Actions"
        :style="{ width: '100px' }"
        headerClass="bg-bleu text-black font-semibold py-3 px-4"
        alignFrozen="right"
        frozen
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

    <!-- Dropdown Menu (Teleport) -->
    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="activeMenuId !== null"
          :style="dropdownStyle"
          class="fixed z-[9999] w-52 bg-white rounded-xl shadow-lg border border-gris p-2"
        >
             <!-- Voir Détails -->
             <button
               @click="handleMenuAction('view', activeMenuData)"
               class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-left text-gray-600"
             >
               <Icon icon="lucide:eye" class="w-5 h-auto text-blue-600" />
               <span class="text-sm font-medium">Voir Détails</span>
             </button>

             <!-- Modifier -->
             <button
               @click="handleMenuAction('edit', activeMenuData)"
               class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors text-left text-gray-600"
             >
               <Icon icon="lucide:edit" class="w-5 h-auto text-orange-600" />
               <span class="text-sm font-medium">Modifier</span>
             </button>

             <hr class="my-2 border-gris" />

             <!-- Supprimer -->
             <button
               @click="handleMenuAction('delete', activeMenuData)"
               class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600"
             >
               <Icon icon="lucide:trash-2" class="w-5 h-auto text-red-600" />
               <span class="text-sm font-medium">Supprimer</span>
             </button>
        </div>
      </Transition>
    </Teleport>

    <!-- Dialog de confirmation suppression -->
    <ConfirmationDialog
      v-model:visible="showConfirmDialog"
      :message="confirmMessage"
      header="Confirmation de suppression"
      accept-label="Oui, supprimer"
      reject-label="Non, annuler"
      accept-variant="danger"
      @accept="onConfirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Icon } from "@iconify/vue";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import AppButton from '~/components/button/AppButton.vue';
import ConfirmationDialog from '~/components/dialog/ConfirmationDialog.vue';
import { useRouter } from 'vue-router';

// --- Types ---

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  type?: 'text' | 'price' | 'date' | 'tag' | 'boolean';
  customRender?: boolean; 
}

export interface GlobalAction {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  handler?: () => void;
  link?: string;
}

interface Props {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  rowsPerPage?: number;
  searchFields?: string[];
  globalAction?: GlobalAction;
  deleteLabelField?: string; // Champ utilisé pour afficher le nom dans le message de suppression
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rowsPerPage: 10,
  searchFields: () => [],
  deleteLabelField: 'nom'
});

const emit = defineEmits<{
  'action:view': [data: any];
  'action:edit': [data: any];
  'action:delete': [data: any];
}>();

const router = useRouter();

// --- State ---
const searchQuery = ref('');
const showConfirmDialog = ref(false);
const itemToDelete = ref<any>(null);
const confirmMessage = ref('');

const activeMenuId = ref<string | number | null>(null);
const activeMenuData = ref<any>(null);
const dropdownStyle = ref({});

// --- Helpers ---

// Permet d'accéder à des propriétés imbriquées (ex: 'categorie.nom')
const getNestedValue = (obj: any, path: string) => {
  if (!obj) return '';
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const formatPrice = (value: any) => {
    if (value === undefined || value === null) return '-';
    return Number(value).toLocaleString('fr-Fr') + ' FCFA'; // ou KMF selon préfs
};

// --- Actions Globales ---
const handleGlobalAction = () => {
    if (props.globalAction?.handler) {
        props.globalAction.handler();
    } else if (props.globalAction?.link) {
        router.push(props.globalAction.link);
    }
};

// --- Dropdown Menu Logic ---

const toggleActionMenu = (event: MouseEvent, id: string | number, data: any) => {
  if (activeMenuId.value === id) {
    activeMenuId.value = null;
    activeMenuData.value = null;
  } else {
    activeMenuId.value = id;
    activeMenuData.value = data;

    // Calculer la position du dropdown
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    dropdownStyle.value = {
      top: `${rect.bottom + 5}px`,
      left: `${rect.left - 192 + rect.width}px`, // 192px = largeur du dropdown (w-48) approx (w-52 = 13rem = 208px actually)
      // Ajustement pour w-52 (208px)
      // left: `${rect.left - 208 + rect.width}px` 
    };
  }
};

const handleMenuAction = (actionName: string, data: any) => {
    // Fermer le menu
    activeMenuId.value = null;
    activeMenuData.value = null;

    if (actionName === 'view') {
        emit('action:view', data);
    } else if (actionName === 'edit') {
        emit('action:edit', data);
    } else if (actionName === 'delete') {
        confirmDelete(data);
    }
};

// Fermer le menu si on clique en dehors
if (typeof window !== 'undefined') {
  onMounted(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('button') && // Simplification: si on clique pas sur un bouton (attention aux boutons du menu meme)
        !target.closest('[style*="fixed"]')
      ) {
         // Logic to check if click is outside dropdown AND outside toggle button
         // But here simple check: if we click outside the dropdown container
         activeMenuId.value = null;
         activeMenuData.value = null;
      }
    };
    document.addEventListener("click", handleClickOutside);
  });
}

// --- Delete Logic ---
const confirmDelete = (item: any) => {
    itemToDelete.value = item;
    const label = getNestedValue(item, props.deleteLabelField) || 'cet élément';
    confirmMessage.value = `Êtes-vous sûr de vouloir supprimer "${label}" ? Cette action est irréversible.`;
    showConfirmDialog.value = true;
};

const onConfirmDelete = () => {
    if (itemToDelete.value) {
        emit('action:delete', itemToDelete.value);
        itemToDelete.value = null;
    }
};

// --- Filtering ---
const filteredData = computed(() => {
  if (!searchQuery.value) return props.data;

  const search = searchQuery.value.toLowerCase();

  return props.data.filter((item) => {
    if (props.searchFields.length > 0) {
      return props.searchFields.some((field) => {
        const val = getNestedValue(item, field);
        return val && String(val).toLowerCase().includes(search);
      });
    }
    
    // Fallback: search in displayed columns
    return props.columns.some((col) => {
        const val = getNestedValue(item, col.field);
        return val && String(val).toLowerCase().includes(search);
    });
  });
});
</script>

<style scoped>
:deep(.custom-table) {
  @apply rounded-lg border overflow-hidden shadow-sm;
}
:deep(.p-datatable-header) {
    background: transparent;
    border: none;
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
