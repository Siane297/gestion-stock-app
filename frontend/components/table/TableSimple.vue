<template>
  <!-- Simple Table Minimal (No external container padding/background) -->
  <div class="w-full">
    <!-- Table -->
    <DataTable
      :value="data"
      :paginator="true"
      :rows="rowsPerPage"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      responsiveLayout="scroll"
      stripedRows
      class="custom-table-simple"
      :loading="loading"
    >
      <!-- Empty State -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-12">
          <Icon icon="tabler:database-x" class="text-5xl text-gray-300 mb-3" />
          <p class="text-gray-500 text-base font-medium">Aucune donnée disponible</p>
        </div>
      </template>

      <!-- Colonnes Dynamiques -->
      <slot name="columns">
          <Column
            v-for="col in columns"
            :key="col.field"
            :field="col.field"
            :header="col.header"
            :sortable="col.sortable !== false"
            headerClass="!bg-bleu text-black text-[13px] font-semibold py-3 px-4"
          >
            <template v-if="col.type === 'tag'" #body="{ data }">
                <Tag :value="getNestedValue(data, col.field)" severity="info" />
            </template>
            
            <template v-else-if="col.type === 'price'" #body="{ data }">
                <span class="font-bold text-primary text-sm">{{ formatPrice(getNestedValue(data, col.field)) }}</span>
            </template>

            <template v-else-if="col.customRender" #body="{ data }">
              <slot :name="`column-${col.field}`" :data="data">
                 {{ getNestedValue(data, col.field) }}
              </slot>
            </template>
            
            <template v-else #body="{ data }">
                <span class="text-sm text-gray-700">{{ getNestedValue(data, col.field) }}</span>
            </template>
          </Column>
      </slot>

      <!-- Colonne Actions (Optional) -->
      <Column
        v-if="showActions"
        header="Actions"
        :style="{ width: '80px' }"
        headerClass="!bg-bleu text-black text-[13px] font-semibold py-3 px-4"
        alignFrozen="right"
        frozen
      >
        <template #body="slotProps">
          <div class="flex justify-center">
            <button
              @click="toggleActionMenu($event, slotProps.data.id || slotProps.index, slotProps.data)"
              class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon icon="mdi:dots-vertical" class="text-lg text-gray-600" />
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
          class="fixed z-[9999] w-[180px] bg-white rounded-xl shadow-lg border border-gris p-2"
        >
             <button
               v-if="showView"
               @click="handleMenuAction('view', activeMenuData)"
               class="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-bleu/40 transition-colors text-left text-gray-600"
             >
               <Icon icon="tabler:eye" class="w-5 h-auto" />
               <span class="text-sm font-medium">Voir Détails</span>
             </button>

             <button
               v-if="showEdit"
               @click="handleMenuAction('edit', activeMenuData)"
               class="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-bleu/40 transition-colors text-left text-gray-600"
             >
               <Icon icon="tabler:edit" class="w-5 h-auto" />
               <span class="text-sm font-medium">Modifier</span>
             </button>

             <hr v-if="showDelete && (showView || showEdit)" class="my-2 border-gris" />

             <button
               v-if="showDelete"
               @click="handleMenuAction('delete', activeMenuData)"
               class="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600"
             >
               <Icon icon="tabler:trash" class="w-5 h-auto text-red-600" />
               <span class="text-sm font-medium">Supprimer</span>
             </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Icon } from "@iconify/vue";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import { useCurrency } from '~/composables/useCurrency';

// --- Types ---
export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  type?: 'text' | 'price' | 'date' | 'tag' | 'boolean';
  customRender?: boolean; 
}

interface Props {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  rowsPerPage?: number;
  showActions?: boolean;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rowsPerPage: 10,
  showActions: true,
  showView: true,
  showEdit: true,
  showDelete: true
});

const emit = defineEmits<{
  'action:view': [data: any];
  'action:edit': [data: any];
  'action:delete': [data: any];
}>();

// --- State ---
const activeMenuId = ref<string | number | null>(null);
const activeMenuData = ref<any>(null);
const dropdownStyle = ref({});

// --- Helpers ---
const getNestedValue = (obj: any, path: string) => {
  if (!obj) return '';
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const { formatPrice: globalFormatPrice } = useCurrency();
const formatPrice = (value: any) => {
    if (value === undefined || value === null) return '-';
    return globalFormatPrice(value);
};

// --- Menu Actions ---
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
      left: `${rect.left - 180 + rect.width}px`,
    };
  }
};

const handleMenuAction = (actionName: string, data: any) => {
    activeMenuId.value = null;
    activeMenuData.value = null;
    if (actionName === 'view') emit('action:view', data);
    else if (actionName === 'edit') emit('action:edit', data);
    else if (actionName === 'delete') emit('action:delete', data);
};

onMounted(() => {
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('button') && !target.closest('.fixed')) {
       activeMenuId.value = null;
       activeMenuData.value = null;
    }
  };
  document.addEventListener("click", handleClickOutside);
});
</script>

<style scoped>
:deep(.custom-table-simple) {
  @apply rounded-lg border-x border-b overflow-hidden shadow-none;
}
:deep(.custom-table-simple .p-datatable-tbody > tr > td) {
    @apply py-2.5 border-b border-gray-100;
}
:deep(.p-datatable-header) {
    display: none;
}
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
