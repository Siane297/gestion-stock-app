<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-bleu to-white px-4">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <!-- Icon -->
        <div class="mb-6">
          <div class="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
               :class="error?.statusCode === 403 ? 'bg-red-100' : 'bg-orange-100'">
            <Icon 
              :icon="error?.statusCode === 403 ? 'lucide:shield-x' : 'lucide:alert-circle'" 
              class="text-6xl"
              :class="error?.statusCode === 403 ? 'text-red-500' : 'text-orange-500'"
            />
          </div>
        </div>

        <!-- Error Code -->
        <h1 class="text-6xl font-bold text-noir mb-2">
          {{ error?.statusCode || 500 }}
        </h1>
        
        <!-- Title -->
        <h2 class="text-2xl font-bold text-noir mb-4">
          {{ errorTitle }}
        </h2>

        <!-- Description -->
        <p class="text-gray-600 mb-8">
          {{ errorMessage }}
        </p>

        <!-- User Info (403 uniquement) -->
        <div v-if="error?.statusCode === 403 && user" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">
            <span class="font-semibold">Utilisateur:</span> {{ userName }}
          </p>
          <p class="text-sm text-gray-600">
            <span class="font-semibold">Rôle:</span> {{ formatRole(user.role) }}
          </p>
          <p class="text-sm text-gray-600" v-if="user.permissions">
            <span class="font-semibold">Permissions:</span> {{ user.permissions.join(', ') }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <AppButton
            label="Retour"
            variant="primary"
            iconLeft="lucide:home"
            @click="handleClearError"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import AppButton from '~/components/button/AppButton.vue';
import { useSecureAuth } from '~/composables/useSecureAuth';
import { formatRole } from '~/composables/api/useUserApi';

const props = defineProps({
  error: Object
});

const { user } = useSecureAuth();

const userName = computed(() => {
  if (!user.value) return 'Utilisateur';
  if (user.value.employee) {
    return user.value.employee.fullName;
  }
  return user.value.name || 'Utilisateur';
});

const errorTitle = computed(() => {
  if (props.error?.statusCode === 403) return 'Accès Refusé';
  if (props.error?.statusCode === 404) return 'Page non trouvée';
  return 'Une erreur est survenue';
});

const errorMessage = computed(() => {
  if (props.error?.statusCode === 403) {
    return 'Vous n\'êtes pas autorisé à accéder à cette page. Veuillez contacter votre administrateur si vous pensez qu\'il s\'agit d\'une erreur.';
  }
  if (props.error?.statusCode === 404) {
    return 'La page que vous recherchez n\'existe pas.';
  }
  return props.error?.message || 'Une erreur inattendue est survenue.';
});

const handleClearError = () => {
  // Rediriger vers index.vue pour revérification et redirection vers la première page accessible
  clearError({ redirect: '/' });
};
</script>

<style scoped>
/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.max-w-md {
  animation: fadeIn 0.5s ease-out;
}
</style>
