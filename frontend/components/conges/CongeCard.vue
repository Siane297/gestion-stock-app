<template>
  <div
    class="text-xs px-2 py-1.5 rounded cursor-pointer  transition-all bg-bleu/40 border-l-[4px]"
    :style="{
      borderLeftColor: conge.typeConge?.couleur || '#6B7280',
    }"
    @click="$emit('click', conge)"
  >
    <div class="font-semibold truncate text-gray-900">
      {{ conge.employe?.fullName }}
    </div>
    <div class="text-[10px] text-gray-600 truncate">
      {{ conge.typeConge?.nom }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Conge } from '~/composables/api/useCongeApi'

defineProps<{
  conge: Conge
}>()

defineEmits<{
  click: [conge: Conge]
}>()
</script>
