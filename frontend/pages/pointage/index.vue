<template>
  <div class="container">
    <!-- Banner Header -->
    <BannerHeader title="Pointage" description="Choisissez le type de pointage à effectuer" />

    <!-- Cards Entrée et Sortie -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Card Entrée -->
      <PointageCard 
        title="Entrée" 
        description="Scanner le QR code pour enregistrer une entrée" 
        icon="mdi:login"
        variant="success" 
        route="/pointage/entree"
        :week-data="entreesWeekData"
        :loading="isLoading"
      />

      <!-- Card Sortie -->
      <PointageCard 
        title="Sortie" 
        description="Scanner le QR code pour enregistrer une sortie" 
        icon="mdi:logout"
        variant="danger" 
        route="/pointage/sortie"
        :week-data="sortiesWeekData"
        :loading="isLoading"
      />
    </div>

    <!-- Table des pointages -->
    <TablePointage
      title="Historique des pointages"
      description="Liste de tous les pointages enregistrés"
      :data="attendances"
      :loading="isLoading"
      :pdf-loading="pdfLoading"
      :pdf-progress="pdfProgress"
      @action:download-pdf="handleDownloadAttendancesPdf"
    />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import BannerHeader from '~/components/banner/BannerHeader.vue';
import PointageCard from '~/components/card/PointageCard.vue';
import TablePointage from '~/components/table/TablePointage.vue';
import { useAttendanceApi, type Attendance } from '~/composables/api/useAttendanceApi';
import { useSecurePdf } from '~/composables/useSecurePdf';
import { useToast } from 'primevue/usetoast';

// Protection de la page - nécessite authentification
definePageMeta({
  middleware: ['auth', 'permissions']
});

const { getAttendances } = useAttendanceApi();
const { generateAttendancesPdf } = useSecurePdf();
const toast = useToast();

const attendances = ref<Attendance[]>([]);
const isLoading = ref(false);
const pdfLoading = ref(false); // État de chargement PDF
const pdfProgress = ref(0); // Progression du téléchargement

// Données pour les charts
const entreesWeekData = ref<Array<{ date: string; count: number }>>([]);
const sortiesWeekData = ref<Array<{ date: string; count: number }>>([]);

// Grouper les attendances par date et type
const processWeekData = (attendancesList: any[]) => {
  // Map pour compter les entrées et sorties par date
  const entreesMap = new Map<string, number>();
  const sortiesMap = new Map<string, number>();
  
  attendancesList.forEach((attendance) => {
    // Extraire la date (YYYY-MM-DD) du timestamp
    const timestamp = attendance.heurePointage || attendance.createdAt;
    const date = timestamp.split('T')[0];
    
    if (attendance.type === 'ENTREE') {
      entreesMap.set(date, (entreesMap.get(date) || 0) + 1);
    } else if (attendance.type === 'SORTIE') {
      sortiesMap.set(date, (sortiesMap.get(date) || 0) + 1);
    }
  });
  
  // Convertir en tableau pour le chart
  entreesWeekData.value = Array.from(entreesMap.entries()).map(([date, count]) => ({
    date,
    count
  }));
  
  sortiesWeekData.value = Array.from(sortiesMap.entries()).map(([date, count]) => ({
    date,
    count
  }));
  
  console.log('Entrées par date:', entreesWeekData.value);
  console.log('Sorties par date:', sortiesWeekData.value);
};

// Charger les pointages au montage
const loadAttendances = async () => {
  isLoading.value = true;
  try {
    attendances.value = await getAttendances();
    
    // Traiter les données pour les charts
    processWeekData(attendances.value);
  } catch (error) {
    console.error('Erreur lors du chargement des pointages:', error);
    attendances.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Gestion du téléchargement PDF
const handleDownloadAttendancesPdf = async () => {
  try {
    pdfLoading.value = true; // Activer le loading
    pdfProgress.value = 0;
    
    // Simulation de progression
    const interval = setInterval(() => {
      if (pdfProgress.value < 90) {
        pdfProgress.value += Math.random() * 10;
      }
    }, 200);

    await generateAttendancesPdf();
    
    clearInterval(interval);
    pdfProgress.value = 100;
  } catch (error) {
    console.error('Erreur lors du téléchargement PDF pointages:', error);
    // L'erreur est déjà gérée par useSecurePdf avec des toasts
  } finally {
    setTimeout(() => {
      pdfLoading.value = false; // Désactiver le loading
      pdfProgress.value = 0;
    }, 500); // Petit délai pour voir la barre à 100%
  }
};

onMounted(() => {
  loadAttendances();
});
</script>
