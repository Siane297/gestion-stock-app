<template>
  <div class="w-full">
    <!-- Header avec contrôles -->
    <div class="bg-white border-2 border-gris/40 rounded-xl p-6 mb-6">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Calendrier des Congés</h2>
          <p class="text-gray-600 mt-1">Visualisez tous les congés de l'équipe</p>
        </div>

        <!-- Navigation mois -->
        <div class="flex items-center gap-4">
          <DatePicker
            v-model="currentDate"
            view="month"
            dateFormat="mm/yy"
            placeholder="Sélectionner un mois"
            showIcon
            :showButtonBar="true"
            class=""
          />
          <AppButton label="Aujourd'hui" variant="primary" size="sm" @click="goToToday" />
        </div>
      </div>
    </div>

    <!-- Légende des types de congés -->
    <!-- <div class="bg-white border-2 border-gris/40 rounded-xl p-6 mb-6">
      <h3 class="font-semibold text-gray-900 mb-3">Types de congés</h3>
      <div class="flex flex-wrap gap-3">
        <div v-for="type in typesConges" :key="type.id"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200">
          <div class="w-4 h-4 rounded" :style="{ backgroundColor: type.couleur || '#6B7280' }"></div>
          <span class="text-sm font-medium text-gray-700">{{ type.nom }}</span>
        </div>
      </div>
    </div> -->

    <!-- Calendrier -->
    <div class="bg-white border-2 border-gris/40 rounded-xl p-6">
      <!-- Jours de la semaine -->
      <div class="grid grid-cols-7 gap-2 mb-2">
        <div v-for="jour in joursHeaders" :key="jour" class="text-center font-semibold text-gray-700 py-2 text-sm">
          {{ jour }}
        </div>
      </div>

      <!-- Grille du calendrier -->
      <div class="grid grid-cols-7 gap-2">
        <div v-for="(jour, index) in joursCalendrier" :key="index"
          class="min-h-[120px] border-2 rounded-lg p-2 transition-all" :class="getJourClasses(jour)">
          <!-- Numéro du jour -->
          <div class="flex justify-between items-start mb-1">
            <div class="flex flex-col">
              <span class="text-sm font-semibold"
                :class="jour.isToday ? 'bg-primary text-white px-2 py-0.5 rounded-full' : 'text-gray-700'">
                {{ jour.numero }}
              </span>
              <!-- Label du mois pour les jours hors du mois courant -->
              <span v-if="!jour.isCurrentMonth" class="text-[10px] text-gray-400 mt-0.5">
                {{ getMoisLabel(jour.date) }}
              </span>
            </div>
            <span v-if="jour.conges.length > 0" class="text-xs text-gray-500">
              {{ jour.conges.length }}
            </span>
          </div>

          <!-- Congés du jour -->
          <div class="space-y-1 overflow-y-auto max-h-[80px]">
            <CongeCard
              v-for="conge in jour.conges"
              :key="conge.id"
              :conge="conge"
              @click="showCongeDetails"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog détails d'un congé -->
    <CongeDetailsDialog
      v-model:visible="showDetailsDialog"
      :conge="selectedConge"
    />

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import AppButton from '~/components/button/AppButton.vue'
import DatePicker from 'primevue/datepicker'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import CongeCard from '~/components/conges/CongeCard.vue'
import CongeDetailsDialog from '~/components/conges/CongeDetailsDialog.vue'
import { useCongeApi, type Conge, type TypeConge } from '~/composables/api/useCongeApi'

const { getCongesParPeriode, getTypesConges } = useCongeApi()
const toast = useToast()

// État
const currentDate = ref(new Date())
const conges = ref<Conge[]>([])
const typesConges = ref<TypeConge[]>([])
const loading = ref(false)
const showDetailsDialog = ref(false)
const selectedConge = ref<Conge | null>(null)

// Headers des jours
const joursHeaders = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

// Label du mois actuel
const currentMonthLabel = computed(() => {
  return currentDate.value.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  }).replace(/^\w/, (c) => c.toUpperCase())
})

// Générer les jours du calendrier
const joursCalendrier = computed(() => {
  const annee = currentDate.value.getFullYear()
  const mois = currentDate.value.getMonth()

  // Premier jour du mois
  const premierJour = new Date(annee, mois, 1)
  const dernierJour = new Date(annee, mois + 1, 0)

  // Ajuster pour commencer au lundi
  let jourDebut = premierJour.getDay()
  jourDebut = jourDebut === 0 ? 6 : jourDebut - 1

  const jours: Array<{
    numero: number
    date: Date
    isCurrentMonth: boolean
    isToday: boolean
    isWeekend: boolean
    conges: Conge[]
  }> = []

  // Jours du mois précédent
  const moisPrecedent = new Date(annee, mois, 0)
  for (let i = jourDebut - 1; i >= 0; i--) {
    const jour = moisPrecedent.getDate() - i
    const date = new Date(annee, mois - 1, jour)
    jours.push({
      numero: jour,
      date,
      isCurrentMonth: false,
      isToday: false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      conges: getCongesPourDate(date),
    })
  }

  // Jours du mois actuel
  for (let jour = 1; jour <= dernierJour.getDate(); jour++) {
    const date = new Date(annee, mois, jour)
    const today = new Date()
    jours.push({
      numero: jour,
      date,
      isCurrentMonth: true,
      isToday:
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      conges: getCongesPourDate(date),
    })
  }

  // Jours du mois suivant pour compléter la grille
  const totalJours = jours.length
  const joursRestants = totalJours % 7 === 0 ? 0 : 7 - (totalJours % 7)
  for (let i = 1; i <= joursRestants; i++) {
    const date = new Date(annee, mois + 1, i)
    jours.push({
      numero: i,
      date,
      isCurrentMonth: false,
      isToday: false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      conges: getCongesPourDate(date),
    })
  }

  return jours
})

// Obtenir les congés pour une date donnée
const getCongesPourDate = (date: Date) => {
  return conges.value.filter((conge) => {
    const debut = new Date(conge.dateDebut)
    const fin = new Date(conge.dateFin)
    const currentDay = new Date(date)

    // Normaliser les dates (ignorer l'heure)
    debut.setHours(0, 0, 0, 0)
    fin.setHours(23, 59, 59, 999)
    currentDay.setHours(12, 0, 0, 0)

    return currentDay >= debut && currentDay <= fin
  })
}

// Classes CSS pour un jour
const getJourClasses = (jour: any) => {
  const classes = []

  if (!jour.isCurrentMonth) {
    classes.push('bg-gray-50 text-gray-400')
  } else if (jour.isWeekend) {
    classes.push('bg-gray-100')
  } else {
    classes.push('bg-white')
  }

  if (jour.isToday && jour.isCurrentMonth) {
    classes.push('border-primary')
  } else {
    classes.push('border-gray-200')
  }

  return classes.join(' ')
}

// Obtenir le label du mois pour un jour
const getMoisLabel = (date: Date) => {
  return date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
}

// Navigation
const goToToday = () => {
  currentDate.value = new Date()
}

// Watcher pour recharger les congés quand la date change
watch(currentDate, (newDate) => {
  if (newDate) {
    loadConges()
  }
})

// Charger les congés du mois
const loadConges = async () => {
  loading.value = true
  try {
    const debut = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
    const fin = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)

    // Formater les dates en YYYY-MM-DD en utilisant l'heure locale pour éviter les décalages UTC
    const formatDateLocal = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    conges.value = await getCongesParPeriode({
      dateDebut: formatDateLocal(debut),
      dateFin: formatDateLocal(fin),
    })
  } catch (error: any) {
    console.error('Erreur lors du chargement des congés:', error)
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les congés',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

// Charger les types de congés
const loadTypesConges = async () => {
  try {
    typesConges.value = await getTypesConges()
  } catch (error) {
    console.error('Erreur chargement types:', error)
  }
}

// Afficher les détails d'un congé
const showCongeDetails = (conge: Conge) => {
  selectedConge.value = conge
  showDetailsDialog.value = true
}

// Charger au montage
onMounted(() => {
  loadConges()
  loadTypesConges()
})
</script>

<style scoped>
/* Styles supplémentaires si nécessaire */
</style>
