<template>
  <div class="flex flex-col items-center gap-6 w-full max-w-xs mx-auto">
    <!-- Visualisation du PIN (Points) -->
    <div class="flex gap-4 justify-center mb-4">
      <div 
        v-for="index in maxDigits" 
        :key="index"
        class="w-4 h-4 rounded-full border-2 transition-all duration-200"
        :class="[
          pin.length >= index 
            ? 'bg-primary border-primary scale-110' 
            : 'border-gray-300'
        ]"
      ></div>
    </div>

    <!-- Message d'erreur -->
    <p v-if="error" class="text-red-500 text-sm font-medium animate-shake text-center">
      {{ error }}
    </p>

    <!-- Grille numérique -->
    <div class="grid grid-cols-3 gap-3 w-full px-2">
      <AppButton
        v-for="n in 9"
        :key="n"
        variant="secondary"
        class="pin-btn"
        @click="addDigit(n.toString())"
      >
        {{ n }}
      </AppButton>
      
      <AppButton
        variant="secondary"
        class="pin-btn text-gray-400"
        @click="clear"
      >
        <Icon icon="tabler:backspace" class="text-3xl" />
      </AppButton>
      
      <AppButton
        variant="secondary"
        class="pin-btn"
        @click="addDigit('0')"
      >
        0
      </AppButton>
 
      <AppButton
        :variant="pin.length >= 4 ? 'success' : 'secondary'"
        class="pin-btn transition-all duration-300"
        :class="{ 'text-gray-300': pin.length < 4 }"
        @click="submit"
        :disabled="pin.length < 4 || loading"
        :loading="loading"
      >
        <Icon v-if="!loading" icon="tabler:check" class="text-3xl font-bold" />
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, onMounted, onUnmounted } from 'vue';
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

const addDigit = (digit: string) => {
  if (pin.value.length < maxDigits) {
    pin.value += digit;
    emit('change', pin.value);
  }
};

const clear = () => {
  if (pin.value.length > 0) {
    pin.value = pin.value.slice(0, -1);
    emit('change', pin.value);
  }
};

const reset = () => {
  pin.value = '';
};

const submit = () => {
  if (pin.value.length >= 4) {
    emit('submit', pin.value);
  }
};

// Exposer la méthode reset
defineExpose({ reset });

// Support du clavier physique
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key >= '0' && e.key <= '9') {
    addDigit(e.key);
  } else if (e.key === 'Backspace') {
    clear();
  } else if (e.key === 'Enter') {
    submit();
  } else if (e.key === 'Escape') {
    reset();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.pin-btn {
  aspect-ratio: 1 / 1 !important;
  border-radius: 1.5rem !important;
  font-size: 2.25rem !important;
  font-weight: 700 !important;
  padding: 0 !important;
  width: 100% !important;
  height: auto !important;
}

:deep(.flex.items-center.justify-center) {
  width: 100%;
  height: 100%;
}

.pin-btn:active:not(:disabled) {
  transform: scale(0.92);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.2s ease-in-out 0s 2;
}
</style>
