<template>
  <div class="flex flex-col gap-4">
    <!-- Bannière -->
    <div class="bg-header shadow-sm rounded-xl py-8 px-8">
      <div class="container mx-auto">
        <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
          {{ isEditMode ? "Modifier un utilisateur" : "Créer un utilisateur" }}
        </h1>
        <p class="text-white/50">
          {{
            isEditMode
              ? "Modifiez les informations et permissions"
              : "Créez un compte utilisateur pour un employé"
          }}
        </p>
      </div>
    </div>

    <!-- Formulaire -->
    <div class="bg-white border-2 border-gris/40 rounded-xl p-8">
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- PARTIE 1 : Informations de base -->
        <div>
          <h2 class="text-xl font-bold text-noir mb-4 flex items-center gap-2">
            <Icon icon="lucide:circle-user" class="text-2xl text-noir" />
            Informations du compte
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Sélectionner l'employé -->
            <div class="field">
              <label
                for="employee"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Employé <span class="text-red-500">*</span>
              </label>
              <Select
                v-model="formData.employeeId"
                :options="availableEmployees"
                optionLabel="label"
                optionValue="value"
                placeholder="Sélectionner un employé"
                :disabled="isEditMode"
                filter
                class="w-full"
                :class="{ 'p-invalid': errors.employeeId }"
              />
              <small v-if="errors.employeeId" class="p-error">{{
                errors.employeeId
              }}</small>
            </div>

            <!-- Rôle/Profil -->
            <div class="field">
              <label
                for="role"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Profil <span class="text-red-500">*</span>
              </label>
              <Select
                v-model="formData.role"
                :options="roles"
                optionLabel="label"
                optionValue="value"
                placeholder="Sélectionner un profil"
                class="w-full"
                :class="{ 'p-invalid': errors.role }"
              />
              <small v-if="errors.role" class="p-error">{{
                errors.role
              }}</small>
            </div>

            <!-- Mot de passe -->
            <div class="field">
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Mot de passe
                <span v-if="!isEditMode" class="text-red-500">*</span>
              </label>
              <div class="relative">
                <Password
                  v-model="formData.password"
                  toggleMask
                  :feedback="false"
                  :placeholder="
                    isEditMode
                      ? 'Laisser vide pour ne pas changer'
                      : 'Entrer le mot de passe'
                  "
                  class="w-full"
                  inputClass="w-full"
                  :class="{
                    'p-invalid': errors.password,
                    'p-valid': isPasswordValid(),
                  }"
                  @input="validatePasswordRealTime"
                />
                <!-- Icône de validation -->
                <Icon
                  v-if="isPasswordValid()"
                  icon="mdi:check-circle"
                  class="absolute right-12 top-1/2 transform -translate-y-1/2 text-vert text-xl pointer-events-none"
                />
              </div>

              <!-- Messages de validation mot de passe -->
              <div
                v-if="!isEditMode && formData.password && !isPasswordValid()"
                class="mt-2"
              >
                <div class="space-y-1">
                  <small class="text-red-500 block">
                    Le mot de passe doit contenir au moins :
                  </small>
                  <div class="space-y-1 ml-2">
                    <div class="flex items-center gap-2">
                      <Icon
                        :icon="
                          hasMinLength(formData.password)
                            ? 'mdi:check'
                            : 'mdi:close'
                        "
                        :class="
                          hasMinLength(formData.password)
                            ? 'text-vert'
                            : 'text-red-500'
                        "
                      />
                      <small
                        :class="
                          hasMinLength(formData.password)
                            ? 'text-vert'
                            : 'text-red-500'
                        "
                      >
                        8 caractères
                      </small>
                    </div>
                    <div class="flex items-center gap-2">
                      <Icon
                        :icon="
                          hasUppercase(formData.password)
                            ? 'mdi:check'
                            : 'mdi:close'
                        "
                        :class="
                          hasUppercase(formData.password)
                            ? 'text-vert'
                            : 'text-red-500'
                        "
                      />
                      <small
                        :class="
                          hasUppercase(formData.password)
                            ? 'text-vert'
                            : 'text-red-500'
                        "
                      >
                        Une majuscule
                      </small>
                    </div>
                    <div class="flex items-center gap-2">
                      <Icon
                        :icon="
                          hasLowercase(formData.password)
                            ? 'mdi:check'
                            : 'mdi:close'
                        "
                        :class="
                          hasLowercase(formData.password)
                            ? 'text-vert'
                            : 'text-red-500'
                        "
                      />
                      <small
                        :class="
                          hasLowercase(formData.password)
                            ? 'text-vert'
                            : 'text-red-500'
                        "
                      >
                        Une minuscule
                      </small>
                    </div>
                    <div class="flex items-center gap-2">
                      <Icon
                        :icon="
                          hasNumber(formData.password)
                            ? 'mdi:check'
                            : 'mdi:close'
                        "
                        :class="
                          hasNumber(formData.password)
                            ? 'text-vert'
                            : 'text-red-500'
                        "
                      />
                      <small
                        :class="
                          hasNumber(formData.password)
                            ? 'text-vert'
                            : 'text-red-500'
                        "
                      >
                        Un chiffre
                      </small>
                    </div>
                    <div class="flex items-center gap-2">
                      <Icon
                        :icon="
                          hasSpecialChar(formData.password)
                            ? 'mdi:check'
                            : 'mdi:close'
                        "
                        :class="
                          hasSpecialChar(formData.password)
                            ? 'text-vert'
                            : 'text-red-500'
                        "
                      />
                      <small
                        :class="
                          hasSpecialChar(formData.password)
                            ? 'text-vert'
                            : 'text-red-500'
                        "
                      >
                        Un caractère spécial (@$!%*?&)
                      </small>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-else-if="!isEditMode && isPasswordValid()"
                class="flex items-center gap-2 mt-1"
              >
                <Icon icon="mdi:check-circle" class="text-vert" />
                <small class="text-vert font-medium"
                  >Mot de passe valide !</small
                >
              </div>

              <small v-if="errors.password" class="p-error">{{
                errors.password
              }}</small>
            </div>

            <!-- Confirmation mot de passe -->
            <div v-if="!isEditMode" class="field">
              <label
                for="confirmPassword"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirmer le mot de passe <span class="text-red-500">*</span>
              </label>
              <Password
                v-model="formData.confirmPassword"
                toggleMask
                :feedback="false"
                placeholder="Confirmer le mot de passe"
                class="w-full"
                inputClass="w-full"
                :class="{ 'p-invalid': errors.confirmPassword }"
              />
              <small v-if="errors.confirmPassword" class="p-error">{{
                errors.confirmPassword
              }}</small>
            </div>

            <!-- Code PIN (Caisse) -->
            <div class="field">
              <label
                for="pin"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Code PIN (Caisse)
                <span class="text-xs text-gray-400 font-normal">(4-6 chiffres)</span>
              </label>
              
              <InputGroup>
                <InputText
                  v-model="formData.pin"
                  id="pin"
                  placeholder="Ex: 1234"
                  class="w-full"
                  :class="{ 'p-invalid': errors.pin }"
                  maxlength="6"
                />
                <InputGroupAddon>
                  <button 
                    type="button" 
                    @click="generateRandomPin"
                    class="p-button p-component p-button-icon-only p-button-text hover:bg-gray-100 transition-colors"
                    title="Générer un PIN aléatoire"
                  >
                    <Icon icon="tabler:dice" class="text-xl text-primary" />
                  </button>
                </InputGroupAddon>
              </InputGroup>

              <small v-if="errors.pin" class="p-error">{{ errors.pin }}</small>
              <small v-else class="text-gray-500 text-xs mt-1">
                Utilisé pour se connecter rapidement aux caisses.
              </small>
            </div>
          </div>
        </div>

        <Divider />

        <!-- PARTIE 2 : Permissions d'accès aux pages -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-noir flex items-center gap-2">
              <Icon icon="tabler:shield-check" class="text-2xl text-noir" />
              Permissions d'accès aux pages
            </h2>
            <div class="flex gap-2">
              <button
                type="button"
                @click="selectAllPermissions"
                class="text-sm text-primary hover:underline"
              >
                Tout sélectionner
              </button>
              <span class="text-gray-300">|</span>
              <button
                type="button"
                @click="deselectAllPermissions"
                class="text-sm text-gray-500 hover:underline"
              >
                Tout désélectionner
              </button>
            </div>
          </div>

          <p class="text-sm text-gray-600 mb-6">
            Sélectionnez les pages auxquelles l'utilisateur aura accès
          </p>

          <!-- Liste simple des permissions -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="page in availablePages"
              :key="page.slug"
              class="flex items-center justify-between p-3 border-2 rounded-lg transition-colors cursor-pointer"
              :class="
                formData.permissions.includes(page.slug)
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              "
              @click="
                togglePermission(
                  page.slug,
                  !formData.permissions.includes(page.slug)
                )
              "
            >
              <div class="flex items-center gap-3">
                <Icon
                  :icon="page.icon"
                  class="text-xl"
                  :class="
                    formData.permissions.includes(page.slug)
                      ? 'text-primary'
                      : 'text-gray-500'
                  "
                />
                <div>
                  <p
                    class="font-medium text-sm"
                    :class="
                      formData.permissions.includes(page.slug)
                        ? 'text-noir'
                        : 'text-gray-700'
                    "
                  >
                    {{ page.name }}
                  </p>
                  <p class="text-xs text-gray-400">
                    {{ page.description }}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                :modelValue="formData.permissions.includes(page.slug)"
                @update:modelValue="togglePermission(page.slug, $event)"
                @click.stop
              />
            </div>
          </div>

          <!-- Résumé des permissions -->
          <div
            v-if="formData.permissions.length > 0"
            class="mt-4 p-3 bg-gray-50 rounded-lg text-center"
          >
            <p class="text-sm text-gray-600">
              <span class="font-medium">{{ formData.permissions.length }}</span>
              permission(s) sélectionnée(s) sur
              <span class="font-medium">{{ availablePages.length }}</span>
            </p>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <AppButton
            label="Annuler"
            variant="outline"
            @click="handleCancel"
            iconLeft="mdi:close"
            type="button"
          />
          <AppButton
            :label="isEditMode ? 'Mettre à jour' : 'Créer l\'utilisateur'"
            variant="primary"
            iconLeft="mdi:check"
            :loading="isSubmitting"
            type="submit"
          />
        </div>
      </form>
    </div>

    <!-- Dialog de confirmation annulation -->
    <ConfirmationDialog
      v-model:visible="showCancelDialog"
      message="Voulez-vous vraiment annuler ? Les données saisies seront perdues."
      header="Confirmation d'annulation"
      accept-label="Oui, annuler"
      reject-label="Non, continuer"
      @accept="onConfirmCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Select from "primevue/select";
import Password from "primevue/password";
import ToggleSwitch from "primevue/toggleswitch";
import Divider from "primevue/divider";
import InputText from "primevue/inputtext";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import { Icon } from "@iconify/vue";
import AppButton from "~/components/button/AppButton.vue";
import ConfirmationDialog from "~/components/dialog/ConfirmationDialog.vue";

interface Employee {
  value: string;
  label: string;
}

interface Props {
  employees?: Employee[];
  initialData?: any;
  isSubmitting?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  employees: () => [],
  isSubmitting: false,
});

const emit = defineEmits<{
  (e: "submit", data: any): void;
  (e: "cancel"): void;
}>();

// Rôles disponibles
const roles = [
  {
    label: "Administrateur",
    value: "ADMIN",
    description: "Propriétaire - Tous les droits",
  },
  {
    label: "Manager",
    value: "MANAGER",
    description: "Gestion d'équipe et paramètres",
  },
  {
    label: "Utilisateur",
    value: "USER",
    description: "Accès limité aux pages autorisées",
  },
  { label: "RH", value: "RH", description: "Gestion des ressources humaines" },
];

// Pages disponibles (correspondant à la sidebar)
const availablePages = [
  {
    name: "Tableau de bord",
    slug: "accueil",
    icon: "tabler:home",
    description: "Vue d'ensemble et statistiques",
  },
  {
    name: "Produits",
    slug: "produits",
    icon: "tabler:box",
    description: "Catalogue des produits",
  },
  {
    name: "Stock",
    slug: "stock",
    icon: "tabler:archive",
    description: "Gestion des stocks",
  },
  {
    name: "Boutique/Magasin",
    slug: "boutique",
    icon: "tabler:building-store",
    description: "Gestion des magasins",
  },
  {
    name: "Personnel",
    slug: "employees",
    icon: "tabler:users",
    description: "Gestion des employés",
  },
  {
    name: "Client",
    slug: "client",
    icon: "tabler:user-check",
    description: "Gestion des clients",
  },
  {
    name: "Fournisseur",
    slug: "fournisseur",
    icon: "tabler:user-star",
    description: "Gestion des fournisseurs",
  },
  {
    name: "Caisse",
    slug: "caisse",
    icon: "tabler:device-laptop",
    description: "Gestion des caisses",
  },
  {
    name: "Point de vente",
    slug: "point-vente",
    icon: "tabler:device-laptop",
    description: "Interface de vente",
  },
  {
    name: "Vente",
    slug: "vente",
    icon: "tabler:coins",
    description: "Historique des ventes",
  },
  {
    name: "Achat",
    slug: "achat",
    icon: "tabler:shopping-cart",
    description: "Gestion des achats",
  },
  {
    name: "Comptabilité",
    slug: "comptabilite",
    icon: "tabler:calculator",
    description: "Suivi comptable",
  },
  {
    name: "Utilisateurs",
    slug: "utilisateur",
    icon: "tabler:user-cog",
    description: "Gestion des comptes utilisateurs",
  },
  {
    name: "Paramètres",
    slug: "parametre",
    icon: "tabler:settings",
    description: "Configuration de l'application",
  },
];

// Mode édition
const isEditMode = computed(() => !!props.initialData);

// Données du formulaire
const formData = ref({
  employeeId: "",
  role: "USER",
  password: "",
  confirmPassword: "",
  permissions: [] as string[],
  pin: "",
});

// Erreurs de validation
const errors = ref<Record<string, string>>({});

// Dialog de confirmation
const showCancelDialog = ref(false);

// Employés disponibles
const availableEmployees = computed(() => {
  return props.employees;
});

// Initialiser avec les données existantes si en mode édition
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = {
        employeeId: newData.employeeId || "",
        role: newData.role || "USER",
        password: "",
        confirmPassword: "",
        permissions: Array.isArray(newData.permissions)
          ? newData.permissions
          : [],
        pin: newData.pin || "",
      };
    }
  },
  { immediate: true }
);

// Toggle permission
const togglePermission = (slug: string, value: boolean) => {
  if (value) {
    if (!formData.value.permissions.includes(slug)) {
      formData.value.permissions.push(slug);
    }
  } else {
    formData.value.permissions = formData.value.permissions.filter(
      (p) => p !== slug
    );
  }
};

// Sélectionner toutes les permissions
const selectAllPermissions = () => {
  formData.value.permissions = availablePages.map((p) => p.slug);
};

// Désélectionner toutes les permissions
const deselectAllPermissions = () => {
  formData.value.permissions = [];
};

// Générer un PIN aléatoire
const generateRandomPin = () => {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  formData.value.pin = pin;
  if (errors.value.pin) {
    delete errors.value.pin;
  }
};

// Validation
const validate = (): boolean => {
  errors.value = {};
  let isValid = true;

  if (!formData.value.employeeId) {
    errors.value.employeeId = "Veuillez sélectionner un employé";
    isValid = false;
  }

  if (!formData.value.role) {
    errors.value.role = "Veuillez sélectionner un profil";
    isValid = false;
  }

  // Validation PIN
  if (formData.value.pin && !/^\d{4,6}$/.test(formData.value.pin)) {
    errors.value.pin = "Le PIN doit être composé de 4 à 6 chiffres";
    isValid = false;
  }

  if (!isEditMode.value) {
    if (!formData.value.password) {
      errors.value.password = "Le mot de passe est requis";
      isValid = false;
    } else if (!isPasswordValid()) {
      errors.value.password =
        "Le mot de passe ne respecte pas les critères requis";
      isValid = false;
    }

    if (formData.value.password !== formData.value.confirmPassword) {
      errors.value.confirmPassword = "Les mots de passe ne correspondent pas";
      isValid = false;
    }
  } else if (formData.value.password && !isPasswordValid()) {
    errors.value.password =
      "Le mot de passe ne respecte pas les critères requis";
    isValid = false;
  }

  return isValid;
};

// Soumettre le formulaire
const handleSubmit = () => {
  if (!validate()) {
    return;
  }

  const dataToSubmit: any = {
    employeeId: formData.value.employeeId,
    role: formData.value.role,
    permissions: formData.value.permissions,
    pin: formData.value.pin || null,
  };

  // Ajouter le mot de passe seulement si renseigné
  if (formData.value.password) {
    dataToSubmit.password = formData.value.password;
  }

  emit("submit", dataToSubmit);
};

// Gérer l'annulation
const handleCancel = () => {
  showCancelDialog.value = true;
};

// Fonctions de validation du mot de passe
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

const isPasswordValid = (): boolean => {
  const password = formData.value.password;
  if (!password) return false;

  return (
    hasMinLength(password) &&
    hasUppercase(password) &&
    hasLowercase(password) &&
    hasNumber(password) &&
    hasSpecialChar(password)
  );
};

const validatePasswordRealTime = () => {
  if (isPasswordValid()) {
    delete errors.value.password;
  }
};

// Confirmer l'annulation
const onConfirmCancel = () => {
  emit("cancel");
};
</script>

<style scoped>
.field {
  @apply flex flex-col;
}

:deep(.p-password) {
  @apply w-full;
}

:deep(.p-password input) {
  @apply w-full;
}

:deep(.p-invalid) {
  @apply border-red-500;
}

.p-error {
  @apply text-red-500 text-xs mt-1;
}
</style>
