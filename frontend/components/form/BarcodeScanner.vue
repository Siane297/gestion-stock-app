<template>
  <Dialog
    v-model:visible="visible"
    header="Scanner un Code-barres"
    :modal="true"
    :closable="true"
    :dismissableMask="true"
    class="w-full max-w-lg"
    @hide="visible = false"
  >
    <div class="flex flex-col items-center gap-4">
      <div 
        id="qr-reader" 
        class="w-full overflow-hidden rounded-lg border-2 border-primary/20 bg-gray-50"
      ></div>
      
      <div v-if="error" class="text-red-500 text-sm bg-red-50 p-3 rounded-lg w-full flex items-center gap-2">
        <i class="pi pi-exclamation-triangle"></i>
        {{ error }}
      </div>

      <div class="flex justify-center w-full gap-3">
        <AppButton 
          label="Annuler" 
          icon="pi pi-times" 
          variant="outline" 
          @click="visible = false" 
        />
        <AppButton 
          v-if="hasMultipleCameras"
          label="Changer de caméra" 
          icon="pi pi-sync" 
          variant="secondary" 
          @click="switchCamera" 
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import Dialog from 'primevue/dialog';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import AppButton from '~/components/button/AppButton.vue';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  autoClose?: boolean;
}>(), {
  autoClose: true
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'scan': [decodedText: string];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const error = ref<string | null>(null);
const html5QrCode = ref<Html5Qrcode | null>(null);
const hasMultipleCameras = ref(false);
const currentCameraIndex = ref(0);
const cameras = ref<any[]>([]);
const isTransitioning = ref(false);

const stopScanner = async () => {
  if (isTransitioning.value) return;
  if (html5QrCode.value && html5QrCode.value.isScanning) {
    isTransitioning.value = true;
    try {
      await html5QrCode.value.stop();
    } catch (err) {
      console.error("Failed to stop scanner", err);
    } finally {
      isTransitioning.value = false;
    }
  }
};

const startScanner = async () => {
  if (isTransitioning.value) return;
  error.value = null;
  
  // Wait for next tick to ensure DOM is ready
  await nextTick();
  isTransitioning.value = true;
  
  try {
    const devices = await Html5Qrcode.getCameras();
    if (devices && devices.length > 0) {
      cameras.value = devices;
      hasMultipleCameras.value = devices.length > 1;
      
      if (!html5QrCode.value) {
        html5QrCode.value = new Html5Qrcode("qr-reader", {
          verbose: false,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.ITF,
          ]
        });
      }
      const cameraConfig = cameras.value[currentCameraIndex.value]?.id || { facingMode: "environment" };

      await html5QrCode.value.start(
        cameraConfig,
        {
          fps: 20,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // Favorise les codes barres 1D (plus larges que hauts)
            const width = Math.min(viewfinderWidth * 0.8, 400);
            const height = Math.min(viewfinderHeight * 0.4, 200);
            return { width, height };
          },
          videoConstraints: {
            facingMode: "environment",
            // @ts-ignore
            advanced: [
              { focusMode: "continuous" } as any,
              { focusDistance: 0.15 } as any
            ]
          },
          // Experimental: Utiliser l'API native du navigateur si disponible (plus rapide)
          //@ts-ignore
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        },
        (decodedText) => {
          emit('scan', decodedText);
          if (props.autoClose) {
            visible.value = false;
          }
        },
        (errorMessage) => {
          // Silent failure
        }
      );
    } else {
      error.value = "Aucune caméra détectée.";
    }
  } catch (err: any) {
    console.error("Error starting scanner", err);
    error.value = "Erreur d'accès à la caméra. Vérifiez les permissions.";
  } finally {
    isTransitioning.value = false;
  }
};

const switchCamera = async () => {
  await stopScanner();
  currentCameraIndex.value = (currentCameraIndex.value + 1) % cameras.value.length;
  await startScanner();
};

watch(visible, (newVal) => {
  if (newVal) {
    startScanner();
  } else {
    stopScanner();
  }
});

onBeforeUnmount(() => {
  stopScanner();
});
</script>

<style scoped>
#qr-reader {
  width: 100%;
  min-height: 250px;
}

#qr-reader :deep(video) {
  width: 100% !important;
  border-radius: 0.5rem;
  object-fit: cover;
}
</style>
