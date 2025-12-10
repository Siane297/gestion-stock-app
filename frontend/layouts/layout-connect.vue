<template>
  <div class="min-h-screen flex flex-col md:flex-row">
    <!-- Section gauche - Formulaire -->
    <div class="min-h-screen md:w-[40%] flex items-center justify-center bg-slot px-6 py-8 sm:px-8 sm:py-10 lg:px-8">
      <div class="w-full max-w-md">
        <!-- Logo en haut -->
        <div class="mb-6">
          <AppLogo size="lg" />
        </div>

        <!-- Contenu du formulaire -->
        <slot />
      </div>
    </div>

    <!-- Section droite - Image -->
    <div class="hidden md:flex md:w-[60%] relative min-h-[400px] md:min-h-screen overflow-hidden bg-blue-900">
      <!-- Image de fond -->
      <img src="/assets/image/equipe.jpg" alt="Equipe" class="absolute inset-0 w-full h-full object-cover" />

      <!-- Overlay dégradé -->
      <div class="absolute inset-0 bg-gradient-to-t from-[#2B48D1] via-[#2B48D1]/40 to-transparent"></div>

      <!-- Bordure rectangle en haut à droite -->
      <div class="glass-corner top-right"></div>

      <!-- Bordure rectangle en bas à gauche -->
      <div class="glass-corner bottom-left"></div>

      <!-- Contenu texte -->
      <div class="absolute bottom-0 left-0 right-0 p-12  mb-6 z-10 text-white flex justify-center items-center">
        <div class="flex flex-col">
          <h2 class="text-4xl font-bold mb-4">Bienvenue sur Pointage APP</h2>
        <p class="text-lg opacity-90 max-w-2xl">
          Votre solution complète pour la gestion des temps et des présences. Simplifiez le suivi de vos équipes, optimisez la productivité et accédez à vos données en temps réel, le tout dans une interface moderne et intuitive.
        </p>
        <!-- Ligne décorative -->
        <div class="w-[300px] h-1 bg-white mt-8"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppLogo from '~/components/logo/AppLogo.vue';

// Ce layout est utilisé pour les pages de connexion 
// Il affiche le formulaire à gauche et une image à droite
</script>

<style scoped>
/* Bordures rectangulaires aux coins - Style repris de EmployeeBadge */
.glass-corner {
  position: absolute;
  background: transparent;
  border: 60px solid rgba(255, 255, 255, 0.254);
  /* Couleur flou fix */
  z-index: 5;
}

/* Bordure en haut à droite */
.glass-corner.top-right {
  top: 0;
  right: 0;
  width: 300px;
  height: 250px;
  border-bottom-left-radius: 90px;
  border-top: none;
  border-right: none;
}

/* Bordure en bas à gauche */
.glass-corner.bottom-left {
  bottom: 0;
  left: 0;
  width: 300px;
  height: 250px;
  border-top-right-radius: 90px;
  border-bottom: none;
  border-left: none;
}
</style>
