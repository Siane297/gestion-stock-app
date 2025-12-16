<template>
  <div class="min-h-screen">
    <!-- Toast pour les notifications -->
    <Toast />

    <!-- En-tête avec bouton retour -->
    <div class="bg-header rounded-lg border border-gris/40 mb-6">
      <div class="mx-auto px-6 py-4 flex items-center gap-4">
        <AppButton
          icon-left="pi pi-arrow-left"
          variant="outline"
          size="sm"
          label=""
          @click="handleGoBack"
          class="text-white"
        />
        <div>
          <h1 class="text-2xl font-bold text-white">Fiche Employé</h1>
          <p class="text-sm text-gray-500">Détails de l'employé</p>
        </div>
      </div>
    </div>

    <!-- Skeleton de chargement -->
    <div v-if="loading" class="max-w-7xl mx-auto px-6 space-y-6">
      <div class="bg-white rounded-lg border-2 border-gris/40 p-6">
        <div class="flex gap-6 animate-pulse">
          <div class="w-32 h-32 bg-gray-200 rounded-full"></div>
          <div class="flex-1 space-y-3">
            <div class="h-8 bg-gray-200 rounded w-1/3"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div v-else class="mx-auto space-y-6">
      <!-- Section 1: Informations personnelles -->
      <div class="bg-white rounded-lg border-2 border-gris/40 p-6">
        <div class="flex flex-col md:flex-row gap-6">
          <!-- Avatar -->
          <div class="flex items-start">
            <AvatarInitials
              :name="employee?.fullName || 'Inconnu'"
              :photo="employee?.photo"
              size="2xl"
              variant="square"
              :show-name="false"
              shadow3d
            />
          </div>

          <!-- Informations -->
          <div class="flex-1 space-y-4">
            <!-- Nom complet -->
            <div class="flex items-center gap-4">
              <h2 class="text-3xl font-bold text-noir">{{ employee?.fullName }}</h2>
              <p class="text-sm bg-primary/10 border border-primary font-semibold text-primary px-3 py-1 w-fit rounded-full mt-1">{{ employee?.matricule }}</p>
            </div>

            <!-- Grille d'informations 4 colonnes -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <!-- Colonne 1: Poste + Département -->
              <div class="space-y-4">
                <div v-if="employee?.position" class="flex items-center gap-2">
                  <div>
                    <p class="text-xs text-primary">Poste</p>
                    <p class="font-medium text-noir">{{ employee.position.name }}</p>
                  </div>
                </div>
                <div v-if="employee?.department" class="flex items-center gap-2">
                  <div>
                    <p class="text-xs text-primary">Département</p>
                    <p class="font-medium text-noir">{{ getDepartmentName(employee.department) }}</p>
                  </div>
                </div>
              </div>

              <!-- Colonne 2: Email + Téléphone -->
              <div class="space-y-4">
                <div v-if="employee?.email" class="flex items-center gap-2">
                  <div>
                    <p class="text-xs text-primary">Email</p>
                    <p class="font-medium text-noir">{{ employee.email }}</p>
                  </div>
                </div>
                <div v-if="employee?.phoneNumber" class="flex items-center gap-2">
                  <div>
                    <p class="text-xs text-primary">Téléphone</p>
                    <p class="font-medium text-noir">{{ employee.phoneNumber }}</p>
                  </div>
                </div>
              </div>

              <!-- Colonne 3: Sexe + Date de naissance -->
              <div class="space-y-4">
                <div v-if="employee?.sexe" class="flex items-center gap-2">
                  <div>
                    <p class="text-xs text-primary">Sexe</p>
                    <p class="font-medium text-noir">{{ employee.sexe === 'MASCULIN' ? 'Masculin' : 'Féminin' }}</p>
                  </div>
                </div>
                <div v-if="employee?.dateNaissance" class="flex items-center gap-2">
                  <div>
                    <p class="text-xs text-primary">Date de naissance</p>
                    <p class="font-medium text-noir">{{ formatDate(employee.dateNaissance) }}</p>
                  </div>
                </div>
              </div>

              <!-- Colonne 4: Adresse -->
              <div v-if="employee?.address" class="">
                <div class="flex items-center gap-2">
                  <div>
                    <p class="text-xs text-primary">Adresse</p>
                    <p class="font-medium text-noir">{{ employee.address }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import AppButton from '~/components/button/AppButton.vue';
import AvatarInitials from '~/components/avatar/AvatarInitials.vue';
import { useEmployeeApi } from '~/composables/api/useEmployeeApi';
import type { Employee } from '~/composables/api/useEmployeeApi';

// Protection de la page
definePageMeta({
  middleware: ['auth', 'permissions'],
});

const route = useRoute();
const router = useRouter();
const toast = useToast();

// APIs
const { getEmployeeById } = useEmployeeApi();

// État
const loading = ref(true);
const employee = ref<Employee | null>(null);

// Récupérer le nom du département
const getDepartmentName = (department: any): string => {
  if (typeof department === 'string') return department;
  return department?.name || 'Non défini';
};

// Formater une date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Retour à la liste des employés
const handleGoBack = () => {
  router.push('/employees');
};

// Charger les données de l'employé
const loadEmployeeData = async () => {
  try {
    const employeeId = route.params.id as string;

    if (!employeeId) {
      toast.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'ID employé manquant',
        life: 3000,
      });
      return;
    }

    // Charger les informations de l'employé
    employee.value = await getEmployeeById(employeeId);

    if (!employee.value) {
      toast.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Employé non trouvé',
        life: 3000,
      });
      handleGoBack();
      return;
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'employé:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les données de l\'employé',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// Chargement initial
onMounted(async () => {
  await loadEmployeeData();
});
</script>