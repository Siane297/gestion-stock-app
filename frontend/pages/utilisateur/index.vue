<template>
  <div>
    <TableUtilisateurs
      title="Gestion des utilisateurs"
      description="Créez et gérez les comptes utilisateurs et leurs permissions"
      :columns="columns"
      :data="users"
      :loading="loading"
      :pdf-loading="pdfLoading"
      :pdf-progress="pdfProgress"
      :action-button="{
        label: 'Nouvel utilisateur',
        icon: 'pi pi-plus',
        variant: 'primary',
        link: '/utilisateur/ajouter'
      }"
      @edit="openEditDialog"
      @delete="handleDelete"
      @toggle-block="handleToggleBlock"
      @action:download-pdf="handleDownloadPdf"
    >
      <!-- Slot personnalisé pour le rôle -->
      <template #column-role="{ data }">
        <Tag :value="getRoleLabel(data.role)" :severity="getRoleSeverity(data.role)" />
      </template>

      <!-- Slot personnalisé pour l'employé avec Avatar -->  
      <template #column-employee.fullName="{ data }">
        <AvatarInitials
          :name="data.employee?.fullName || 'Inconnu'"
          :subtitle="data.employee?.matricule"
          size="sm"
          :show-name="true"
        />
      </template>
    </TableUtilisateurs>

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import TableUtilisateurs from '~/components/table/TableUtilisateurs.vue';
import AvatarInitials from '~/components/avatar/AvatarInitials.vue';
import { useTenantUserApi, type TenantUser } from '~/composables/api/useTenantUserApi';
import { useSecurePdf } from '~/composables/useSecurePdf';

// Protection de la page
definePageMeta({
  middleware: ['auth', 'permissions'],
});

const {
  getAllTenantUsers,
  toggleBlockTenantUser,
  deleteTenantUser,
} = useTenantUserApi();
const { generateUsersPdf } = useSecurePdf();
const toast = useToast();
const router = useRouter();

// État
const users = ref<TenantUser[]>([]);
const loading = ref(false);
const pdfLoading = ref(false); // État de chargement PDF
const pdfProgress = ref(0); // Progression du téléchargement

// Configuration des colonnes
const columns = [
  { field: 'employee.fullName', header: 'Employé', sortable: true, customRender: true },
  { field: 'email', header: 'Email', sortable: true },
  { field: 'role', header: 'Rôle', sortable: true, customRender: true },
  { field: 'employee.department.name', header: 'Département', sortable: true },
  { field: 'employee.position.name', header: 'Poste', sortable: true },
];

// Charger les utilisateurs
const loadUsers = async () => {
  loading.value = true;
  try {
    users.value = await getAllTenantUsers();
  } catch (error: any) {
    console.error('Erreur lors du chargement des utilisateurs:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors du chargement des utilisateurs',
      life: 5000,
    });
  } finally {
    loading.value = false;
  }
};

// Rediriger vers la page de modification
const openEditDialog = (user: TenantUser) => {
  router.push(`/utilisateur/modifiier/${user.id}`);
};

// Bloquer/Débloquer un utilisateur
const handleToggleBlock = async (data: any) => {
  try {
    await toggleBlockTenantUser(data.id, data.isBlocked);
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: `Utilisateur ${data.isBlocked ? 'bloqué' : 'débloqué'} avec succès`,
      life: 3000,
    });
    await loadUsers();
  } catch (error: any) {
    console.error('Erreur lors du blocage/déblocage:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors du blocage/déblocage',
      life: 5000,
    });
  }
};

// Supprimer un utilisateur
const handleDelete = async (id: string) => {
  try {
    await deleteTenantUser(id);
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Utilisateur supprimé avec succès',
      life: 3000,
    });
    await loadUsers();
  } catch (error: any) {
    console.error('Erreur lors de la suppression:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors de la suppression',
      life: 5000,
    });
  }
};

// Obtenir le label du rôle
const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    ADMIN: 'Administrateur',
    MANAGER: 'Manager',
    USER: 'Utilisateur',
    RH: 'RH',
  };
  return labels[role] || role;
};

// Obtenir la sévérité du tag selon le rôle
const getRoleSeverity = (role: string) => {
  const severities: Record<string, any> = {
    ADMIN: 'danger',
    MANAGER: 'warning',
    USER: 'info',
    RH: 'success',
  };
  return severities[role] || 'secondary';
};

// Gestion du téléchargement PDF
const handleDownloadPdf = async () => {
  try {
    pdfLoading.value = true; // Activer l'état de chargement
    pdfProgress.value = 0;
    
    // Simulation de progression
    const interval = setInterval(() => {
      if (pdfProgress.value < 90) {
        pdfProgress.value += Math.random() * 10;
      }
    }, 200);

    await generateUsersPdf();
    
    clearInterval(interval);
    pdfProgress.value = 100;
  } catch (error) {
    console.error('Erreur lors du téléchargement PDF:', error);
    // L'erreur est déjà gérée par useSecurePdf avec des toasts
  } finally {
    setTimeout(() => {
      pdfLoading.value = false; // Désactiver l'état de chargement
      pdfProgress.value = 0;
    }, 500); // Petit délai pour voir la barre à 100%
  }
};

// Charger au montage du composant
onMounted(() => {
  loadUsers();
});
</script>