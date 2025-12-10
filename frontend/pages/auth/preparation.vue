<template>
  <div
    class="min-h-screen flex items-center justify-center bg-[#061141] relative overflow-hidden">
    
    <!-- Bordure rectangle en haut à droite -->
    <div class="glass-corner top-right"></div>

    <!-- Bordure rectangle en bas à gauche -->
    <div class="glass-corner bottom-left"></div>

    <div class="text-center space-y-6 p-8 relative z-10">
      <!-- Logo ou icône -->
      <div class="flex justify-center">
        <div class="relative">
          <Icon icon="mdi:cog" class="text-white  text-8xl animate-spin-slow" />
          <!-- <Icon icon="tabler:rosette-discount-check-filled"
            class="text-green-500 text-4xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" /> -->
        </div>
      </div>

      <!-- Message principal -->
      <div class="space-y-2">
        <h1 class="text-4xl font-bold text-white">
          {{ title }}
        </h1>
        <p class="text-lg text-white animate-pulse">
          {{ message }}
        </p>
      </div>

      <!-- Barre de progression -->
      <div class="max-w-md mx-auto">
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-primary h-2.5 rounded-full transition-all duration-300" :style="{ width: `${progress}%` }">
          </div>
        </div>
        <p class="text-sm text-gray-500 mt-2">
          {{ Math.round(progress) }}%
        </p>
      </div>

      <!-- Liste des tâches -->
      <div class="max-w-md mx-auto text-left bg-white border-2 border-gris/40 rounded-xl shadow-lg p-6 space-y-3">
        <div v-for="(task, index) in tasks" :key="index" class="flex items-center gap-3 text-gray-700">
          <Icon :icon="task.completed ? 'tabler:rosette-discount-check-filled' : 'mdi:loading'" :class="[
            task.completed ? 'text-green-500' : 'text-primary animate-spin',
            'text-xl'
          ]" />
          <span :class="{ 'font-medium': !task.completed }">
            {{ task.label }}
          </span>
        </div>
      </div>

      <!-- Note -->
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Cette opération peut prendre quelques instants. Merci de patienter...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
interface Props {
  title?: string;
  message?: string;
  duration?: number; // Durée en millisecondes
  redirectTo?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Préparation de votre espace de gestion de présence',
  message: 'Configuration de votre environnement en cours...',
  duration: 7000,
  redirectTo: '/accueil?onboarding=true',
});

// Désactiver le layout
definePageMeta({
  layout: false,
});

const progress = ref(0);
const tasks = ref([
  { label: 'Création de votre organisation', completed: false },
  { label: 'Configuration de la base de données', completed: false },
  { label: 'Préparation de votre espace', completed: false },
  { label: 'Finalisation', completed: false },
]);

// Animation de progression
onMounted(() => {
  const taskDuration = props.duration / tasks.value.length;

  // Compléter les tâches une par une
  tasks.value.forEach((task, index) => {
    setTimeout(() => {
      task.completed = true;
    }, taskDuration * (index + 1));
  });

  // Progression continue
  const interval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += 100 / (props.duration / 100);
    } else {
      clearInterval(interval);
      // Rediriger après completion avec rechargement complet
      // pour garantir que toutes les données sont chargées
      setTimeout(() => {
        // Utiliser window.location.href au lieu de navigateTo
        // pour forcer un rechargement complet de la page
        window.location.href = props.redirectTo;
      }, 500);
    }
  }, 100);
});
</script>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

/* Bordures rectangulaires aux coins */
.glass-corner {
  position: absolute;
  background: transparent;
  border: 60px solid rgba(255, 255, 255, 0.254);
  z-index: 0;
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
