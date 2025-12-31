<template>
  <!-- Formulaire Congé -->
  <div class="flex flex-col gap-4">
    <!-- Bannière -->
    <div v-if="showHeader" class="bg-header shadow-sm rounded-xl py-8 px-8">
      <div class="container mx-auto">
        <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
          {{ title }}
        </h1>
        <p class="text-white/50">
          {{ description }}
        </p>
      </div>
    </div>

    <!-- Formulaire -->
    <div>
      <div class="bg-white border-2 border-gris/40 rounded-xl p-8">
        <!-- Message d'information sur les week-ends -->
        <div class="mb-6 p-4 bg-bleu border-2 border-[#a7d2e1] rounded-lg">
          <div class="flex items-start gap-3">
            <Icon icon="lucide:info" class="text-xl text-primary mt-0.5" />
            <div>
              <p class="font-semibold text-blue-900">Information importante</p>
              <p class="text-sm text-blue-800 mt-1">
                Les <strong>samedis et dimanches</strong> sont automatiquement exclus du calcul. 
                Seuls les <strong>jours ouvrables</strong> (lundi au vendredi) sont comptabilisés.
              </p>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Champs dynamiques -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="(field, index) in fields"
              :key="field.name"
              :class="getFieldClass(index)"
              class="flex flex-col gap-2"
            >
              <label v-if="field.showLabel !== false" :for="field.name" class="font-semibold text-gray-700">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>

              <!-- Input Text / Email -->
              <InputText
                v-if="field.type === 'text' || field.type === 'email'"
                :id="field.name"
                v-model="formData[field.name]"
                :type="field.type"
                :placeholder="field.placeholder"
                :invalid="submitted && field.required && !formData[field.name]"
                :disabled="field.disabled"
                class="w-full"
              />

              <!-- Select -->
              <Select
                v-else-if="field.type === 'select'"
                :id="field.name"
                v-model="formData[field.name]"
                :options="field.options"
                :optionLabel="field.optionLabel || 'label'"
                :optionValue="field.optionValue || 'value'"
                :placeholder="field.placeholder"
                :disabled="field.disabled"
                :invalid="submitted && field.required && !formData[field.name]"
                :filter="field.filter"
                class="w-full"
              />

              <!-- Select avec filtre et bouton + -->
              <div
                v-else-if="field.type === 'select-with-add'"
                class="flex gap-2"
              >
                <Select
                  :id="field.name"
                  v-model="formData[field.name]"
                  :options="field.options"
                  :optionLabel="field.optionLabel || 'label'"
                  :optionValue="field.optionValue || 'value'"
                  :placeholder="field.placeholder"
                  :invalid="
                    submitted && field.required && !formData[field.name]
                  "
                  filter
                  class="flex-1"
                />
                <button
                  type="button"
                  @click="handleAddClick(field)"
                  class="px-4 py-2 border-2 border-dashed border-primary/40 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center gap-2 text-primary font-semibold"
                >
                  <Icon icon="lucide:plus" class="text-xl" />
                </button>
              </div>

              <!-- DatePicker avec blocage des week-ends -->
              <DatePicker
                v-else-if="field.type === 'date'"
                :id="field.name"
                v-model="formData[field.name]"
                :placeholder="field.placeholder"
                :invalid="submitted && field.required && !formData[field.name]"
                :showIcon="field.showIcon !== false"
                iconDisplay="input"
                dateFormat="dd/mm/yy"
                :disabledDays="[0, 6]"
                :minDate="field.name === 'dateFin' ? formData.dateDebut : undefined"
                class="w-full"
                fluid
              />

              <!-- Textarea -->
              <Textarea
                v-else-if="field.type === 'textarea'"
                :id="field.name"
                v-model="formData[field.name]"
                :placeholder="field.placeholder"
                :invalid="submitted && field.required && !formData[field.name]"
                :rows="field.rows || 3"
                class="w-full"
              />

              <!-- Message d'erreur -->
              <small
                v-if="submitted && field.required && !formData[field.name]"
                class="text-red-500"
              >
                {{ field.label }} est requis
              </small>
            </div>
          </div>

          <!-- Affichage du nombre de jours calculé -->
          <div v-if="nombreJours > 0" class="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
            <div class="flex items-center gap-3">
              <Icon icon="lucide:calendar-check" class="text-2xl text-green-600" />
              <div>
                <p class="font-semibold text-green-900">Durée du congé</p>
                <p class="text-lg font-bold text-green-700 mt-1">
                  {{ nombreJours }} jour{{ nombreJours > 1 ? 's' : '' }} ouvrable{{ nombreJours > 1 ? 's' : '' }}
                </p>
                <p class="text-sm text-green-600 mt-0.5">
                  Du {{ formatDate(formData.dateDebut) }} au {{ formatDate(formData.dateFin) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Boutons -->
          <div class="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200 w-full">
            <AppButton
              v-if="showCancelButton"
              type="button"
              :label="cancelLabel"
              icon="pi pi-times"
              variant="outline"
              size="sm"
              @click="handleCancel"
              class="w-full sm:w-auto"
            />
            <AppButton
              type="submit"
              :label="submitLabel"
              icon="pi pi-check"
              variant="primary"
              size="sm"
              :loading="isSubmitting || loading"
              class="w-full sm:w-auto"
            />
          </div>
        </form>
      </div>
    </div>

    <!-- Dialog de confirmation -->
    <ConfirmationDialog
      v-model:visible="showConfirmDialog"
      message="Voulez-vous vraiment annuler ? Les données saisies seront perdues."
      header="Confirmation"
      accept-label="Oui, annuler"
      reject-label="Non, continuer"
      @accept="onConfirmCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Textarea from 'primevue/textarea'
import AppButton from '~/components/button/AppButton.vue'
import ConfirmationDialog from '~/components/dialog/ConfirmationDialog.vue'

interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'select' | 'select-with-add' | 'date' | 'textarea'
  placeholder?: string
  required?: boolean
  options?: any[]
  optionLabel?: string
  optionValue?: string
  disabled?: boolean
  value?: string | number
  filter?: boolean
  showIcon?: boolean
  showLabel?: boolean
  rows?: number
  onAdd?: () => void
}

interface Props {
  title: string
  description: string
  fields: FormField[]
  submitLabel?: string
  cancelLabel?: string
  showCancelButton?: boolean
  showHeader?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Enregistrer',
  cancelLabel: 'Annuler',
  showCancelButton: true,
  showHeader: true,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: Record<string, any>]
  cancel: []
  addClick: [field: FormField]
}>()

const showConfirmDialog = ref(false)
const formData = ref<Record<string, any>>({})
const submitted = ref(false)
const isSubmitting = ref(false)

// Initialiser formData
onMounted(() => {
  props.fields.forEach((field) => {
    formData.value[field.name] = field.value !== undefined ? field.value : ''
  })
})

// Mettre à jour formData si les champs changent
watch(
  () => props.fields,
  (newFields) => {
    newFields.forEach((field) => {
      if (field.value !== undefined && field.disabled) {
        formData.value[field.name] = field.value
      }
    })
  },
  { deep: true }
)

// Calculer le nombre de jours ouvrables
const nombreJours = computed(() => {
  const dateDebut = formData.value.dateDebut
  const dateFin = formData.value.dateFin

  if (!dateDebut || !dateFin) return 0

  const debut = new Date(dateDebut)
  const fin = new Date(dateFin)

  // Vérifier que la date de fin est après la date de début
  if (fin < debut) return 0

  let count = 0
  const current = new Date(debut)

  while (current <= fin) {
    const dayOfWeek = current.getDay()
    // Exclure samedi (6) et dimanche (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
})

// Formater une date pour l'affichage
const formatDate = (date: Date | null) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Déterminer la classe du champ
const getFieldClass = (index: number) => {
  const totalFields = props.fields.length
  const isLastField = index === totalFields - 1
  const isOddTotal = totalFields % 2 !== 0

  if (isLastField && isOddTotal) {
    return 'md:col-span-2'
  }
  return ''
}

// Validation et soumission
const handleSubmit = async () => {
  submitted.value = true
  isSubmitting.value = true

  try {
    // Valider les champs requis
    const isValid = props.fields.every((field) => {
      if (field.required) {
        return (
          formData.value[field.name] &&
          formData.value[field.name].toString().trim() !== ''
        )
      }
      return true
    })

    if (!isValid) {
      isSubmitting.value = false
      return
    }

    // Émettre les données
    emit('submit', { ...formData.value })
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  showConfirmDialog.value = true
}

const onConfirmCancel = () => {
  emit('cancel')
}

// Méthode pour réinitialiser le formulaire
const resetForm = () => {
  props.fields.forEach((field) => {
    formData.value[field.name] = ''
  })
  submitted.value = false
}

// Gérer le clic sur le bouton +
const handleAddClick = (field: FormField) => {
  if (field.onAdd) {
    field.onAdd()
  } else {
    emit('addClick', field)
  }
}

// Exposer formData et resetForm
defineExpose({
  resetForm,
  formData,
})
</script>

<style scoped>
/* Override focus colors for inputs */
:deep(.p-inputtext:enabled:focus),
:deep(.p-textarea:enabled:focus),
:deep(.p-select:enabled:focus),
:deep(.p-datepicker-input:enabled:focus) {
  border-color: #4361ee !important;
  box-shadow: 0 0 0 1px #4361ee !important;
}
</style>
