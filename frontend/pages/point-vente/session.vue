<template>
  <div class="min-h-screen overflow-visible flex flex-col items-center  p-4 relative overflow-hidden">
    <!-- Décoration Arrière-plan -->
    <!-- <div class="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full -ml-48 -mb-48 blur-3xl"></div> -->

    <div class="w-full relative z-10" :class="step === 'select-caisse' ? 'max-w-4xl' : 'max-w-lg'">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl mb-4">
          <Icon icon="tabler:device-laptop" class="text-4xl text-primary" />
        </div>
        <h1 class="text-3xl font-bold text-noir mb-2">Session de Caisse</h1>
        <p class="text-noir/60">Sélectionnez une caisse et saisissez votre PIN pour commencer</p>
      </div>

      <!-- Étape 1 : Sélection de Caisse -->
      <div v-if="step === 'select-caisse'" class="animate-fade-in">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            v-for="caisse in caisses" 
            :key="caisse.id"
            class="caisse-card"
            :class="{ 'opacity-60 cursor-not-allowed': caisse.displayStatut === 'OCCUPEE' && !caisse.isMySession }"
            @click="(caisse.displayStatut !== 'OCCUPEE' || caisse.isMySession) ? selectCaisse(caisse) : null"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Icon icon="tabler:device-laptop" class="text-2xl text-primary" />
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-gray-800">{{ caisse.nom }}</h3>
                <div class="flex flex-col gap-0.5">
                  <p class="text-xs text-gray-500">{{ caisse.code }}</p>
                  <p v-if="caisse.occupant" class="text-[10px] font-medium text-amber-600 flex items-center gap-1">
                    <Icon icon="tabler:user" />
                    Occupée par {{ caisse.occupant }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <Badge 
                  :value="caisse.displayStatut === 'OUVERTE' ? 'Disponible' : (caisse.displayStatut === 'OCCUPEE' ? 'Occupée' : 'Fermée')" 
                  :severity="caisse.displayStatut === 'OUVERTE' ? 'success' : (caisse.displayStatut === 'OCCUPEE' ? 'warn' : 'danger')"
                />
              </div>
            </div>
          </div>
          
          <div v-if="caisses.length === 0 && !loading" class="text-center p-8 bg-white/5 rounded-3xl border border-white/10">
              <Icon icon="tabler:exclamation-circle" class="text-4xl text-white/40 mb-2 mx-auto" />
              <p class="text-white/60">Aucune caisse configurée pour votre organisation.</p>
          </div>
        </div>
      </div>

      <!-- Étape 2 : Saisie du PIN & Fond Initial -->
      <div v-else-if="step === 'pin-entry'" class="bg-white rounded-2xl border-2 border-gris/40 p-8 animate-slide-up">
         <button @click="step = 'select-caisse'" class="p-2 border-gris/40 border hover:bg-gray-100 rounded-lg transition-colors">
            <Icon icon="tabler:arrow-left" class="text-xl text-gray-600" />
          </button>
        <div class="flex items-center justify-center gap-9 mb-6">
          <div class="text-center">
            <h2 class="font-bold text-xl text-gray-800">{{ selectedCaisse?.nom }}</h2>
            <p class="text-sm text-gray-500">Ouverture de session</p>
          </div>
        </div>

        <!-- Saisie du fond initial (seulement à la première ouverture de l'étape) -->
        <div v-if="!fondInitialSaisi" class="space-y-6">
          <div class="p-4 bg-primary/5 rounded-2xl">
            <label class="block text-sm font-semibold text-primary mb-2">Fond de caisse initial</label>
            <div class="flex items-center gap-2">
              <InputGroup>
                <InputGroupAddon v-if="currentCurrency?.symbolPosition === 'before'" 
                  class="font-bold text-gray-600 bg-gray-50 border-r-0">
                  {{ currentCurrency?.symbol }}
                </InputGroupAddon>

                <InputNumber 
                  v-model="fondInitial" 
                  class="w-full text-2xl font-bold"
                  :min="0"
                  :maxFractionDigits="currencyDecimals"
                  :minFractionDigits="0"
                  autoFocus
                  @keyup.enter="fondInitialSaisi = true"
                />

                <InputGroupAddon v-if="currentCurrency?.symbolPosition !== 'before'" 
                  class="font-bold !text-gray-600 !bg-gray-50 !border-l-0">
                  {{ currentCurrency?.symbol || 'KMF' }}
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
          
          <button 
            class="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all"
            @click="fondInitialSaisi = true"
          >
            Continuer
          </button>
        </div>

        <!-- Saisie du PIN -->
        <div v-else class="space-y-6">
          <PinPad 
            ref="pinPadRef"
            :loading="loading"
            :error="error"
            @submit="handlePinSubmit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useCaisseApi } from '~/composables/api/useCaisseApi';
import { useCaisseStore } from '~/stores/caisse';
import { useCurrency } from '~/composables/useCurrency';
import { useSecureAuth } from '~/composables/useSecureAuth';
import PinPad from '~/components/pos/PinPad.vue';
import InputNumber from 'primevue/inputnumber';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Badge from 'primevue/badge';

const { currentCurrency } = useCurrency();
const { user } = useSecureAuth();
const currencyDecimals = computed(() => {
  return currentCurrency.value !== null ? currentCurrency.value.decimalPlaces : 0;
});

// Désactiver le layout normal
definePageMeta({
//   layout: false,
  middleware: ['auth']
});

const { getCaisses, ouvrirSessionParPin } = useCaisseApi();
const caisseStore = useCaisseStore();
const router = useRouter();

// État
const step = ref<'select-caisse' | 'pin-entry'>('select-caisse');
const caisses = ref<any[]>([]);
const selectedCaisse = ref<any>(null);
const fondInitial = ref(0);
const fondInitialSaisi = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const pinPadRef = ref<any>(null);

// Charger les caisses
async function loadCaisses() {
  loading.value = true;
  try {
    const data = await getCaisses();
    caisses.value = data.map((c: any) => {
      // Une caisse est OCCUPEE s'il y a une session OUVERTE
      const activeSession = c.sessions?.find((s: any) => s.statut === 'OUVERTE');
      const isMySession = activeSession?.utilisateur_id === user.value?.id;
      
      let displayStatut: 'OUVERTE' | 'OCCUPEE' | 'FERMEE' = 'FERMEE';
      if (activeSession) {
        displayStatut = 'OCCUPEE';
      } else if (c.statut === 'ACTIVE') {
        displayStatut = 'OUVERTE';
      }

      return {
        ...c,
        displayStatut,
        isMySession,
        occupant: activeSession?.utilisateur?.employee?.fullName || activeSession?.utilisateur?.email
      };
    });
  } catch (err) {
    console.error('Erreur chargement caisses:', err);
  } finally {
    loading.value = false;
  }
}

function selectCaisse(caisse: any) {
  selectedCaisse.value = caisse;
  step.value = 'pin-entry';
  // Réinitialiser l'étape PIN
  fondInitialSaisi.value = false;
  fondInitial.value = 0;
  error.value = null;
}

async function handlePinSubmit(pin: string) {
  if (!selectedCaisse.value) return;

  loading.value = true;
  error.value = null;

  try {
    const session = await ouvrirSessionParPin(selectedCaisse.value.id, {
      pin,
      fond_initial: fondInitial.value,
      notes: `Ouverture via terminal tactile le ${new Date().toLocaleString()}`
    });

    if (session) {
      // Mettre à jour le store
      caisseStore.setSession(session);
      // Rediriger vers le POS
      router.push('/point-vente');
    } else {
      error.value = "Impossible d'ouvrir la session";
    }
  } catch (err: any) {
    error.value = "Code PIN incorrect ou session déjà ouverte";
    pinPadRef.value?.reset();
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  // 1. Si une session est déjà active dans le store, rediriger directement
  if (caisseStore.hasActiveSession) {
    router.push('/point-vente');
    return;
  }

  // 2. Vérifier si l'utilisateur a une session active sur le serveur (cas du refresh)
  try {
    const { getMaSession } = useCaisseApi();
    const mySession = await getMaSession();
    if (mySession) {
      caisseStore.setSession(mySession);
      router.push('/point-vente');
      return;
    }
  } catch (e) {
    console.warn("Erreur vérification session active au démarrage", e);
  }

  // 3. Sinon charger la liste
  loadCaisses();
});
</script>

<style scoped>
.caisse-card {
  background-color: #ffffff;
  border-radius: 1.5rem;
  padding: 1.25rem;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.caisse-card:hover {
  border-color: rgba(13, 148, 136, 0.3);
  box-shadow: 0 10px 15px -3px rgba(13, 148, 136, 0.1);
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
