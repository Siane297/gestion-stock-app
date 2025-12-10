<template>
  <div>
    <!-- Banner Header -->
    <BannerHeader
      title="Gestion des Congés"
      description="Gérez les demandes de congés de vos employés"
      banner-image="/assets/image/bg-connect.jpg"
      :loading="loading"
    />

    <!-- Toggle de vue -->
    <div class="mb-6">
      <ViewToggle
        v-model="activeView"
        :views="[
          { value: 'liste', label: 'Liste', icon: 'lucide:list' },
          { value: 'calendrier', label: 'Calendrier', icon: 'lucide:calendar' },
        ]"
      />
    </div>

    <!-- Vue Liste -->
    <TableConges
      v-if="activeView === 'liste'" 
      :data="conges" 
      :loading="loading"
      :pdf-loading="pdfLoading"
      :pdf-progress="pdfProgress"
      :action-button="{
        label: 'Nouvelle demande',
        icon: 'pi pi-plus',
        variant: 'primary',
        link: '/conge/ajouter'
      }"
      @action:approve="handleApprove"
      @action:reject="handleReject"
      @action:download-pdf="handleDownloadPdf"
      @refresh="loadConges"
    />

    <!-- Vue Calendrier -->
    <CalendrierConges v-if="activeView === 'calendrier'" />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import BannerHeader from '~/components/banner/BannerHeader.vue'
import ViewToggle from '~/components/common/ViewToggle.vue'
import TableConges from '~/components/table/TableConges.vue'
import CalendrierConges from '~/components/conges/CalendrierConges.vue'
import { useCongeApi, type Conge } from '~/composables/api/useCongeApi'
import { useSecurePdf } from '~/composables/useSecurePdf'

// Protection de la page
definePageMeta({
  middleware: ['auth', 'permissions'],
})

const { getCongesParPeriode, modifierStatutConge } = useCongeApi()
const { generateCongesPdf } = useSecurePdf()
const toast = useToast()

// État
const conges = ref<Conge[]>([])
const loading = ref(false)
const pdfLoading = ref(false)
const pdfProgress = ref(0)
const activeView = ref<'liste' | 'calendrier'>('liste')

// Charger les congés
const loadConges = async () => {
  loading.value = true
  try {
    const debut = new Date()
    debut.setDate(1)
    const fin = new Date()
    fin.setMonth(fin.getMonth() + 1)
    fin.setDate(0)

    conges.value = await getCongesParPeriode({
      dateDebut: debut.toISOString().split('T')[0]!,
      dateFin: fin.toISOString().split('T')[0]!,
    })
  } catch (error: any) {
    console.error('Erreur lors du chargement des congés:', error)
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors du chargement des congés',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

// Approuver un congé
const handleApprove = async (conge: Conge) => {
  try {
    await modifierStatutConge(conge.id, 'APPROUVE')
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Congé approuvé',
      life: 3000,
    })
    await loadConges()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors de l\'approbation',
      life: 5000,
    })
  }
}

// Refuser un congé
const handleReject = async (conge: Conge) => {
  try {
    await modifierStatutConge(conge.id, 'REFUSE')
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Congé refusé',
      life: 3000,
    })
    await loadConges()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors du refus',
      life: 5000,
    })
  }
}

// Gestion du téléchargement PDF
const handleDownloadPdf = async () => {
  try {
    pdfLoading.value = true
    pdfProgress.value = 0
    
    // Simulation de progression
    const interval = setInterval(() => {
      if (pdfProgress.value < 90) {
        pdfProgress.value += Math.random() * 10
      }
    }, 200)

    await generateCongesPdf()
    
    clearInterval(interval)
    pdfProgress.value = 100
  } catch (error) {
    console.error('Erreur lors du téléchargement PDF:', error)
  } finally {
    setTimeout(() => {
      pdfLoading.value = false
      pdfProgress.value = 0
    }, 500)
  }
}

// Charger au montage
onMounted(() => {
  loadConges()
})
</script>
