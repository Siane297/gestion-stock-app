<template>
  <div class="color-picker-field">
    <label v-if="showLabel && label" :for="inputId" class="block text-sm font-semibold text-gray-700 mb-2">
      {{ label }}
    </label>
    <div class="flex items-center gap-3">
      <!-- Color input -->
      <input
        :id="inputId"
        type="color"
        :value="modelValue"
        @input="handleInput"
        class="h-12 w-16 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-primary transition-colors"
      />
      
      <!-- Hex value display -->
      <div class="flex-1">
        <input
          type="text"
          :value="modelValue"
          @input="handleTextInput"
          placeholder="#000000"
          class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none font-mono text-sm"
        />
      </div>
    </div>
    
    <p v-if="description" class="mt-1 text-xs text-gray-500">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: string;
  label?: string;
  description?: string;
  inputId?: string;
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  inputId: () => `color-picker-${Math.random().toString(36).substr(2, 9)}`,
  showLabel: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const handleTextInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  
  // Émettre immédiatement la mise à jour pour la réactivité
  emit('update:modelValue', value);
};
</script>

<style scoped>
/* Personnalisation du color picker */
input[type="color"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: white;
  cursor: pointer;
  padding: 4px;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
  border-radius: 0.5rem;
}

input[type="color"]::-webkit-color-swatch {
  border: 2px solid #e5e7eb;
  border-radius: 0.375rem;
}

input[type="color"]::-moz-color-swatch {
  border: 2px solid #e5e7eb;
  border-radius: 0.375rem;
}
</style>
