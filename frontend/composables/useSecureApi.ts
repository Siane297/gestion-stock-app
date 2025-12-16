/**
 * Composable sécurisé pour les appels API
 * Version simplifiée sans dépendances circulaires
 */

export const useSecureApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase || 'http://localhost:3001';

  /**
   * Wrapper sécurisé autour de $fetch
   */
  const secureApiFetch = async <T = any>(url: string, options: any = {}): Promise<T> => {
    const { accessToken, user } = useSecureAuth();
    const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;

    // Tentative de récupération proactive du token si manquant (Client-side uniquement)
    // Cela évite les erreurs 401 initiales lors du chargement de la page
    if (!accessToken.value && process.client) {
      const { refreshAccessToken } = useSecureAuth();
      await refreshAccessToken(false); 
    }

    // Headers de base
    const headers: Record<string, string> = {
      ...(options.headers || {}),
    };

    // Si le corps n'est pas un FormData, on ajoute application/json par défaut
    // Si c'est un FormData, on laisse le navigateur gérer le Content-Type (avec boundary)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Ajouter le token d'accès si disponible
    if (accessToken.value) {
      headers['Authorization'] = `Bearer ${accessToken.value}`;
    }

    // Ajouter le tenant ID pour les utilisateurs tenant
    if (user.value?.company?.schemaName) {
      headers['x-tenant-id'] = user.value.company.schemaName;
    }

    // Faire la requête avec les cookies HttpOnly inclus
    try {
      return await $fetch<T>(fullUrl, {
        ...options,
        headers,
        credentials: 'include', // Inclure automatiquement les cookies HttpOnly
      });
    } catch (error: any) {
      // Intercepter les erreurs 401 (Non autorisé / Token expiré)
      if (error.response?.status === 401) {
        console.log('🔄 [secureApiFetch] 401 détecté, tentative de refresh token...');
        
        // Tenter de rafraîchir le token
        const { refreshAccessToken } = useSecureAuth();
        const refreshSuccess = await refreshAccessToken(false); // false = ne pas logout tout de suite

        if (refreshSuccess) {
          console.log('✅ [secureApiFetch] Refresh réussi, nouvelle tentative de la requête...');
          
          // Récupérer le nouveau token
          const { accessToken: newAccessToken } = useSecureAuth();
          
          // Mettre à jour le header Authorization
          if (newAccessToken.value) {
            headers['Authorization'] = `Bearer ${newAccessToken.value}`;
          }

          // Réessayer la requête originale
          return await $fetch<T>(fullUrl, {
            ...options,
            headers,
            credentials: 'include',
          });
        } else {
          console.log('❌ [secureApiFetch] Refresh échoué, redirection vers login');
          // Si le refresh échoue, on laisse l'erreur se propager ou on redirige
          const { logout } = useSecureAuth();
          await logout();
          navigateTo('/auth/connexion');
          throw error;
        }
      }
      
      // Propager les autres erreurs
      throw error;
    }
  };

  /**
   * Méthodes HTTP spécialisées
   */
  const get = <T = any>(url: string, options: any = {}) => 
    secureApiFetch<T>(url, { ...options, method: 'GET' });

  const post = <T = any>(url: string, body?: any, options: any = {}) => 
    secureApiFetch<T>(url, { ...options, method: 'POST', body });

  const put = <T = any>(url: string, body?: any, options: any = {}) => 
    secureApiFetch<T>(url, { ...options, method: 'PUT', body });

  const patch = <T = any>(url: string, body?: any, options: any = {}) => 
    secureApiFetch<T>(url, { ...options, method: 'PATCH', body });

  const del = <T = any>(url: string, options: any = {}) => 
    secureApiFetch<T>(url, { ...options, method: 'DELETE' });

  return {
    secureApiFetch,
    get,
    post,
    put,
    patch,
    delete: del,
    baseURL,
  };
};
