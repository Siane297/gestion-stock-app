<template>
  <div>
    <SimplePageHeader
      title="Gestion des Utilisateurs"
      description="Gérez les comptes d'accès, les rôles et les codes PIN de votre personnel"
    />

    <div class="mt-6">
      <TableGeneric
        :columns="columns"
        :data="users"
        :loading="loading"
        :global-action="{
          label: 'Nouvel Utilisateur',
          icon: 'pi pi-plus',
          variant: 'primary',
          link: '/utilisateur/ajouter'
        }"
        :search-fields="['email', 'employee.fullName', 'role']"
        delete-label-field="email"
        @action:edit="handleEdit"
        @action:delete="handleDelete"
      >
        <!-- Colonne Utilisateur (Avatar + Email) -->
        <template #column-user="{ data }: { data: any }">
          <div class="flex items-center gap-3">
            <Avatar 
              :label="data.employee?.fullName ? data.employee.fullName.charAt(0).toUpperCase() : 'U'"
              class="mr-2" 
              shape="circle"
              size="normal"
            />
            <div class="flex flex-col">
              <span class="font-medium text-gray-900">{{ data.employee?.fullName || 'Utilisateur Sans Nom' }}</span>
              <span class="text-xs text-gray-500">{{ data.email }}</span>
            </div>
          </div>
        </template>

        <!-- Colonne Rôle -->
        <template #column-role="{ data }: { data: any }">
          <Tag :value="data.role" :severity="getRoleSeverity(data.role)" />
        </template>

        <!-- Colonne PIN -->
        <template #column-pin="{ data }: { data: any }">
          <div class="flex items-center gap-1">
            <Icon 
              :icon="data.pin ? 'tabler:shield-check' : 'tabler:shield-x'" 
              :class="data.pin ? 'text-vert' : 'text-gray-300'"
              class="text-lg"
            />
            <span class="text-xs" :class="data.pin ? 'text-noir' : 'text-gray-400'">
              {{ data.pin ? 'Configuré' : 'Non défini' }}
            </span>
          </div>
        </template>

        <!-- Colonne Statut -->
        <template #column-isBlocked="{ data }: { data: any }">
          <div class="flex items-center gap-2">
            <Tag 
              :severity="data.isBlocked ? 'danger' : 'success'" 
              :value="data.isBlocked ? 'Bloqué' : 'Actif'" 
            />
            <button 
              @click.stop="handleToggleBlock(data)"
              class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              :title="data.isBlocked ? 'Débloquer' : 'Bloquer'"
            >
              <Icon :icon="data.isBlocked ? 'tabler:lock-open' : 'tabler:lock'" class="text-lg" />
            </button>
          </div>
        </template>
      </TableGeneric>
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { Icon } from '@iconify/vue';
import TableGeneric, { type TableColumn } from '~/components/table/TableGeneric.vue';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import { useTenantUserApi } from '~/composables/api/useTenantUserApi';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import Avatar from 'primevue/avatar';

// Protection de la page
definePageMeta({
  middleware: ['auth', 'permissions'],
});

const { getAllTenantUsers, deleteTenantUser, toggleBlockTenantUser } = useTenantUserApi();
const { extractErrorMessage } = useErrorHandler();
const toast = useToast();
const router = useRouter();

const users = ref<any[]>([]);
const loading = ref(false);

const columns: TableColumn[] = [
  { field: 'user', header: 'Utilisateur', sortable: true, customRender: true },
  { field: 'role', header: 'Rôle', sortable: true, customRender: true },
  { field: 'pin', header: 'Code PIN', sortable: false, customRender: true },
  { field: 'isBlocked', header: 'Statut', sortable: true, customRender: true },
];

const loadData = async () => {
  loading.value = true;
  try {
    users.value = await getAllTenantUsers();
  } catch (e: any) {
    console.error("Erreur chargement utilisateurs", e);
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les utilisateurs', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const getRoleSeverity = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'danger';
    case 'MANAGER': return 'warn';
    case 'USER': return 'info';
    case 'RH': return 'success';
    default: return 'info';
  }
};

const handleEdit = (user: any) => {
  router.push(`/utilisateur/modifier/${user.id}`);
};

const handleDelete = async (user: any) => {
  if (user.isOwner) {
    toast.add({ severity: 'warn', summary: 'Action refusée', detail: 'Impossible de supprimer le compte propriétaire', life: 5000 });
    return;
  }

  try {
    await deleteTenantUser(user.id);
    toast.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateur supprimé', life: 3000 });
    await loadData();
  } catch (e: any) {
    const errorMsg = extractErrorMessage(e, 'Impossible de supprimer cet utilisateur');
    toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 5000 });
  }
};

const handleToggleBlock = async (user: any) => {
  if (user.isOwner && !user.isBlocked) {
    toast.add({ severity: 'warn', summary: 'Action refusée', detail: 'Impossible de bloquer le compte propriétaire', life: 5000 });
    return;
  }

  try {
    await toggleBlockTenantUser(user.id, !user.isBlocked);
    toast.add({ 
      severity: 'success', 
      summary: 'Succès', 
      detail: `Utilisateur ${user.isBlocked ? 'débloqué' : 'bloqué'} avec succès`, 
      life: 3000 
    });
    await loadData();
  } catch (e: any) {
    const errorMsg = extractErrorMessage(e, 'Une erreur est survenue');
    toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 5000 });
  }
};

onMounted(() => {
  loadData();
});
</script>