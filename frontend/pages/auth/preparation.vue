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
import { useCurrentUser } from "~/composables/api/useUserApi";

interface Props {
  title?: string;
  message?: string;
  duration?: number;
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

const route = useRoute();
const config = useRuntimeConfig();
const { user } = useCurrentUser();
const progress = ref(0);
const error = ref<string | null>(null);

const tasks = ref([
  { label: 'Création de votre organisation', completed: true },
  { label: 'Configuration de la base de données', completed: false },
  { label: 'Préparation de votre espace', completed: false },
  { label: 'Finalisation', completed: false },
]);

const companyId = computed(() => {
  return (route.query.companyId as string) || user.value?.company?.id;
});

const checkStatus = async () => {
  if (!companyId.value) {
    progress.value = 100; // Pas d'ID, on suppose terminé ou erreur
    tasks.value.forEach(t => t.completed = true);
    return true; // Stop polling
  }

  try {
    const response = await $fetch<{ success: boolean; data: { status: string } }>(
      `${config.public.apiBase}/api/auth/company-status/${companyId.value}`
    );

    if (response.success) {
      const status = response.data.status;
      
      if (status === 'PROVISIONING') {
        // En cours... on avance un peu la barre fictivement
        if (progress.value < 90) progress.value += 5;
        return false; // Continue polling
      } else if (status === 'TRIAL' || status === 'ACTIVE') {
        // Terminé !
        progress.value = 100;
        tasks.value.forEach(t => t.completed = true);
        return true; // Stop polling
      } else if (status === 'FAILED') {
        error.value = "Une erreur est survenue lors de la création de votre espace. Veuillez contacter le support.";
        return true; // Stop polling
      }
    }
  } catch (err) {
    console.error("Erreur polling:", err);
    // On ne stop pas forcément en cas d'erreur réseau temporaire
  }
  return false;
};

// Polling
onMounted(async () => {
  // Attendre un peu que le composable user soit prêt si besoin
  if (!companyId.value) {
    // Si on vient d'arriver, user store peut ne pas être hydraté
    // On attend un peu ou on espère qu'il l'est
  }

  const interval = setInterval(async () => {
    if (error.value) {
      clearInterval(interval);
      return;
    }

    const finished = await checkStatus();
    if (finished) {
      clearInterval(interval);
      // Redirection après court délai
      setTimeout(() => {
        window.location.href = props.redirectTo;
      }, 1000);
    }
  }, 2000); // Check toutes les 2 secondes
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
