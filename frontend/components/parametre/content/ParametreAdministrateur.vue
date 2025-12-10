<template>
  <div class="space-y-6">
    <!-- Toast pour les notifications -->
    <Toast />

    <!-- Bannière en haut -->
    <BannerHeader
      title="Gestion des Administrateurs"
      description="Gérez les comptes administrateurs et leurs permissions"
    />

    <!-- Contenu temporaire -->
    <div class="bg-white rounded-lg border-2 border-gris/40 p-8">
      <div class="text-center py-12">
        <Icon name="lucide:users" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 class="text-xl font-semibold text-gray-700 mb-2">
          Gestion des Administrateurs
        </h3>
        <p class="text-gray-500 mb-6">
          Cette section permettra de gérer les comptes administrateurs, leurs rôles et permissions.
        </p>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p class="text-sm text-blue-700">
            <Icon name="lucide:info" class="w-4 h-4 inline mr-2" />
            Fonctionnalité en cours de développement
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Toast from 'primevue/toast';
import BannerHeader from '~/components/banner/BannerHeader.vue';

// Ce composant sera développé ultérieurement
// Il contiendra la logique pour :
// - Lister les administrateurs
// - Ajouter/modifier des administrateurs
// - Gérer les permissions
// - Réinitialiser les mots de passe
</script>
