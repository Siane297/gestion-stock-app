<template>

  <div class="min-h-screen flex flex-col md:flex-row">
    <!-- Section gauche - Formulaire -->
    <div class="min-h-screen md:w-[40%] flex items-center justify-center bg-white px-6 py-8 sm:px-8 sm:py-10 lg:px-8">
      <div class="w-full max-w-md">
        <!-- Logo en haut -->
        <div class="mb-6">
          <img src="~/assets/images/logo-2.png" alt="Logo" class=" h-24 w-auto" />
        </div>

        <!-- Contenu du formulaire -->
        <slot />
      </div>
    </div>

    <!-- Section droite - Image & Waves -->
    <div class="hidden md:flex md:w-[60%] relative min-h-[400px] md:min-h-screen overflow-hidden bg-primary items-center justify-center">
      
      <!-- Waves Background -->
      <div class="absolute inset-0 z-0 opacity-30 ">
        <svg class="absolute top-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#ffffff" fill-opacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
        <svg class="absolute bottom-0 right-0 w-full h-1/3" viewBox="0 0 1440 320" preserveAspectRatio="none">
           <path fill="#ffffff" fill-opacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <!-- Image de fond -->
      <img src="~/assets/images/image-dash.png" alt="Connexion" class="w-[600px] max-w-2xl object-contain relative bottom-10 z-10 drop-shadow-2xl" />

      <!-- Contenu texte -->
      <div class="absolute bottom-10 left-10 right-10 p-8 z-20 bg-white/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl text-left">
        <h2 class="text-3xl lg:text-4xl font-bold mb-3 tracking-tight text-[#061141]">Gestion Intelligente & Simplifiée</h2>
        <p class="text-lg text-gray-700 max-w-3xl font-light leading-relaxed">
          Optimisez votre activité avec notre solution tout-en-un : gestion de stock, encaissement (POS) et suivi d'équipe. Gagnez du temps et concentrez-vous sur l'essentiel.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import AppLogo from '~/components/logo/AppLogo.vue';

// Ce layout est utilisé pour les pages de connexion 
// Il affiche le formulaire à gauche et une image à droite avec illustration
</script>

<style scoped>
/* Styles spécifiques au layout si nécessaire */
</style>
