<template>
  <!-- Banner Header -->
  <!-- <BannerHeader
    :title="title"
    :description="description"
    :banner-image="bannerImage"
  /> -->

  <!-- Skeleton Loading State -->
  <TableSkeleton v-if="loading" :columns="5" :rows="8" :show-filters="false" />
  
  <!-- Actual Content -->
  <div v-else class="w-full bg-white border-2 border-gris/40 rounded-xl p-7">
    <!-- Barre de recherche et actions -->
    <div class="mb-6 flex flex-row justify-between items-center gap-4">
      <div class="w-full sm:w-96">
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

      <!-- Boutons d'export -->
      <div class="flex gap-3">
        <AppButton
          label="Télécharger PDF"
          icon-left="pi pi-file-pdf"
          variant="outline"
          size="sm"
          :downloading="pdfLoading || false"
          :progress="pdfProgress || 0"
          class="bg-white"
          @click="handleDownloadPdf"
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
      class="custom-table "
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
            Il n'y a aucun pointage enregistré pour le moment
          </p>
        </div>
      </template>

      <!-- Colonnes -->
      <Column
        field="employee.fullName"
        header="Nom complet"
        sortable
        headerClass="bg-primary text-white font-semibold"
      >
        <template #body="slotProps">
          <AvatarInitials
            :name="slotProps.data.employee?.fullName || 'Inconnu'"
            :subtitle="slotProps.data.employee?.matricule"
            size="sm"
            :show-name="true"
          />
        </template>
      </Column>
      


      <Column
        field="date"
        header="Date"
        sortable
        headerClass="bg-primary text-white font-semibold"
      >
        <template #body="slotProps">
          {{ formatDate(slotProps.data.date) }}
        </template>
      </Column>

      <Column
        field="heureEntree"
        header="Entrée"
        sortable
        headerClass="bg-primary text-white font-semibold"
      >
        <template #body="slotProps">
          <div v-if="slotProps.data.heureEntree" class="flex items-center gap-2">
            <!-- <Icon icon="mdi:login" class="text-green-600" /> -->
            <span class="font-medium">{{ formatTime(slotProps.data.heureEntree) }}</span>
          </div>
          <span v-else class="text-gray-400 text-sm">-</span>
        </template>
      </Column>

      <Column
        field="heureSortie"
        header="Sortie"
        sortable
        headerClass="bg-primary text-white font-semibold"
      >
        <template #body="slotProps">
          <div v-if="slotProps.data.heureSortie" class="flex items-center gap-2">
            <!-- <Icon icon="mdi:logout" class="text-red-600" /> -->
            <span class="font-medium">{{ formatTime(slotProps.data.heureSortie) }}</span>
          </div>
          <span v-else class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
            En cours
          </span>
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
import { Icon } from "@iconify/vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import AppButton from "~/components/button/AppButton.vue";
import BannerHeader from "~/components/banner/BannerHeader.vue";
import TableSkeleton from "~/components/skeleton/TableSkeleton.vue";
import AvatarInitials from "~/components/avatar/AvatarInitials.vue";
import { useTimezone } from "~/composables/useTimezone";

interface Props {
  title: string;
  description: string;
  bannerImage?: string;
  data: any[];
  loading?: boolean;
  pdfLoading?: boolean; // État de chargement PDF depuis le parent
  pdfProgress?: number; // Progression du téléchargement
  rowsPerPage?: number;
  searchFields?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  bannerImage: "/assets/image/bg-connect.jpg",
  loading: false,
  pdfLoading: false,
  pdfProgress: 0,
  rowsPerPage: 10,
  searchFields: () => ['employee.fullName', 'employee.phoneNumber'],
});

const emit = defineEmits<{
  "action:download-pdf": [];
}>();

const toast = useToast();
const { userTimezone } = useTimezone();
const searchQuery = ref("");

// Interface pour les données groupées
interface GroupedAttendance {
  id: string;
  employee: any;
  date: string;
  heureEntree?: string;
  heureSortie?: string;
  statut: 'EN_COURS' | 'TERMINE';
}

// Groupement des données
const groupedData = computed(() => {
  if (!props.data || props.data.length === 0) return [];

  const groups = new Map<string, GroupedAttendance>();

  // Trier par date croissante pour traiter les événements dans l'ordre
  const sortedData = [...props.data].sort((a, b) => {
    const dateA = new Date(a.heurePointage || a.createdAt).getTime();
    const dateB = new Date(b.heurePointage || b.createdAt).getTime();
    return dateA - dateB;
  });

  sortedData.forEach((item) => {
    const timestamp = item.heurePointage || item.createdAt;
    const date = timestamp.split('T')[0];
    const key = `${item.employeeId}-${date}`;

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        employee: item.employee,
        date: timestamp,
        statut: 'EN_COURS'
      });
    }

    const group = groups.get(key)!;

    if (item.type === 'ENTREE') {
      // Si on a déjà une entrée, c'est peut-être une nouvelle session dans la même journée ?
      // Pour simplifier, on prend la première entrée
      if (!group.heureEntree) {
        group.heureEntree = item.heurePointage || item.createdAt;
      }
    } else if (item.type === 'SORTIE') {
      // On prend la dernière sortie
      group.heureSortie = item.heurePointage || item.createdAt;
      group.statut = 'TERMINE';
    }
  });

  // Convertir en tableau et trier par date décroissante (plus récent en premier)
  return Array.from(groups.values()).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
});

// Filtrage des données groupées
const filteredData = computed(() => {
  if (!searchQuery.value) {
    return groupedData.value;
  }

  const query = searchQuery.value.toLowerCase();
  return groupedData.value.filter((item) => {
    return (
      item.employee?.fullName?.toLowerCase().includes(query) ||
      item.employee?.matricule?.toLowerCase().includes(query)
    );
  });
});

// Formatage de la date
const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: userTimezone.value,
  });
};

// Formatage de l'heure
const formatTime = (timestamp?: string) => {
  if (!timestamp) return 'En cours';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: userTimezone.value,
  });
};

// Gestion du téléchargement PDF
const handleDownloadPdf = () => {
  emit('action:download-pdf');
};


</script>
