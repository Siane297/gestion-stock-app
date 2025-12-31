<template>
  <div class="flex flex-col gap-4">
    <!-- Bannière -->
    <SimplePageHeader 
      v-if="showHeader" 
      :title="title" 
      :description="description" 
    />

    <!-- Formulaire -->
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-8 pb-12">
      <!-- Groupes de champs -->
      <div v-for="(group, groupIndex) in groups" :key="groupIndex" 
           class="bg-white border-2 border-gris/40 rounded-xl p-8  flex flex-col gap-8">
        
        <!-- Titre du groupe avec Icône -->
        <div v-if="group.title" class="flex items-center gap-3 border-b border-gris pb-4">
          <div v-if="group.icon" class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <i :class="group.icon" class="text-lg"></i>
          </div>
          <h3 class="text-xl font-bold text-[#064654]">{{ group.title }}</h3>
        </div>

        <!-- Grille des champs du groupe -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <template v-for="(field, fieldIndex) in (group.fields || []).filter(f => f.visible !== false)" :key="field.name">
            <div :class="getFieldClass((group.fields || []).filter(f => f.visible !== false), fieldIndex)"
              class="flex flex-col gap-2">
 
            <label v-if="field.showLabel !== false && !['conditionnement', 'achat-lines', 'image', 'select-packaging', 'info-divider'].includes(field.type)" :for="field.name"
              class="font-semibold text-gray-700">
              {{ field.label }}
              <span v-if="field.required" class="text-red-500">*</span>
            </label>
 
             <!-- info-divider (Design Orange) -->
             <div v-if="field.type === 'info-divider'" 
               class="bg-orange-100/50 border-l-4 border-orange-400 p-3 rounded-r-lg mb-2">
               <div class="flex items-center gap-2 text-orange-800 font-bold uppercase text-xs tracking-wider">
                 <i :class="field.icon || 'pi pi-info-circle'"></i>
                 {{ field.label }}
               </div>
             </div>
 
            <!-- Input Text / Email / Scanner -->
            <div v-else-if="field.type === 'text' || field.type === 'email'" class="w-full">
              <div v-if="field.withScanner" class="flex gap-2">
                 <InputText :id="field.name"
                   v-model="formData[field.name]" :type="field.type" :placeholder="field.placeholder"
                   :invalid="submitted && field.required && !formData[field.name]" :disabled="field.disabled"
                   class="flex-1 h-11" @input="validateFieldRealTime(field)" />
                 
                 <AppButton 
                    type="button"
                    variant="dashed"
                    icon="pi pi-barcode"
                    class="h-11 px-4"
                    @click="openScanner(field)"
                 />
              </div>
              <InputText v-else :id="field.name"
               v-model="formData[field.name]" :type="field.type" :placeholder="field.placeholder"
               :invalid="submitted && field.required && !formData[field.name]" :disabled="field.disabled"
               class="w-full h-11" @input="validateFieldRealTime(field)" />
            </div>

            <!-- Password -->
            <Password v-else-if="field.type === 'password'" :id="field.name"
              v-model="formData[field.name]" :placeholder="field.placeholder" :feedback="false" toggleMask
              inputClass="w-full h-11" :inputStyle="{ width: '100%' }"
              :invalid="submitted && field.required && !formData[field.name]" :disabled="field.disabled"
              class="w-full" @input="validateFieldRealTime(field)" />

            <!-- Select -->
            <Select v-else-if="field.type === 'select'" :id="field.name" v-model="formData[field.name]"
              :options="field.options" :optionLabel="field.optionLabel || 'label'"
              :optionValue="field.optionValue || 'value'" :placeholder="field.placeholder" :disabled="field.disabled"
              :invalid="submitted && field.required && !formData[field.name]" :filter="field.filter" class="w-full h-11 flex items-center">
              <template v-if="field.showFlag" #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center gap-2">
                  <span :class="getFlagClass(slotProps.value)" class="text-xl"></span>
                  <span>{{ slotProps.value }}</span>
                </div>
                <span v-else>{{ field.placeholder }}</span>
              </template>
              <template v-if="field.showFlag" #option="slotProps">
                <div class="flex items-center gap-2">
                  <span v-if="slotProps.option.code" :class="`fi fi-${slotProps.option.code}`" class="text-xl"></span>
                  <span>{{ slotProps.option[field.optionLabel || "label"] }}</span>
                </div>
              </template>
            </Select>
 
             <!-- Select Packaging (Design Orange style Achat) -->
             <div v-else-if="field.type === 'select-packaging'"
               class="flex flex-col gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
               <label :for="field.name" class="font-semibold text-orange-800 flex items-center gap-2">
                 <i class="pi pi-box"></i> {{ field.label }}
                 <span v-if="field.required" class="text-red-500">*</span>
               </label>
               <Select :id="field.name" v-model="formData[field.name]" :options="field.options"
                 :optionLabel="field.optionLabel || 'label'" :optionValue="field.optionValue || 'value'"
                 :placeholder="field.placeholder" :disabled="field.disabled"
                 :invalid="submitted && field.required && !formData[field.name]" :filter="field.filter" class="w-full h-11 flex items-center"
                 showClear />
             </div>

            <!-- Select avec filtre et bouton + -->
            <div v-else-if="field.type === 'select-with-add'" class="flex gap-2">
              <Select :id="field.name" v-model="formData[field.name]" :options="field.options"
                :optionLabel="field.optionLabel || 'label'" :optionValue="field.optionValue || 'value'"
                :placeholder="field.placeholder" :invalid="submitted && field.required && !formData[field.name]" filter class="flex-1 h-11 flex items-center" />
              
              <AppButton 
                type="button"
                variant="dashed"
                icon="pi pi-plus"
                class="h-11 px-4"
                @click="handleAddClick(field)"
              />
            </div>

            <!-- InputNumber -->
            <InputNumber v-else-if="field.type === 'number'" :id="field.name" v-model="formData[field.name]"
              :placeholder="field.placeholder" :invalid="submitted && field.required && !formData[field.name]"
              :min="field.min" :max="field.max" 
              :useGrouping="false" :maxFractionDigits="3" :minFractionDigits="0"
              class="w-full h-11" inputClass="h-11" />

            <!-- Currency Field -->
            <InputGroup v-else-if="field.type === 'currency'" class="h-11">
              <InputGroupAddon v-if="currentCurrency?.symbolPosition === 'before'" 
                class="font-bold text-gray-600 bg-gray-50 border-r-0">
                {{ currentCurrency?.symbol }}
              </InputGroupAddon>
              
              <InputNumber :id="field.name" v-model="formData[field.name]"
                :useGrouping="false" :maxFractionDigits="currencyDecimals"
                :minFractionDigits="0"
                :placeholder="field.placeholder" :invalid="submitted && field.required && !formData[field.name]"
                :min="field.min" :max="field.max" class="w-full" inputClass="h-11" />
              
              <InputGroupAddon v-if="currentCurrency?.symbolPosition !== 'before'" 
                class="font-bold !text-gray-600 !bg-gray-50 !border-l-0">
                {{ currentCurrency?.symbol }}
              </InputGroupAddon>
            </InputGroup>

            <!-- Textarea -->
            <Textarea v-else-if="field.type === 'textarea'" :id="field.name" v-model="formData[field.name]"
              :placeholder="field.placeholder" :invalid="submitted && field.required && !formData[field.name]"
              rows="3" class="w-full" />
 
            <!-- DatePicker -->
            <DatePicker v-else-if="field.type === 'date'" :id="field.name" v-model="formData[field.name]"
              :placeholder="field.placeholder" :invalid="submitted && field.required && !formData[field.name]"
              showIcon fluid dateFormat="dd/mm/yy" class="w-full h-11" />

            <!-- Conditionnement Field -->
            <ConditionnementField v-else-if="field.type === 'conditionnement'" v-model="formData[field.name]"
              :label="field.label" />

            <!-- Lot Fields Group (Design Orange style Achat) -->
            <div v-else-if="field.type === 'lot-fields' && field.visible !== false"
              class="md:col-span-2 flex flex-col gap-4 p-4 bg-orange-50/60 rounded-xl border border-orange-200">
              <label class="font-bold text-orange-800 flex items-center gap-2 uppercase text-xs tracking-wider">
                <i :class="field.icon || 'pi pi-box'"></i> {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-gray-600">Numéro de Lot</label>
                    <InputText v-model="formData[field.name]" placeholder="Ex: LOT-2024-001" class="w-full h-11" />
                 </div>
                 <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-gray-600">Date de péremption</label>
                    <DatePicker v-if="field.name2" v-model="formData[field.name2]" placeholder="Sélectionner une date" showIcon fluid dateFormat="dd/mm/yy" class="w-full h-11" />
                 </div>
              </div>
            </div>

            <!-- Checkbox -->
            <div v-else-if="field.type === 'checkbox'" class="flex items-center gap-3 mt-2">
              <Checkbox :inputId="field.name" v-model="formData[field.name]" :binary="true"
                :disabled="field.disabled" class="w-6 h-6" />
              <div class="flex flex-col">
                <label :for="field.name" class="cursor-pointer text-gray-700 select-none font-semibold">
                  {{ field.label || field.name }}
                </label>
                <small v-if="field.helpText" class="block text-gray-500 text-xs">
                  {{ field.helpText }}
                </small>
              </div>
            </div>

            <!-- Image Upload -->
            <div v-else-if="field.type === 'image'" class="w-full">
              <ImageUploadField :name="field.name" :label="field.label"
                  :required="field.required" :model-value="formData[field.name]"
                  @file-selected="(file) => handleImageSelect(field, file)"
                  @file-removed="() => handleImageRemove(field)" 
              />
            </div>

            <!-- Message d'erreur -->
            <small v-if="submitted && field.required && !formData[field.name]" class="text-red-500 block">
              {{ field.label }} est requis
            </small>
            <small v-else-if="errors && errors[field.name]" class="text-red-500 block">
              {{ errors[field.name] }}
            </small>

            <!-- Help Text -->
            <small v-if="field.helpText && field.type !== 'checkbox'" class="block text-gray-500 text-xs mt-1 italic">
              {{ field.helpText }}
            </small>
          </div>
        </template>
      </div>
    </div>

      <!-- Boutons d'action -->
      <div class="flex flex-col-reverse sm:flex-row justify-end gap-4 p-6 bg-white border border-gris rounded-xl shadow-sm w-full">
        <AppButton v-if="showCancelButton" type="button" :label="cancelLabel" icon="pi pi-times" variant="outline"
          size="sm" @click="handleCancel" class="w-full sm:w-auto sm:px-8" />
        <AppButton type="submit" :label="submitLabel" icon="pi pi-check" variant="primary" size="sm"
          :loading="isSubmitting || loading" class="w-full sm:w-auto sm:px-8" />
      </div>
    </form>

    <!-- Dialog de confirmation -->
    <ConfirmationDialog v-model:visible="showConfirmDialog"
      message="Voulez-vous vraiment annuler ? Les données saisies seront perdues." header="Confirmation"
      accept-label="Oui, annuler" reject-label="Non, continuer" @accept="onConfirmCancel" />

    <!-- Scanner de code-barres -->
    <BarcodeScanner 
      v-model="scannerVisible" 
      @scan="handleScanResult" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import SimplePageHeader from "~/components/banner/SimplePageHeader.vue";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import AppButton from "~/components/button/AppButton.vue";
import ConfirmationDialog from "~/components/dialog/ConfirmationDialog.vue";
import InputNumber from "primevue/inputnumber";
import Checkbox from 'primevue/checkbox';
import DatePicker from 'primevue/datepicker';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import ImageUploadField from "~/components/form/ImageUploadField.vue";
import BarcodeScanner from "~/components/form/BarcodeScanner.vue";
import ConditionnementField from "~/components/form/ConditionnementField.vue";
import { useCountryFlags } from "~/composables/useCountryFlags";
import { useCurrency } from "~/composables/useCurrency";
import { useSound } from "~/composables/useSound"; // Imports useSound
import type { FormField } from "./FormulaireDynamique.vue";

export interface FormSection {
  title: string;
  icon?: string;
  fields: FormField[];
}

interface Props {
  title: string;
  description: string;
  groups: FormSection[];
  submitLabel?: string;
  cancelLabel?: string;
  showCancelButton?: boolean;
  showHeader?: boolean;
  loading?: boolean;
  errors?: Record<string, string>;
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
  addClick: [field: FormField];
}>();

const { getFlagClass } = useCountryFlags();
const { currentCurrency } = useCurrency();
const { playSuccessBeep } = useSound(); // Initialize useSound

const currencyDecimals = computed(() => {
  return currentCurrency.value !== null ? currentCurrency.value.decimalPlaces : 2;
});

const showConfirmDialog = ref(false);
const formData = ref<Record<string, any>>({});
const pendingFiles = ref<Record<string, File>>({});
const pendingDeletions = ref<Set<string>>(new Set());
const submitted = ref(false);
const isSubmitting = ref(false);

// Scanner
const scannerVisible = ref(false);
const currentScannerField = ref<string | null>(null);

const openScanner = (field: FormField) => {
  currentScannerField.value = field.name;
  scannerVisible.value = true;
};

const handleScanResult = (decodedText: string) => {
  if (currentScannerField.value) {
    formData.value[currentScannerField.value] = decodedText;
    currentScannerField.value = null;
    playSuccessBeep(); // Play sound
  }
};

const allFields = computed(() => props.groups.flatMap(g => g.fields));

const getDefaultValue = (field: FormField) => {
    if (field.value !== undefined) return field.value;
    if (field.type === 'conditionnement') return [];
    if (field.type === 'checkbox') return false;
    if (field.type === 'number') return null;
    return "";
};

onMounted(() => {
  allFields.value.forEach((field) => {
    formData.value[field.name] = getDefaultValue(field);
  });
});

watch(
  () => props.groups,
  () => {
    allFields.value.forEach((field) => {
      if (!(field.name in formData.value)) {
         formData.value[field.name] = getDefaultValue(field);
      }
      if (field.value !== undefined && field.value !== formData.value[field.name]) {
        formData.value[field.name] = field.value;
      }
    });
  },
  { deep: true }
);

watch(formData, (newVal) => {
    emit('change', newVal);
}, { deep: true });

const getFieldClass = (groupFields: FormField[], index: number) => {
  const field = groupFields[index];
  const isFullWidthField = (f?: FormField) => !!f && (f.fullWidth || f.type === 'conditionnement' || f.type === 'image' || f.type === 'lot-fields');

  if (groupFields.length === 2 && !isFullWidthField(groupFields[0]) && !isFullWidthField(groupFields[1])) {
    return "md:col-span-1";
  }

  if (isFullWidthField(field)) return "md:col-span-2";

  let align = 0;
  for (let i = 0; i < index; i++) {
    const prevField = groupFields[i];
    if (isFullWidthField(prevField)) {
      align = 0;
    } else {
      const nextField = groupFields[i + 1];
      const isOrphan = (align === 0) && (!nextField || isFullWidthField(nextField));
      if (isOrphan) align = 0;
      else align = (align + 1) % 2;
    }
  }

  if (align === 1) return "md:col-span-1";
  const nextField = groupFields[index + 1];
  return (!nextField || isFullWidthField(nextField)) ? "md:col-span-2" : "md:col-span-1";
};

const handleSubmit = async () => {
  submitted.value = true;
  isSubmitting.value = true;

  try {
    const isValid = allFields.value.every((field) => {
      if (field.visible === false) return true;
      if (field.required) {
        const val1 = formData.value[field.name];
        const ok1 = val1 !== undefined && val1 !== null && val1.toString().trim() !== "";
        
        if (field.type === 'lot-fields' && field.name2) {
            const val2 = formData.value[field.name2];
            const ok2 = val2 !== undefined && val2 !== null && val2.toString().trim() !== "";
            return ok1 && ok2;
        }
        return ok1;
      }
      return true;
    });

    if (!isValid) {
      isSubmitting.value = false;
      return;
    }

    // Handle image uploads if needed (mimic FormulaireDynamique logic)
    // NOTE: In the current app, upload is often handled in the page's handleSubmit
    
    emit("submit", { ...formData.value, $files: { ...pendingFiles.value } });
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

const handleAddClick = (field: FormField) => {
  emit("addClick", field);
};

const handleImageSelect = (field: FormField, file: File) => {
  pendingFiles.value[field.name] = file;
  if (pendingDeletions.value.has(field.name)) pendingDeletions.value.delete(field.name);

  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) formData.value[field.name] = e.target.result as string;
  };
  reader.readAsDataURL(file);
};

const handleImageRemove = async (field: FormField) => {
  delete pendingFiles.value[field.name];
  pendingDeletions.value.add(field.name);
  formData.value[field.name] = '';
};

const validateFieldRealTime = (field: FormField) => {};

const resetForm = () => {
  allFields.value.forEach((field) => {
    formData.value[field.name] = getDefaultValue(field);
  });
  submitted.value = false;
  pendingFiles.value = {};
  pendingDeletions.value.clear();
};

const setField = (name: string, value: any) => {
  formData.value[name] = value;
};

defineExpose({
  formData,
  resetForm,
  setField,
});
</script>

<style scoped>
:deep(.p-inputtext:enabled:focus),
:deep(.p-password-input:enabled:focus),
:deep(.p-textarea:enabled:focus),
:deep(.p-select:enabled:focus),
:deep(.p-inputnumber-input:enabled:focus) {
  border-color: #064654 !important;
  box-shadow: 0 0 0 1px #064654 !important;
}
</style>
