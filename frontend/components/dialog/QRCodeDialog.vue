<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :closable="true"
    :draggable="false"
    :style="{ width: '600px' }"
    class="qr-dialog"
  >
    <template #header>
      <span>QR code</span>
    </template>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
    </div>

    <QRCodeDisplay
      v-else
      ref="qrCodeDisplayRef"
      :qr-code="qrCode"
      :employee-name="employeeName"
      :employee-matricule="employeeMatricule"
      :employee-position="employeePosition"
      :employee-department="employeeDepartment"
      :employee-photo="employeePhoto"
      :company-name="companyName"
      :company-logo="companyLogo"
      :background-color="customization?.backgroundColor"
      :text-color="customization?.textColor"
      :border-color="customization?.borderColor"
    />

    <template #footer>
      <div class="flex pt-4 border-t w-full justify-center gap-4">
        <AppButton
          label="Télécharger le Badge"
          icon="pi pi-download"
          variant="primary"
          size="sm"
          :loading="isDownloading"
          @click="handleDownload"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import QRCodeDisplay from "~/components/qrcode/QRCodeDisplay.vue";
import AppButton from "~/components/button/AppButton.vue";
import { useBadgeCustomizationApi, type BadgeCustomization } from "~/composables/api/useBadgeCustomizationApi";
import { useCompanyApi } from "~/composables/api/useCompanyApi";
// @ts-ignore - html2canvas types
import html2canvas from 'html2canvas';

interface Props {
  visible: boolean;
  qrCode: string;
  employeeName: string;
  employeeMatricule: string;
  employeePosition?: string;
  employeeDepartment?: string;
  employeePhoto?: string;
}

const props = withDefaults(defineProps<Props>(), {
  employeePosition: 'Employé',
  employeeDepartment: 'Non spécifié'
});

const emit = defineEmits<{
  "update:visible": [value: boolean];
  download: [];
}>();

const { getBadgeCustomization } = useBadgeCustomizationApi();
const { getCurrentCompany } = useCompanyApi();

const customization = ref<BadgeCustomization | null>(null);
const companyName = ref('');
const companyLogo = ref('');
const isLoading = ref(true);
const isDownloading = ref(false);
const qrCodeDisplayRef = ref<any>(null);

const loadData = async () => {
  isLoading.value = true;
  try {
    // 1. Charger la personnalisation
    const customData = await getBadgeCustomization();
    if (customData && customData.isActive) {
      customization.value = customData;
    } else {
      customization.value = null;
    }

    // 2. Charger les infos de la compagnie (nom et logo)
    console.log('QRCodeDialog - Chargement données compagnie...');
    const company = await getCurrentCompany();
    console.log('QRCodeDialog - Données compagnie reçues:', company);
    
    if (company) {
      companyName.value = company.name;
      if (company.logo) {
        // Vérifier si c'est une URL complète (Cloudinary)
        if (company.logo.startsWith('http://') || company.logo.startsWith('https://')) {
          companyLogo.value = company.logo;
          console.log('QRCodeDialog - URL Cloudinary détectée:', companyLogo.value);
        } else {
          // Ancien système - ajouter apiBase
          const config = useRuntimeConfig();
          const encodedPath = company.logo.split('/').map(part => encodeURIComponent(part)).join('/');
          companyLogo.value = `${config.public.apiBase}/${encodedPath}`;
          console.log('QRCodeDialog - Logo URL construite (encodée):', companyLogo.value);
        }
      } else {
        console.log('QRCodeDialog - Pas de logo dans les données compagnie');
        companyLogo.value = '';
      }
    } else {
      console.log('QRCodeDialog - Aucune donnée compagnie reçue');
    }
  } catch (error) {
    console.error("Erreur chargement données badge:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});

// Recharger les données à chaque ouverture
watch(() => props.visible, (newValue) => {
  if (newValue) {
    loadData();
  }
});

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const handleDownload = async () => {
  if (!qrCodeDisplayRef.value?.badgeRef) {
    console.error('Référence du badge non trouvée');
    return;
  }
  
  isDownloading.value = true;
  
  try {
    console.log('=== Début du téléchargement du badge ===');
    const badgeElement = qrCodeDisplayRef.value.badgeRef;
    
    // Attendre que le DOM soit complètement rendu
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Début de la capture avec html2canvas...');
    
    // Capturer le badge entier en image avec options pour flexbox
    const canvas = await html2canvas(badgeElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: true,
      useCORS: true,
      allowTaint: false,
      width: 600,
      height: 900,
      windowWidth: 600,
      windowHeight: 900,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: false,
      removeContainer: true,
      onclone: (clonedDoc: Document) => {
        console.log('Clone du document créé');
        const clonedBadge = clonedDoc.querySelector('.employee-badge');
        
        if (clonedBadge) {
          console.log('Badge cloné trouvé');
          
          // Vérifier tous les éléments de texte
          const allParagraphs = clonedBadge.querySelectorAll('p, h1, h2, h3');
          
          allParagraphs.forEach((el: any) => {
            // Forcer tous les éléments à être visibles
            el.style.setProperty('opacity', '1', 'important');
            el.style.setProperty('visibility', 'visible', 'important');
          });
          
          // Forcer tous les textes
          const textElements = clonedBadge.querySelectorAll('p, h1, h2, span');
          textElements.forEach((el: any) => {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
          });
        }
      }
    });
    
    // Convertir en blob et télécharger
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `Badge_${props.employeeMatricule}_${props.employeeName}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        console.log('Téléchargement lancé !');
      }
    });
  } catch (error) {
    console.error('=== ERREUR lors du téléchargement ===');
    console.error('Détails de l\'erreur:', error);
  } finally {
    isDownloading.value = false;
  }
};
</script>

<style scoped>
:deep(.p-dialog-header) {
  padding: 1rem 1rem 0 1rem;
}

:deep(.p-dialog-content) {
  padding: 2rem;
}

:deep(.p-dialog-footer) {
  padding: 1rem 2rem 2rem 2rem;
  border-top: 1px solid #e5e7eb;
}
</style>
