<template>
  <!-- Skeleton Loading State -->
  <TableSkeleton v-if="loading" :columns="6" :rows="8" />

  <!-- Actual Content -->
  <div v-else class="w-full bg-white border-2 border-gris/40 rounded-xl p-7">
    <!-- Barre de recherche et actions -->
    <div class="mb-6 flex flex-col gap-4">
      <!-- Barre de recherche - 100% width -->
      <div class="w-full">
        <IconField iconPosition="left">
          <InputIcon>
            <i class="pi pi-search"></i>
          </InputIcon>
          <InputText
            v-model="searchQuery"
            placeholder="Rechercher par nom, matricule..."
            class="w-full"
          />
        </IconField>
      </div>

      <!-- Filtres - responsive grid -->
      <div
        class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full"
      >
        <!-- Filtres à gauche -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
          <!-- Filtre statut -->
          <Select
            v-model="selectedStatut"
            :options="statutOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filtrer par statut"
            class="w-full lg:w-48"
            showClear
          />

          <!-- Filtre par date -->
          <DatePicker
            v-model="selectedDate"
            dateFormat="dd/mm/yy"
            placeholder="Sélectionner une date"
            showIcon
            :showButtonBar="true"
            class="w-full lg:w-48"
            fluid
          />
        </div>

        <!-- Boutons à droite -->
        <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <!-- Bouton PDF -->
          <AppButton
            label="Télécharger PDF"
            icon-left="pi pi-file-pdf"
            variant="outline"
            size="sm"
            :downloading="pdfLoading || false"
            :progress="pdfProgress || 0"
            class="bg-white w-full sm:w-fit"
            @click="handleDownloadPdf"
          />

          <!-- Bouton rafraîchir -->
          <AppButton
            label="Rafraîchir"
            icon-left="pi pi-replay"
            variant="primary"
            size="sm"
            @click="handleRefresh"
            :loading="loading"
            class="w-full sm:w-fit"
          />
        </div>
      </div>
    </div>

    <!-- Table -->
    <DataTable
      :value="filteredData"
      :paginator="true"
      :rows="rowsPerPage"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      responsiveLayout="scroll"
      stripedRows
      class="custom-table"
      :loading="false"
    >
      <!-- Message quand la table est vide -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16">
          <Icon
            icon="tabler:database-x"
            class="text-6xl text-gray-300 mb-4"
          />
          <p class="text-gray-500 text-lg font-medium">
            Aucun historique disponible
          </p>
          <p class="text-gray-400 text-sm mt-2">
            Il n'y a aucun pointage enregistré pour le moment
          </p>
        </div>
      </template>

      <!-- Colonnes -->
      <Column
        v-if="!hideEmployeeColumn"
        field="employe.fullName"
        header="Employé"
        sortable
        headerClass="bg-primary text-white font-semibold"
      >
        <template #body="slotProps">
          <AvatarInitials
            :name="slotProps.data.employe?.fullName || 'Inconnu'"
            :subtitle="slotProps.data.employe?.matricule"
            size="sm"
            :show-name="true"
          />
        </template>
      </Column>

      <Column
        field="createdAt"
        header="Date"
        sortable
        headerClass="bg-primary text-white font-semibold"
      >
        <template #body="slotProps">
          <span class="font-medium">{{
            formatDate(slotProps.data.createdAt)
          }}</span>
        </template>
      </Column>

      <Column
        field="statut"
        header="Statut"
        sortable
        headerClass="bg-primary text-white font-semibold"
      >
        <template #body="slotProps">
          <span
            :class="[
              'px-3 py-1 rounded-full text-xs font-semibold',
              getStatutClass(slotProps.data.statut),
            ]"
          >
            {{ getStatutLabel(slotProps.data.statut) }}
          </span>
        </template>
      </Column>

      <Column
        field="heureEntree"
        header="Heure d'entrée"
        sortable
        headerClass="bg-primary text-white font-semibold"
      >
        <template #body="slotProps">
          <div
            v-if="slotProps.data.heureEntree"
            class="flex items-center gap-2"
          >
            <!-- <Icon icon="mdi:login" class="text-green-600" /> -->
            <span class="font-medium">{{
              formatTime(slotProps.data.heureEntree)
            }}</span>
          </div>
          <span v-else class="text-gray-400 text-sm">N/A</span>
        </template>
      </Column>

      <Column
        field="heureSortie"
        header="Heure de sortie"
        sortable
        headerClass="bg-primary text-white font-semibold"
      >
        <template #body="slotProps">
          <div
            v-if="slotProps.data.heureSortie"
            class="flex items-center gap-2"
          >
            <!-- <Icon icon="mdi:logout" class="text-red-600" /> -->
            <span class="font-medium">{{
              formatTime(slotProps.data.heureSortie)
            }}</span>
          </div>
          <span v-else class="text-gray-400 text-sm">N/A</span>
        </template>
      </Column>

      <Column
        field="dureeTravailMinutes"
        header="Durée"
        sortable
        headerClass="bg-primary text-white font-semibold"
      >
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <!-- <Icon icon="mdi:clock-outline" class="text-blue-600" /> -->
            <span class="font-medium">
              {{
                formatDuree(
                  slotProps.data.dureeTravailMinutes,
                  slotProps.data.heureEntree,
                  slotProps.data.heureSortie
                )
              }}
            </span>
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Toast pour les notifications -->
    <Toast />
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

/* Cellules */
:deep(.custom-table .p-datatable-tbody > tr > td) {
  @apply py-4 px-4;
}

/* Pagination */
:deep(.custom-table .p-paginator) {
  @apply bg-bleu rounded-none border-t border-gray-200;
}

:deep(.custom-table .p-paginator .p-paginator-current) {
  @apply text-noir;
}

/* Boutons de pagination */
:deep(.custom-table .p-paginator button) {
  @apply text-gray-600;
}

:deep(.custom-table .p-paginator button:hover) {
  @apply bg-primary text-white;
}

:deep(.custom-table .p-paginator button.p-highlight) {
  @apply bg-primary text-white;
}
</style>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { Icon } from '@iconify/vue'
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import AppButton from "~/components/button/AppButton.vue";
import TableSkeleton from "~/components/skeleton/TableSkeleton.vue";
import AvatarInitials from "~/components/avatar/AvatarInitials.vue";
import type { BilanPresence } from "~/composables/api/useHistoriqueApi";
import { useTimezone } from "~/composables/useTimezone";

interface Props {
  data: BilanPresence[];
  loading?: boolean;
  pdfLoading?: boolean; // État de chargement PDF depuis le parent
  pdfProgress?: number; // Progression du téléchargement
  rowsPerPage?: number;
  hideEmployeeColumn?: boolean; // Masquer la colonne employé (mode détail)
  hideSearchBar?: boolean; // Masquer la barre de recherche
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pdfLoading: false,
  pdfProgress: 0,
  rowsPerPage: 10,
  hideEmployeeColumn: false,
  hideSearchBar: false,
});

const emit = defineEmits<{
  filterChange: [
    filters: {
      statut?:
        | "A_L_HEURE"
        | "EN_RETARD"
        | "ABSENT"
        | "INCOMPLET"
        | "EN_CONGE"
        | undefined;
      startDate?: string;
      endDate?: string;
      employeeId?: string;
    }
  ];
  "action:download-pdf": [];
}>();

const toast = useToast();
const { userTimezone } = useTimezone();
const searchQuery = ref("");
const selectedStatut = ref<
  "A_L_HEURE" | "EN_RETARD" | "ABSENT" | "INCOMPLET" | "EN_CONGE" | null
>(null);
const selectedDate = ref<Date | null>(null);

const statutOptions = [
  { label: "À l'heure", value: "A_L_HEURE" },
  { label: "En retard", value: "EN_RETARD" },
  { label: "Absent", value: "ABSENT" },
  { label: "Incomplet", value: "INCOMPLET" },
  { label: "En congé", value: "EN_CONGE" },
];

// Émettre les changements de filtre
watch([selectedStatut, selectedDate], ([newStatut, newDate]) => {
  const formattedDate = newDate
    ? newDate.toISOString().split("T")[0]
    : undefined;
  emit("filterChange", {
    statut: newStatut || undefined,
    startDate: formattedDate,
    endDate: formattedDate,
  });
});

// Fonction rafraîchir
const handleRefresh = () => {
  const formattedDate = selectedDate.value
    ? selectedDate.value.toISOString().split("T")[0]
    : undefined;
  emit("filterChange", {
    statut: selectedStatut.value || undefined,
    startDate: formattedDate,
    endDate: formattedDate,
  });
};

// Filtrage des données
const filteredData = computed(() => {
  let filtered = props.data;

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((item) => {
      return (
        item.employe.fullName.toLowerCase().includes(query) ||
        item.employe.matricule.toLowerCase().includes(query) ||
        item.employe.department.toLowerCase().includes(query)
      );
    });
  }

  return filtered;
});

// Formatage de la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: userTimezone.value, // Timezone dynamique
  });
};

// Formatage de l'heure
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: userTimezone.value, // Timezone dynamique
  });
};

// Formatage de la durée
const formatDuree = (
  minutes: number,
  heureEntree?: string | null,
  heureSortie?: string | null
) => {
  // Si pas d'heure d'entrée (absent), afficher N/A
  if (!heureEntree) {
    return "N/A";
  }

  // Si pas de sortie, durée incomplète
  if (!heureSortie) {
    return "En cours";
  }

  // Utiliser la durée enregistrée en BDD (avec pause déduite si applicable)
  if (minutes !== undefined && minutes !== null) {
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${heures}h ${mins.toString().padStart(2, "0")}`;
  }

  // Fallback : calculer en temps réel (ne devrait normalement pas arriver)
  const entree = new Date(heureEntree);
  const sortie = new Date(heureSortie);
  const diffMs = sortie.getTime() - entree.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes > 0) {
    const heures = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return `${heures}h ${mins.toString().padStart(2, "0")}`;
  }

  return "N/A";
};

// Obtenir le label du statut
const getStatutLabel = (statut: string) => {
  const labels: Record<string, string> = {
    A_L_HEURE: "À l'heure",
    EN_RETARD: "En retard",
    ABSENT: "Absent",
    INCOMPLET: "Incomplet",
    EN_CONGE: "En congé",
  };
  return labels[statut] || statut;
};

// Obtenir les classes CSS selon le statut
const getStatutClass = (statut: string) => {
  const classes: Record<string, string> = {
    A_L_HEURE: "bg-green-100 text-green-700",
    EN_RETARD: "bg-orange-100 text-orange-700",
    ABSENT: "bg-red-100 text-red-700",
    INCOMPLET: "bg-yellow-100 text-yellow-700",
    EN_CONGE: "bg-blue-100 text-blue-700",
  };
  return classes[statut] || "bg-gray-100 text-gray-700";
};

// Gestion du téléchargement PDF
const handleDownloadPdf = () => {
  emit("action:download-pdf");
};
</script>
