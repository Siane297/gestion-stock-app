<template>
  <div>
    <!-- Formulaire de modification -->
    <FormulaireUtilisateur
      v-if="!loadingUser"
      mode="edit"
      :initial-data="userData"
      :loading="loading"
      :employees="employeesForSelect"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />

    <!-- Loader pendant le chargement -->
    <div v-else class="flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <Icon icon="lucide:loader-2" class="text-6xl text-primary animate-spin mb-4" />
        <p class="text-gray-600">Chargement des données...</p>
      </div>
    </div>

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import FormulaireUtilisateur from '~/components/form/FormulaireUtilisateur.vue';
import { useTenantUserApi } from '~/composables/api/useTenantUserApi';
import { useEmployeeApi } from '~/composables/api/useEmployeeApi';

// Protection de la page
definePageMeta({
  middleware: ['auth', 'permissions'],
});

const route = useRoute();
const router = useRouter();
const userId = route.params.id as string;

const { getTenantUserById, updateTenantUser } = useTenantUserApi();
const { getEmployees } = useEmployeeApi();
const toast = useToast();

// États
const loading = ref(false);
const loadingUser = ref(true);
const user = ref<any>(null);
const employees = ref<any[]>([]);

// Transformer les employés pour le format Select
const employeesForSelect = computed(() => {
  return employees.value.map(emp => ({
    label: `${emp.fullName} (${emp.matricule})`,
    value: emp.id
  }));
});

// Données pré-remplies pour le formulaire
const userData = computed(() => {
  if (!user.value) return null;
  return {
    employeeId: user.value.employeeId,
    email: user.value.email,
    role: user.value.role,
    permissions: user.value.permissions || [],
    pin: user.value.pin || "",
    magasin_id: user.value.magasin_id || null
  };
});

// Charger l'utilisateur
const loadUser = async () => {
  loadingUser.value = true;
  try {
    user.value = await getTenantUserById(userId);
    console.log('Utilisateur chargé:', user.value);
  } catch (error: any) {
    console.error('Erreur chargement utilisateur:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors du chargement de l\'utilisateur',
      life: 5000
    });
    setTimeout(() => router.push('/utilisateur'), 2000);
  } finally {
    loadingUser.value = false;
  }
};

// Charger les employés
const loadEmployees = async () => {
  try {
    const response = await getEmployees();
    employees.value = response || [];
  } catch (error: any) {
    console.error('Erreur chargement employés:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger la liste des employés',
      life: 5000
    });
  }
};

// Gestion de la soumission
const handleSubmit = async (data: any) => {
  loading.value = true;

  try {
    const updateData: any = {
      role: data.role,
      permissions: data.permissions || [],
      pin: data.pin,
      magasin_id: data.magasin_id
    };

    // Ajouter le mot de passe seulement s'il est fourni
    if (data.password && data.password.trim()) {
      updateData.password = data.password;
    }

    await updateTenantUser(userId, updateData);

    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Utilisateur modifié avec succès !',
      life: 3000
    });

    setTimeout(() => router.push('/utilisateur'), 1000);

  } catch (error: any) {
    console.error('Erreur lors de la modification:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Une erreur est survenue lors de la modification',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

// Annuler
const handleCancel = () => {
  router.push('/utilisateur');
};

// Charger au montage
onMounted(async () => {
  await Promise.all([
    loadUser(),
    loadEmployees()
  ]);
});
</script>