<script setup lang="ts">
const pwa = useNuxtApp().$pwa as any

const updateServiceWorker = () => {
  if (pwa) {
    pwa.updateServiceWorker(true)
  }
}

const close = () => {
  if (pwa) {
    pwa.needRefresh.value = false
  }
}
</script>

<template>
  <div v-if="pwa?.needRefresh" 
       class="fixed bottom-4 right-4 z-[9999] p-4 bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300"
       role="alert">
    <div class="flex items-start gap-4">
      <div class="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
        <Icon name="tabler:refresh" class="w-6 h-6" />
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-semibold text-slate-900 dark:text-white">
          Mise à jour disponible
        </h3>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Une nouvelle version de l'application est disponible. Cliquez sur mettre à jour pour l'appliquer.
        </p>
        <div class="mt-4 flex items-center gap-3">
          <button @click="updateServiceWorker"
                  class="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
            Mettre à jour
          </button>
          <button @click="close"
                  class="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors duration-200 focus:outline-none">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: animate-in 0.3s ease-out;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
