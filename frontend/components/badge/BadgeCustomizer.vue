<template>
  <div class="badge-customizer">
    <!-- Loading Spinner -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Colonne gauche - Formulaire de personnalisation -->
      <div class="customization-form bg-white h-fit rounded-xl border-2 border-gris/40 p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Personnalisation des couleurs</h2>
        
        <div class="space-y-6">
          <!-- Couleur de fond -->
          <ColorPickerField
            v-model="formData.backgroundColor"
            label="Couleur de fond"
            description="Couleur principale du badge"
            input-id="bg-color"
          />
          
          <!-- Couleur du texte -->
          <ColorPickerField
            v-model="formData.textColor"
            label="Couleur du texte"
            description="Couleur des textes sur le badge"
            input-id="text-color"
          />
          
          <!-- Couleur des bordures -->
          <ColorPickerField
            v-model="formData.borderColor"
            label="Couleur des bordures"
            description="Couleur des rectangles décoratifs"
            input-id="border-color"
          />
        </div>
        
        <!-- Boutons d'action -->
        <div class="flex gap-3 mt-8">
          <AppButton
            label="Enregistrer"
            icon="lucide:save"
            variant="primary"
            :loading="saving"
            @click="handleSave"
            class="flex-1"
          />
        </div>
      </div>
      
      <!-- Colonne droite - Aperçu en temps réel -->
      <div class="preview-section">
        <div class="bg-bleu rounded-xl h-fit pt-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Aperçu du Badge</h2>
          
          <div class="flex justify-center items-center">
            <div class="transform scale-[0.9] rounded-lg origin-top">
              <EmployeeBadge
                :employee-name="sampleEmployee.fullName"
                :employee-position="sampleEmployee.position"
                :employee-matricule="sampleEmployee.matricule"
                :employee-department="sampleEmployee.department"
                :qr-code-url="sampleEmployee.qrCode"
                :company-name="companyName"
                :company-logo="companyLogo"
                :background-color="formData.backgroundColor"
                :text-color="formData.textColor"
                :border-color="formData.borderColor"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import Checkbox from 'primevue/checkbox';
import { useToast } from 'primevue/usetoast';
import ColorPickerField from '~/components/form/ColorPickerField.vue';
import EmployeeBadge from '~/components/badge/EmployeeBadge.vue';
import AppButton from '~/components/button/AppButton.vue';
import { useBadgeCustomizationApi } from '~/composables/api/useBadgeCustomizationApi';
import { useCompanyApi } from '~/composables/api/useCompanyApi';

const toast = useToast();
const { getBadgeCustomization, upsertBadgeCustomization } = useBadgeCustomizationApi();
const { getCurrentCompany } = useCompanyApi();

const emit = defineEmits<{
  saved: []
}>();

const saving = ref(false);
const isLoading = ref(true);
const companyName = ref('Mon Entreprise');

// Données du formulaire
const formData = ref({
  backgroundColor: '#2B48D1',
  textColor: '#ffffff',
  borderColor: 'rgba(255, 255, 255, 0.6)',
  isActive: false,
});

// Données d'exemple pour l'aperçu
const sampleEmployee = {
  fullName: 'Sirhame Saidi',
  position: 'Développeur',
  matricule: 'EMP-001',
  department: 'Informatique',
  qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=EMP-001',
};

// Fonction helper pour construire l'URL de l'image (Cloudinary ou locale)
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  
  // Si l'URL commence par http:// ou https://, c'est une URL Cloudinary complète
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Sinon, c'est un chemin relatif (ancien système), ajouter apiBase
  const config = useRuntimeConfig();
  return `${config.public.apiBase}/${imagePath}`;
};

// Charger la configuration actuelle
const companyLogo = ref('');

onMounted(async () => {
  isLoading.value = true;
  try {
    // Charger le nom de l'entreprise et le logo
    const company = await getCurrentCompany();
    if (company) {
      companyName.value = company.name;
      companyLogo.value = getImageUrl(company.logo);
    }
    
    // Charger la personnalisation existante
    const customization = await getBadgeCustomization();
    if (customization) {
      formData.value = {
        backgroundColor: customization.backgroundColor,
        textColor: customization.textColor,
        borderColor: customization.borderColor,
        isActive: customization.isActive,
      };
    }
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
  } finally {
    isLoading.value = false;
  }
});

// Sauvegarder la personnalisation
const handleSave = async () => {
  saving.value = true;
  try {
    // Toujours activer la personnalisation lors de la sauvegarde
    await upsertBadgeCustomization({
      ...formData.value,
      isActive: true
    });
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Personnalisation du badge enregistrée',
      life: 3000,
    });
    emit('saved');
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de sauvegarder la personnalisation',
      life: 3000,
    });
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.badge-customizer {
  width: 100%;
}

.preview-section {
  position: sticky;
  top: 2rem;
  
}
</style>
