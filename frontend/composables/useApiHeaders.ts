/**
 * Composable pour gérer les headers d'authentification
 * Compatible avec iOS Safari (utilise localStorage au lieu des cookies)
 */
export const useApiHeaders = () => {
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Ajouter le token depuis localStorage si disponible
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  };

  return {
    getAuthHeaders,
  };
};
