<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <BannerHeader
      title="Historique des pointages"
      description="Consultez l'historique complet des pointages avec statut et durées"
    />

    <!-- Tableau d'historique -->
    <TableHistorique
      :data="historique"
      :loading="loading"
      :pdf-loading="pdfLoading"
      :pdf-progress="pdfProgress"
      :rows-per-page="20"
      @filter-change="handleFilterChange"
      @action:download-pdf="handleDownloadBilansPdf"
    />

    <!-- Pagination personnalisée si nécessaire -->

  </div>
</template>

<script setup lang="ts">
import TableHistorique from '~/components/table/TableHistorique.vue';
import BannerHeader from '~/components/banner/BannerHeader.vue';
import { useBilanPresenceApi } from '~/composables/api/useHistoriqueApi';
import type { BilanPresence, BilanQueryParams } from '~/composables/api/useHistoriqueApi';
import { useSecurePdf } from '~/composables/useSecurePdf';
import { useToast } from 'primevue/usetoast';

// Protection de la page
definePageMeta({
  middleware: ['auth', 'permissions']
});

const { getHistorique } = useBilanPresenceApi();
const { generateBilansPdf } = useSecurePdf();
const toast = useToast();

const loading = ref(false);
const pdfLoading = ref(false); // État de chargement PDF
const pdfProgress = ref(0); // Progression du téléchargement
const historique = ref<BilanPresence[]>([]);


const filters = ref<Omit<BilanQueryParams, 'page' | 'limit'>>({});

// Charger l'historique
const loadHistorique = async () => {
  loading.value = true;
  try {
    console.log('🔍 Chargement de l\'historique avec params:', {
      ...filters.value,
    });
    
    const result = await getHistorique({
      ...filters.value,
    });
    
    // Vérifier que le résultat n'est pas null
    if (!result) {
      throw new Error('Aucune donnée reçue du serveur');
    }
    
    console.log('✅ Résultat reçu:', result);
    
    historique.value = result;
    
    console.log('📝 historique.value après affectation:', historique.value);
  } catch (error: any) {
    console.error('❌ Erreur lors du chargement de l\'historique:', error);
  } finally {
    loading.value = false;
  }
};

// Gestion des filtres
const handleFilterChange = (newFilters: Partial<Omit<BilanQueryParams, 'page' | 'limit'>>) => {
  filters.value = {
    ...filters.value,
    ...newFilters,
  };
  loadHistorique();
};

// Gestion du téléchargement PDF
const handleDownloadBilansPdf = async () => {
  try {
    pdfLoading.value = true; // Activer le loading
    pdfProgress.value = 0;
    
    // Simulation de progression
    const interval = setInterval(() => {
      if (pdfProgress.value < 90) {
        pdfProgress.value += Math.random() * 10;
      }
    }, 200);

    await generateBilansPdf();
    
    clearInterval(interval);
    pdfProgress.value = 100;
  } catch (error) {
    console.error('Erreur lors du téléchargement PDF bilans:', error);
    // L'erreur est déjà gérée par useSecurePdf avec des toasts
  } finally {
    setTimeout(() => {
      pdfLoading.value = false; // Désactiver le loading
      pdfProgress.value = 0;
    }, 500); // Petit délai pour voir la barre à 100%
  }
};

// Charger au montage
onMounted(() => {
  loadHistorique();
});
</script>
