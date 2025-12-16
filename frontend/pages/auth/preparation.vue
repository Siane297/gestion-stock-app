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

const isFinished = ref(false);
const minTimeElapsed = ref(false);

const checkStatus = async () => {
  if (!companyId.value) {
    progress.value = 100; // Pas d'ID, on suppose terminé ou erreur
    tasks.value.forEach(t => t.completed = true);
    return true; // Stop polling logic locally (but redirect is managed elsewhere)
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
        isFinished.value = true;
        progress.value = 100;
        tasks.value.forEach(t => t.completed = true);
        
        // Si le temps min est écoulé, on redirige
        if (minTimeElapsed.value) {
           setTimeout(() => {
                window.location.href = props.redirectTo;
           }, 1000);
           return true; 
        }
        // Sinon on attend que le timer minTimeElapsed le déclenche
        return false; 
      } else if (status === 'FAILED') {
        error.value = "Une erreur est survenue lors de la création de votre espace. Veuillez contacter le support.";
        return true; 
      }
    }
  } catch (err) {
    console.error("Erreur polling:", err);
  }
  return false;
};

// Polling
onMounted(async () => {
    // Timer minimum de 3 secondes pour l'UX
    setTimeout(() => {
        minTimeElapsed.value = true;
        // Si c'était déjà fini, on déclenche la redirection maintenant
        if (isFinished.value) {
             setTimeout(() => {
                window.location.href = props.redirectTo;
             }, 1000);
        }
    }, 3000);

  const interval = setInterval(async () => {
    if (error.value) {
      clearInterval(interval);
      return;
    }
    
    // Si déjà fini et en attente du timer, on ne poll plus l'API inutilement, 
    // mais on laisse l'interval actif pour checker minTimeElapsed ? 
    // Non, le setTimeout s'en charge. On peut stop le polling API si isFinished.
    if (isFinished.value) {
        // On n'arrête pas l'interval ici car checkStatus gère la redirection
        // Mais checkStatus retournera false tant que minTimeElapsed est false...
        // Optimisation: si isFinished, on attend juste le timer.
        return;
    }

    const stop = await checkStatus();
    if (stop && (status === 'FAILED' || !companyId.value)) {
      clearInterval(interval);
    }
    // Note: Si SUCCESS mais pas minTimeElapsed, checkStatus retourne false (ou true avec delai géré)
    // Ici j'ai modifié checkStatus pour ne renvoyer true (stop) que si redirection lancée ou erreur
    if (isFinished.value && minTimeElapsed.value) {
         clearInterval(interval);
    }
    
  }, 1000); // Check toutes les 1 secondes (plus réactif)
  
  // Premier check immédiat
  checkStatus();
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
