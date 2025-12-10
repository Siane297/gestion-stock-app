<template>
  <!-- Skeleton Loading State -->
  <TableSkeleton v-if="loading" :columns="6" :rows="10" />
  
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
      <div v-if="!hideActionButtons" class="flex flex-col sm:flex-row gap-3 lg:w-auto">
        <!-- Bouton PDF -->
        <AppButton
          v-if="!hidePdfButton"
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
      <!-- Message vide -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16">
          <Icon icon="tabler:database-x" class="text-6xl text-gray-300 mb-4" />
          <p class="text-gray-500 text-lg font-medium">Aucune demande de congé</p>
          <p class="text-gray-400 text-sm mt-2">Il n'y a aucune demande à afficher</p>
        </div>
      </template>

      <!-- Colonne Employé -->
      <Column v-if="!hideEmployeeColumn" field="employe.fullName" header="Employé" sortable>
        <template #body="slotProps">
          <AvatarInitials
            :name="slotProps.data.employe?.fullName || 'Inconnu'"
            :subtitle="slotProps.data.employe?.matricule"
            size="sm"
            :show-name="true"
          />
        </template>
      </Column>

      <!-- Colonne Type de congé -->
      <Column field="typeConge.nom" header="Type de congé" sortable>
        <template #body="slotProps">
          <span
            class="px-3 py-1 rounded-full text-sm font-semibold"
            :style="{
              backgroundColor: (slotProps.data.typeConge?.couleur || '#6B7280') + '20',
              color: slotProps.data.typeConge?.couleur || '#6B7280',
            }"
          >
            {{ slotProps.data.typeConge?.nom }}
          </span>
        </template>
      </Column>

      <!-- Colonne Date début -->
      <Column field="dateDebut" header="Date début" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.dateDebut) }}
        </template>
      </Column>

      <!-- Colonne Date fin -->
      <Column field="dateFin" header="Date fin" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.dateFin) }}
        </template>
      </Column>

      <!-- Colonne Durée -->
      <Column field="nombreJours" header="Durée" sortable>
        <template #body="slotProps">
          <span class="font-medium">{{ slotProps.data.nombreJours }} jour(s)</span>
        </template>
      </Column>

      <!-- Colonne Statut -->
      <Column field="statut" header="Statut" sortable>
        <template #body="slotProps">
          <span
            :class="[
              'px-3 py-1 rounded-full text-sm font-semibold',
              getStatutClass(slotProps.data.statut),
            ]"
          >
            {{ getStatutLabel(slotProps.data.statut) }}
          </span>
        </template>
      </Column>

      <!-- Colonne Actions -->
      <Column v-if="!hideActionButtons" header="Actions" :style="{ width: '150px' }">
        <template #body="slotProps">
          <div class="flex gap-2 justify-center" v-if="slotProps.data.statut === 'EN_ATTENTE'">
            <Button
              icon="pi pi-check"
              severity="success"
              text
              rounded
              @click="handleApprove(slotProps.data)"
              v-tooltip="'Approuver'"
            />
            <Button
              icon="pi pi-times"
              severity="danger"
              text
              rounded
              @click="handleReject(slotProps.data)"
              v-tooltip="'Refuser'"
            />
          </div>
          <span v-else class="text-gray-400 text-sm">-</span>
        </template>
      </Column>
    </DataTable>

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

:deep(.custom-table .p-paginator .p-paginator-page.p-highlight) {
  @apply bg-primary text-white;
}
</style>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import AppButton from '~/components/button/AppButton.vue'
import TableSkeleton from '~/components/skeleton/TableSkeleton.vue'
import AvatarInitials from '~/components/avatar/AvatarInitials.vue'

interface ActionButton {
  label: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success'
  link?: string
  handler?: () => void
}

interface Props {
  data: any[]
  loading?: boolean
  pdfLoading?: boolean
  pdfProgress?: number
  rowsPerPage?: number
  actionButton?: ActionButton
  hideEmployeeColumn?: boolean // Masquer la colonne Employé (mode détail)
  hideActionButtons?: boolean // Masquer les boutons Approuver/Refuser et action principal
  hidePdfButton?: boolean // Masquer le bouton télécharger PDF
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pdfLoading: false,
  pdfProgress: 0,
  rowsPerPage: 10,
  hideEmployeeColumn: false,
  hideActionButtons: false,
  hidePdfButton: false,
})

const emit = defineEmits<{
  'action:approve': [data: any]
  'action:reject': [data: any]
  'action:download-pdf': []
  'refresh': []
}>()

const searchQuery = ref('')

// Filtrage des données
const filteredData = computed(() => {
  if (!searchQuery.value) return props.data

  const search = searchQuery.value.toLowerCase()
  return props.data.filter((item) => {
    const employeName = item.employe?.fullName?.toLowerCase() || ''
    const employeMatricule = item.employe?.matricule?.toLowerCase() || ''
    const typeNom = item.typeConge?.nom?.toLowerCase() || ''
    const statut = getStatutLabel(item.statut).toLowerCase()

    return (
      employeName.includes(search) ||
      employeMatricule.includes(search) ||
      typeNom.includes(search) ||
      statut.includes(search)
    )
  })
})

// Formatage de la date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Classes CSS pour les statuts
const getStatutClass = (statut: string) => {
  switch (statut) {
    case 'APPROUVE':
      return 'bg-green-100 text-green-700'
    case 'REFUSE':
      return 'bg-red-100 text-red-700'
    case 'EN_ATTENTE':
      return 'bg-yellow-100 text-yellow-700'
    case 'ANNULE':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

// Labels pour les statuts
const getStatutLabel = (statut: string) => {
  switch (statut) {
    case 'APPROUVE':
      return 'Approuvé'
    case 'REFUSE':
      return 'Refusé'
    case 'EN_ATTENTE':
      return 'En attente'
    case 'ANNULE':
      return 'Annulé'
    default:
      return statut
  }
}

// Approuver un congé
const handleApprove = (data: any) => {
  emit('action:approve', data)
}

// Refuser un congé
const handleReject = (data: any) => {
  emit('action:reject', data)
}

// Télécharger le PDF
const handleDownloadPdf = () => {
  emit('action:download-pdf')
}

// Gestion du clic sur le bouton d'action principal
const handleActionClick = () => {
  if (props.actionButton?.handler) {
    props.actionButton.handler()
  } else if (props.actionButton?.link) {
    navigateTo(props.actionButton.link)
  }
}
</script>
