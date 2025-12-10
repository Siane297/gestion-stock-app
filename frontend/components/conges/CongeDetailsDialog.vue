<template>
  <Dialog :visible="visible" modal header="Détails du congé" :style="{ width: '500px' }" @update:visible="$emit('update:visible', $event)">
    <div v-if="conge" class="flex flex-col gap-5">
      <!-- Employé -->
      <div class="border-b pb-4">
        <AvatarInitials
          :name="conge.employe?.fullName || 'Inconnu'"
          :subtitle="conge.employe?.matricule"
          size="md"
          :show-name="true"
        />
      </div>


      <!-- Type de congé -->
      <div>
        <label class="font-medium text-gray-700">Type de congé</label>
        <div class="mt-1">
          <span
            class="px-3 py-1.5 rounded-full font-semibold inline-block"
            :style="{
              backgroundColor: (conge.typeConge?.couleur || '#6B7280') + '20',
              color: conge.typeConge?.couleur || '#6B7280',
            }"
          >
            {{ conge.typeConge?.nom }}
          </span>
        </div>
      </div>

      <!-- Dates -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="font-medium text-gray-700">Date de début</label>
          <div class="mt-1 bg-bleu/20 border-2 border-[#a7d2e1] w-fit px-2 rounded-full font-semibold">{{ formatDate(conge.dateDebut) }}</div>
        </div>
        <div>
          <label class="font-medium text-gray-700">Date de fin</label>
          <div class="mt-1 bg-bleu/20 border-2 border-[#a7d2e1] w-fit px-2 rounded-full font-semibold">{{ formatDate(conge.dateFin) }}</div>
        </div>
      </div>

      <!-- Durée et Statut -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="font-medium text-gray-700">Durée</label>
          <div class="mt-1 font-semibold text-primary">
            {{ conge.nombreJours }} jour{{ conge.nombreJours > 1 ? 's' : '' }}
          </div>
        </div>
        <div>
          <label class="font-medium text-gray-700">Statut</label>
          <div class="mt-1">
            <span
              :class="[
                'px-3 py-1.5 rounded-full font-semibold inline-block',
                getStatutClass(conge.statut),
              ]"
            >
              {{ getStatutLabel(conge.statut) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Raison -->
      <div v-if="conge.raison">
        <label class="font-medium text-gray-700">Raison</label>
        <div class="mt-1 text-gray-700 bg-bleu/20 border-2 border-[#a7d2e1] p-3 rounded-lg">
          {{ conge.raison }}
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import AvatarInitials from '~/components/avatar/AvatarInitials.vue'
import type { Conge } from '~/composables/api/useCongeApi'

defineProps<{
  visible: boolean
  conge: Conge | null
}>()

defineEmits<{
  'update:visible': [value: boolean]
}>()

// Formater une date
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
</script>
