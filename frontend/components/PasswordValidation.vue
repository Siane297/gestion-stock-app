<template>
  <div v-if="showValidation" class="mt-2">
    <div v-if="password && !isValid" class="space-y-1">
      <small class="text-red-500 block">
        Le mot de passe doit contenir au moins :
      </small>
      <div class="space-y-1 ml-2">
        <div class="flex items-center gap-2">
          <Icon :icon="hasMinLength ? 'mdi:check' : 'mdi:close'" 
                :class="hasMinLength ? 'text-vert' : 'text-red-500'" />
          <small :class="hasMinLength ? 'text-vert' : 'text-red-500'">
            8 caractères
          </small>
        </div>
        <div class="flex items-center gap-2">
          <Icon :icon="hasUppercase ? 'mdi:check' : 'mdi:close'" 
                :class="hasUppercase ? 'text-vert' : 'text-red-500'" />
          <small :class="hasUppercase ? 'text-vert' : 'text-red-500'">
            Une majuscule
          </small>
        </div>
        <div class="flex items-center gap-2">
          <Icon :icon="hasLowercase ? 'mdi:check' : 'mdi:close'" 
                :class="hasLowercase ? 'text-vert' : 'text-red-500'" />
          <small :class="hasLowercase ? 'text-vert' : 'text-red-500'">
            Une minuscule
          </small>
        </div>
        <div class="flex items-center gap-2">
          <Icon :icon="hasNumber ? 'mdi:check' : 'mdi:close'" 
                :class="hasNumber ? 'text-vert' : 'text-red-500'" />
          <small :class="hasNumber ? 'text-vert' : 'text-red-500'">
            Un chiffre
          </small>
        </div>
        <div class="flex items-center gap-2">
          <Icon :icon="hasSpecialChar ? 'mdi:check' : 'mdi:close'" 
                :class="hasSpecialChar ? 'text-vert' : 'text-red-500'" />
          <small :class="hasSpecialChar ? 'text-vert' : 'text-red-500'">
            Un caractère spécial (@$!%*?&)
          </small>
        </div>
      </div>
    </div>
    <div v-else-if="isValid" class="flex items-center gap-2 mt-1">
      <Icon icon="mdi:check-circle" class="text-vert" />
      <small class="text-vert font-medium">Mot de passe valide !</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface Props {
  password: string | undefined;
  showValidation?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showValidation: true,
});

// Fonctions de validation
const hasMinLength = computed((): boolean => {
  return !!props.password && props.password.length >= 8;
});

const hasUppercase = computed((): boolean => {
  return !!props.password && /[A-Z]/.test(props.password);
});

const hasLowercase = computed((): boolean => {
  return !!props.password && /[a-z]/.test(props.password);
});

const hasNumber = computed((): boolean => {
  return !!props.password && /\d/.test(props.password);
});

const hasSpecialChar = computed((): boolean => {
  return !!props.password && /[@$!%*?&]/.test(props.password);
});

const isValid = computed((): boolean => {
  if (!props.password) return false;
  
  return hasMinLength.value && 
         hasUppercase.value && 
         hasLowercase.value && 
         hasNumber.value && 
         hasSpecialChar.value;
});

// Exposer isValid pour les composants parents
defineExpose({
  isValid,
});
</script>
