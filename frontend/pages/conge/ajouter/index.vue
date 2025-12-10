<template>
  <div>
    <!-- Formulaire congé -->
    <FormulaireConge
      title="Nouvelle demande de congé"
      description="Remplissez le formulaire pour créer une demande de congé"
      :fields="congeFields"
      submit-label="Créer la demande"
      cancel-label="Annuler"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @addClick="handleAddClick"
      ref="formRef"
    />

    <!-- Popup pour ajouter un type de congé -->
    <FormPopupDynamique
      v-model:visible="showTypeCongeDialog"
      title="Ajouter un type de congé"
      description="Créez un nouveau type de congé pour l'organisation"
      headerTitle="Nouveau type de congé"
      :fields="typeCongeFields"
      submit-label="Créer"
      :loading="loadingTypeConge"
      @submit="handleCreateTypeConge"
      @cancel="showTypeCongeDialog = false"
    />

    <Toast />
  </div>
</template>

<script setup lang="ts">
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import FormulaireConge from '~/components/form/FormulaireConge.vue'
import FormPopupDynamique from '~/components/form/FormPopupDynamique.vue'
import { useCongeApi } from '~/composables/api/useCongeApi'
import { useEmployeeApi } from '~/composables/api/useEmployeeApi'
import { useTypeCongeApi } from '~/composables/api/useTypeCongeApi'

const { getTypesConges, creerConge } = useCongeApi()
const { getEmployees } = useEmployeeApi()
const { createTypeConge } = useTypeCongeApi()
const toast = useToast()

// Protection de la page
definePageMeta({
  middleware: ['auth', 'permissions'],
})

// Référence du formulaire
const formRef = ref<InstanceType<typeof FormulaireConge> | null>(null)

// État
const loading = ref(false)
const typesConges = ref<any[]>([])
const employes = ref<any[]>([])
const loadingLists = ref(false)

// États des popups
const showTypeCongeDialog = ref(false)
const loadingTypeConge = ref(false)

// Charger les types de congés et employés
const loadData = async () => {
  loadingLists.value = true
  try {
    const [types, emps] = await Promise.all([
      getTypesConges(),
      getEmployees({ isActive: true }),
    ])

    typesConges.value = types
    employes.value = emps
  } catch (error) {
    console.error('Erreur chargement listes:', error)
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Erreur lors du chargement des données',
      life: 3000,
    })
  } finally {
    loadingLists.value = false
  }
}

// Charger au montage
onMounted(() => {
  loadData()
})

// Définition des champs du formulaire
const congeFields = computed(() => [
  {
    name: 'employeId',
    label: 'Employé',
    type: 'select' as const,
    placeholder: 'Sélectionnez un employé',
    required: true,
    options: employes.value,
    optionLabel: 'fullName',
    optionValue: 'id',
    filter: true,
  },
  {
    name: 'typeCongeId',
    label: 'Type de congé',
    type: 'select-with-add' as const,
    placeholder: 'Sélectionnez un type',
    required: true,
    options: typesConges.value,
    optionLabel: 'nom',
    optionValue: 'id',
  },
  {
    name: 'dateDebut',
    label: 'Date de début',
    type: 'date' as const,
    placeholder: 'Sélectionner une date',
    required: true,
  },
  {
    name: 'dateFin',
    label: 'Date de fin',
    type: 'date' as const,
    placeholder: 'Sélectionner une date',
    required: true,
  },
  {
    name: 'raison',
    label: 'Raison / Commentaire',
    type: 'textarea' as const,
    placeholder: 'Décrivez la raison de votre demande...',
    required: false,
    rows: 4,
  },
])

// Champs pour le formulaire de type congé
const typeCongeFields = [
  {
    name: 'nom',
    label: 'Nom du type',
    type: 'text' as const,
    placeholder: 'Ex: Congé annuel, Maladie, etc.',
    required: true
  },
  {
    name: 'couleur',
    label: 'Couleur',
    type: 'color' as const,
    required: true
  }
]

// Gérer le clic sur le bouton + d'un champ
const handleAddClick = (field: any) => {
  if (field.name === 'typeCongeId') {
    showTypeCongeDialog.value = true
  }
}

// Créer un nouveau type de congé
const handleCreateTypeConge = async (data: Record<string, any>) => {
  loadingTypeConge.value = true
  try {
    const newType = await createTypeConge({ 
      nom: data.nom,
      couleur: data.couleur
    })
    
    if (!newType) {
      throw new Error('Échec de la création du type de congé')
    }
    
    // Ajouter le nouveau type à la liste
    typesConges.value.push(newType)
    
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Type de congé créé avec succès',
      life: 3000
    })
    
    // Fermer le dialog
    showTypeCongeDialog.value = false
    
    // Sélectionner automatiquement
    await nextTick()
    if (formRef.value && (formRef.value as any).formData) {
      (formRef.value as any).formData.typeCongeId = newType.id
      console.log('Type de congé sélectionné automatiquement:', newType.id)
    }
  } catch (error: any) {
    console.error('Erreur création type:', error)
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors de la création du type de congé',
      life: 3000
    })
  } finally {
    loadingTypeConge.value = false
  }
}

// Fonction helper pour formater la date en YYYY-MM-DD sans décalage de timezone
const formatDateToYYYYMMDD = (date: Date | string): string => {
  if (typeof date === 'string') return date
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Gestion de la soumission
const handleSubmit = async (data: Record<string, any>) => {
  loading.value = true

  try {
    // Conversion des dates - Utiliser la date locale pour éviter le décalage de timezone
    const dateDebut = data.dateDebut instanceof Date 
      ? formatDateToYYYYMMDD(data.dateDebut)
      : data.dateDebut

    const dateFin = data.dateFin instanceof Date 
      ? formatDateToYYYYMMDD(data.dateFin)
      : data.dateFin

    await creerConge({
      employeId: data.employeId,
      typeCongeId: data.typeCongeId,
      dateDebut,
      dateFin,
      raison: data.raison || undefined,
    })

    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Demande de congé créée avec succès',
      life: 3000,
    })

    // Rediriger après un court délai
    setTimeout(() => {
      navigateTo('/conge')
    }, 1500)
  } catch (error: any) {
    console.error('Erreur lors de la création:', error)
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Une erreur est survenue lors de la création',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

// Annuler
const handleCancel = () => {
  navigateTo('/conge')
}
</script>