<template>
  <div class="w-full">
    <!-- Header -->
    <BannerHeader
      title="Personnalisation du Badge Employé"
      description="Choisissez le style de badge qui sera utilisé pour vos employés"
    />
    
    <Toast />

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Sélection des badges -->
    <div v-else :class="customization ? 'grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8' : 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'">
      <!-- Badge Primary - Défaut -->
      <div
        @click="selectBadge('default')"
        :class="[
          'relative cursor-pointer rounded-xl border-4 transition-all duration-300 p-6',
          selectedBadge === 'default' 
            ? 'border-primary shadow-lg scale-105' 
            : 'border-gray-200 hover:border-gray-300'
        ]"
      >
        <div class="absolute top-4 right-4 z-20">
          <RadioButton
            v-model="selectedBadge"
            inputId="badge-default"
            name="badgeSelection"
            value="default"
          />
        </div>
        
        <div class="p-4 bg-gray-50 rounded-t-lg mb-4">
          <p class="text-center font-semibold text-gray-700">Badge par défaut</p>
        </div>
        
        <BadgePreview 
          :employee-data="sampleEmployee" 
          :company-name="companyName"
        />
      </div>

      <!-- Badge Personnalisé (affiché seulement si existe) -->
      <div
        v-if="customization"
        @click="selectBadge('custom')"
        :class="[
          'relative cursor-pointer rounded-xl border-4 transition-all duration-300 p-6',
          selectedBadge === 'custom' 
            ? 'border-primary shadow-lg scale-105' 
            : 'border-gray-200 hover:border-gray-300'
        ]"
      >
        <div class="absolute top-4 right-4 z-20">
          <RadioButton
            v-model="selectedBadge"
            inputId="badge-custom"
            name="badgeSelection"
            value="custom"
          />
        </div>
        
        <div class="p-4 bg-gray-50 rounded-t-lg mb-4 flex justify-between items-center">
          <p class="text-center font-semibold text-gray-700 flex-1">Badge personnalisé</p>
          <button 
            @click.stop="showCustomizer = true" 
            class="text-primary hover:text-primary/80 transition-colors"
            title="Modifier"
          >
            <Icon icon="lucide:edit" class="text-xl" />
          </button>
        </div>
        
        <BadgePreview 
          :employee-data="sampleEmployee" 
          :company-name="companyName"
          :background-color="customization.backgroundColor"
          :text-color="customization.textColor"
          :border-color="customization.borderColor"
        />
      </div>

      <!-- Carte Personnalisation -->
      <div
        @click="showCustomizer = true"
        class="relative cursor-pointer rounded-xl border-4 border-dashed border-gray-300 transition-all duration-300 hover:border-primary hover:bg-gray-50 flex items-center justify-center min-h-[320px]"
      >
        <div class="text-center p-6">
          <Icon icon="lucide:palette" class="text-6xl text-gray-400 mb-4 mx-auto" />
          <p class="text-lg font-semibold text-gray-700 mb-2">
            {{ customization ? 'Modifier la personnalisation' : 'Personnaliser le badge' }}
          </p>
          <p class="text-sm text-gray-500">Modifiez les couleurs selon votre marque</p>
        </div>
      </div>
    </div>

    <!-- Dialog de personnalisation -->
    <Dialog
      v-model:visible="showCustomizer"
      modal
      header="Personnalisation du badge"
      :style="{ width: '90vw', maxWidth: '1400px' }"
      :dismissableMask="true"
      @hide="loadCustomization"
    >
      <BadgeCustomizer @saved="onCustomizationSaved" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import RadioButton from 'primevue/radiobutton';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import BannerHeader from '~/components/banner/BannerHeader.vue';
import AppButton from '~/components/button/AppButton.vue';
import BadgePreview from '~/components/badge/BadgePreview.vue';
import BadgeCustomizer from '~/components/badge/BadgeCustomizer.vue';
import { useCompanyApi } from '~/composables/api/useCompanyApi';
import { useBadgeCustomizationApi, type BadgeCustomization } from '~/composables/api/useBadgeCustomizationApi';

const toast = useToast();
const { getCurrentCompany } = useCompanyApi();
const { getBadgeCustomization, upsertBadgeCustomization } = useBadgeCustomizationApi();

const showCustomizer = ref(false);
const companyName = ref('Mon Entreprise');
const customization = ref<BadgeCustomization | null>(null);
const selectedBadge = ref<'default' | 'custom'>('default');
const isLoading = ref(true);

// Données d'exemple pour l'aperçu
const sampleEmployee = {
  fullName: 'Sirhame Saidi Ousseni',
  position: 'Développeur',
  matricule: 'EMP-001',
  department: 'Informatique',
  qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=EMP-001'
};

// Charger la personnalisation
const loadCustomization = async () => {
  try {
    const data = await getBadgeCustomization();
    customization.value = data;
    
    if (data && data.isActive) {
      selectedBadge.value = 'custom';
    } else {
      selectedBadge.value = 'default';
    }
  } catch (error) {
    console.error('Erreur chargement personnalisation:', error);
  }
};

// Sélectionner un badge
const selectBadge = async (type: 'default' | 'custom') => {
  if (selectedBadge.value === type) return;
  
  try {
    // Mettre à jour l'état isActive via l'API
    // On envoie juste isActive, le backend gardera les autres valeurs si elles existent
    // ou créera une config par défaut si elle n'existe pas (pour 'custom')
    if (type === 'custom' && !customization.value) {
       // Si pas de customisation, on ouvre le customizer
       showCustomizer.value = true;
       return;
    }

    await upsertBadgeCustomization({
      isActive: type === 'custom'
    });
    
    selectedBadge.value = type;
    
    // Recharger pour être sûr d'avoir les dernières données
    await loadCustomization();
    
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: `Badge ${type === 'default' ? 'par défaut' : 'personnalisé'} activé`,
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de changer le badge actif',
      life: 3000,
    });
  }
};

// Quand la personnalisation est sauvegardée
const onCustomizationSaved = async () => {
  showCustomizer.value = false;
  await loadCustomization();
};

// Charger au montage
onMounted(async () => {
  isLoading.value = true;
  try {
    const company = await getCurrentCompany();
    if (company?.name) {
      companyName.value = company.name;
    }
    
    // Charger la personnalisation si elle existe
    await loadCustomization();
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* Animations */
.scale-105 {
  transform: scale(1.02);
}
</style>
