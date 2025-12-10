<template>
  <div class="inline-flex gap-2 bg-white border-2 border-gris/40 rounded-xl p-2">
    <button
      v-for="view in views"
      :key="view.value"
      :class="[
        'py-3 px-4 rounded-lg font-semibold transition-all',
        modelValue === view.value
          ? 'bg-primary text-white'
          : 'text-gray-600 hover:bg-gray-100'
      ]"
      @click="$emit('update:modelValue', view.value)"
    >
      <Icon :icon="view.icon" class="inline-block mr-2" />
      {{ view.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface View {
  value: string
  label: string
  icon: string
}

defineProps<{
  modelValue: string
  views: View[]
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
