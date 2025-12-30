<template>
  <div class="flex flex-col items-center justify-center w-full max-w-sm mx-auto" @click="focusInput">
    <!-- Zone de Saisie (Cases) -->
    <div class="relative mb-6">
      <!-- Input Invisible mais actif pour le clavier -->
      <input
        ref="inputRef"
        v-model="pin"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        autocomplete="one-time-code"
        :maxlength="maxDigits"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer caret-transparent z-10"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @input="handleInput"
        @keyup.enter="submit"
        :disabled="loading"
      />

      <!-- Visualisation des Cases -->
      <div class="flex gap-2 sm:gap-3 justify-center">
        <div 
          v-for="index in maxDigits" 
          :key="index"
          class="w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-200 bg-white"
          :class="[
            isFocused && pin.length === index - 1 ? 'border-primary ring-4 ring-primary/10 scale-105 z-20 shadow-lg' : 'border-gris',
            pin.length >= index ? 'border-primary/50 bg-primary/5 text-primary' : 'text-transparent',
            error ? '!border-red-500 !bg-red-50 !text-red-500 animate-shake' : ''
          ]"
        >
          <span v-if="pin.length >= index">●</span>
          <span v-else-if="isFocused && pin.length === index - 1" class="w-1 h-6 bg-primary/20 rounded-full animate-pulse"></span>
        </div>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="flex items-center gap-2 text-red-500 font-medium animate-shake mb-6 bg-red-50 px-4 py-2 rounded-lg border border-red-100 w-full justify-center">
      <Icon icon="tabler:alert-circle" />
      <span>{{ error }}</span>
    </div>

    <!-- Bouton Valider -->
    <div class="w-full mb-2">
      <AppButton
        label="Valider le code"
        variant="primary"
        icon="pi pi-check"
        full-width
        size="md"
        :disabled="pin.length < 4"
        :loading="loading"
        @click="submit"
      />
    </div>

    <!-- Info -->
    <!-- <p class="text-gray-400 text-xs font-medium flex items-center gap-2">
      <Icon icon="tabler:keyboard" class="text-base" />
      Saisissez votre code via votre clavier
    </p> -->
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, onMounted, watch, nextTick } from 'vue';
import AppButton from '~/components/button/AppButton.vue';

const props = defineProps<{
  maxDigits?: number;
  loading?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  (e: 'submit', pin: string): void;
  (e: 'change', pin: string): void;
}>();

const maxDigits = props.maxDigits || 6;
const pin = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);

const handleInput = () => {
  // Nettoyer - garder que les chiffres
  pin.value = pin.value.replace(/[^0-9]/g, '');
  
  emit('change', pin.value);
};

const submit = () => {
  if (pin.value.length >= 4 && !props.loading) {
    emit('submit', pin.value);
  }
};

const focusInput = () => {
  if (!props.loading) {
    inputRef.value?.focus();
  }
};

const reset = () => {
  pin.value = '';
  focusInput();
};

defineExpose({ reset, focus: focusInput });
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
}
</style>
