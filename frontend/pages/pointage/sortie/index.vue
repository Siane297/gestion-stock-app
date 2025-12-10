<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Scanner Section -->
    <div class="max-w-2xl mx-auto">
      <QrScanner 
        type="SORTIE"
        title="Pointage Sortie"
        description="Scannez le QR code pour enregistrer une sortie"
        back-route="/pointage"
        @scan-success="handleScanSuccess"
        @scan-error="handleScanError"
      />
    </div>

    <!-- Recent Scans -->
    <div v-if="recentScans.length > 0" class="max-w-2xl mx-auto mt-8">
      <div class="bg-white rounded-xl p-6 shadow-lg">
        <div class="flex items-center gap-2 mb-4">
          <Icon icon="mdi:history" class="text-2xl text-gray-600" />
          <h3 class="text-xl font-bold text-gray-800">Derniers pointages</h3>
        </div>
        <div class="space-y-3">
          <div
            v-for="(scan, index) in recentScans"
            :key="index"
            class="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
          >
            <div class="flex items-center gap-3">
              <Icon icon="mdi:logout" class="text-2xl text-red-600" />
              <div>
                <p class="font-semibold text-gray-800">{{ scan.employeeName }}</p>
                <p class="text-sm text-gray-600">{{ scan.timestamp }}</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
              Sortie
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import AppButton from '~/components/button/AppButton.vue';
import QrScanner from '~/components/scanner/QrScanner.vue';

// Protection de la page - nécessite authentification
definePageMeta({
  middleware: 'auth'
});

interface ScanResult {
  success: boolean;
  employee?: {
    fullName: string;
    matricule: string;
    position: string;
    department: string;
  };
  timestamp?: string;
  message?: string;
}

interface RecentScan {
  employeeName: string;
  timestamp: string;
}

const recentScans = ref<RecentScan[]>([]);

const handleScanSuccess = (result: ScanResult) => {
  console.log('Scan réussi:', result);
  
  // Ajouter aux scans récents
  if (result.employee) {
    recentScans.value.unshift({
      employeeName: result.employee.fullName,
      timestamp: result.timestamp || new Date().toLocaleString('fr-FR'),
    });

    // Garder seulement les 5 derniers scans
    if (recentScans.value.length > 5) {
      recentScans.value = recentScans.value.slice(0, 5);
    }
  }
};

const handleScanError = (error: string) => {
  console.error('Erreur de scan:', error);
};
</script>
