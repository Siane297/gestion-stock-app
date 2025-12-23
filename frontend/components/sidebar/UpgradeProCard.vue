<template>
  <div class="px-4 py-3 mt-auto border-t border-white/10">
    <div class="relative overflow-visible rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary p-4 shadow-[0_15px_35px_-5px_rgba(0,147,160,0.5)] group border border-white/20">
      <!-- Lignes courbes décoratives SVG -->
      <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-2xl">
        <svg class="absolute top-0 right-0 w-full h-full opacity-20" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M150 0C150 100 0 100 0 200" stroke="white" stroke-width="2" />
          <path d="M200 50C200 150 50 150 50 250" stroke="white" stroke-width="2" />
        </svg>
      </div>

      <!-- Illustration et Cercles décoratifs -->
      <div class="absolute -right-5 -top-7 w-auto h-[110px] z-10 group-hover:scale-105 transition-all duration-500 rotate-12">
        <img src="~/assets/images/illustration-upgrade.png" alt="Upgrade" class="w-full h-full object-contain" />
      </div>

      <!-- Contenu -->
      <div class="relative z-10 flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-black/10 backdrop-blur-md border border-white/20">
            <Icon icon="solar:crown-minimalistic-bold-duotone" class="text-white text-lg" />
          </div>
          <span class="text-[13px] font-bold text-white tracking-wide uppercase drop-shadow-sm">Version Pro</span>
        </div>
        
        <p class="text-[11px] text-white/90 leading-snug font-medium pr-8">
          Débloquez des fonctionnalités avancées, plus de boutiques et des rapports.
        </p>

        <button 
          class="mt-1 w-full rounded-xl bg-white py-2 text-[11px] font-bold text-primary shadow hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span>Plus d'infos</span>
          <Icon icon="tabler:arrow-narrow-right" class="text-xs" />
        </button>
      </div>

      <!-- Motif de grille subtil -->
      <div class="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 15px 15px;"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
</script>

<style scoped>
/* Optionnel: animation de pulsation douce sur le bouton */
button {
  /* box-shadow: 0 4px 14px 0 rgba(255, 255, 255, 0.39); */
}
</style>
