<template>
  <div class="inline-flex flex-col items-center gap-2 p-1.5 bg-white/50 backdrop-blur-sm border-2 border-gris/40 rounded-2xl shadow-sm">
    <Select 
      :modelValue="modelValue" 
      @update:modelValue="$emit('update:modelValue', $event)"
      :options="options" 
      optionLabel="nom" 
      optionValue="id"
      :placeholder="placeholder"
      class="w-64 !border-0 !bg-transparent !shadow-none font-semibold text-primary" 
      @change="$emit('change', $event)"
      showClear
    >
      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex items-center gap-2">
          <Icon icon="tabler:building-store" class="text-primary" />
          <span class="text-primary">{{ options.find(m => m.id === slotProps.value)?.nom }}</span>
        </div>
        <span v-else class="text-gray-400">{{ placeholder }}</span>
      </template>
      <template #option="slotProps">
        <div class="flex items-center gap-2">
          <Icon icon="tabler:building-store" class="text-primary" />
          <span>{{ slotProps.option.nom }}</span>
        </div>
      </template>
    </Select>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Select from 'primevue/select';

defineProps<{
  modelValue: string | null;
  options: any[];
  placeholder?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
  (e: 'change', event: any): void;
}>();
</script>
