<template>
  <div
    class="min-h-screen flex items-center justify-center bg-side2 relative overflow-hidden">
    
    <!-- Bordure rectangle en haut à droite -->
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
    progress.value = 100; 
    tasks.value.forEach(t => t.completed = true);
    return true; 
  }

  try {
    const response = await $fetch<{ success: boolean; data: { status: string } }>(
      `${config.public.apiBase}/api/auth/company-status/${companyId.value}`
    );

    if (response.success) {
      const status = response.data.status;
      
      if (status === 'PROVISIONING') {
        // Le backend travaille... on laisse la simulation gérer la barre
        return false; 
      } else if (status === 'TRIAL' || status === 'ACTIVE') {
        isFinished.value = true;
        tasks.value.forEach(t => t.completed = true);
        return true; // Stop polling API
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

const simulateProgress = () => {
    // Incrémenter jusqu'à 90% max pendant la phase d'attente
    // On veut atteindre ~90% en props.duration (par défaut 3000ms ici hardcodé via minTimeElapsed)
    // 3000ms / 50ms = 60 ticks. 90 / 60 = 1.5% par tick.
    const interval = setInterval(() => {
        if (progress.value >= 90) {
            // Ralentir drastiquement si on attend encore l'API ou le timer
            if (progress.value < 99) progress.value += 0.1;
        } else {
            progress.value += 1.5;
        }
        
        // Si tout est fini (API Ok + Timer Ok), on termine
        if (isFinished.value && minTimeElapsed.value) {
             progress.value = 100;
             clearInterval(interval);
             setTimeout(() => {
                window.location.href = props.redirectTo;
             }, 500);
        }
    }, 50);
    return interval;
};

// Polling
onMounted(async () => {
    // 1. Démarrer la simulation visuelle immédiate
    simulateProgress();

    // 2. Timer minimum de 3 secondes pour l'UX
    setTimeout(() => {
        minTimeElapsed.value = true;
    }, 3000);

    // 3. Polling API
    const interval = setInterval(async () => {
        if (error.value) {
            clearInterval(interval);
            return;
        }
        
        // Si API a fini, on arrête de poller, on laisse la simulation finir le job
        if (isFinished.value) {
            clearInterval(interval);
            return;
        }

        const stop = await checkStatus();
        if (stop) {
            clearInterval(interval);
        }
    }, 1000); 
  
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
