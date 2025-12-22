<template>
    <div class="p-8 text-center text-gray-500">
        <h1>Formulaire de modification de caisse</h1>
        <p>Bientôt disponible...</p>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth', 'permissions'],
    permission: 'caisses:modifier'
});
</script>