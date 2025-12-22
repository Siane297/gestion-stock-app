<template>
    <h1>liste des comptabilites</h1>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'permissions'],
  permission: 'comptabilite:voir'
});
</script>