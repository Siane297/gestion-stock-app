import { defineStore } from 'pinia';
import { useCaisseApi } from '~/composables/api/useCaisseApi';
import type { SessionCaisse } from '~/composables/api/useCaisseApi';

const SESSION_STORAGE_KEY = 'current_caisse_session_id';

// Helper pour accéder localStorage de manière sécurisée (SSR-safe)
const getStoredSessionId = (): string | null => {
  if (process.client && typeof localStorage !== 'undefined') {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  }
  return null;
};

const setStoredSessionId = (data: { sessionId: string; caisseId: string }): void => {
  if (process.client && typeof localStorage !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
  }
};

const removeStoredSessionId = (): void => {
  if (process.client && typeof localStorage !== 'undefined') {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
};

export const useCaisseStore = defineStore('caisse', () => {
  const { getSessionActive } = useCaisseApi();
  
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
   * Vérifie si une session est déjà active
   * Restaure uniquement depuis le localStorage (session ouverte via PIN)
   */
  async function checkCurrentSession() {
    isLoading.value = true;
    lastError.value = null;
    try {
      // Vérifier si on a un ID de session stocké localement
      const storedSessionId = getStoredSessionId();
      
      if (storedSessionId) {
        // Tenter de récupérer cette session spécifique
        try {
          const sessionData = JSON.parse(storedSessionId);
          // Récupérer la session active de cette caisse
          const session = await getSessionActive(sessionData.caisseId);
          
          // Vérifier que la session est toujours la même (même ID et statut OUVERTE)
          if (session && session.id === sessionData.sessionId && session.statut === 'OUVERTE') {
            activeSession.value = session;
            return;
          } else {
            // Session expirée ou fermée, nettoyer le localStorage
            removeStoredSessionId();
          }
        } catch (err) {
          console.warn('[CaisseStore] Session stockée invalide, nettoyage', err);
          removeStoredSessionId();
        }
      }
      
      // Pas de session stockée = pas de session active
      // Note: On ne fait PAS de fallback vers getMaSession() car cela utiliserait
      // le JWT de l'utilisateur connecté et non le vendeur authentifié par PIN
      activeSession.value = null;
    } catch (error: any) {
      console.error('[CaisseStore] Erreur lors de la vérification de session:', error);
      activeSession.value = null;
      lastError.value = error.message;
      removeStoredSessionId();
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
    
    // Stocker l'ID de la session dans localStorage pour persistance
    setStoredSessionId({
      sessionId: session.id,
      caisseId: session.caisse_id
    });
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
   * Réinitialise le store (déconnexion ou fermeture de session)
   */
  function reset() {
    activeSession.value = null;
    isLocked.value = false;
    isLoading.value = false;
    lastError.value = null;
    removeStoredSessionId();
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
