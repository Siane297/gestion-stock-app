import { defineStore } from 'pinia';
import { useCaisseApi } from '~/composables/api/useCaisseApi';
import type { SessionCaisse } from '~/composables/api/useCaisseApi';

export const useCaisseStore = defineStore('caisse', () => {
  const { getMaSession } = useCaisseApi();
  
  // État
  const activeSession = ref<SessionCaisse | null>(null);
  const isLocked = ref(false);
  const isLoading = ref(false);
  const lastError = ref<string | null>(null);

  // Getters
  const hasActiveSession = computed(() => !!activeSession.value);
  const currentCaisseId = computed(() => activeSession.value?.caisse_id || null);

  // Actions
  
  /**
   * Vérifie si une session est déjà active pour l'utilisateur connecté
   */
  async function checkCurrentSession() {
    isLoading.value = true;
    lastError.value = null;
    try {
      const session = await getMaSession();
      if (session) {
        activeSession.value = session;
      } else {
        activeSession.value = null;
      }
    } catch (error: any) {
      console.error('[CaisseStore] Erreur lors de la vérification de session:', error);
      activeSession.value = null;
      lastError.value = error.message;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Définit manuellement la session active (après ouverture par PIN)
   */
  function setSession(session: SessionCaisse) {
    activeSession.value = session;
    isLocked.value = false;
  }

  /**
   * Verrouille l'interface (nécessitera le PIN pour continuer)
   */
  function lock() {
    isLocked.value = true;
  }

  /**
   * Déverrouille l'interface
   */
  function unlock() {
    isLocked.value = false;
  }

  /**
   * Réinitialise le store (déconnexion)
   */
  function reset() {
    activeSession.value = null;
    isLocked.value = false;
    isLoading.value = false;
    lastError.value = null;
  }

  return {
    // État
    activeSession,
    isLocked,
    isLoading,
    lastError,
    // Getters
    hasActiveSession,
    currentCaisseId,
    // Actions
    checkCurrentSession,
    setSession,
    lock,
    unlock,
    reset
  };
});
