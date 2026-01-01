<template>
  <div class="bg-white border-2 text-left border-gris/50 rounded-xl p-4  flex flex-col gap-3 transition-colors hover:border-gris/80">
    <!-- Header: Titre, Badge... -->
    <div v-if="$slots.header" class="flex justify-between items-start gap-2">
      <slot name="header"></slot>
    </div>

    <hr v-if="$slots.header && $slots.default" class="border-gris/50" />

    <!-- Corps de la carte -->
    <div class="flex-grow">
      <slot></slot>
    </div>

    <!-- Actions (Boutons) -->
    <div v-if="$slots.footer" class="pt-2 mt-auto border-t border-gris/50">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
// Composant purement structurel pour uniformiser les cartes mobiles
</script>
