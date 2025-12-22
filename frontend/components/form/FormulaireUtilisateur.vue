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
      <Stepper v-model:value="activeStep">
        <StepList>
          <Step :value="1">Compte</Step>
          <Step :value="2">Permissions</Step>
        </StepList>

        <StepPanels>
          <!-- ÉTAPE 1 : Informations du compte -->
          <StepPanel :value="1">
            <div class="space-y-8">
              <h2 class="text-xl font-bold text-noir flex items-center gap-2">
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

            <!-- Boutique d'affectation -->
            <div class="field">
              <label
                for="magasin"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Boutique d'affectation
              </label>
              <Select
                v-model="formData.magasin_id"
                :options="magasins"
                optionLabel="nom"
                optionValue="id"
                placeholder="Sélectionner une boutique"
                class="w-full"
                showClear
                filter
              >
                <template #option="slotProps">
                  <div class="flex items-center gap-2">
                    <Icon icon="tabler:building-store" class="text-primary" />
                    <span>{{ slotProps.option.nom }}</span>
                  </div>
                </template>
              </Select>
              <small class="text-gray-500 text-xs mt-1">
                L'utilisateur sera restreint aux caisses et stocks de cette boutique.
              </small>
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

            <!-- Portée Globale -->
            <div class="field flex flex-col justify-center">
              <div class="flex items-center gap-3 p-3 border-2 border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                <ToggleSwitch v-model="formData.globalScope" />
                <div>
                  <label class="block text-sm font-bold text-gray-700">Accès global</label>
                  <p class="text-xs text-gray-500">Permet d'accéder à toutes les boutiques de l'organisation.</p>
                </div>
              </div>
            </div>

            <!-- Multi-boutiques (seulement si pas global) -->
            <div v-if="!formData.globalScope" class="field">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Boutiques gérées
              </label>
              <MultiSelect
                v-model="formData.managedStoreIds"
                :options="magasins"
                optionLabel="nom"
                optionValue="id"
                placeholder="Sélectionner les boutiques"
                class="w-full"
                filter
                display="chip"
              >
                <template #option="slotProps">
                  <div class="flex items-center gap-2">
                    <Icon icon="tabler:building-store" class="text-primary" />
                    <span>{{ slotProps.option.nom }}</span>
                  </div>
                </template>
              </MultiSelect>
              <small class="text-gray-500 text-xs mt-1">
                Boutiques supplémentaires auxquelles l'utilisateur a accès.
              </small>
            </div>
            </div> <!-- Fin de la grid -->

            <!-- Boutons de navigation Étape 1 -->
            <div class="flex justify-end gap-3 mt-8 pt-6 border-t">
              <AppButton
                label="Annuler"
                variant="outline"
                @click="onConfirmCancel"
                iconLeft="pi pi-times"
                type="button"
              />
              <AppButton
                label="Suivant"
                variant="primary"
                iconRight="pi pi-arrow-right"
                @click="handleNext"
                type="button"
              />
            </div>
          </div> <!-- Fin de space-y-8 -->
        </StepPanel>

          <!-- ÉTAPE 2 : Permissions granulaires -->
          <StepPanel :value="2">
            <div class="space-y-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-noir flex items-center gap-2">
                  <Icon icon="tabler:shield-check" class="text-2xl text-noir" />
                  Permissions granulaires
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

              <div v-if="formData.role === 'ADMIN'" class="p-4 bg-primary/5 border-2 border-primary/20 rounded-xl mb-6">
                <div class="flex items-center gap-3">
                  <Icon icon="tabler:info-circle" class="text-2xl text-primary" />
                  <p class="text-sm text-noir">
                    <span class="font-bold">Note :</span> Les administrateurs ont accès à toutes les fonctionnalités par défaut. Les permissions sélectionnées ici sont des permissions additionnelles ou spécifiques.
                  </p>
                </div>
              </div>

              <p class="text-sm text-gray-600 mb-6 font-medium">
                Activez les modules et définissez précisément les actions autorisées :
              </p>

              <!-- Liste des modules avec le nouveau composant (Grille 2 colonnes) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <PermissionModuleToggle
                  v-for="mod in permissionModules"
                  :key="mod.id"
                  :module="mod"
                  :actionLabels="actionLabels"
                  v-model="moduleStates[mod.id]!"
                />
              </div>

              <!-- Résumé des permissions -->
              <div
                v-if="formData.customPermissions.length > 0"
                class="mt-6 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gris flex items-center justify-between"
              >
                <p class="text-sm text-gray-600">
                  <span class="font-bold text-primary">{{ formData.customPermissions.length }}</span>
                  permission(s) spécifique(s) configurée(s).
                </p>
                <button 
                    type="button"
                    @click="deselectAllPermissions"
                    class="text-xs text-red-500 hover:underline flex items-center gap-1"
                  >
                    <Icon icon="lucide:trash-2" />
                    Réinitialiser
                  </button>
              </div>

              <!-- Boutons d'action Étape 2 -->
              <div class="flex justify-end gap-3 mt-8 pt-6 border-t">
                <AppButton
                  label="Précédent"
                  variant="outline"
                  @click="activeStep = 1"
                  iconLeft="pi pi-arrow-left"
                  type="button"
                />
                <AppButton
                  :label="isEditMode ? 'Enregistrer les modifications' : 'Créer l\'utilisateur'"
                  variant="primary"
                  iconLeft="pi pi-check"
                  :loading="isSubmitting"
                  @click="handleSubmit"
                  type="button"
                />
              </div>
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>
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
import { ref, computed, watch, onMounted, reactive } from "vue";
import Stepper from "primevue/stepper";
import StepList from "primevue/steplist";
import Step from "primevue/step";
import StepPanels from "primevue/steppanels";
import StepPanel from "primevue/steppanel";
import Select from "primevue/select";
import Password from "primevue/password";
import ToggleSwitch from "primevue/toggleswitch";
import MultiSelect from "primevue/multiselect";
import Divider from "primevue/divider";
import InputText from "primevue/inputtext";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import { Icon } from "@iconify/vue";
import AppButton from "~/components/button/AppButton.vue";
import ConfirmationDialog from "~/components/dialog/ConfirmationDialog.vue";
import PermissionModuleToggle from "./PermissionModuleToggle.vue";
import { useMagasinApi } from "~/composables/api/useMagasinApi";
import { getEffectivePermissions, calculatePermissionsDiff } from "~/utils/permissions";

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
    description: "Accès complet à l'organisation",
  },
  {
    label: "Gérant de Boutique",
    value: "STORE_MANAGER",
    description: "Gestion complète d'une ou plusieurs boutiques",
  },
  {
    label: "Gestionnaire de Stock",
    value: "STOCK_MANAGER",
    description: "Gestion des produits et inventaires",
  },
  {
    label: "Vendeur",
    value: "SELLER",
    description: "Ventes, caisse et catalogue produits",
  },
  {
    label: "Comptable",
    value: "ACCOUNTANT",
    description: "Suivi financier et rapports",
  },
  {
    label: "Utilisateur",
    value: "USER",
    description: "Accès limité par défaut",
  },
];

// Modules et actions disponibles pour les permissions granulaires
const permissionModules = [
  { id: "tableau_de_bord", name: "Tableau de bord", icon: "tabler:home", actions: ["voir"] },
  { id: "produits", name: "Produits", icon: "tabler:box", actions: ["voir", "creer", "modifier", "supprimer", "exporter"] },
  { id: "stock", name: "Stock", icon: "tabler:archive", actions: ["voir", "creer", "modifier", "valider"] },
  { id: "achats", name: "Achats", icon: "tabler:shopping-cart", actions: ["voir", "creer", "modifier", "valider"] },
  { id: "ventes", name: "Ventes", icon: "tabler:coins", actions: ["voir", "creer", "modifier", "supprimer", "exporter"] },
  { id: "clients", name: "Clients", icon: "tabler:user-check", actions: ["voir", "creer", "modifier"] },
  { id: "fournisseurs", name: "Fournisseurs", icon: "tabler:user-star", actions: ["voir", "creer", "modifier"] },
  { id: "caisses", name: "Caisses", icon: "tabler:cash-register", actions: ["voir", "creer", "modifier", "valider", "exporter"] },
  { id: "personnel", name: "Personnel", icon: "tabler:users", actions: ["voir", "creer", "modifier"] },
  { id: "utilisateurs", name: "Utilisateurs", icon: "tabler:user-cog", actions: ["voir", "creer", "modifier", "supprimer"] },
  { id: "boutiques", name: "Boutiques", icon: "tabler:building-store", actions: ["voir", "creer", "modifier"] },
  { id: "comptabilite", name: "Comptabilité", icon: "tabler:calculator", actions: ["voir", "exporter"] },
  { id: "parametres", name: "Paramètres", icon: "tabler:settings", actions: ["voir", "modifier"] },
];

const actionLabels: Record<string, string> = {
  voir: "Voir",
  creer: "Créer",
  modifier: "Modifier",
  supprimer: "Supprimer",
  exporter: "Exporter",
  valider: "Valider",
};

// Mode édition
const isEditMode = computed(() => !!props.initialData);

// Données du formulaire
const formData = ref({
  employeeId: "",
  role: "USER",
  password: "",
  confirmPassword: "",
  customPermissions: [] as string[],
  pin: "",
  magasin_id: null as string | null,
  globalScope: false,
  managedStoreIds: [] as string[],
});

const activeStep = ref(1);

/**
 * Gestion réactive de l'état des modules pour le composant PermissionModuleToggle
 * Synchronise les permissions individuelles avec la liste plate customPermissions du formulaire
 */
const moduleStates = reactive<Record<string, { active: boolean, permissions: string[] }>>({});

// Initialiser moduleStates
permissionModules.forEach(mod => {
  moduleStates[mod.id] = {
    active: false,
    permissions: formData.value.customPermissions
  };
});

// Synchroniser les changements de moduleStates vers formData.customPermissions
watch(moduleStates, () => {
  const allPermissions: string[] = [];
  Object.keys(moduleStates).forEach(moduleId => {
    const state = moduleStates[moduleId];
    if (state && state.active && state.permissions) {
      state.permissions.forEach(p => {
        if (typeof p === 'string' && p.startsWith(`${moduleId}:`) && !allPermissions.includes(p)) {
          allPermissions.push(p);
        }
      });
    }
  });
  
  // Rompre la boucle : ne mettre à jour que si les valeurs ont changé
  const currentPerms = formData.value.customPermissions;
  if (JSON.stringify(allPermissions) !== JSON.stringify(currentPerms)) {
    formData.value.customPermissions = allPermissions;
  }
}, { deep: true });

// Synchroniser les changements de formData.customPermissions vers moduleStates (chargement initial/reset)
watch(() => formData.value.customPermissions, (newPerms) => {
  if (!Array.isArray(newPerms)) return;
  
  permissionModules.forEach(mod => {
    const mState = moduleStates[mod.id];
    if (mState) {
      const hasModPerms = newPerms.includes('*') || newPerms.some(p => typeof p === 'string' && p.startsWith(`${mod.id}:`));
      
      // Mettre à jour seulement si nécessaire pour éviter de redéclencher le watcher parent
      if (mState.active === false && hasModPerms) {
        mState.active = true;
      }
      
      if (mState.permissions !== newPerms) {
        mState.permissions = newPerms;
      }
    }
  });
}, { immediate: true });

// Erreurs de validation
const errors = ref<Record<string, string>>({});

// Dialog de confirmation
const showCancelDialog = ref(false);

// Magasins
const { getMagasins } = useMagasinApi();
const magasins = ref<any[]>([]);

onMounted(async () => {
  try {
    magasins.value = await getMagasins();
  } catch (error) {
    console.error("Erreur récupération magasins:", error);
  }
});

// Employés disponibles
const availableEmployees = computed(() => {
  return props.employees;
});

// Initialiser avec les données existantes si en mode édition
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      const role = newData.role || "USER";
      const customPerms = Array.isArray(newData.customPermissions)
          ? newData.customPermissions
          : Array.isArray(newData.permissions) ? newData.permissions : [];
      
      formData.value = {
        employeeId: newData.employeeId || "",
        role: role,
        password: "",
        confirmPassword: "",
        customPermissions: getEffectivePermissions(role, customPerms),
        pin: newData.pin || "",
        magasin_id: newData.magasin_id || null,
        globalScope: newData.globalScope || false,
        managedStoreIds: Array.isArray(newData.managedStoreIds) ? newData.managedStoreIds : [],
      };
    }
  },
  { immediate: true }
);

// Mettre à jour les permissions par défaut lors du changement de rôle (en mode création seulement ou si demandé)
watch(() => formData.value.role, (newRole, oldRole) => {
  if (newRole && newRole !== oldRole) {
    // On met à jour avec les permissions par défaut du nouveau rôle
    // On garde l'état actuel mais on recalcule la base
    formData.value.customPermissions = getEffectivePermissions(newRole, []);
  }
});

// Toggle permission
const togglePermission = (slug: string, value: boolean) => {
  if (value) {
    if (!formData.value.customPermissions.includes(slug)) {
      formData.value.customPermissions.push(slug);
    }
  } else {
    formData.value.customPermissions = formData.value.customPermissions.filter(
      (p) => p !== slug
    );
  }
};

// Sélectionner toutes les permissions
const selectAllPermissions = () => {
  const all: string[] = [];
  permissionModules.forEach(mod => {
    mod.actions.forEach(act => {
      all.push(`${mod.id}:${act}`);
    });
  });
  formData.value.customPermissions = all;
};

// Cocher toutes les actions d'un module
const toggleModuleAll = (moduleId: string, check: boolean) => {
  const module = permissionModules.find(m => m.id === moduleId);
  if (!module) return;

  const currentPermissions = [...formData.value.customPermissions];
  const modulePermissions = module.actions.map(a => `${moduleId}:${a}`);

  if (check) {
    // Ajouter seulement celles qui n'y sont pas
    modulePermissions.forEach(p => {
      if (!currentPermissions.includes(p)) {
        currentPermissions.push(p);
      }
    });
  } else {
    // Retirer toutes celles du module
    formData.value.customPermissions = currentPermissions.filter(p => !p.startsWith(`${moduleId}:`));
    return;
  }
  
  formData.value.customPermissions = currentPermissions;
};

// Désélectionner toutes les permissions
const deselectAllPermissions = () => {
  formData.value.customPermissions = [];
};

// Générer un PIN aléatoire
const generateRandomPin = () => {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  formData.value.pin = pin;
  if (errors.value.pin) {
    delete errors.value.pin;
  }
};

// Passer à l'étape suivante
const handleNext = () => {
  if (validate()) {
    activeStep.value = 2;
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

  // Calculer le "diff" des permissions par rapport au rôle choisi
  const customPermissionsDiff = calculatePermissionsDiff(formData.value.role, formData.value.customPermissions);

  const dataToSubmit: any = {
    employeeId: formData.value.employeeId,
    role: formData.value.role,
    customPermissions: customPermissionsDiff,
    pin: formData.value.pin || null,
    magasin_id: formData.value.magasin_id || null,
    globalScope: formData.value.globalScope,
    managedStoreIds: formData.value.managedStoreIds,
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
  display: flex;
  flex-direction: column;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password input) {
  width: 100%;
}

:deep(.p-invalid) {
  border-color: #ef4444; /* red-500 */
}

.p-error {
  color: #ef4444; /* red-500 */
  font-size: 0.75rem; /* text-xs */
  margin-top: 0.25rem; /* mt-1 */
}
</style>
