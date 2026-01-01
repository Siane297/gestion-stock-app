<template>
  <div class="min-h-screen flex flex-col items-center  p-4 relative overflow-hidden">
    <!-- Décoration Arrière-plan -->
    <!-- <div class="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full -ml-48 -mb-48 blur-3xl"></div> -->

    <div class="w-full relative z-10" :class="step === 'select-caisse' ? 'max-w-4xl' : 'max-w-lg'">
      <!-- Header -->
      <div v-if="caisses.length > 0 || loading" class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary shadow-sm mb-4">
          <Icon icon="tabler:cash-register" class="text-4xl text-white" />
        </div>
        <h1 class="text-3xl font-bold text-noir mb-2">Session de Caisse</h1>
        <p class="text-noir/60 mb-6">Sélectionnez une caisse et saisissez votre PIN pour commencer</p>

        <!-- Sélecteur de Boutique (Admin/Manager) -->
        <div v-if="(user?.role === 'ADMIN' || user?.role === 'MANAGER') && step === 'select-caisse'"
          class="flex justify-center mb-4">
          <MagasinSelector 
            v-model="selectedMagasinId" 
            :options="magasins" 
            placeholder="Toutes les boutiques"
            @change="loadCaisses"
          />
        </div>
      </div>

      <!-- Étape 1 : Sélection de Caisse -->
      <div v-if="step === 'select-caisse'" class="animate-fade-in">
        <!-- Grille des caisses -->
        <div v-if="caisses.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CaisseCard v-for="caisse in caisses" :key="caisse.id" :caisse="caisse" @select="selectCaisse" />
        </div>

        <!-- État Vide -->
        <div v-else-if="!loading"
          class="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-2 border-gris/40  animate-fade-in max-w-2xl mx-auto w-full">
          <img src="~/assets/images/caisse.png" alt="Aucune caisse" class="w-64 h-auto mb-2 drop-shadow-xl" />
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Prêt à encaisser ?</h2>
          <p class="text-gray-500 text-center max-w-sm mb-8 leading-relaxed">
            Aucune caisse n'est configurée pour votre organisation. Créez votre premier terminal de vente pour commencer
            à
            servir vos clients.
          </p>
          <AppButton label="Configurer mes caisses" icon="pi pi-cog" variant="primary" size="sm"
            class="w-full sm:w-auto" @click="router.push('/caisse')" />
        </div>
      </div>

      <!-- Étape 2 : Saisie du PIN & Fond Initial -->
      <div v-else-if="step === 'pin-entry'" class="bg-white rounded-2xl border-2 border-gris/40 p-8 animate-slide-up">
        <button @click="step = 'select-caisse'"
          class="p-2 border-gris/40 border hover:bg-gray-100 rounded-lg transition-colors">
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

                <InputNumber v-model="fondInitial" class="w-full text-2xl font-bold" :min="0"
                  :maxFractionDigits="currencyDecimals" :minFractionDigits="0" autoFocus
                  @keyup.enter="fondInitialSaisi = true" />

                <InputGroupAddon v-if="currentCurrency?.symbolPosition !== 'before'"
                  class="font-bold !text-gray-600 !bg-gray-50 !border-l-0">
                  {{ currentCurrency?.symbol || 'KMF' }}
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>

          <AppButton label="Continuer" variant="primary" iconRight="pi pi-arrow-right" size="md" full-width :loading="loading"
            @click="fondInitialSaisi = true" class="" />
        </div>

        <!-- Saisie du PIN -->
        <div v-else class="space-y-6">
          <!-- État de transition pour Admin (Automatique) -->
          <template v-if="isAdminUser && !error">
            <div class="flex flex-col items-center py-8 gap-4 animate-fade-in">
              <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon icon="tabler:shield-check" class="text-4xl text-primary animate-bounce" />
              </div>
              <div class="text-center">
                <p class="font-bold text-gray-800">Accès Administrateur</p>
                <p class="text-sm text-gray-500">Ouverture de session en cours...</p>
              </div>
            </div>
          </template>

          <template v-else>
            <PinPad ref="pinPadRef" :loading="loading" :error="error" @submit="handlePinSubmit" />
            
            <!-- Bouton Accès Admin (Fallback si erreur ou manuel) -->
            <div v-if="isAdminUser" class="pt-4 border-t">
              <AppButton label="Réessayer l'accès Admin" variant="outline" icon="pi pi-shield" full-width size="md" :loading="loading"
                @click="handleAdminBypass" class=" !bg-orange-500 border-none text-white transition-all hover:scale-[1.02]" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useCaisseApi } from '~/composables/api/useCaisseApi';
import { useCaisseStore } from '~/stores/caisse';
import { useCurrency } from '~/composables/useCurrency';
import { useSecureAuth } from '~/composables/useSecureAuth';
import PinPad from '~/components/pos/PinPad.vue';
import CaisseCard from '~/components/caisse/CaisseCard.vue';
import MagasinSelector from '~/components/magasin/MagasinSelector.vue';
import InputNumber from 'primevue/inputnumber';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Badge from 'primevue/badge';
import Select from 'primevue/select';
import { useMagasinApi } from '~/composables/api/useMagasinApi';
import { useMagasinStore } from '~/stores/magasin';
import AppButton from '~/components/button/AppButton.vue';
import { useGlobalLoading } from '~/composables/useGlobalLoading';
const { currentCurrency } = useCurrency();
const { user } = useSecureAuth();
const magasinStore = useMagasinStore();

const currencyDecimals = computed(() => {
  return currentCurrency.value !== null ? currentCurrency.value.decimalPlaces : 0;
});

// Désactiver le layout normal
definePageMeta({
  middleware: ['auth', 'permissions'],
  permission: 'ventes:creer',
  hideBreadcrumb: true
});

const { getCaisses, ouvrirSessionParPin, ouvrirSession } = useCaisseApi();
const caisseStore = useCaisseStore();
const router = useRouter();
const { startLoading, stopLoading } = useGlobalLoading();

// État
const step = ref<'select-caisse' | 'pin-entry'>('select-caisse');
const caisses = ref<any[]>([]);
const selectedCaisse = ref<any>(null);
const fondInitial = ref(0);
const fondInitialSaisi = ref(false);
const loading = ref(true);
const error = ref<string | null>(null);
const pinPadRef = ref<any>(null);

// Multi-Boutique
const { getMagasins } = useMagasinApi();
const magasins = ref<any[]>([]);
// Initialiser avec le magasin courant du store (choisi dans la sidebar) ou celui de l'utilisateur
const selectedMagasinId = ref<string | null>(magasinStore.currentMagasinId || user.value?.magasin_id || null);

// Vérifier si l'utilisateur est Admin (peut bypasser le PIN)
const isAdminUser = computed(() => {
  const role = user.value?.role;
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
});

// Accès Admin sans PIN (utilise le JWT pour l'identification)
async function handleAdminBypass() {
  if (!selectedCaisse.value) return;

  loading.value = true;
  error.value = null;

  try {
    // Vérifier si la caisse a déjà une session active (mode reprise ou nouvelle)
    const activeSession = (selectedCaisse.value as any).sessions?.find((s: any) => s.statut === 'OUVERTE');

    // Utiliser ouvrirSession qui utilise le JWT (pas le PIN)
    const session = await ouvrirSession(selectedCaisse.value.id, {
      fond_initial: activeSession ? activeSession.fond_initial : fondInitial.value,
      notes: activeSession
        ? `Reprise Admin (sans PIN) via terminal tactile le ${new Date().toLocaleString()}`
        : `Ouverture Admin (sans PIN) via terminal tactile le ${new Date().toLocaleString()}`
    });

    if (session) {
      caisseStore.setSession(session);
      router.push('/point-vente');
    } else {
      error.value = "Impossible d'ouvrir la session";
    }
  } catch (err: any) {
    if (err.message?.includes('occupée') || err.message?.includes('déjà ouverte')) {
      error.value = "Cette caisse est occupée par un autre utilisateur";
    } else {
      error.value = err.message || "Erreur lors de l'ouverture de session";
    }
  } finally {
    loading.value = false;
  }
}

// Charger les caisses
async function loadCaisses() {
  loading.value = true;
  startLoading();
  try {
    // Si c'est un admin ou manager, on utilise selectedMagasinId (qui peut être null pour "Tout")
    // Sinon on utilise obligatoirement le magasin_id de l'utilisateur
    const filterId = (user.value?.role === 'ADMIN' || user.value?.role === 'MANAGER')
      ? (selectedMagasinId.value || undefined)
      : (user.value?.magasin_id || undefined);

    const data = await getCaisses(filterId);
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
    stopLoading();
  }
}

function selectCaisse(caisse: any) {
  selectedCaisse.value = caisse;

  // Si la caisse a déjà une session active, on va reprendre cette session
  const activeSession = caisse.sessions?.find((s: any) => s.statut === 'OUVERTE');
  if (activeSession) {
    // Mode reprise de session : on saute l'étape du fond initial
    fondInitialSaisi.value = true;
  } else {
    // Nouvelle session : demander le fond initial
    fondInitialSaisi.value = false;
    fondInitial.value = 0;
  }

  step.value = 'pin-entry';
  error.value = null;
}

async function handlePinSubmit(pin: string) {
  if (!selectedCaisse.value) return;

  loading.value = true;
  error.value = null;

  try {
    // Vérifier si la caisse a déjà une session active (mode reprise ou nouvelle)
    const activeSession = (selectedCaisse.value as any).sessions?.find((s: any) => s.statut === 'OUVERTE');

    // Le backend gère les deux cas :
    // - Nouvelle session : crée et retourne la session
    // - Reprise : si même utilisateur (PIN), retourne la session existante
    const session = await ouvrirSessionParPin(selectedCaisse.value.id, {
      pin,
      fond_initial: activeSession ? activeSession.fond_initial : fondInitial.value,
      notes: activeSession
        ? `Reprise via terminal tactile le ${new Date().toLocaleString()}`
        : `Ouverture via terminal tactile le ${new Date().toLocaleString()}`
    });

    if (session) {
      caisseStore.setSession(session);
      router.push('/point-vente');
    } else {
      error.value = "Impossible d'ouvrir la session";
    }
  } catch (err: any) {
    // Extraire le message d'erreur de la réponse API
    const apiMessage = err.data?.message || err.response?._data?.message || err.message;

    // Message d'erreur plus spécifique
    if (apiMessage?.includes('occupée') || apiMessage?.includes('déjà ouverte')) {
      error.value = "Cette caisse est occupée par un autre utilisateur";
    } else if (apiMessage?.includes('PIN incorrect')) {
      error.value = "Code PIN incorrect";
    } else {
      error.value = apiMessage || "Erreur lors de l'ouverture de session";
    }
    pinPadRef.value?.reset();
  } finally {
    loading.value = false;
  }
}

// Automatisation pour l'ADMIN : Déclencher le bypass dès que le fond initial est validé
watch(fondInitialSaisi, (isSaisi) => {
  if (isSaisi && isAdminUser.value && step.value === 'pin-entry' && !loading.value) {
    handleAdminBypass();
  }
}, { immediate: true });

onMounted(async () => {
  // 1. Si une session est déjà active dans le store, rediriger directement
  if (caisseStore.hasActiveSession) {
    router.push('/point-vente');
    return;
  }

  // 2. Vérifier via le store (qui utilise le localStorage, pas le JWT)
  await caisseStore.checkCurrentSession();
  if (caisseStore.hasActiveSession) {
    router.push('/point-vente');
    return;
  }

  // 3. Charger les boutiques si profil gestion
  if (user.value?.role === 'ADMIN' || user.value?.role === 'MANAGER') {
    try {
      magasins.value = await getMagasins();
    } catch (err) {
      console.error('Erreur chargement magasins:', err);
    }
  }

  // 4. Sinon charger la liste
  // Note: loadCaisses appelle déjà start/stopLoading
  loadCaisses();
});
</script>

<style scoped>
.caisse-card {
  background-color: #ffffff;
  border-radius: 1.5rem;
  padding: 1.25rem;
  cursor: pointer;
  /* box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); */
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
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
