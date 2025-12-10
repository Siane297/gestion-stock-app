<template>
  <div>
    <!-- Formulaire dynamique -->
    <FormulaireDynamique
      title="Enregistrer un employé"
      description="Remplissez le formulaire pour créer un nouveau profil employé et générer son QR Code"
      :fields="employeeFields"
      submit-label="Enregistrer"
      cancel-label="Annuler"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @addClick="handleAddClick"
      ref="formRef"
    />

    <!-- Dialog QR Code -->
    <QRCodeDialog
      v-model:visible="showQRDialog"
      :qr-code="generatedQRCode"
      :employee-name="employeeData.fullName"
      :employee-matricule="employeeData.matricule"
      :employee-position="employeeData.position"
      :employee-department="employeeData.department"
      :employee-photo="employeeData.photo"
      @download="downloadQRCode"
      @new-entry="resetForNewEntry"
    />

    <!-- Popup pour ajouter un poste -->
    <FormPopupDynamique
      v-model:visible="showPosteDialog"
      title="Ajouter un poste"
      description="Créez un nouveau poste pour l'organisation"
      headerTitle="Nouveau poste"
      :fields="posteFields"
      submit-label="Créer"
      :loading="loadingPoste"
      @submit="handleCreatePoste"
      @cancel="showPosteDialog = false"
    />

    <!-- Popup pour ajouter un département -->
    <FormPopupDynamique
      v-model:visible="showDepartmentDialog"
      title="Ajouter un département"
      description="Créez un nouveau département pour l'organisation"
      headerTitle="Nouveau département"
      :fields="departmentFields"
      submit-label="Créer"
      :loading="loadingDepartment"
      @submit="handleCreateDepartment"
      @cancel="showDepartmentDialog = false"
    />

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import FormPopupDynamique from '~/components/form/FormPopupDynamique.vue';
import QRCodeDialog from '~/components/dialog/QRCodeDialog.vue';
import { useEmployeeApi } from '~/composables/api/useEmployeeApi';
import { useEmployeeImageApi } from '~/composables/api/useEmployeeImageApi';
import { usePosteApi } from '~/composables/api/usePosteApi';
import { useDepartementApi } from '~/composables/api/useDepartementApi';

const { createEmployee } = useEmployeeApi();
const { uploadEmployeePhoto } = useEmployeeImageApi();
const { getPostes, createPoste } = usePosteApi();
const { getDepartements, createDepartement } = useDepartementApi();
const toast = useToast();

// Photo de l'employé à uploader
const pendingPhotoFile = ref<File | null>(null);

// Référence du formulaire
const formRef = ref<InstanceType<typeof FormulaireDynamique> | null>(null);

// Fonction pour générer un matricule aléatoire (7 caractères: 4-5 chiffres, 2-3 lettres)
const generateMatricule = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  // Décider aléatoirement: 2 ou 3 lettres (donc 5 ou 4 chiffres)
  const letterCount = Math.random() < 0.5 ? 2 : 3;
  const numberCount = 7 - letterCount;
  
  // Créer un tableau de caractères
  const chars: string[] = [];
  
  // Ajouter les lettres
  for (let i = 0; i < letterCount; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    chars.push(letters.charAt(randomIndex));
  }
  
  // Ajouter les chiffres
  for (let i = 0; i < numberCount; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    chars.push(numbers.charAt(randomIndex));
  }
  
  // Mélanger le tableau (algorithme Fisher-Yates)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = chars[i]!;
    chars[i] = chars[j]!;
    chars[j] = temp;
  }
  
  return chars.join('');
};

// Générer le matricule au chargement
const generatedMatricule = ref(generateMatricule());

// État
const loading = ref(false);
const showQRDialog = ref(false);
const generatedQRCode = ref('');
const employeeData = ref({
  fullName: '',
  matricule: '',
  position: '',
  department: '',
  photo: ''
});

// Listes des postes et départements
const postes = ref<Array<{ id: string; name: string }>>([]);
const departements = ref<Array<{ id: string; name: string }>>([]);
const loadingLists = ref(false);

// États des popups
const showPosteDialog = ref(false);
const showDepartmentDialog = ref(false);
const loadingPoste = ref(false);
const loadingDepartment = ref(false);
const pendingPosteSelection = ref<string | null>(null);
const pendingDepartmentSelection = ref<string | null>(null);

// Charger les postes et départements
const loadPostesAndDepartements = async () => {  
  loadingLists.value = true;
  try {
    const [postesData, departementsData] = await Promise.all([
      getPostes(),
      getDepartements()
    ]);
    
    postes.value = postesData;
    departements.value = departementsData;
    
    console.log('Postes chargés:', postes.value.length);
    console.log('Départements chargés:', departements.value.length);
  } catch (error) {
    console.error('Erreur chargement listes:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Erreur lors du chargement des listes',
      life: 3000
    });
  } finally {
    loadingLists.value = false;
  }
};

// Charger au montage
onMounted(() => {
  loadPostesAndDepartements();
});

// Définition des champs du formulaire
const employeeFields = computed(() => [
  {
    name: 'photo',
    label: 'Photo de l\'employé',
    type: 'image' as const,
    required: false,
    showLabel: false,
    fixedWidth: true,
    value: '',
    onImageUpload: async (file: File) => {
      // Stocker le fichier pour l'upload après création de l'employé
      pendingPhotoFile.value = file;
      // Retourner une URL temporaire pour preview
      return URL.createObjectURL(file);
    },
    onImageRemove: async () => {
      pendingPhotoFile.value = null;
    }
  },
  {
    name: 'matricule',
    label: 'Matricule',
    type: 'text' as const,
    placeholder: 'Généré automatiquement',
    required: true,
    disabled: true,
    value: generatedMatricule.value
  },
  {
    name: 'fullName',
    label: 'Nom complet',
    type: 'text' as const,
    placeholder: 'Ex: Jean Dupont',
    required: true
  },
  {
    name: 'positionId',
    label: 'Poste / Fonction',
    type: 'select-with-add' as const,
    placeholder: 'Sélectionnez un poste',
    required: true,
    options: postes.value,
    optionLabel: 'name',
    optionValue: 'id'
  },
  {
    name: 'departmentId',
    label: 'Département',
    type: 'select-with-add' as const,
    placeholder: 'Sélectionnez un département',
    required: true,
    options: departements.value,
    optionLabel: 'name',
    optionValue: 'id'
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email' as const,
    placeholder: 'Ex: jean.dupont@entreprise.com',
    required: false
  },
  {
    name: 'phone',
    label: 'Téléphone',
    type: 'text' as const,
    placeholder: 'Ex: +212 6 12 34 56 78',
    required: false
  },
  {
    name: 'sexe',
    label: 'Sexe',
    type: 'select' as const,
    placeholder: 'Sélectionnez le sexe',
    required: false,
    options: [
      { label: 'Masculin', value: 'MASCULIN' },
      { label: 'Féminin', value: 'FEMININ' }
    ],
    optionLabel: 'label',
    optionValue: 'value'
  },
  {
    name: 'dateNaissance',
    label: 'Date de naissance',
    type: 'date' as const,
    placeholder: 'Sélectionnez la date de naissance',
    required: false
  },
  {
    name: 'address',
    label: 'Adresse',
    type: 'textarea' as const,
    placeholder: 'Ex: 123 Rue de la Paix, Casablanca',
    required: false
  }
]);

// Fonction helper pour formater la date en YYYY-MM-DD sans décalage de timezone
const formatDateToYYYYMMDD = (date: Date | string): string => {
  if (typeof date === 'string') return date;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Gestion de la soumission
const handleSubmit = async (data: Record<string, any>) => {
  loading.value = true;

  try {
    // Formater la date de naissance si présente
    const dateNaissance = data.dateNaissance instanceof Date
      ? formatDateToYYYYMMDD(data.dateNaissance)
      : data.dateNaissance;

    // Envoyer les données au backend avec le matricule généré
    const employee = await createEmployee({
      matricule: generatedMatricule.value,
      fullName: data.fullName,
      positionId: data.positionId,
      departmentId: data.departmentId,
      email: data.email || undefined,
      phoneNumber: data.phone || undefined,
      sexe: data.sexe || undefined,
      dateNaissance: dateNaissance || undefined,
      address: data.address || undefined,
    });

    // Vérifier que l'employé a été créé avec succès
    if (!employee) {
      throw new Error('Échec de la création de l\'employé');
    }

    console.log('Employé créé:', employee);

    // Uploader la photo si un fichier a été sélectionné
    let uploadedPhotoUrl = '';
    if (pendingPhotoFile.value && employee.id) {
      try {
        const response: any = await uploadEmployeePhoto(employee.id, pendingPhotoFile.value);
        if (response.success && response.data?.photo) {
          uploadedPhotoUrl = response.data.photo;
        }
        console.log('Photo uploadée avec succès:', uploadedPhotoUrl);
      } catch (photoError) {
        console.error('Erreur upload photo:', photoError);
        toast.add({
          severity: 'warn',
          summary: 'Attention',
          detail: 'Employé créé mais erreur lors de l\'upload de la photo',
          life: 5000
        });
      }
    }

    // Récupérer les noms du poste et département depuis les listes locales
    const selectedPosition = postes.value.find(p => p.id === data.positionId);
    const selectedDepartment = departements.value.find(d => d.id === data.departmentId);

    // Vérifier que les données du poste et département sont trouvées
    if (!selectedPosition) {
      throw new Error('Poste sélectionné introuvable');
    }
    if (!selectedDepartment) {
      throw new Error('Département sélectionné introuvable');
    }

    // Stocker les données de l'employé
    employeeData.value = {
      fullName: employee.fullName,
      matricule: generatedMatricule.value,
      position: selectedPosition.name,
      department: selectedDepartment.name,
      photo: uploadedPhotoUrl
    };

    // Générer le QR code avec les noms récupérés
    const qrData = JSON.stringify({
      matricule: employee.matricule,
      fullName: employee.fullName,
      position: selectedPosition.name,
      department: selectedDepartment.name,
      qrCode: employee.qrCode
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 512, // Taille plus grande pour meilleure lisibilité
      margin: 4, // Marge plus importante
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H', // Niveau de correction d'erreur élevé
      type: 'image/png'
    });

    generatedQRCode.value = qrCodeDataUrl;

    // Réinitialiser le formulaire et la photo
    formRef.value?.resetForm();
    pendingPhotoFile.value = null;
    
    // Générer un nouveau matricule pour le prochain employé
    generatedMatricule.value = generateMatricule();

    // Afficher le toast de succès
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Employé enregistré avec succès !',
      life: 3000
    });

    // Afficher le dialog
    showQRDialog.value = true;

  } catch (error: any) {
    console.error('Erreur lors de l\'enregistrement:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Une erreur est survenue lors de l\'enregistrement',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

// Télécharger le QR Code
const downloadQRCode = () => {
  const link = document.createElement('a');
  link.download = `QR_${employeeData.value.matricule}_${employeeData.value.fullName}.png`;
  link.href = generatedQRCode.value;
  link.click();
};

// Réinitialiser pour un nouvel enregistrement
const resetForNewEntry = () => {
  formRef.value?.resetForm();
  generatedQRCode.value = '';
  employeeData.value = {
    fullName: '',
    matricule: '',
    position: '',
    department: '',
    photo: ''
  };
};

// Annuler
const handleCancel = () => {
  navigateTo('/employees');
};

// Gérer le clic sur le bouton + d'un champ
const handleAddClick = (field: any) => {
  if (field.name === 'positionId') {
    showPosteDialog.value = true;
  } else if (field.name === 'departmentId') {
    showDepartmentDialog.value = true;
  }
};

// Champs pour le formulaire de poste
const posteFields = [
  {
    name: 'name',
    label: 'Nom du poste',
    type: 'text' as const,
    placeholder: 'Ex: Développeur, Manager, etc.',
    required: true
  }
];

// Champs pour le formulaire de département
const departmentFields = [
  {
    name: 'name',
    label: 'Nom du département',
    type: 'text' as const,
    placeholder: 'Ex: IT, RH, Finance, etc.',
    required: true
  }
];

// Créer un nouveau poste
const handleCreatePoste = async (data: Record<string, any>) => {
  loadingPoste.value = true;
  try {
    const newPoste = await createPoste({ name: data.name });
    
    // Vérifier que le poste a été créé avec succès
    if (!newPoste) {
      throw new Error('Échec de la création du poste');
    }
    
    // Ajouter le nouveau poste à la liste
    postes.value.push(newPoste);
    
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Poste créé avec succès',
      life: 3000
    });
    
    // Fermer le dialog
    showPosteDialog.value = false;
    
    // Sélectionner automatiquement après un court délai
    await nextTick();
    if (formRef.value && (formRef.value as any).formData) {
      (formRef.value as any).formData.positionId = newPoste.id;
      console.log('Poste sélectionné automatiquement:', newPoste.id);
    }
  } catch (error: any) {
    console.error('Erreur création poste:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors de la création du poste',
      life: 3000
    });
  } finally {
    loadingPoste.value = false;
  }
};

// Créer un nouveau département
const handleCreateDepartment = async (data: Record<string, any>) => {
  loadingDepartment.value = true;
  try {
    const newDepartment = await createDepartement({ name: data.name });
    
    // Vérifier que le département a été créé avec succès
    if (!newDepartment) {
      throw new Error('Échec de la création du département');
    }
    
    // Ajouter le nouveau département à la liste
    departements.value.push(newDepartment);
    
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Département créé avec succès',
      life: 3000
    });
    
    // Fermer le dialog
    showDepartmentDialog.value = false;
    
    // Sélectionner automatiquement après un court délai
    await nextTick();
    if (formRef.value && (formRef.value as any).formData) {
      (formRef.value as any).formData.departmentId = newDepartment.id;
      console.log('Département sélectionné automatiquement:', newDepartment.id);
    }
  } catch (error: any) {
    console.error('Erreur création département:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Erreur lors de la création du département',
      life: 3000
    });
  } finally {
    loadingDepartment.value = false;
  }
};

</script>
