<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" :for="name" class="font-semibold text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Zone d'upload ou preview -->
    <div
      v-if="!previewUrl"
      class="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/50 transition-all duration-200 cursor-pointer bg-gray-50/50"
      :class="{ 'border-red-500': error, 'opacity-50': uploading }"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedFormats"
        class="hidden"
        @change="handleFileSelect"
        :disabled="uploading"
      />

      <div class="flex flex-col items-center gap-3">
        <!-- Icon -->
        <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon
            v-if="!uploading"
            icon="lucide:image"
            class="w-8 h-8 text-gray-400"
          />
          <Icon
            v-else
            icon="lucide:loader-2"
            class="w-8 h-8 text-primary animate-spin"
          />
        </div>

        <!-- Text -->
        <div>
          <p class="text-primary font-medium">
            {{ uploading ? 'Upload en cours...' : 'Upload media' }}
          </p>
          <p class="text-sm text-gray-500">
            or drag and drop
          </p>
          <p class="text-xs text-gray-400 mt-1">
            PNG, JPG or GIF up to 10MB
          </p>
        </div>
      </div>
    </div>

    <!-- Preview de l'image -->
    <div
      v-else
      class="relative border-2 border-gray-300 rounded-lg p-4 bg-gray-50"
    >
      <img
        :src="previewUrl"
        :alt="label || 'Image preview'"
        class="w-full h-48 object-contain rounded"
      />
      
      <!-- Bouton de suppression -->
      <button
        type="button"
        @click="removeImage"
        class="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
        :disabled="uploading"
      >
        <Icon icon="lucide:x" class="w-5 h-5" />
      </button>
    </div>

    <!-- Message d'erreur -->
    <small v-if="error" class="text-red-500">
      {{ error }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, watch } from 'vue';

interface Props {
  name: string;
  label?: string;
  required?: boolean;
  modelValue?: string; // URL de l'image existante
  maxSize?: number; // Taille max en MB
  acceptedFormats?: string;
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 10,
  acceptedFormats: 'image/png,image/jpeg,image/jpg,image/gif',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'file-selected': [file: File];
  'file-removed': [];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string>(props.modelValue || '');
const isDragging = ref(false);
const uploading = ref(false);
const error = ref('');

// Watcher pour mettre à jour le preview quand modelValue change
watch(() => props.modelValue, (newValue) => {
  // Mettre à jour même si c'est vide (pour la suppression)
  previewUrl.value = newValue || '';
  console.log('ImageUploadField - modelValue changé:', newValue);
});

const triggerFileInput = () => {
  if (!uploading.value) {
    fileInput.value?.click();
  }
};

const validateFile = (file: File): boolean => {
  error.value = '';

  // Vérifier le type
  const acceptedTypes = props.acceptedFormats.split(',');
  if (!acceptedTypes.includes(file.type)) {
    error.value = 'Format de fichier non supporté. Utilisez PNG, JPG ou GIF.';
    return false;
  }

  // Vérifier la taille
  const maxSizeBytes = props.maxSize * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    error.value = `Le fichier est trop volumineux. Taille max: ${props.maxSize}MB`;
    return false;
  }

  return true;
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    processFile(file);
  }
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  
  if (file) {
    processFile(file);
  }
};

const processFile = (file: File) => {
  if (!validateFile(file)) {
    return;
  }

  // Créer un preview local
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  // Émettre le fichier pour upload
  emit('file-selected', file);
};

const removeImage = () => {
  previewUrl.value = '';
  error.value = '';
  
  if (fileInput.value) {
    fileInput.value.value = '';
  }

  emit('file-removed');
  emit('update:modelValue', '');
};

// Exposer les méthodes pour usage externe
defineExpose({
  removeImage,
});
</script>
