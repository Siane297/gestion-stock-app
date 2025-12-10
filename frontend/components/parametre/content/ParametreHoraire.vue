<template>
  <div class="space-y-6">
    <!-- Toast pour les notifications -->
    <Toast />

    <!-- Bannière en haut (100% largeur) -->
    <BannerHeader
      title="Configuration des horaires de travail"
      description="Définissez les horaires de travail, pauses et tolérances pour le système de pointage"
    />

    <!-- Grid 2 colonnes : Formulaire à gauche, Configuration active à droite -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Formulaire de configuration horaire (à gauche) -->
      <div class="space-y-4">
        <FormulaireDynamique
          ref="formRef"
          title="Enregistrement"
          description=""
          :fields="configurationFields"
          :loading="loading"
          submit-label="Enregistrer la configuration"
          :show-cancel-button="false"
          :show-header="false"
          @submit="handleSubmit"
        />
      </div>

      <!-- Section de la configuration (active ou dernière créée) (à droite) -->
      <div class="bg-white rounded-lg  border-2 border-gris/40 p-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">
          Configuration enregistrée
        </h3>
        
        <div v-if="isLoading" class="flex justify-center py-12">
          <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-primary" />
        </div>
        
        <div v-else-if="activeConfig" class="space-y-4">
          <!-- Toggle pour activer/désactiver la configuration -->
          <div class="flex items-center justify-between p-3 rounded-lg" :class="activeConfig.isActive ? 'bg-green-50 border border-green-200' : 'bg-gray-100 border border-gray-200'">
            <div>
              <p class="font-medium" :class="activeConfig.isActive ? 'text-green-800' : 'text-gray-600'">
                {{ activeConfig.isActive ? 'Configuration activée' : 'Configuration désactivée' }}
              </p>
              <p class="text-xs" :class="activeConfig.isActive ? 'text-green-600' : 'text-gray-500'">
                {{ activeConfig.isActive ? 'Le système de pointage utilise cette configuration' : 'Activer la configuration pour la prise en compte des pointages' }}
              </p>
            </div>
            <ToggleSwitch 
              v-model="activeConfig.isActive" 
              :disabled="isTogglingActive"
              @update:modelValue="handleToggleActive"
            />
          </div>

          <div class="space-y-3">
            <div class="p-3 bg-bleu/50 rounded-lg">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Heure de début</p>
              <p class="font-semibold text-lg">{{ activeConfig.heureDebut }}</p>
            </div>
            
            <div class="p-3 bg-bleu/50 rounded-lg">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Heure de fin</p>
              <p class="font-semibold text-lg">{{ activeConfig.heureFin }}</p>
            </div>
            
            <div class="p-3 bg-bleu/50 rounded-lg">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Pause</p>
              <p v-if="activeConfig.heureDebutPause && activeConfig.heureFinPause" class="font-semibold text-lg">
                {{ activeConfig.heureDebutPause }} - {{ activeConfig.heureFinPause }}
              </p>
              <p v-else class="text-gray-400 text-sm">Non configurée</p>
            </div>
            
            <div class="p-3 bg-bleu/50 rounded-lg">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Tolérance retard</p>
              <p class="font-semibold text-lg">{{ activeConfig.toleranceRetardMinutes }} min</p>
            </div>
          </div>
          
          <div v-if="activeConfig.description" class="mt-4 p-4 bg-blue-50 border-l-4 border-primary rounded">
            <p class="text-sm text-gray-700">
              {{ activeConfig.description }}
            </p>
          </div>
        </div>
        
        <div v-else class="text-center py-12 text-gray-500">
          <p class="font-medium text-gray-600">Aucune configuration enregistrée</p>
          <p class="text-sm mt-1">Veuillez créer une configuration à gauche</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import Toast from 'primevue/toast';
import ToggleSwitch from 'primevue/toggleswitch';
import { useToast } from 'primevue/usetoast';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import BannerHeader from '~/components/banner/BannerHeader.vue';
import { useConfigurationHoraireApi } from '~/composables/api/useConfigurationHoraireApi';
import type { ConfigurationHoraire } from '~/composables/api/useConfigurationHoraireApi';

// Références et état
const formRef = ref<InstanceType<typeof FormulaireDynamique> | null>(null);
const toast = useToast();
const loading = ref(false); // Pour la soumission du formulaire
const isLoading = ref(true); // Pour le chargement initial
const isTogglingActive = ref(false); // Pour l'animation du toggle
const activeConfig = ref<ConfigurationHoraire | null>(null);

// API
const { createConfiguration, getAllConfigurations, updateConfiguration } = useConfigurationHoraireApi();

// Définition des champs du formulaire
const configurationFields = [
  {
    name: 'heureDebut',
    label: 'Heure de début',
    type: 'time' as const,
    placeholder: '08:00',
    required: true
  },
  {
    name: 'heureFin',
    label: 'Heure de fin',
    type: 'time' as const,
    placeholder: '17:00',
    required: true
  },
  {
    name: 'heureDebutPause',
    label: 'Heure de début de pause',
    type: 'time' as const,
    placeholder: '12:00',
    required: false
  },
  {
    name: 'heureFinPause',
    label: 'Heure de fin de pause',
    type: 'time' as const,
    placeholder: '13:00',
    required: false
  },
  {
    name: 'toleranceRetardMinutes',
    label: 'Tolérance retard (minutes)',
    type: 'number' as const,
    placeholder: '15',
    required: false,
    min: 0,
    max: 60
  }
];

// Charger la dernière configuration au montage
onMounted(async () => {
  await loadLatestConfiguration();
});

const loadLatestConfiguration = async () => {
  isLoading.value = true;
  try {
    // Récupérer toutes les configurations (triées par date de création desc)
    const configs = await getAllConfigurations();
    // Prendre la première (la plus récente) ou null si aucune
    activeConfig.value = configs[0] ?? null;
  } catch (error: any) {
    console.error('Erreur lors du chargement des configurations:', error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Impossible de charger les configurations',
      life: 3000
    });
    activeConfig.value = null;
  } finally {
    isLoading.value = false;
  }
};

// Helper pour formater l'heure en HH:mm
const formatTime = (time: Date | string): string => {
  if (!time) return '';
  
  // Si c'est déjà une chaîne, la retourner
  if (typeof time === 'string') return time;
  
  // Si c'est un objet Date, le formater
  if (time instanceof Date) {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  return '';
};

// Gestion de la soumission du formulaire
const handleSubmit = async (data: Record<string, any>) => {
  loading.value = true;

  try {
    // Créer la configuration avec conversion des heures (non activée par défaut)
    const result = await createConfiguration({
      heureDebut: formatTime(data.heureDebut),
      heureFin: formatTime(data.heureFin),
      heureDebutPause: data.heureDebutPause ? formatTime(data.heureDebutPause) : undefined,
      heureFinPause: data.heureFinPause ? formatTime(data.heureFinPause) : undefined,
      // Convertir en nombre ou utiliser 0 par défaut si vide/null
      toleranceRetardMinutes: data.toleranceRetardMinutes ? parseInt(String(data.toleranceRetardMinutes), 10) : 0,
      description: data.description || undefined,
      isActive: false // La config n'est pas activée par défaut
    });

    console.log('Configuration créée:', result);

    // Réinitialiser le formulaire
    formRef.value?.resetForm();

    // Recharger la dernière configuration
    await loadLatestConfiguration();

    // Afficher le toast de succès
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Configuration horaire enregistrée. Activez-la pour la prise en compte des pointages.',
      life: 4000
    });

  } catch (error: any) {
    console.error('Erreur lors de l\'enregistrement:', error);
    
    // Afficher le toast d'erreur
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

// Gestion du toggle d'activation/désactivation de la config existante
const handleToggleActive = async (value: boolean) => {
  if (!activeConfig.value) return;
  
  isTogglingActive.value = true;
  
  try {
    await updateConfiguration(activeConfig.value.id, { isActive: value });
    toast.add({
      severity: value ? 'success' : 'info',
      summary: value ? 'Configuration activée' : 'Configuration désactivée',
      detail: value 
        ? 'Le système de pointage utilisera cette configuration' 
        : 'Le système de pointage ne marquera pas d\'absences',
      life: 3000
    });
  } catch (error: any) {
    // Revenir à l'état précédent en cas d'erreur
    activeConfig.value.isActive = !value;
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Impossible de modifier l\'état de la configuration',
      life: 3000
    });
  } finally {
    isTogglingActive.value = false;
  }
};
</script>
