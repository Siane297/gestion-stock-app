<template>
  <div>
    <ClientOnly>
      <VitePwaManifest />
      <PwaUpdatePrompt />
    </ClientOnly>
    <Toast />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import Toast from 'primevue/toast';
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
  body {
    font-family: 'Outfit', sans-serif;
  }
</style>
