<template>
  <div>
    <TablePersonnel 
      title="Liste des Employés" 
      description="Gérez les employés de votre entreprise" 
      :columns="columns"
      :data="employees" 
      :loading="loading"
      :pdf-loading="pdfLoading"
      :pdf-progress="pdfProgress"
      :search-fields="['matricule', 'fullName', 'position', 'department', 'email']" 
      :action-button="{
        label: 'Nouveau employé',
        icon: 'pi pi-plus',
        variant: 'primary',
        link: '/employees/ajouter'
      }"
      @action:view-qr="handleViewQR"
      @action:edit="handleEdit"
      @action:delete="handleDelete"
      @action:download-pdf="handleDownloadPdf"
    >
      <!-- Slot personnalisé pour la colonne Nom complet avec Avatar et Matricule -->
      <template #column-fullName="{ data }">
        <AvatarInitials
          :name="data.fullName"
          :subtitle="data.matricule"
          :photo="data.photo"
          size="sm"
          :show-name="true"
        />
      </template>

      <!-- Slot personnalisé pour la colonne département -->
      <template #column-department.name="{ data }">
        <Tag :value="typeof data.department === 'object' ? data.department?.name : data.department" severity="info" />
      </template>
    </TablePersonnel>

    <!-- Dialog QR Code avec Badge -->
    <QRCodeDialog
      v-model:visible="qrDialog"
      :qr-code="generatedQRCode"
      :employee-name="selectedEmployee?.fullName || ''"
      :employee-matricule="selectedEmployee?.matricule || ''"
      :employee-position="selectedEmployee?.position?.name || ''"
      :employee-department="typeof selectedEmployee?.department === 'object' ? selectedEmployee?.department?.name || '' : selectedEmployee?.department || ''"
      :employee-photo="selectedEmployee?.photo || ''"
    />

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import QRCode from 'qrcode';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import TablePersonnel from '~/components/table/TablePersonnel.vue';
import QRCodeDialog from '~/components/dialog/QRCodeDialog.vue';
import AvatarInitials from '~/components/avatar/AvatarInitials.vue';
import { useEmployeeApi, type Employee } from '~/composables/api/useEmployeeApi';
import { useSecurePdf } from '~/composables/useSecurePdf';

// Protection de la page
definePageMeta({
  middleware: ['auth', 'permissions'],
});

const { getEmployees, deleteEmployee } = useEmployeeApi();
const { generateEmployeesPdf } = useSecurePdf();
const toast = useToast();

// État
const employees = ref<Employee[]>([]);
const loading = ref(false);
const pdfLoading = ref(false); // État de chargement PDF
const pdfProgress = ref(0); // Progression du téléchargement
const qrDialog = ref(false);
const selectedEmployee = ref<Employee | null>(null);
const generatedQRCode = ref('');

// Configuration des colonnes de la table
const columns = [
  { field: 'fullName', header: 'Nom complet', sortable: true, customRender: true },
  { field: 'position.name', header: 'Poste', sortable: true },
  { field: 'department.name', header: 'Département', sortable: true, customRender: true },
  { field: 'email', header: 'Email', sortable: true },
  { field: 'phoneNumber', header: 'Téléphone', sortable: false },
];

// Charger les employés
const loadEmployees = async () => {
  loading.value = true;
  try {
    const response = await getEmployees();
    employees.value = response;
  } catch (error: any) {
    console.error('Erreur lors du chargement des employés:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors du chargement des employés',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

// Générer le QR Code
const generateQRCode = async (employee: Employee) => {
  try {
    const qrData = JSON.stringify({
      matricule: employee.matricule,
      fullName: employee.fullName,
      position: employee.position?.name || '',
      department: typeof employee.department === 'object' ? employee.department?.name || '' : employee.department || '',
      qrCode: employee.qrCode
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    generatedQRCode.value = qrCodeDataUrl;
  } catch (error) {
    console.error('Erreur génération QR Code:', error);
  }
};

// Handlers pour les actions
const handleViewQR = async (employee: Employee) => {
  selectedEmployee.value = employee;
  await generateQRCode(employee);
  qrDialog.value = true;
};

const handleEdit = (employee: Employee) => {
  navigateTo(`/employees/modifier/${employee.id}`);
};

const handleDelete = async (employee: Employee) => {
  try {
    await deleteEmployee(employee.id);
    await loadEmployees();
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Employé supprimé avec succès',
      life: 3000
    });
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors de la suppression',
      life: 5000
    });
  }
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

    await generateEmployeesPdf();
    
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

// Charger au montage
onMounted(() => {
  loadEmployees();
});
</script>