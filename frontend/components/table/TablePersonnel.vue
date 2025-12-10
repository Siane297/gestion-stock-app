<template>
  <!-- Banner Header -->
  <BannerHeader
    :title="title"
    :description="description"
    :banner-image="bannerImage"
    :loading="loading"
  />

  <!-- Skeleton Loading State -->
  <TableSkeleton v-if="loading" :columns="7" :rows="10" />
  
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
            placeholder="Rechercher..."
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
        
        <!-- Bouton d'action principal -->
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
      <!-- Message quand la table est vide -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16">
          <Icon
            icon="tabler:database-x"
            class="text-6xl text-gray-300 mb-4"
          />
          <p class="text-gray-500 text-lg font-medium">
            Aucune donnée disponible
          </p>
          <p class="text-gray-400 text-sm mt-2">
            Il n'y a aucun élément à afficher pour le moment
          </p>
        </div>
      </template>

      <!-- Colonnes dynamiques -->
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

      <!-- Colonne Actions -->
      <Column
        v-if="showActions"
        header="Actions"
        :style="{ width: '100px' }"
        headerClass="bg-primary text-white font-semibold"
      >
        <template #body="slotProps">
          <div class="flex justify-center">
            <button
              @click="
                toggleActionMenu(
                  $event,
                  slotProps.data.id || slotProps.index,
                  slotProps.data
                )
              "
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon icon="mdi:dots-vertical" class="text-xl text-gray-600" />
            </button>
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Dropdown Menu (en dehors de la table avec Teleport) -->
    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="activeMenuId !== null"
          :style="dropdownStyle"
          class="fixed z-[9999] w-52 bg-white rounded-xl shadow-lg border border-gris p-2"
        >
          <template v-for="(action, index) in computedActions" :key="action.name">
            <!-- Séparateur avant l'action supprimer -->
            <hr v-if="action.name === 'delete'" class="my-2 border-gris" />
            
            <button
              @click="handleMenuActionClick(action, activeMenuData)"
              class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slot transition-colors text-left"
              :class="getActionHoverClass(action.variant)"
            >
              <Icon
                :icon="action.icon"
                class="w-5 h-auto"
                :class="
                  getActionColor(action.variant || action.severity || 'secondary')
                "
              />
              <span
                class="text-sm font-medium text-noir"
                :class="getActionTextClass(action.variant)"
                >{{ action.label || action.tooltip }}</span
              >
            </button>
          </template>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast pour les notifications -->
    <Toast />

    <!-- Dialog de confirmation -->
    <ConfirmationDialog
      v-model:visible="showConfirmDialog"
      :message="confirmMessage"
      :header="confirmHeader"
      accept-label="Oui, supprimer"
      reject-label="Non, annuler"
      accept-variant="danger"
      @accept="onConfirmAction"
    />
  </div>
</template>

<style scoped>
/* Personnalisation de la table PrimeVue */
:deep(.custom-table) {
  @apply rounded-lg border overflow-hidden shadow-sm;
}

/* En-têtes de colonnes */
:deep(.custom-table .p-datatable-thead > tr > th) {
  @apply bg-bleu text-noir font-semibold py-4 px-4;
}

/* Hover sur les en-têtes triables */
:deep(.custom-table .p-datatable-thead > tr > th.p-sortable-column:hover) {
  @apply bg-primary/90;
}

/* Corps de la table */
:deep(.custom-table .p-datatable-tbody > tr) {
  @apply transition-colors;
}

/* :deep(.custom-table .p-datatable-tbody > tr:hover) {
  @apply bg-blue-50;
} */

/* Cellules */
:deep(.custom-table .p-datatable-tbody > tr > td) {
  @apply py-3 px-4;
}

/* Pagination */
:deep(.custom-table .p-paginator) {
  @apply bg-bleu rounded-none border-t border-gray-200;
}

:deep(.custom-table .p-paginator .p-paginator-current) {
  @apply text-noir;
}

/* Boutons de pagination */
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

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import AppButton from "~/components/button/AppButton.vue";
import ConfirmationDialog from "~/components/dialog/ConfirmationDialog.vue";
import BannerHeader from "~/components/banner/BannerHeader.vue";
import TableSkeleton from "~/components/skeleton/TableSkeleton.vue";

interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  customRender?: boolean; // Si true, utilise un slot pour le rendu personnalisé
}

interface TableAction {
  name: string;
  icon: string;
  severity?: string;
  variant?: "primary" | "secondary" | "outline" | "danger" | "success";
  tooltip?: string;
  label?: string;
  handler?: (data: any) => void; // Optionnel, utilisé seulement pour les actions personnalisées
}

interface ActionButton {
  label: string;
  icon?: string;
  variant?: "primary" | "secondary" | "outline" | "danger" | "success";
  link?: string; // Lien de navigation
  handler?: () => void; // Fonction personnalisée
}

interface Props {
  title: string;
  description: string;
  bannerImage?: string;
  columns: TableColumn[];
  data: any[];
  actions?: TableAction[];
  loading?: boolean;
  rowsPerPage?: number;
  searchFields?: string[]; // Champs sur lesquels effectuer la recherche
  showActions?: boolean;
  actionButton?: ActionButton; // Bouton d'action principal
  pdfLoading?: boolean; // État de chargement pour le PDF depuis le parent
  pdfProgress?: number; // Progression du téléchargement
}

const props = withDefaults(defineProps<Props>(), {
  bannerImage: "/assets/image/bg-connect.jpg",
  loading: false,
  rowsPerPage: 10,
  searchFields: () => [],
  showActions: true,
  actions: () => [], // Les actions par défaut seront ajoutées dans computed
  pdfProgress: 0,
});

const emit = defineEmits<{
  "action:view-details": [data: any];
  "action:view-qr": [data: any];
  "action:edit": [data: any];
  "action:delete": [data: any];
  "action:custom": [actionName: string, data: any];
  "action:download-pdf": [];
}>();

const toast = useToast();
const searchQuery = ref("");
const activeMenuId = ref<string | number | null>(null);
const activeMenuData = ref<any>(null);
const dropdownStyle = ref({});
const showConfirmDialog = ref(false);
const confirmMessage = ref("");
const confirmHeader = ref("Confirmation");
const pendingAction = ref<{ action: TableAction; data: any } | null>(null);
// isGeneratingPdf supprimée - gestion par le composant parent via pdfLoading prop

// Actions par défaut
const defaultActions: TableAction[] = [
  {
    name: "view-details",
    icon: "lucide:user",
    variant: "secondary" as const,
    label: "Voir Détails",
  },
  {
    name: "view-qr",
    icon: "lucide:scan-qr-code",
    variant: "secondary" as const,
    label: "Voir QR Code",
  },
  {
    name: "edit",
    icon: "lucide:edit",
    variant: "primary" as const,
    label: "Modifier",
  },
  {
    name: "delete",
    icon: "lucide:trash-2",
    variant: "danger" as const,
    label: "Supprimer",
  },
];

// Utiliser les actions par défaut si aucune action n'est fournie
const computedActions = computed(() => {
  return props.actions.length > 0 ? props.actions : defaultActions;
});

// Toggle du menu d'actions avec calcul de position
const toggleActionMenu = (
  event: MouseEvent,
  id: string | number,
  data: any
) => {
  if (activeMenuId.value === id) {
    activeMenuId.value = null;
    activeMenuData.value = null;
  } else {
    activeMenuId.value = id;
    activeMenuData.value = data;

    // Calculer la position du dropdown
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    // Positionner le dropdown en dessous du bouton, aligné à droite
    dropdownStyle.value = {
      top: `${rect.bottom + 5}px`,
      left: `${rect.left - 192 + rect.width}px`, // 192px = largeur du dropdown (w-48)
    };
  }
};

// Gestion du clic sur une action du menu dropdown
const handleMenuActionClick = (action: TableAction, data: any) => {
  // Fermer le menu
  activeMenuId.value = null;
  activeMenuData.value = null;

  // Actions nécessitant une confirmation
  if (action.name === "delete") {
    confirmMessage.value = `Êtes-vous sûr de vouloir supprimer ${
      data.fullName || "cet élément"
    } ?`;
    confirmHeader.value = "Confirmation de suppression";
    pendingAction.value = { action, data };
    showConfirmDialog.value = true;
    return;
  }

  // Exécuter l'action directement
  executeAction(action, data);
};

// Exécuter une action
const executeAction = (action: TableAction, data: any) => {
  // Émettre l'événement correspondant
  switch (action.name) {
    case "view-details":
      // Naviguer vers la page détails employé
      navigateTo(`/employees/${data.id}`);
      break;
    case "view-qr":
      emit("action:view-qr", data);
      break;
    case "edit":
      emit("action:edit", data);
      break;
    case "delete":
      emit("action:delete", data);
      break;
    default:
      // Action personnalisée
      if (action.handler) {
        action.handler(data);
      } else {
        emit("action:custom", action.name, data);
      }
  }
};

// Confirmation de l'action
const onConfirmAction = () => {
  if (pendingAction.value) {
    executeAction(pendingAction.value.action, pendingAction.value.data);
    pendingAction.value = null;
  }
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
    document.addEventListener("click", handleClickOutside);
  });
}

// Obtenir la couleur selon le severity ou variant
const getActionColor = (variantOrSeverity: string) => {
  const colors: Record<string, string> = {
    primary: "text-gray-600",
    secondary: "text-gray-600",
    info: "text-blue-600",
    danger: "text-red-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    outline: "text-gray-600",
  };
  return colors[variantOrSeverity] || "text-gray-600";
};

// Obtenir la classe de texte
const getActionTextClass = (variant?: string) => {
  if (variant === "danger") return "text-red-600";
  return "";
};

// Obtenir la classe de hover
const getActionHoverClass = (variant?: string) => {
  const hoverClasses: Record<string, string> = {
    danger: "hover:bg-red-50",
    success: "hover:bg-green-50",
    primary: "hover:bg-blue-50",
    warning: "hover:bg-yellow-50",
  };
  return hoverClasses[variant || ""] || "";
};

// Gestion du clic sur le bouton d'action principal (bannière)
const handleActionClick = () => {
  if (props.actionButton?.handler) {
    props.actionButton.handler();
  } else if (props.actionButton?.link) {
    navigateTo(props.actionButton.link);
  }
};

// Gestion du téléchargement PDF
const handleDownloadPdf = () => {
  emit('action:download-pdf');
};

// Filtrage des données basé sur la recherche
const filteredData = computed(() => {
  if (!searchQuery.value) return props.data;

  const search = searchQuery.value.toLowerCase();

  return props.data.filter((item) => {
    // Si searchFields est défini, rechercher uniquement dans ces champs
    if (props.searchFields.length > 0) {
      return props.searchFields.some((field) => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(search);
      });
    }

    // Sinon, rechercher dans tous les champs des colonnes
    return props.columns.some((col) => {
      const value = item[col.field];
      return value && String(value).toLowerCase().includes(search);
    });
  });
});
</script>
