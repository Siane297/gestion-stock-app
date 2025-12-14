<template>
  <div class="space-y-6">
    <!-- Toast pour les notifications -->
    <Toast />

    <!-- Bannière en haut -->
    <BannerHeader
      title="Configuration de l'Organisation"
      description="Gérez les informations et paramètres de votre organisation"
    />

    <!-- Contenu Principal avec SelectButton -->
    <div class="bg-white rounded-lg border-2 border-gris/40 p-6">
      <div class="flex  mb-6">
        <SelectButton 
          v-model="activeTab" 
          :options="tabOptions" 
          optionLabel="label" 
          optionValue="value"
          :allowEmpty="false"
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2 px-2">
              <Icon :icon="slotProps.option.icon" />
              <span>{{ slotProps.option.label }}</span>
            </div>
          </template>
        </SelectButton>
      </div>
        
      <!-- Onglet Organisation -->
      <div v-if="activeTab === 'organisation'" class="py-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Informations de l'organisation</h2>
        
        <div v-if="loadingCompany" class="flex justify-center py-12">
          <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-primary" />
        </div>
        
        <FormulaireDynamique
          v-else
          title="Informations de l'Organisation"
          description="Modifiez les détails de votre structure"
          :fields="companyFields"
          submitLabel="Enregistrer"
          cancelLabel="Annuler"
          :showCancelButton="false"
          :showHeader="false"
          :loading="submittingCompany"
          @submit="handleCompanySubmit"
        />
      </div>

      <!-- Onglet Postes -->
      <div v-if="activeTab === 'postes'" class="py-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Gestion des Postes</h2>
        
        <TableGestion
          :data="postes"
          :loading="loadingPostes"
          entity-label="poste"
          empty-icon="lucide:briefcase"
          @add="openAddPoste"
          @edit="openEditPoste"
          @delete="handleDeletePoste"
        />
      </div>




    </div>

    <!-- Popup Ajout/Modification Poste -->
    <FormPopupDynamique
      v-model:visible="showPostePopup"
      :title="editingPoste ? 'Modifier le poste' : 'Ajouter un poste'"
      description=""
      :fields="posteFields"
      :loading="submittingPoste"
      @submit="handlePosteSubmit"
    />




  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Toast from 'primevue/toast';
import SelectButton from 'primevue/selectbutton';
import { useToast } from 'primevue/usetoast';

import BannerHeader from '~/components/banner/BannerHeader.vue';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';

import FormPopupDynamique from '~/components/form/FormPopupDynamique.vue';

import { useCompanyApi } from '~/composables/api/useCompanyApi';
import { usePosteApi } from '~/composables/api/usePosteApi';

import { useCompanyImageApi } from '~/composables/api/useCompanyImageApi';

const toast = useToast();

// Navigation
const activeTab = ref('organisation');
const tabOptions = computed(() => [
  { label: 'Organisation', value: 'organisation', icon: 'lucide:building' },
  { label: `Postes (${postes.value.length})`, value: 'postes', icon: 'lucide:briefcase' },
]);

// APIs
const { getCurrentCompany, updateCompany } = useCompanyApi();
const { getPostes, createPoste, updatePoste, deletePoste } = usePosteApi();

const { uploadCompanyLogo, deleteCompanyLogo, uploadCompanyPdfHeader, deleteCompanyPdfHeader } = useCompanyImageApi();

// État Organisation
const loadingCompany = ref(true);
const submittingCompany = ref(false);
const company = ref<any>(null);

const countryCodeMap: { [key: string]: string} = {
  'United Kingdom': 'gb',
  'USA': 'us',
  'France': 'fr',
  'Germany': 'de',
  'Spain': 'es',
  'Italy': 'it',
  'Canada': 'ca',
  'Australia': 'au',
  'Japan': 'jp',
  'China': 'cn',
  'India': 'in',
  'Brazil': 'br',
  'Mexico': 'mx',
  'South Africa': 'za',
  'Nigeria': 'ng',
  'Egypt': 'eg',
  'Kenya': 'ke',
  'Morocco': 'ma',
  'Algeria': 'dz',
  'Tunisia': 'tn',
  'Portugal': 'pt',
  'Ireland': 'ie',
  'Belgium': 'be',
  'Netherlands': 'nl',
  'Switzerland': 'ch',
  'Austria': 'at',
  'Poland': 'pl',
  'Czech Republic': 'cz',
  'Hungary': 'hu',
  'Sweden': 'se',
  'Norway': 'no',
  'Denmark': 'dk',
  'Greece': 'gr',
  'Romania': 'ro',
  'Bulgaria': 'bg',
  'Ukraine': 'ua',
  'Finland': 'fi',
  'UAE': 'ae',
  'Saudi Arabia': 'sa',
  'Qatar': 'qa',
  'Kuwait': 'kw',
  'Bahrain': 'bh',
  'Oman': 'om',
  'Israel': 'il',
  'Turkey': 'tr',
  'Pakistan': 'pk',
  'Bangladesh': 'bd',
  'South Korea': 'kr',
  'Thailand': 'th',
  'Vietnam': 'vn',
  'Singapore': 'sg',
  'Malaysia': 'my',
  'Indonesia': 'id',
  'Philippines': 'ph',
  'Argentina': 'ar',
  'Chile': 'cl',
  'Colombia': 'co',
  'Peru': 'pe',
  'New Zealand': 'nz',
  'Tanzania': 'tz',
  'Uganda': 'ug',
  'Ethiopia': 'et',
  'Somalia': 'so',
  'Djibouti': 'dj',
  'Comoros': 'km',
  'Madagascar': 'mg',
  'Cameroon': 'cm',
  'Niger': 'ne',
  'Chad': 'td',
  'Benin': 'bj',
  'Togo': 'tg',
  'Gabon': 'ga',
  'Congo': 'cg',
  'RDC': 'cd',
  'Zimbabwe': 'zw',
  'Zambia': 'zm',
  'Botswana': 'bw',
  'Mozambique': 'mz',
  'Malawi': 'mw',
};
const getFlagClass = (countryName: string) => `fi fi-${countryCodeMap[countryName] || countryName.toLowerCase()}`;

// Fonction helper pour construire l'URL de l'image (Cloudinary ou locale)
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  
  // Si l'URL commence par http:// ou https://, c'est une URL Cloudinary complète
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Sinon, c'est un chemin relatif (ancien système), ajouter apiBase
  return `${useRuntimeConfig().public.apiBase}/${imagePath}`;
};

// Configuration des champs Organisation
const companyFields = computed(() => [
  {
    name: 'logo',
    label: 'Logo de l\'organisation',
    type: 'image' as const,
    required: false,
    showLabel: false,
    fixedWidth: true,
    value: getImageUrl(company.value?.logo),
    onImageUpload: async (file: File) => {
      try {
        const response: any = await uploadCompanyLogo(file);
        if (response.success && response.data?.logo) {
          company.value.logo = response.data.logo;
          return getImageUrl(response.data.logo);
        }
        throw new Error('Erreur lors de l\'upload');
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de l\'upload du logo', life: 3000 });
        throw error;
      }
    },
    onImageRemove: async () => {
      try {
        await deleteCompanyLogo();
        company.value.logo = null;
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression du logo', life: 3000 });
        throw error;
      }
    }
  },
  {
    name: 'pdfHeader',
    label: 'En-tête PDF Personnalisé',
    type: 'image' as const,
    required: false,
    showLabel: false,
    fixedWidth: true,
    value: getImageUrl(company.value?.pdfHeader),
    helpText: 'L\'en-tête personnalisé remplacera l\'en-tête par défaut dans tous les PDFs générés. Format recommandé: image large (format panoramique).',
    onImageUpload: async (file: File) => {
      try {
        const response: any = await uploadCompanyPdfHeader(file);
        if (response.success && response.data?.pdfHeader) {
          company.value.pdfHeader = response.data.pdfHeader;
          return getImageUrl(response.data.pdfHeader);
        }
        throw new Error('Erreur lors de l\'upload');
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de l\'upload de l\'en-tête PDF', life: 3000 });
        throw error;
      }
    },
    onImageRemove: async () => {
      try {
        await deleteCompanyPdfHeader();
        company.value.pdfHeader = null;
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression de l\'en-tête PDF', life: 3000 });
        throw error;
      }
    }
  },
  {
    name: 'name',
    label: 'Nom de l\'organisation',
    type: 'text' as const,
    required: true,
    value: company.value?.name
  },
  {
    name: 'emailOrganisation',
    label: 'Email de contact',
    type: 'email' as const,
    required: true,
    value: company.value?.emailOrganisation
  },
  {
    name: 'telephoneOrganisation',
    label: 'Téléphone',
    type: 'text' as const,
    value: company.value?.telephoneOrganisation
  },
  
  
  {
    name: 'country',
    label: 'Pays',
    type: 'select' as const,
    placeholder: 'Sélectionnez votre pays',
    required: false,
    disabled: true,
    showFlag: true,
    filter: true,
    optionLabel: 'label',
    optionValue: 'value',
    value: company.value?.country,
    options: [
      { label: 'Kenya', value: 'Kenya', code: 'ke' },
      { label: 'Tanzania', value: 'Tanzania', code: 'tz' },
      { label: 'Uganda', value: 'Uganda', code: 'ug' },
      { label: 'Ethiopia', value: 'Ethiopia', code: 'et' },
      { label: 'Somalia', value: 'Somalia', code: 'so' },
      { label: 'Djibouti', value: 'Djibouti', code: 'dj' },
      { label: 'Comoros', value: 'Comoros', code: 'km' },
      { label: 'Madagascar', value: 'Madagascar', code: 'mg' },
      { label: 'Nigeria', value: 'Nigeria', code: 'ng' },
      { label: 'Cameroon', value: 'Cameroon', code: 'cm' },
      { label: 'Niger', value: 'Niger', code: 'ne' },
      { label: 'Chad', value: 'Chad', code: 'td' },
      { label: 'Benin', value: 'Benin', code: 'bj' },
      { label: 'Togo', value: 'Togo', code: 'tg' },
      { label: 'Gabon', value: 'Gabon', code: 'ga' },
      { label: 'Congo', value: 'Congo', code: 'cg' },
      { label: 'RDC', value: 'RDC', code: 'cd' },
      { label: 'South Africa', value: 'South Africa', code: 'za' },
      { label: 'Zimbabwe', value: 'Zimbabwe', code: 'zw' },
      { label: 'Zambia', value: 'Zambia', code: 'zm' },
      { label: 'Botswana', value: 'Botswana', code: 'bw' },
      { label: 'Mozambique', value: 'Mozambique', code: 'mz' },
      { label: 'Malawi', value: 'Malawi', code: 'mw' },
      { label: 'Morocco', value: 'Morocco', code: 'ma' },
      { label: 'Algeria', value: 'Algeria', code: 'dz' },
      { label: 'Tunisia', value: 'Tunisia', code: 'tn' },
      { label: 'Libya', value: 'Libya', code: 'ly' },
      { label: 'Egypt', value: 'Egypt', code: 'eg' },
      { label: 'Portugal', value: 'Portugal', code: 'pt' },
      { label: 'Ireland', value: 'Ireland', code: 'ie' },
      { label: 'United Kingdom', value: 'United Kingdom', code: 'gb' },
      { label: 'France', value: 'France', code: 'fr' },
      { label: 'Germany', value: 'Germany', code: 'de' },
      { label: 'Italy', value: 'Italy', code: 'it' },
      { label: 'Spain', value: 'Spain', code: 'es' },
      { label: 'Belgium', value: 'Belgium', code: 'be' },
      { label: 'Netherlands', value: 'Netherlands', code: 'nl' },
      { label: 'Switzerland', value: 'Switzerland', code: 'ch' },
      { label: 'Austria', value: 'Austria', code: 'at' },
      { label: 'Poland', value: 'Poland', code: 'pl' },
      { label: 'Czech Republic', value: 'Czech Republic', code: 'cz' },
      { label: 'Hungary', value: 'Hungary', code: 'hu' },
      { label: 'Sweden', value: 'Sweden', code: 'se' },
      { label: 'Norway', value: 'Norway', code: 'no' },
      { label: 'Denmark', value: 'Denmark', code: 'dk' },
      { label: 'Greece', value: 'Greece', code: 'gr' },
      { label: 'Romania', value: 'Romania', code: 'ro' },
      { label: 'Bulgaria', value: 'Bulgaria', code: 'bg' },
      { label: 'Ukraine', value: 'Ukraine', code: 'ua' },
      { label: 'Finland', value: 'Finland', code: 'fi' },
      { label: 'UAE', value: 'UAE', code: 'ae' },
      { label: 'Saudi Arabia', value: 'Saudi Arabia', code: 'sa' },
      { label: 'Qatar', value: 'Qatar', code: 'qa' },
      { label: 'Kuwait', value: 'Kuwait', code: 'kw' },
      { label: 'Bahrain', value: 'Bahrain', code: 'bh' },
      { label: 'Oman', value: 'Oman', code: 'om' },
      { label: 'Israel', value: 'Israel', code: 'il' },
      { label: 'Turkey', value: 'Turkey', code: 'tr' },
      { label: 'India', value: 'India', code: 'in' },
      { label: 'Pakistan', value: 'Pakistan', code: 'pk' },
      { label: 'Bangladesh', value: 'Bangladesh', code: 'bd' },
      { label: 'China', value: 'China', code: 'cn' },
      { label: 'Japan', value: 'Japan', code: 'jp' },
      { label: 'South Korea', value: 'South Korea', code: 'kr' },
      { label: 'Thailand', value: 'Thailand', code: 'th' },
      { label: 'Vietnam', value: 'Vietnam', code: 'vn' },
      { label: 'Singapore', value: 'Singapore', code: 'sg' },
      { label: 'Malaysia', value: 'Malaysia', code: 'my' },
      { label: 'Indonesia', value: 'Indonesia', code: 'id' },
      { label: 'Philippines', value: 'Philippines', code: 'ph' },
      { label: 'USA', value: 'USA', code: 'us' },
      { label: 'Canada', value: 'Canada', code: 'ca' },
      { label: 'Mexico', value: 'Mexico', code: 'mx' },
      { label: 'Brazil', value: 'Brazil', code: 'br' },
      { label: 'Argentina', value: 'Argentina', code: 'ar' },
      { label: 'Chile', value: 'Chile', code: 'cl' },
      { label: 'Colombia', value: 'Colombia', code: 'co' },
      { label: 'Peru', value: 'Peru', code: 'pe' },
      { label: 'Australia', value: 'Australia', code: 'au' },
      { label: 'New Zealand', value: 'New Zealand', code: 'nz' },
    ],
  },
  {
    name: 'address',
    label: 'Adresse',
    type: 'text' as const,
    value: company.value?.address
  },
]);

// État Postes
const loadingPostes = ref(true);
const submittingPoste = ref(false);
const postes = ref<any[]>([]);
const showPostePopup = ref(false);
const editingPoste = ref<any>(null);



// Configuration des champs Poste
const posteFields = computed(() => [
  {
    name: 'name',
    label: 'Intitulé du poste',
    type: 'text' as const,
    required: true,
    placeholder: 'Ex: Développeur Fullstack',
    value: editingPoste.value?.name
  }
]);



// Chargement initial
onMounted(async () => {
  // Charger organisation
  try {
    company.value = await getCurrentCompany();
  } catch (error) {
    console.error('Erreur chargement organisation:', error);
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les infos organisation', life: 3000 });
  } finally {
    loadingCompany.value = false;
  }

  // Charger postes
  try {
    postes.value = await getPostes();
  } catch (error) {
    console.error('Erreur chargement postes:', error);
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les postes', life: 3000 });
  } finally {
    loadingPostes.value = false;
  }


});

// Soumission formulaire Organisation
const handleCompanySubmit = async (data: any) => {
  submittingCompany.value = true;
  try {
    // Exclure le logo et pdfHeader car ils ont déjà été uploadés séparément
    const { logo, pdfHeader, ...companyData } = data;
    
    console.log('Données à soumettre (sans logo/pdfHeader):', companyData);
    console.log('Logo déjà uploadé:', company.value.logo);
    console.log('En-tête PDF déjà uploadé:', company.value.pdfHeader);
    
    const updated = await updateCompany(companyData);
    company.value = updated;
    toast.add({ severity: 'success', summary: 'Succès', detail: 'Informations mises à jour', life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la mise à jour', life: 3000 });
  } finally {
    submittingCompany.value = false;
  }
};

// === Gestion Postes ===
const openAddPoste = () => {
  editingPoste.value = null;
  showPostePopup.value = true;
};

const openEditPoste = (poste: any) => {
  editingPoste.value = poste;
  showPostePopup.value = true;
};

const handlePosteSubmit = async (data: any) => {
  submittingPoste.value = true;
  try {
    if (editingPoste.value) {
      // Mise à jour
      await updatePoste(editingPoste.value.id, data);
      const index = postes.value.findIndex(p => p.id === editingPoste.value.id);
      if (index !== -1) {
        postes.value[index] = { ...postes.value[index], ...data };
      }
      toast.add({ severity: 'success', summary: 'Succès', detail: 'Poste modifié', life: 3000 });
    } else {
      // Création
      const newPoste = await createPoste(data);
      postes.value.push(newPoste);
      toast.add({ severity: 'success', summary: 'Succès', detail: 'Poste créé', life: 3000 });
    }
    showPostePopup.value = false;
    editingPoste.value = null;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de l\'opération', life: 3000 });
  } finally {
    submittingPoste.value = false;
  }
};

const handleDeletePoste = async (id: string) => {
  try {
    await deletePoste(id);
    postes.value = postes.value.filter(p => p.id !== id);
    toast.add({ severity: 'success', summary: 'Succès', detail: 'Poste supprimé', life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression', life: 3000 });
  }
};








</script>
