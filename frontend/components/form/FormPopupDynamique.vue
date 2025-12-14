<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :header="headerTitle"
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    @hide="handleClose"
  >
    <!-- En-tête personnalisé -->
    <SimplePageHeader
      :title="title"
      :description="description"
      class="mb-4"
    />

    <!-- Formulaire dynamique -->
    <FormulaireDynamique
      :title="title"
      :description="description"
      :fields="fields"
      :submitLabel="submitLabel"
      :cancelLabel="cancelLabel"
      :showCancelButton="showCancelButton"
      :showHeader="false"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @addClick="handleAddClick"
    />
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "select" | "select-with-add" | "number" | "date" | "time" | "textarea" | "image" | "color" | "conditionnement" | "checkbox" | "achat-lines";
  placeholder?: string;
  required?: boolean;
  options?: string[] | any[];
  optionLabel?: string;
  optionValue?: string;
  min?: number;
  max?: number;
  showIcon?: boolean;
  disabled?: boolean;
  value?: string | number | boolean | Date;
  onAdd?: () => void;
  onImageUpload?: (file: File) => Promise<string>;
  onImageRemove?: () => Promise<void>;
  filter?: boolean;
  showFlag?: boolean;
  showLabel?: boolean;
  fixedWidth?: boolean;
  helpText?: string;
  fullWidth?: boolean;
}

interface Props {
  visible: boolean;
  title: string;
  description: string;
  headerTitle?: string;
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
  showCancelButton?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  headerTitle: 'Ajouter',
  submitLabel: 'Enregistrer',
  cancelLabel: 'Annuler',
  showCancelButton: true,
  loading: false,
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  submit: [data: Record<string, any>];
  cancel: [];
  addClick: [field: FormField];
}>();

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const handleSubmit = (data: Record<string, any>) => {
  emit('submit', data);
};

const handleCancel = () => {
  emit('cancel');
  isVisible.value = false;
};

const handleClose = () => {
  emit('update:visible', false);
};

const handleAddClick = (field: FormField) => {
  emit('addClick', field);
};
</script>
