<template>
  <div class="space-y-6">
    <!-- Header -->
    <BannerHeader3D
      :title="title"
      :description="description"
      title-class="text-3xl md:text-4xl"
    />
    <!-- Scanner Container - Affiché seulement quand il n'y a pas de résultat -->
    <div v-if="!localScanResult" class="bg-white p-6 rounded-lg">
      <div class="bg-gray-900 rounded-lg">
        <!-- Loading State -->
        <div v-if="isProcessing" class="flex flex-col items-center justify-center py-16">
          <i class="pi pi-spin pi-spinner text-6xl text-white mb-6"></i>
          <p class="text-white text-xl font-medium animate-pulse">Traitement du QR code...</p>
        </div>

        <div v-else-if="!isScanning" class="flex flex-col items-center py-12">
          <Icon icon="lucide:scan-qr-code" class="text-6xl text-gray-400 mb-4" />
          <p class="text-gray-400 text-center mb-6">
           "Commencer le scan par votre Badge" 
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
             <AppButton label="Commencer le scan" icon-left="pi pi-camera" @click="startScanning" variant="success"
              size="md" />
            <AppButton label="Retour" icon-left="pi pi-arrow-left" @click="handleBack" variant="outline" size="md"
              class="text-white" />
           
          </div>
        </div>
        <div v-else>
          <div id="qr-reader" class="w-full overflow-hidden rounded-t-lg" style="max-height: 450px;"></div>
          <div class="p-4 flex flex-col sm:flex-row gap-3 justify-center bg-gray-900 rounded-b-lg">
            <AppButton 
              v-if="cameras.length > 1" 
              label="Changer de caméra" 
              icon-left="pi pi-replay" 
              @click="switchCamera" 
              variant="outline" 
              size="md"
              class="text-white"
            />
            <AppButton label="Arrêter le scan" icon-left="pi pi-times" @click="stopScanning" variant="danger" size="md" />
          </div>
        </div>
      </div>
    </div>

    <!-- Scan Result -->
    <div v-if="localScanResult" class="space-y-4">
      <div :class="[
        'p-6 rounded-lg border-2',
        localScanResult.success
          ? 'bg-green-50 border-green-500'
          : 'bg-red-50 border-red-500'
      ]">
        <div class="flex items-start gap-4">
          <Icon :icon="localScanResult.success ? 'mdi:check-circle' : 'mdi:close-circle'" :class="[
            'text-4xl',
            localScanResult.success ? 'text-green-600' : 'text-red-600'
          ]" />
          <div class="flex-1">
            <h3 :class="[
              'text-xl font-bold mb-2',
              localScanResult.success ? 'text-green-800' : 'text-red-800'
            ]">
              {{ localScanResult.success ? 'Pointage réussi !' : 'Erreur de pointage' }}
            </h3>

            <div v-if="localScanResult.success" class="space-y-2 text-gray-700">
              <p><strong>Nom:</strong> {{ localScanResult.employee?.fullName }}</p>
              <p><strong>Matricule:</strong> {{ localScanResult.employee?.matricule }}</p>
              <p><strong>Poste:</strong> {{ localScanResult.employee?.position }}</p>
              <p><strong>Département:</strong> {{ localScanResult.employee?.department }}</p>
              <p><strong>Type: </strong>
                <span :class="type === 'ENTREE' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                  {{ type === 'ENTREE' ? 'Entrée' : 'Sortie' }}
                </span>
              </p>
              <p><strong>Heure:</strong> {{ localScanResult.timestamp }}</p>
            </div>

            <p v-else class="text-red-700">
              {{ localScanResult.message }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex gap-4">
        <AppButton label="Scanner un autre QR code" icon-left="pi pi-camera" @click="resetScan" variant="primary"
          size="md" full-width />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Html5Qrcode, Html5QrcodeScanType } from 'html5-qrcode';
import { Icon } from '@iconify/vue';
import AppButton from '~/components/button/AppButton.vue';
import BannerHeader3D from '~/components/banner/BannerHeader3D.vue';
import { useToast } from 'primevue/usetoast';

interface Employee {
  fullName: string;
  matricule: string;
  position: string;
  department: string;
}

interface ScanResult {
  success: boolean;
  employee?: Employee;
  timestamp?: string;
  message?: string;
}

interface Props {
  type: 'ENTREE' | 'SORTIE';
  title: string;
  description: string;
  backRoute?: string;
}

const props = withDefaults(defineProps<Props>(), {
  backRoute: '/pointage'
});
const emit = defineEmits<{
  scanSuccess: [result: ScanResult];
  scanError: [error: string];
}>();

const toast = useToast();
const isScanning = ref(false);
const isProcessing = ref(false);
const localScanResult = ref<ScanResult | null>(null);
const cameras = ref<any[]>([]);
const currentCameraIndex = ref(0);
const currentFacingMode = ref<'environment' | 'user'>('environment');

let html5QrCode: Html5Qrcode | null = null;

// Fonction pour gérer le retour
const handleBack = () => {
  navigateTo(props.backRoute);
};

// Demander explicitement les permissions de caméra
const requestCameraPermission = async (): Promise<boolean> => {
  try {
    // Demander directement l'accès à la caméra via getUserMedia
    // Cela va automatiquement déclencher la popup de permission du navigateur
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: currentFacingMode.value,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    // Arrêter le stream une fois la permission obtenue
    stream.getTracks().forEach(track => track.stop());

    console.log('✅ Permission caméra accordée');
    return true;
  } catch (err) {
    console.error('Erreur lors de la demande de permission:', err);

    // Messages d'erreur plus spécifiques
    if (err instanceof Error) {
      let errorMessage = 'Erreur lors de l\'accès à la caméra';

      if (err.name === 'NotAllowedError') {
        errorMessage = 'Accès à la caméra refusé par l\'utilisateur. Veuillez cliquer sur "Autoriser" dans la popup de votre navigateur pour scanner les QR codes.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra détectée sur cet appareil. Vérifiez qu\'une caméra est connectée.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Votre navigateur ne supporte pas l\'accès à la caméra. Utilisez un navigateur moderne (Chrome, Firefox, Safari).';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'La caméra est déjà utilisée par une autre application. Fermez les autres applications utilisant la caméra.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Impossible de trouver une caméra correspondant aux contraintes demandées.';
      }

      toast.add({
        severity: 'error',
        summary: 'Erreur caméra',
        detail: errorMessage,
        life: 7000,
      });
    }

    return false;
  }
};

// Fonction pour vérifier les permissions sans démarrer le scan
const checkCameraPermission = async () => {
  const hasPermission = await requestCameraPermission();
  if (hasPermission) {
    toast.add({
      severity: 'success',
      summary: 'Accès autorisé',
      detail: '✅ Accès à la caméra autorisé ! Vous pouvez maintenant scanner les QR codes.',
      life: 3000,
    });
  }
};

// Obtenir la liste des caméras disponibles
const getCameras = async () => {
  try {
    const devices = await Html5Qrcode.getCameras();
    cameras.value = devices;
    console.log('Caméras disponibles:', devices);
  } catch (err) {
    console.error('Erreur lors de la récupération des caméras:', err);
  }
};


const startScanning = async () => {
  try {
    // Vérifier le contexte sécurisé (HTTPS ou localhost requis pour l'accès caméra)
    if (!window.isSecureContext) {
      toast.add({
        severity: 'error',
        summary: 'Contexte non sécurisé',
        detail: 'L\'accès à la caméra nécessite un contexte sécurisé (HTTPS ou localhost). Veuillez utiliser HTTPS.',
        life: 7000,
      });
      return;
    }

    // Vérifier la disponibilité de getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.add({
        severity: 'error',
        summary: 'API non disponible',
        detail: 'Votre navigateur ne supporte pas l\'accès à la caméra. Utilisez un navigateur moderne.',
        life: 7000,
      });
      return;
    }

    // Demander les permissions avant de commencer
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }

    // Obtenir la liste des caméras
    await getCameras();

    isScanning.value = true;

    // Attendre que Vue ait rendu l'élément qr-reader
    await nextTick();

    // Vérifier que l'élément existe avant de continuer
    const qrReaderElement = document.getElementById('qr-reader');
    if (!qrReaderElement) {
      throw new Error('Élément qr-reader non trouvé dans le DOM');
    }

    html5QrCode = new Html5Qrcode('qr-reader');

    const config = {
      fps: 30,
      qrbox: function (viewfinderWidth: number, viewfinderHeight: number) {
        const minEdgePercentage = 0.8;
        const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
        return {
          width: qrboxSize,
          height: qrboxSize
        };
      },
      aspectRatio: 1.0,
      disableFlip: false,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    };

    // Utiliser facingMode ou deviceId selon les caméras disponibles
    let cameraConstraints: any;
    if (cameras.value.length > 0) {
      cameraConstraints = cameras.value[currentCameraIndex.value].id;
    } else {
      cameraConstraints = {
        facingMode: currentFacingMode.value
      };
    }

    await html5QrCode.start(
      cameraConstraints,
      config,
      onScanSuccess,
      onScanFailure
    );
  } catch (err) {
    console.error('Erreur lors du démarrage du scan:', err);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de démarrer le scanner. Veuillez réessayer.',
      life: 3000,
    });
    isScanning.value = false;
  }
};

// Fonction pour changer de caméra
const switchCamera = async () => {
  try {
    // Arrêter le scan actuel
    if (html5QrCode) {
      await html5QrCode.stop();
    }

    // Passer à la caméra suivante
    if (cameras.value.length > 1) {
      currentCameraIndex.value = (currentCameraIndex.value + 1) % cameras.value.length;
    } else {
      // Si pas de liste de caméras, alterner entre front et back
      currentFacingMode.value = currentFacingMode.value === 'environment' ? 'user' : 'environment';
    }

    // Redémarrer le scan avec la nouvelle caméra
    const config = {
      fps: 30,
      qrbox: function (viewfinderWidth: number, viewfinderHeight: number) {
        const minEdgePercentage = 0.8;
        const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
        return {
          width: qrboxSize,
          height: qrboxSize
        };
      },
      aspectRatio: 1.0,
      disableFlip: false,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    };

    let cameraConstraints: any;
    if (cameras.value.length > 0) {
      cameraConstraints = cameras.value[currentCameraIndex.value].id;
    } else {
      cameraConstraints = {
        facingMode: currentFacingMode.value
      };
    }

    await html5QrCode!.start(
      cameraConstraints,
      config,
      onScanSuccess,
      onScanFailure
    );

    toast.add({
      severity: 'info',
      summary: 'Caméra changée',
      detail: cameras.value.length > 0 
        ? `Caméra ${currentCameraIndex.value + 1}/${cameras.value.length}` 
        : currentFacingMode.value === 'environment' ? 'Caméra arrière' : 'Caméra avant',
      life: 2000,
    });
  } catch (err) {
    console.error('Erreur lors du changement de caméra:', err);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de changer de caméra.',
      life: 3000,
    });
  }
};

const stopScanning = async () => {
  if (html5QrCode) {
    try {
      await html5QrCode.stop();
      html5QrCode.clear();
    } catch (err) {
      console.error('Erreur lors de l\'arrêt du scan:', err);
    }
  }
  isScanning.value = false;
};

const onScanSuccess = async (decodedText: string) => {
  // Activer l'état de chargement
  isProcessing.value = true;
  
  await stopScanning();

  let attendance: any = null; // Déclarer ici pour être accessible dans le catch

  try {
    let qrCode: string;
    let qrData: any = {};

    // Essayer de parser en JSON d'abord
    try {
      qrData = JSON.parse(decodedText);
      qrCode = qrData.qrCode || decodedText;
    } catch {
      // Si ce n'est pas du JSON, c'est probablement le qrCode directement
      qrCode = decodedText.trim();
    }

    if (!qrCode) {
      throw new Error('QR code invalide : code manquant');
    }

    // Importer l'API
    const { scanAttendance } = await import('~/composables/api/useAttendanceApi').then(m => m.useAttendanceApi());

    // Enregistrer le pointage via l'API backend
    attendance = await scanAttendance({
      qrCode: qrCode,
      type: props.type,
    });

    console.log('Pointage enregistré:', attendance);

    // Formater le timestamp
    const timestamp = new Date(attendance.createdAt).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Afficher le résultat
    const result: ScanResult = {
      success: true,
      employee: {
        fullName: attendance.employee?.fullName || qrData.fullName,
        matricule: attendance.employee?.matricule || qrData.matricule,
        position: qrData.position,
        department: attendance.employee?.department || qrData.department,
      },
      timestamp
    };

    localScanResult.value = result;
    emit('scanSuccess', result);

    toast.add({
      severity: 'success',
      summary: 'Pointage réussi !',
      detail: `${result.employee?.fullName} - ${props.type === 'ENTREE' ? 'Entrée' : 'Sortie'}`,
      life: 3000,
    });

  } catch (error: any) {
    console.error('Erreur lors du traitement du QR code:', error);
    
    let errorMessage = 'QR code invalide ou non reconnu';
    let errorSummary = 'Erreur de pointage';
    
    // Gérer les messages d'erreur spécifiques
    if (error.message || error.data?.message) {
      const backendMessage = error.data?.message || error.message;
      
      // Cas 1: Pointage déjà existant pour ce type aujourd'hui
      if (backendMessage.includes('déjà été enregistré')) {
        // Extraire le nom de l'employé si disponible
        const employeeName = attendance?.employee?.fullName || 'cet employé';
        errorMessage = `Un pointage de type ${props.type} a déjà été enregistré aujourd'hui pour ${employeeName}`;
        errorSummary = 'Pointage déjà existant';
      }
      // Cas 2: QR code invalide (employé non trouvé)
      else if (backendMessage.includes('QR code invalide') || backendMessage.includes('non trouvé')) {
        errorMessage = 'Ce QR code ne correspond à aucun employé. Veuillez vérifier le code scanné.';
        errorSummary = 'QR code invalide';
      }
      // Cas 3: Aucune configuration horaire active
      else if (backendMessage.includes('configuration') || backendMessage.includes('horaire')) {
        errorMessage = 'Aucune configuration horaire active. Veuillez enregistrer la configuration horaire avant de pouvoir scanner les QR codes.';
        errorSummary = 'Configuration manquante';
      }
      // Autres erreurs
      else {
        errorMessage = backendMessage;
      }
    }
    
    const errorResult: ScanResult = {
      success: false,
      message: errorMessage
    };

    localScanResult.value = errorResult;
    emit('scanError', errorResult.message || 'Erreur inconnue');

    toast.add({
      severity: 'error',
      summary: errorSummary,
      detail: errorMessage,
      life: 5000,
    });
  } finally {
    // Désactiver l'état de chargement
    isProcessing.value = false;
  }
};

const onScanFailure = (error: string) => {
  // Ignorer les erreurs de scan normales (pas de QR code détecté)
};

const resetScan = () => {
  localScanResult.value = null;
};

// Nettoyer lors de la destruction du composant
onUnmounted(() => {
  if (html5QrCode && isScanning.value) {
    stopScanning();
  }
});
</script>
