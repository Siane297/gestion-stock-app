<template>
  <div>
    <FormulaireUtilisateur
      mode="create"
      :loading="loading"
      :employees="employeesForSelect"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import FormulaireUtilisateur from '~/components/form/FormulaireUtilisateur.vue';
import { useTenantUserApi } from '~/composables/api/useTenantUserApi';
import { useEmployeeApi } from '~/composables/api/useEmployeeApi';

// Protection de la page
definePageMeta({
  middleware: ['auth', 'permissions'],
});

const { createTenantUser } = useTenantUserApi();
const { getEmployees } = useEmployeeApi();
const toast = useToast();
const router = useRouter();

// État
const loading = ref(false);
const employees = ref<any[]>([]);

// Transformer les employés pour le format Select (label/value)
const employeesForSelect = computed(() => {
  return employees.value.map(emp => ({
    label: `${emp.fullName} (${emp.matricule})`,
    value: emp.id
  }));
});

// Charger les employés au montage
const loadEmployees = async () => {
  try {
    const response = await getEmployees();
    // La réponse est de type Employee[]
    employees.value = response || [];
    console.log('Employés chargés:', employees.value.length);
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

onMounted(() => {
  loadEmployees();
});

// Gestion de la soumission
const handleSubmit = async (data: any) => {
  loading.value = true;

  try {
    await createTenantUser({
      employeeId: data.employeeId,
      email: data.email,
      password: data.password,
      role: data.role,
      permissions: data.permissions || [],
      pin: data.pin,
      magasin_id: data.magasin_id
    });

    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Utilisateur créé avec succès !',
      life: 3000
    });

    // Rediriger vers la liste
    setTimeout(() => {
      router.push('/utilisateur');
    }, 1000);

  } catch (error: any) {
    console.error('Erreur lors de la création:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Une erreur est survenue lors de la création',
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
</script>