/**
 * Composable pour l'authentification sécurisée
 * Utilise une approche hybride : HttpOnly cookies + Memory storage
 * Compatible iOS Safari et résistant aux attaques XSS/CSRF
 */
import { useMagasinStore } from '~/stores/magasin';
import { useCaisseStore } from '~/stores/caisse';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName: string;
  emailOrganisation: string;
  telephoneOrganisation: string;
  country: string;
  address?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken?: string; // Token courte durée stocké en mémoire
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      company?: {
        id: string;
        name: string;
        country: string;
        schemaName: string;
      };
    };
    company?: {
      id: string;
      name: string;
    };
    requiresProvisioning?: boolean;
  };
}

/**
 * Composable pour l'authentification sécurisée
 */
// Promise partagée pour éviter les appels concurrents au refresh token
let refreshPromise: Promise<boolean> | null = null;

export const useSecureAuth = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase || 'http://localhost:3001';

  // État réactif pour l'access token (en mémoire uniquement)
  const accessToken = useState<string | null>('auth.accessToken', () => null);
  const isAuthenticated = useState<boolean>('auth.isAuthenticated', () => false);
  const user = useState<any>('auth.user', () => null);
  const isLoading = useState<boolean>('auth.loading', () => false);

  /**
   * Rafraîchir l'access token en utilisant le refresh token (HttpOnly cookie)
   */


  /**
   * Rafraîchir l'access token en utilisant le refresh token (HttpOnly cookie)
   */
  const refreshAccessToken = async (shouldLogoutOnError: boolean = true): Promise<boolean> => {
    // Si un refresh est déjà en cours, retourner la promesse existante
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const response = await $fetch<AuthResponse>(`${baseURL}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // Inclut automatiquement les HttpOnly cookies
        });

        if (response.success && response.data?.accessToken) {
          accessToken.value = response.data.accessToken;
          isAuthenticated.value = true;

          // Utiliser les données utilisateur retournées directement par /refresh
          if (response.data.user) {
            user.value = response.data.user;
          }
          return true;
        }

        console.warn('[refreshAccessToken] User data manquant dans la réponse refresh');
        if (shouldLogoutOnError) await logout();
        return false;
      } catch (error) {
        if (shouldLogoutOnError) {
          await logout();
        }
        return false;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };


  /**
   * Inscription d'un nouvel utilisateur
   */
  const register = async (data: RegisterData): Promise<AuthResponse> => {
    isLoading.value = true;
    
    // Arrêter tout refresh automatique en cours avant l'inscription
    stopTokenRefresh();
    
    try {
      // console.log('📝 [register] Début de l\'inscription');
      
      // Nettoyer l'état avant l'inscription pour éviter les conflits
      accessToken.value = null;
      user.value = null;
      isAuthenticated.value = false;
      
      const response = await $fetch<AuthResponse>(`${baseURL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include', // Pour recevoir le HttpOnly cookie
        body: data,
      });

      if (response.success && response.data) {
        // console.log('✅ [register] Inscription réussie');
        accessToken.value = response.data.accessToken || null;
        user.value = response.data.user;
        isAuthenticated.value = true;

        // Démarrer le rafraîchissement automatique APRÈS inscription réussie
        startTokenRefresh();
      }

      return response;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      return {
        success: false,
        message: error.data?.message || 'Erreur lors de l\'inscription',
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Connexion d'un utilisateur
   */
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    isLoading.value = true;
    try {
      const response = await $fetch<AuthResponse>(`${baseURL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include', // Pour recevoir le HttpOnly cookie
        body: credentials,
      });

      if (response.success && response.data) {
        accessToken.value = response.data.accessToken || null;
        user.value = response.data.user;
        isAuthenticated.value = true;

        // Démarrer le rafraîchissement automatique
        startTokenRefresh();
      }

      return response;
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      return {
        success: false,
        message: error.data?.message || 'Erreur lors de la connexion',
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Déconnexion de l'utilisateur
   */
  const logout = async (): Promise<{ success: boolean }> => {
    isLoading.value = true;
    try {
      // Appeler l'endpoint de déconnexion pour invalider le refresh token
      await $fetch(`${baseURL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: accessToken.value ? {
          'Authorization': `Bearer ${accessToken.value}`
        } : {}
      });

      // Nettoyer l'état local
      accessToken.value = null;
      user.value = null;
      isAuthenticated.value = false;

      // Réinitialiser les stores Pinia
      const magasinStore = useMagasinStore();
      const caisseStore = useCaisseStore();
      magasinStore.reset();
      caisseStore.reset();

      // Arrêter le rafraîchissement automatique
      stopTokenRefresh();

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      
      // Même en cas d'erreur, nettoyer l'état local
      accessToken.value = null;
      user.value = null;
      isAuthenticated.value = false;
      stopTokenRefresh();

      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Vérifier l'authentification au démarrage de l'application
   */
  const checkAuth = async (): Promise<void> => {
    isLoading.value = true;
    try {
      // console.log('🔍 [checkAuth] Début de la vérification d\'authentification');
      
      // Essayer de rafraîchir le token avec le refresh token (cookie)
      // Pas de logout automatique lors de la vérification initiale
      const success = await refreshAccessToken(false);
      
      if (success) {
        // console.log('✅ [checkAuth] Authentification réussie');
        // Démarrer le rafraîchissement automatique
        startTokenRefresh();
      } else {
        // console.log('❌ [checkAuth] Refresh token échoué ou pas de cookie disponible');
        // Ne pas déconnecter automatiquement, laisser l'utilisateur sur la page de connexion
        isAuthenticated.value = false;
        user.value = null;
        accessToken.value = null;
      }
    } catch (error) {
      // console.error('❌ [checkAuth] Erreur lors de la vérification de l\'authentification:', error);
      // Ne pas déconnecter automatiquement en cas d'erreur réseau
      isAuthenticated.value = false;
      user.value = null;
      accessToken.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  // Variables pour la gestion du rafraîchissement automatique
  let refreshInterval: NodeJS.Timeout | null = null;

  /**
   * Gérer le changement de visibilité de la page
   * Rafraîchit le token si l'utilisateur revient sur l'onglet après une longue période
   */
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && isAuthenticated.value) {
      // console.log('👁️ [handleVisibilityChange] Retour sur l\'onglet, vérification du token');
      // On force un refresh pour être sûr d'avoir un token valide
      await refreshAccessToken(false);
    }
  };

  /**
   * Démarrer le rafraîchissement automatique des tokens
   */
  const startTokenRefresh = () => {
    // Nettoyer l'ancien interval s'il existe
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    // Rafraîchir le token toutes les 5 minutes (marge de sécurité de 1 minute)
    refreshInterval = setInterval(async () => {
      if (isAuthenticated.value) {
        await refreshAccessToken();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Ajouter l'écouteur de visibilité
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  };

  /**
   * Arrêter le rafraîchissement automatique
   */
  const stopTokenRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
    
    // Retirer l'écouteur de visibilité
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };

  /**
   * Obtenir les headers d'authentification pour les requêtes API
   */
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken.value) {
      headers['Authorization'] = `Bearer ${accessToken.value}`;
    }

    return headers;
  };

  // Nettoyer lors de la destruction (seulement si dans un contexte de composant)
  if (process.client && getCurrentInstance()) {
    onUnmounted(() => {
      stopTokenRefresh();
    });
  }

  return {
    // État
    accessToken: readonly(accessToken),
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    isLoading: readonly(isLoading),

    // Méthodes
    register,
    login,
    logout,
    checkAuth,
    refreshAccessToken,
    getAuthHeaders,

    // Utilitaires
    startTokenRefresh,
    stopTokenRefresh,
  };
};
