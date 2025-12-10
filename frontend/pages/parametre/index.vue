<template>
  <div class="min-h-screen">
    <ParametreManager />
  </div>
</template>

<script setup lang="ts">
import ParametreManager from '~/components/parametre/ParametreManager.vue';

// Middleware d'authentification
definePageMeta({
  middleware: ['auth', 'permissions'],
});
</script>