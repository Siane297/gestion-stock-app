<template>
  <div class="flex">
    <SelectButton 
      v-model="model" 
      :options="options" 
      optionLabel="label" 
      optionValue="value"
      :allowEmpty="false"
    >
      <template #option="slotProps">
        <div class="flex items-center gap-2 px-2">
          <Icon :icon="slotProps.option.icon" />
          <span>{{ slotProps.option.label }}</span>
        </div>
      </template>
    </SelectButton>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import SelectButton from 'primevue/selectbutton';

interface TabOption {
  label: string;
  value: string;
  icon: string;
}

interface Props {
  modelValue: string;
  options: TabOption[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
});
</script>
