<template>
  <div>
    <SimplePageHeader
      title="Gestion des Employés"
      description="Gérez votre personnel et leurs droits d'accès"
    />

    <div class="mt-6">
        <TableGeneric
            :columns="columns"
            :data="employees"
            :loading="loading"
            :global-action="{
                label: 'Nouvel Employé',
                icon: 'pi pi-plus',
                variant: 'primary',
                link: '/employees/ajouter'
            }"
            :search-fields="['fullName', 'matricule', 'email', 'phoneNumber']"
            delete-label-field="fullName"
            @action:edit="handleEdit"
            @action:delete="handleDelete"
        >
             <template #column-fullName="{ data }: { data: any }">
                 <div class="flex items-center gap-3">
                     <Avatar 
                        :image="data.photo" 
                        :label="data.fullName ? data.fullName.charAt(0).toUpperCase() : 'U'"
                        class="mr-2" 
                        shape="circle"
                        size="normal"
                     />
                     <div class="flex flex-col">
                         <span class="font-medium text-gray-900">{{ data.fullName }}</span>
                         <span class="text-xs text-gray-500">{{ data.matricule }}</span>
                     </div>
                 </div>
             </template>

             <template #column-position="{ data }: { data: any }">
                 <Tag :value="data.position?.name || 'Non défini'" severity="info" />
             </template>

             <template #column-isActive="{ data }: { data: any }">
                 <Tag :severity="data.isActive ? 'success' : 'danger'" :value="data.isActive ? 'Actif' : 'Inactif'" />
             </template>
        </TableGeneric>
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import TableGeneric, { type TableColumn } from '~/components/table/TableGeneric.vue';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import { useEmployeeApi } from '~/composables/api/useEmployeeApi';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import Avatar from 'primevue/avatar';

const { getEmployees, deleteEmployee } = useEmployeeApi();
const { extractErrorMessage } = useErrorHandler();
const toast = useToast();
const router = useRouter();

const employees = ref<any[]>([]);
const loading = ref(false);

const columns: TableColumn[] = [
    { field: 'fullName', header: 'Employé', sortable: true, customRender: true },
    { field: 'position', header: 'Poste', sortable: true, customRender: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'phoneNumber', header: 'Téléphone', sortable: true },
    { field: 'isActive', header: 'Statut', sortable: true, customRender: true },
];

const loadData = async () => {
    loading.value = true;
    try {
        employees.value = await getEmployees();
    } catch (e: any) {
        console.error("Erreur chargement employés", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les employés', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const handleEdit = (emp: any) => {
    router.push(`/employees/modifier/${emp.id}`);
};

const handleDelete = async (emp: any) => {
    try {
        await deleteEmployee(emp.id);
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Employé supprimé', life: 3000 });
        await loadData();
    } catch (e: any) {
         const errorMsg = extractErrorMessage(e, 'Impossible de supprimer cet employé');
         toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 5000 });
    }
};

onMounted(() => {
    loadData();
});
</script>