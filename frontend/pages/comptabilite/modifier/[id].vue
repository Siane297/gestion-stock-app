<template>
    <h1>formulaire de modification de comptabilite</h1>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'permissions'],
  permission: 'comptabilite:modifier'
});
</script>