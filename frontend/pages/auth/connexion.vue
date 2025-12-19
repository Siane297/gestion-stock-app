<template>
  <div>
    <!-- Titre -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
      <p class="text-gray-600">Accédez à votre espace de gestion</p>
    </div>

    <!-- Formulaire -->
    <form @submit.prevent="handleLogin" class="space-y-6">
      <div class="flex flex-col gap-5 mb-2">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <InputText id="email" v-model="email" type="email" placeholder="votre@email.com" class="w-full"
            :class="{ 'p-invalid': errors.email }" required />
          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <div class="relative">
            <Password id="password" v-model="password" placeholder="••••••••" :feedback="false" toggleMask
              inputClass="w-full" :inputStyle="{ width: '100%' }" :class="{ 'p-invalid': errors.password }" required />
          </div>
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>
      </div>

      <!-- Error message -->
      <Message v-if="errorMessage" severity="error" :closable="false" class="mb-4">
        {{ errorMessage }}
      </Message>

      <!-- Submit button -->
      <AppButton type="submit" label="Se connecter" icon-left="mdi:login" :loading="isLoading" variant="primary"
        size="sm" full-width />
    </form>

    <!-- Footer -->
    <div class="mt-6 text-center">
      <p class="text-gray-600">
        Pas encore de compte ?
        <NuxtLink to="/auth/inscription" class="text-primary hover:underline font-medium">
          S'inscrire
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Message from 'primevue/message';
import AppButton from '~/components/button/AppButton.vue';
import { useSecureAuth } from '~/composables/useSecureAuth';
import { useValidation } from '~/composables/useValidation';
import { z } from 'zod';

// Utiliser le layout avec image
definePageMeta({
  layout: 'layout-connect',
});

const config = useRuntimeConfig();
const router = useRouter();
const { validate, rules } = useValidation();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const errors = ref<{ email?: string; password?: string }>({});

// Schéma de validation
const loginSchema = z.object({
  email: rules.email,
  password: rules.required('Mot de passe requis'),
});

const handleLogin = async () => {
  // Reset errors
  errors.value = {};
  errorMessage.value = '';

  // Validation avec Zod
  const validation = validate(loginSchema, {
    email: email.value,
    password: password.value,
  });

  if (!validation.success) {
    errors.value = validation.errors || {};
    return;
  }

  isLoading.value = true;

  try {
    // Utiliser le composable d'authentification sécurisée
    const { login } = useSecureAuth();

    const response = await login({
      email: email.value,
      password: password.value,
    });

    console.log('🔐 Réponse de connexion:', response);

    if (response.success) {
      console.log('✅ Connexion réussie, redirection vers /');
      // Rediriger vers index.vue qui déterminera la première page accessible
      await navigateTo('/');
    } else {
      errorMessage.value = response.message || 'Erreur de connexion';
    }
  } catch (error: any) {
    console.error('❌ Erreur de connexion:', error);
    errorMessage.value = error.data?.message || 'Email ou mot de passe incorrect';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.p-inputtext,
.p-password {
  width: 100%;
}

/* Override focus colors for inputs */
:deep(.p-inputtext:enabled:focus),
:deep(.p-password-input:enabled:focus) {
  border-color: #4361ee !important;
  box-shadow: 0 0 0 1px #4361ee !important;
}
</style>
