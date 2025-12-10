<template>
  <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '50rem' }"
    :pt="{ mask: { class: 'backdrop-blur-sm' } }" class="onboarding-dialog bg-transparent shadow-none" :showHeader="false" :contentStyle="{ padding: '0', borderRadius: '1rem' }">
    <template #container="{ closeCallback }">
      <div class="flex flex-col h-full relative overflow-hidden bg-white rounded-xl">
        <!-- Close button (optional, user said they can close if they want, but usually onboarding is forced or has a skip) -->
        <button @click="handleClose" class="absolute top-4 right-4 z-50 text-gray-400 hover:text-gray-600 transition-colors">
          <i class="pi pi-times text-xl"></i>
        </button>

        <!-- Slides Container -->
        <div class="flex-1 overflow-hidden relative min-h-[500px] flex">
          <transition-group name="slide-fade" tag="div" class="w-full flex">
             <div v-for="(slide, index) in slides" :key="index" v-show="currentSlide === index" class="w-full flex-shrink-0 flex items-center p-8 gap-8">
                <!-- Text Content (Left) -->
                <div class="w-1/2 space-y-6">
                   <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6 shadow-3d-icon border-2 ">
                      <Icon :icon="slide.icon" class="text-white text-3xl" />
                   </div>
                   <h2 class="text-3xl font-bold text-gray-900 leading-tight">
                      {{ slide.title }}
                   </h2>
                   <p class="text-lg text-gray-600 leading-relaxed">
                      {{ slide.description }}
                   </p>
                </div>

                <!-- Illustration (Right) -->
                 <div class="w-1/2 flex justify-center items-center">
                    <img :src="slide.image" :alt="slide.title" class="max-w-full max-h-[350px] object-contain drop-shadow-xl animate-float" />
                 </div>
             </div>
          </transition-group>
        </div>

        <!-- Navigation Footer -->
        <div class="p-8 border-t border-gray-100 flex items-center justify-between">
            <!-- Progress Indicators -->
            <div class="flex gap-2">
                <div v-for="i in slides.length" :key="i" 
                     class="h-2 rounded-full transition-all duration-300"
                     :class="currentSlide === i - 1 ? 'w-8 bg-primary' : 'w-2 bg-gray-200'">
                </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-4">
                <AppButton v-if="currentSlide > 0" label="Retour" iconLeft="pi pi-arrow-left" variant="outline" @click="prevSlide" />
                <AppButton :label="isLastSlide ? 'Commencer maintenant' : 'Suivant'" 
                        :iconRight="isLastSlide ? 'pi pi-check' : 'pi pi-arrow-right'" 
                        variant="primary"
                        @click="nextSlide" />
            </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Dialog from 'primevue/dialog';
import AppButton from '~/components/button/AppButton.vue';
import employeImg from '~/assets/images/employe.png';
import configImg from '~/assets/images/config.png';
import qrCodeImg from '~/assets/images/QR Code-bro.png';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'complete']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const currentSlide = ref(0);

const slides = [
  {
    title: "Gestion Centralisée des Employés",
    description: "Créez facilement des profils complets pour vos collaborateurs. Importez leurs informations, générez des badges numériques et suivez leurs dossiers en un seul endroit.",
    image: employeImg,
    icon: "lucide:users"
  },
  {
    title: "Configuration Horaire Flexible",
    description: "Définissez des plages horaires adaptées à votre activité. Gérez automatiquement les temps de pause, configurez les tolérances de retard et assurez un suivi précis du temps de travail.",
    image: configImg,
    icon: "lucide:clock"
  },
  {
    title: "Pointage Intelligent par QR Code",
    description: "Chaque employé reçoit un badge avec QR Code unique. Un appareil de l'entreprise (téléphone ou tablette) scannera le badge pour enregistrer les entrées et sorties en un instant.",
    image: qrCodeImg,
    icon: "lucide:qr-code"
  }
];

const isLastSlide = computed(() => currentSlide.value === slides.length - 1);

const nextSlide = () => {
  if (isLastSlide.value) {
    handleClose();
    emit('complete');
  } else {
    currentSlide.value++;
  }
};

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
};

const handleClose = () => {
  visible.value = false;
};
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.animate-float {
    animation: float 6s ease-in-out infinite;
}

@keyframes float {
    0% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-10px);
    }
    100% {
        transform: translateY(0px);
    }
}

.shadow-3d-icon {
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 -2px 4px rgba(0, 0, 0, 0.15),
    inset 0 2px 4px rgba(255, 255, 255, 0.25);
}
</style>
