<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-4">
    <div class="w-full max-w-5xl">
      <!-- Header avec effet 3D -->
      <!-- <BannerHeader3D :title="headerTitle" :description="headerDescription" title-class="text-3xl md:text-4xl"
        icon="solar:user-id-linear" /> -->

      <!-- Carte principale du stepper -->
      <div class="bg-white rounded-lg border-2 border-gris/40 shadow-sm px-8 pt-5 pb-1">
        <!-- Stepper PrimeVue -->
        <Stepper v-model:value="activeStep" linear class="">
          <StepList>
            <Step v-for="(step, index) in steps" :key="index" :value="index + 1">
              {{ step.title }}
            </Step>
          </StepList>

          <StepPanels>
            <StepPanel v-for="(step, index) in steps" :key="index" :value="index + 1">
              <template #default>
                <div class="">
                  <!-- Titre de l'étape -->
                  <h3 class="text-2xl font-bold text-gray-800 mb-6">
                    {{ step.title }}
                  </h3>

                  <!-- Contenu de l'étape (formulaire ou résumé) -->
                  <div v-if="!step.isSummary" class="space-y-6">
                    <!-- Formulaire dynamique -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div v-for="field in step.fields" :key="field.name"
                        :class="field.fullWidth ? 'md:col-span-2' : ''">
                        <label :for="field.name" class="block text-sm font-medium text-gray-700 mb-2">
                          {{ field.label }}
                          <span v-if="field.required" class="text-red-500">*</span>
                        </label>

                        <!-- Select (Dropdown) -->
                        <Select v-if="field.type === 'select'" :id="field.name" v-model="formData[field.name]"
                          :options="field.options" :optionLabel="field.optionLabel || 'label'"
                          :optionValue="field.optionValue || 'value'" :placeholder="field.placeholder"
                          :filter="field.filter !== false" class="w-full" :class="{ 'p-invalid': errors[field.name] }">
                          <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex items-center gap-2">
                              <span v-if="field.showFlag" :class="getFlagClass(slotProps.value)" class="text-xl"></span>
                              <span>{{ slotProps.value }}</span>
                            </div>
                            <span v-else>{{ field.placeholder }}</span>
                          </template>
                          <template #option="slotProps">
                            <div class="flex items-center gap-2">
                              <span v-if="field.showFlag && slotProps.option.code"
                                :class="`fi fi-${slotProps.option.code}`" class="text-xl"></span>
                              <span>{{
                                slotProps.option[field.optionLabel || "label"]
                              }}</span>
                            </div>
                          </template>
                        </Select>

                        <!-- Input Text / Email / Tel -->
                        <div v-else-if="
                          ['text', 'email', 'tel'].includes(field.type)
                        " class="relative">
                          <InputText :id="field.name" v-model="formData[field.name]" :type="field.type"
                            :placeholder="field.placeholder" class="w-full" :class="{
                              'p-invalid': errors[field.name],
                              'p-valid': isEmailValid(field),
                            }" @input="validateEmailRealTime(field)" />
                          <!-- Icône de validation email -->
                          <Icon v-if="isEmailValid(field)" icon="mdi:check-circle"
                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-vert text-xl pointer-events-none" />
                        </div>

                        <!-- Password -->
                        <div v-else-if="field.type === 'password'" class="relative">
                          <Password :id="field.name" v-model="formData[field.name]" :placeholder="field.placeholder"
                            :feedback="false" toggleMask inputClass="w-full" :inputStyle="{ width: '100%' }" :class="{
                              'p-invalid': errors[field.name],
                              'p-valid': isPasswordValid(field.name),
                            }" @input="validatePasswordRealTime(field.name)" />
                          <!-- Icône de validation -->
                          <Icon v-if="isPasswordValid(field.name)" icon="mdi:check-circle"
                            class="absolute right-12 top-1/2 transform -translate-y-1/2 text-vert text-xl pointer-events-none" />
                        </div>

                        <!-- Textarea -->
                        <Textarea v-else-if="field.type === 'textarea'" :id="field.name" v-model="formData[field.name]"
                          :placeholder="field.placeholder" rows="3" class="w-full"
                          :class="{ 'p-invalid': errors[field.name] }" />

                        <!-- Messages de validation mot de passe -->
                        <PasswordValidation v-if="
                          field.type === 'password' &&
                          field.name === 'password'
                        " :password="formData[field.name]" ref="passwordValidationRef" />

                        <!-- Message d'erreur standard -->
                        <small v-else-if="errors[field.name]" class="text-red-500">
                          {{ errors[field.name] }}
                        </small>
                      </div>
                    </div>
                  </div>

                  <!-- Résumé (dernière étape) -->
                  <div v-else class="space-y-6">
                    <div v-for="(step, stepIndex) in steps.filter(
                      (s) => !s.isSummary
                    )" :key="stepIndex" class="bg-bleu/20 border-2 border-[#a7d2e1] rounded-lg p-6">
                      <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <div class="bg-white border-2 border-[#a7d2e1] p-3 text-center mr-3 shadow-3d-icon">
                          <Icon icon="mdi:check-circle" class="text-green-500" />
                        </div>
                        {{ step.title }}
                      </h4>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-for="field in step.fields" :key="field.name"
                          :class="field.fullWidth ? 'md:col-span-2' : ''">
                          <p class="text-sm text-gray-500">{{ field.label }}</p>
                          <p class="font-medium text-gray-900">
                            {{
                              field.type === "password"
                                ? "••••••••"
                                : formData[field.name] || "Non renseigné"
                            }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Message d'erreur global -->
                  <Message v-if="errorMessage" severity="error" :closable="false" class="mt-6">
                    {{ errorMessage }}
                  </Message>

                  <!-- Boutons de navigation -->
                  <div class="flex justify-end gap-3 mt-8 pt-6 border-t">
                    <!-- Bouton Précédent -->
                    <AppButton v-if="activeStep > 1" label="Précédent" icon-left="pi pi-arrow-left" variant="outline"
                      @click="handlePrev" />
                    <div v-else></div>

                    <!-- Bouton Suivant ou Soumettre -->
                    <AppButton v-if="!step.isSummary" label="Suivant" icon-right="pi pi-arrow-right" variant="primary"
                      @click="handleNext" />
                    <AppButton v-else label="Créer mon compte" icon-left="pi pi-check" variant="primary"
                      :loading="isLoading" @click="handleSubmit" />
                  </div>
                </div>
              </template>
            </StepPanel>
          </StepPanels>
        </Stepper>
      </div>

      <!-- Lien vers connexion -->
      <div class="mt-6 text-center">
        <p class="text-gray-600">
          Déjà un compte ?
          <NuxtLink to="/auth/connexion" class="text-primary hover:underline font-medium">
            Se connecter
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Effet 3D pour l'icône */
.shadow-3d-icon {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.033),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.4);
}
</style>
<script setup lang="ts">
import Stepper from "primevue/stepper";
import StepList from "primevue/steplist";
import Step from "primevue/step";
import StepPanels from "primevue/steppanels";
import StepPanel from "primevue/steppanel";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import Message from "primevue/message";
import AppButton from "~/components/button/AppButton.vue";
// import BannerHeader3D from "~/components/banner/BannerHeader3D.vue";
import { Icon } from "@iconify/vue";
import PasswordValidation from "~/components/PasswordValidation.vue";
import { useValidation } from "~/composables/useValidation";
import { z } from "zod";

interface StepField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "password" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
  feedback?: boolean;
  options?: Array<{ label: string; value: string; flag?: string }>;
  optionLabel?: string;
  optionValue?: string;
  filter?: boolean;
  showFlag?: boolean;
}

interface Step {
  title: string;
  fields?: StepField[];
  isSummary?: boolean;
}

interface Props {
  steps: Step[];
  headerTitle?: string;
  headerDescription?: string;
  onSubmit: (
    data: Record<string, any>
  ) => Promise<{ success: boolean; message?: string }>;
}

const props = withDefaults(defineProps<Props>(), {
  headerTitle: "Inscription",
  headerDescription: "Créez votre compte en quelques étapes",
});

const activeStep = ref(1);
const formData = ref<Record<string, any>>({});
const errors = ref<Record<string, string>>({});
const errorMessage = ref("");
const isLoading = ref(false);

const { validate, rules } = useValidation();
// Utiliser le composable pour les drapeaux
const { getFlagClass } = useCountryFlags();

// Fonctions de validation du mot de passe en temps réel
const hasMinLength = (password: string | undefined): boolean => {
  return !!password && password.length >= 8;
};

const hasUppercase = (password: string | undefined): boolean => {
  return !!password && /[A-Z]/.test(password);
};

const hasLowercase = (password: string | undefined): boolean => {
  return !!password && /[a-z]/.test(password);
};

const hasNumber = (password: string | undefined): boolean => {
  return !!password && /\d/.test(password);
};

const hasSpecialChar = (password: string | undefined): boolean => {
  return !!password && /[@$!%*?&]/.test(password);
};

const passwordValidationRef = ref();

const isPasswordValid = (fieldName: string): boolean => {
  const password = formData.value[fieldName];
  if (!password) return false;

  // Utiliser directement les fonctions de validation
  return (
    hasMinLength(password) &&
    hasUppercase(password) &&
    hasLowercase(password) &&
    hasNumber(password) &&
    hasSpecialChar(password)
  );
};

const validatePasswordRealTime = (fieldName: string) => {
  // Supprimer l'erreur si le mot de passe devient valide
  if (isPasswordValid(fieldName)) {
    delete errors.value[fieldName];
  }
};

// Validation email en temps réel
const isEmailValid = (field: any): boolean => {
  if (field.type !== "email") return false;
  const email = formData.value[field.name];
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateEmailRealTime = (field: any) => {
  // Supprimer l'erreur si l'email devient valide
  if (isEmailValid(field)) {
    delete errors.value[field.name];
  }
};

// Validation des champs de l'étape actuelle avec Zod
const validateCurrentStep = (): boolean => {
  errors.value = {};
  errorMessage.value = "";

  const currentStep = props.steps[activeStep.value - 1];
  if (!currentStep || !currentStep.fields || currentStep.isSummary) return true;

  // Construire le schéma Zod dynamiquement pour l'étape courante
  const stepSchemaShape: Record<string, any> = {};

  for (const field of currentStep.fields) {
    let fieldSchema;

    // Type de base
    if (field.type === 'email') {
      fieldSchema = rules.email;
    } else if (field.type === 'password') {
      // Pour le mot de passe, on garde la validation complexe existante via une règle custom Zod
      fieldSchema = z.string().refine((val) => isPasswordValid(field.name), {
        message: "Le mot de passe ne respecte pas les critères requis"
      });
    } else if (field.type === 'tel') {
      // Pour le téléphone, on peut utiliser une regex simple ou laisser required
      fieldSchema = z.string();
    } else {
      fieldSchema = z.string();
    }

    // Requis ou optionnel
    if (field.required) {
      if (field.type !== 'email' && field.type !== 'password') { // email et password ont déjà leurs contraintes min/format
        fieldSchema = fieldSchema.min(1, `${field.label} est requis`);
      }
    } else {
      fieldSchema = fieldSchema.optional().or(z.literal(''));
    }

    // Cas spécial confirmation mot de passe
    if (field.name === 'confirmPassword') {
      // On gérera la confirmation après la création de l'objet global ou via superRefine, 
      // mais pour simplifier ici on valide juste qu'il est présent s'il est requis.
      // La comparaison se fera manuellement ou via un schéma global plus tard.
      // Pour l'instant, on l'ajoute au schéma de base.
    }

    stepSchemaShape[field.name] = fieldSchema;
  }

  let stepSchema = z.object(stepSchemaShape);

  // Ajouter la validation de confirmation de mot de passe au niveau de l'objet
  if (currentStep.fields.some(f => f.name === 'confirmPassword')) {
    stepSchema = stepSchema.refine((data) => {
      if (data.password && data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    }, {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmPassword"]
    });
  }

  // Valider les données du formulaire
  const validation = validate(stepSchema, formData.value);

  if (!validation.success) {
    errors.value = validation.errors || {};
    errorMessage.value = "Veuillez corriger les erreurs avant de continuer";
    return false;
  }

  return true;
};

// Passer à l'étape suivante
const handleNext = () => {
  if (validateCurrentStep()) {
    if (activeStep.value < props.steps.length) {
      activeStep.value++;
    }
  }
};

// Revenir à l'étape précédente
const handlePrev = () => {
  if (activeStep.value > 1) {
    activeStep.value--;
  }
};

// Soumettre le formulaire
const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await props.onSubmit(formData.value);

    if (!response.success) {
      errorMessage.value = response.message || "Erreur lors de la soumission";
    }
  } catch (error: any) {
    console.error("Erreur soumission:", error);
    errorMessage.value = error.message || "Erreur lors de la soumission";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
:deep(.p-stepper-nav) {
  margin-bottom: 2rem;
}

:deep(.p-stepper-header) {
  padding: 1rem;
}

:deep(.p-stepper-action) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

:deep(.p-inputtext),
:deep(.p-password),
:deep(.p-textarea) {
  width: 100%;
}

/* Couleur du stepper actif en primary au lieu de vert */
:deep(.p-step.p-step-active .p-step-number) {
  background-color: #111827 !important;
  border-color: #111827 !important;
  color: white !important;
}

:deep(.p-step.p-step-active .p-step-title) {
  color: #111827 !important;
  font-weight: 600;
}

:deep(.p-step.p-step-active) {
  color: #111827 !important;
}

/* Ligne de connexion entre les étapes */
:deep(.p-stepper-separator),
:deep(.p-stepper-separator.p-stepper-separator-active),
:deep(.p-step-connector),
:deep(.p-step-connector.p-step-active),
:deep(.p-step-separator) {
  background-color: #111827 !important;
  --p-stepper-separator-active-background: #111827;
  --p-stepper-connector-active-background: #111827;
}

/* Numéro et titre des étapes complétées */
:deep(.p-step.p-step-complete .p-step-number) {
  background-color: #111827 !important;
  border-color: #111827 !important;
}

:deep(.p-step.p-step-complete .p-step-title) {
  color: #111827 !important;
}

/* Override focus colors for inputs in stepper */
:deep(.p-inputtext:enabled:focus),
:deep(.p-password-input:enabled:focus),
:deep(.p-textarea:enabled:focus),
:deep(.p-select:enabled:focus),
:deep(.p-inputnumber-input:enabled:focus) {
  border-color: #4361ee !important;
  box-shadow: 0 0 0 1px #4361ee !important;
}
</style>
