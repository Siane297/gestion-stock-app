<template>
  <!-- Formulaire -->
  <div class="flex flex-col gap-4">
    <!-- Bannière -->
    <div v-if="showHeader" class="bg-[#064654] shadow-sm rounded-xl py-5 px-8">
      <div class="container mx-auto">
        <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
          {{ title }}
        </h1>
        <p class="text-white/50">
          {{ description }}
        </p>
      </div>
    </div>

    <!-- Formulaire -->
    <div class="">
      <div class="bg-white border-2 border-gris/40 rounded-xl p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Champs dynamiques -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="(field, index) in fields" :key="field.name" :class="getFieldClass(index)"
              class="flex flex-col gap-2">

              <label v-if="field.showLabel !== false && field.type !== 'conditionnement' && field.type !== 'achat-lines'" :for="field.name"
                class="font-semibold text-gray-700">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>

              <!-- Input Text / Email -->
              <InputText v-if="field.type === 'text' || field.type === 'email'" :id="field.name"
                v-model="formData[field.name]" :type="field.type" :placeholder="field.placeholder"
                :invalid="submitted && field.required && !formData[field.name]" :disabled="field.disabled"
                class="w-full" @input="validateFieldRealTime(field)" />

              <!-- Select -->
              <Select v-else-if="field.type === 'select'" :id="field.name" v-model="formData[field.name]"
                :options="field.options" :optionLabel="field.optionLabel || 'label'"
                :optionValue="field.optionValue || 'value'" :placeholder="field.placeholder" :disabled="field.disabled"
                :invalid="submitted && field.required && !formData[field.name]" :filter="field.filter" class="w-full">
                <!-- Template pour afficher le drapeau dans la valeur sélectionnée -->
                <template v-if="field.showFlag" #value="slotProps">
                  <div v-if="slotProps.value" class="flex items-center gap-2">
                    <span :class="getFlagClass(slotProps.value)" class="text-xl"></span>
                    <span>{{ slotProps.value }}</span>
                  </div>
                  <span v-else>{{ field.placeholder }}</span>
                </template>

                <!-- Template pour afficher les drapeaux dans les options -->
                <template v-if="field.showFlag" #option="slotProps">
                  <div class="flex items-center gap-2">
                    <span v-if="slotProps.option.code" :class="`fi fi-${slotProps.option.code}`" class="text-xl"></span>
                    <span>{{
                      slotProps.option[field.optionLabel || "label"]
                    }}</span>
                  </div>
                </template>
              </Select>

              <!-- Select avec filtre et bouton + -->
              <div v-else-if="field.type === 'select-with-add'" class="flex gap-2">
                <Select :id="field.name" v-model="formData[field.name]" :options="field.options"
                  :optionLabel="field.optionLabel || 'label'" :optionValue="field.optionValue || 'value'"
                  :placeholder="field.placeholder" :invalid="submitted && field.required && !formData[field.name]
                    " filter class="flex-1" />
                <button type="button" @click="handleAddClick(field)"
                  class="px-4 py-2 border-2 border-dashed border-primary/40 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center gap-2 text-primary font-semibold">
                  <i class="pi pi-plus text-sm"></i>
                </button>
              </div>

              <!-- InputNumber -->
              <InputNumber v-else-if="field.type === 'number'" :id="field.name" v-model="formData[field.name]"
                :placeholder="field.placeholder" :invalid="submitted && field.required && !formData[field.name]"
                :min="field.min" :max="field.max" class="w-full" />

              <!-- DatePicker -->
              <DatePicker v-else-if="field.type === 'date'" :id="field.name" v-model="formData[field.name]"
                :placeholder="field.placeholder" :invalid="submitted && field.required && !formData[field.name]"
                showIcon fluid dateFormat="dd/mm/yy" class="w-full" />

              <!-- DatePicker pour Time (HH:mm) -->
              <DatePicker v-else-if="field.type === 'time'" :id="field.name" v-model="formData[field.name]"
                :placeholder="field.placeholder || 'HH:mm'"
                :invalid="submitted && field.required && !formData[field.name]" timeOnly showIcon fluid
                iconDisplay="input" class="w-full" />

              <!-- Textarea -->
              <Textarea v-else-if="field.type === 'textarea'" :id="field.name" v-model="formData[field.name]"
                :placeholder="field.placeholder" :invalid="submitted && field.required && !formData[field.name]"
                rows="3" class="w-full" />

              <!-- Color Picker -->
              <ColorPickerField v-else-if="field.type === 'color'" v-model="formData[field.name]" :show-label="false" />

              <!-- Conditionnement Field -->
              <ConditionnementField v-else-if="field.type === 'conditionnement'" v-model="formData[field.name]"
                :label="field.label" />

              <!-- Achat Lines -->
              <AchatLinesField v-else-if="field.type === 'achat-lines'" v-model="formData[field.name]"
                :label="field.label" :required="field.required" />

              <!-- Checkbox -->
              <div v-else-if="field.type === 'checkbox'" class="flex items-center gap-2 mt-2">
                <Checkbox :inputId="field.name" v-model="formData[field.name]" :binary="true"
                  :disabled="field.disabled" />
                <div class="flex flex-col">
                  <label :for="field.name" class="cursor-pointer text-gray-700 select-none">
                    {{ field.label || field.name }}
                  </label>
                  <small v-if="field.helpText" class="block text-gray-500 text-xs">
                    {{ field.helpText }}
                  </small>
                </div>
              </div>

              <!-- Image Upload -->
              <ImageUploadField v-else-if="field.type === 'image'" :name="field.name" :label="field.label"
                :required="field.required" :model-value="formData[field.name]"
                @file-selected="(file) => handleImageSelect(field, file)"
                @file-removed="() => handleImageRemove(field)" />

              <!-- Message d'erreur -->
              <small v-if="submitted && field.required && !formData[field.name]" class="text-red-500 block">
                {{ field.label }} est requis
              </small>

              <!-- Help Text (Generic) -->
              <small v-if="field.helpText && field.type !== 'checkbox'" class="block text-gray-500 text-xs mt-1">
                {{ field.helpText }}
              </small>
            </div>
          </div>

          <!-- Boutons -->
          <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <AppButton v-if="showCancelButton" type="button" :label="cancelLabel" icon="pi pi-times" variant="outline"
              size="sm" @click="handleCancel" />
            <AppButton type="submit" :label="submitLabel" icon="pi pi-check" variant="primary" size="sm"
              :loading="isSubmitting || loading" />
          </div>
        </form>
      </div>
    </div>

    <!-- Dialog de confirmation -->
    <ConfirmationDialog v-model:visible="showConfirmDialog"
      message="Voulez-vous vraiment annuler ? Les données saisies seront perdues." header="Confirmation"
      accept-label="Oui, annuler" reject-label="Non, continuer" @accept="onConfirmCancel" />
  </div>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import { Icon } from "@iconify/vue";
import InputMask from "primevue/inputmask";
import Textarea from "primevue/textarea";
import AppButton from "~/components/button/AppButton.vue";
import ConfirmationDialog from "~/components/dialog/ConfirmationDialog.vue";
import InputNumber from "primevue/inputnumber";
import DatePicker from "primevue/datepicker";
import ImageUploadField from "~/components/form/ImageUploadField.vue";

import ColorPickerField from "~/components/form/ColorPickerField.vue";
import ConditionnementField from "~/components/form/ConditionnementField.vue";
import AchatLinesField from "~/components/form/AchatLinesField.vue";
import Checkbox from 'primevue/checkbox';
import { useCountryFlags } from "~/composables/useCountryFlags";

interface FormField {
  name: string;
  label: string;
  type:
  | "text"
  | "email"
  | "select"
  | "select-with-add"
  | "number"
  | "date"
  | "time"
  | "textarea"
  | "image"
  | "image"
  | "color"
  | "color"
  | "conditionnement"
  | "checkbox"
  | "achat-lines";
  placeholder?: string;
  required?: boolean;
  options?: string[] | any[];
  optionLabel?: string; // Propriété pour le label du select (ex: 'label', 'fullName', 'name')
  optionValue?: string; // Propriété pour la valeur du select (ex: 'value', 'id')
  min?: number;
  max?: number;
  showIcon?: boolean;
  disabled?: boolean;
  value?: string | number | Date | boolean | any;
  onAdd?: () => void; // Callback pour le bouton +
  onImageUpload?: (file: File) => Promise<string>; // Callback pour l'upload d'image
  onImageRemove?: () => Promise<void>; // Callback pour la suppression d'image
  filter?: boolean; // Activer le filtre pour les selects
  showFlag?: boolean; // Afficher les drapeaux pour les pays
  showLabel?: boolean; // Afficher le label (par défaut true)
  fixedWidth?: boolean; // Largeur fixe de 30% au lieu de responsive
  fullWidth?: boolean; // Force la largeur à 100%
  helpText?: string;
}

interface Props {
  title: string;
  description: string;
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
  showCancelButton?: boolean;
  showHeader?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: "Enregistrer",
  cancelLabel: "Annuler",
  showCancelButton: true,
  showHeader: true,
  loading: false,
});

const emit = defineEmits<{
  submit: [data: Record<string, any>];
  cancel: [];
  change: [data: Record<string, any>];
  addClick: [field: FormField]; // Événement pour le bouton +
  imageUpload: [field: FormField, file: File]; // Événement pour l'upload d'image
  imageRemove: [field: FormField]; // Événement pour la suppression d'image
}>();

// Utiliser le composable pour les drapeaux
const { getFlagClass } = useCountryFlags();

const showConfirmDialog = ref(false);
const formData = ref<Record<string, any>>({});
const pendingFiles = ref<Record<string, File>>({}); // Stocker les fichiers en attente d'upload
const pendingDeletions = ref<Set<string>>(new Set()); // Stocker les champs marqués pour suppression
const submitted = ref(false);
const isSubmitting = ref(false); // État de loading interne

// Initialiser formData avec les champs
onMounted(() => {
  props.fields.forEach((field) => {
    formData.value[field.name] = field.value !== undefined ? field.value : "";
  });
});

// Mettre à jour formData si les champs changent (pour les valeurs computed)
// Mettre à jour formData si les champs changent (pour les valeurs computed)
watch(
  () => props.fields,
  (newFields) => {
    newFields.forEach((field) => {
      // 1. Initialiser le champ s'il n'existe pas encore dans formData
      if (!(field.name in formData.value)) {
         formData.value[field.name] = field.value !== undefined ? field.value : "";
      }

      // 2. Mettre à jour les champs si la valeur change dans les props (binding externe)
      // On ne met à jour que si la valeur est définie et différente de la valeur actuelle
      if (field.value !== undefined && field.value !== formData.value[field.name]) {
        // Pour les champs image, on veut toujours mettre à jour si la prop change
        // Pour les autres champs, on met à jour aussi pour supporter le chargement asynchrone
        formData.value[field.name] = field.value;
      }
    });
  },
  { deep: true }
);

// Surveiller les changements locaux pour émettre l'événement "change"
watch(
  formData,
  (newVal) => {
      emit('change', newVal);
  },
  { deep: true }
);

// Déterminer la classe du champ (2 par 2, orphelin prend 100%)
const getFieldClass = (index: number) => {
  const field = props.fields[index];

  // Fonction utilitaire pour vérifier si un champ force le "Pleine Largeur"
  const isFullWidthField = (f?: FormField) => !!f && (f.fullWidth || f.type === 'conditionnement' || f.type === 'achat-lines');

  // 1. Si le champ actuel est explicitement Pleine Largeur, on retourne col-span-2
  if (isFullWidthField(field)) {
    return "md:col-span-2";
  }

  // 2. Calculer l'alignement actuel (0 = Gauche/Début, 1 = Droite/Fin)
  // On doit simuler le placement des champs précédents pour savoir où on tombe
  let align = 0;
  for (let i = 0; i < index; i++) {
    const prevField = props.fields[i];

    if (isFullWidthField(prevField)) {
      align = 0; // Un champ full width force le retour à la ligne
    } else {
      // C'est un champ standard. A-t-il pris 1 ou 2 slots ?
      // Il prend 2 slots s'il était à Gauche (0) ET (C'était le dernier OU le suivant était Full)
      const nextField = props.fields[i + 1]; // Existe car i < index
      // Note: nextField ici est props.fields[i+1], qui est le champ actuel si i == index-1

      const isOrphan = (align === 0) && (!nextField || isFullWidthField(nextField));

      if (isOrphan) {
        align = 0; // Il a pris toute la ligne, donc le prochain (nous) commence à 0
      } else {
        align = (align + 1) % 2; // Il a pris 1 slot, on avance
      }
    }
  }

  // 3. Appliquer la logique sur le champ actuel selon son alignement
  if (align === 1) {
    // On est à Droite (2ème sur la ligne). On prend juste notre place.
    return "md:col-span-1";
  } else {
    // On est à Gauche (1er sur la ligne).
    // On doit vérifier si on est "Orphelin" pour s'étendre
    const nextField = props.fields[index + 1];
    const willBeOrphan = !nextField || isFullWidthField(nextField);

    if (willBeOrphan) {
      return "md:col-span-2"; // Extension
    } else {
      return "md:col-span-1"; // Normal
    }
  }
};

// Validation et soumission
const handleSubmit = async () => {
  submitted.value = true;
  isSubmitting.value = true; // Activer le loading immédiatement

  try {
    // Valider les champs requis
    const isValid = props.fields.every((field) => {
      if (field.required) {
        return (
          formData.value[field.name] &&
          formData.value[field.name].toString().trim() !== ""
        );
      }
      return true;
    });

    if (!isValid) {
      isSubmitting.value = false;
      return;
    }

    // Uploader les fichiers en attente avant de soumettre
    for (const [fieldName, file] of Object.entries(pendingFiles.value)) {
      const field = props.fields.find(f => f.name === fieldName);
      if (field?.onImageUpload) {
        try {
          const imageUrl = await field.onImageUpload(file);
          formData.value[fieldName] = imageUrl;
          console.log(`Image uploadée pour ${fieldName}:`, imageUrl);
        } catch (error) {
          console.error(`Erreur upload ${fieldName}:`, error);
          isSubmitting.value = false;
          return; // Arrêter la soumission en cas d'erreur
        }
      }
    }

    // Supprimer les images marquées pour suppression
    for (const fieldName of pendingDeletions.value) {
      const field = props.fields.find(f => f.name === fieldName);
      if (field?.onImageRemove) {
        try {
          await field.onImageRemove();
          formData.value[fieldName] = '';
          console.log(`Image supprimée pour ${fieldName}`);
        } catch (error) {
          console.error(`Erreur suppression ${fieldName}:`, error);
          // Continuer même en cas d'erreur de suppression
        }
      }
    }

    // Émettre les données
    emit("submit", { ...formData.value });

    // Nettoyer les fichiers et suppressions en attente après soumission réussie
    pendingFiles.value = {};
    pendingDeletions.value.clear();
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  showConfirmDialog.value = true;
};

const onConfirmCancel = () => {
  emit("cancel");
};

// Méthode pour réinitialiser le formulaire (exposée)
const resetForm = () => {
  props.fields.forEach((field) => {
    formData.value[field.name] = "";
  });
  submitted.value = false;
};

// Gérer le clic sur le bouton +
const handleAddClick = (field: FormField) => {
  if (field.onAdd) {
    field.onAdd();
  } else {
    emit("addClick", field);
  }
};

const validateFieldRealTime = (field: FormField) => {
  // Logique de validation temps réel si nécessaire
};

// Gérer la sélection d'image (stocker le fichier sans uploader)
const handleImageSelect = (field: FormField, file: File) => {
  // Stocker le fichier pour upload ultérieur
  pendingFiles.value[field.name] = file;

  // Si le champ était marqué pour suppression, annuler la suppression
  if (pendingDeletions.value.has(field.name)) {
    pendingDeletions.value.delete(field.name);
    console.log(`Annulation de la suppression pour ${field.name} car une nouvelle image a été sélectionnée`);
  }

  // Créer un preview local immédiat
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      formData.value[field.name] = e.target.result as string;
    }
  };
  reader.readAsDataURL(file);
};

// Gérer la suppression d'image (marquer pour suppression, pas de suppression immédiate)
const handleImageRemove = async (field: FormField) => {
  // Supprimer le fichier en attente si présent
  delete pendingFiles.value[field.name];

  // Marquer pour suppression lors de la soumission
  pendingDeletions.value.add(field.name);

  // Vider le preview immédiatement
  formData.value[field.name] = '';

  console.log(`Image marquée pour suppression: ${field.name}`);
};

// Exposer formData pour accès externe
defineExpose({
  resetForm,
  formData, // Exposer formData pour permettre la sélection automatique
});
</script>

<style scoped>
/* Override focus colors for inputs */
:deep(.p-inputtext:enabled:focus),
:deep(.p-password-input:enabled:focus),
:deep(.p-textarea:enabled:focus),
:deep(.p-select:enabled:focus),
:deep(.p-inputnumber-input:enabled:focus),
:deep(.p-datepicker-input:enabled:focus) {
  border-color: #4361ee !important;
  box-shadow: 0 0 0 1px #4361ee !important;
}
</style>
