/**
 * Composable pour gérer l'extraction et l'affichage des erreurs API
 */
export const useErrorHandler = () => {
  /**
   * Extrait le message d'erreur d'une réponse API
   * @param error L'erreur capturée
   * @param defaultMessage Message par défaut si aucun message spécifique n'est trouvé
   * @returns Le message d'erreur à afficher
   */
  const extractErrorMessage = (error: any, defaultMessage: string = 'Une erreur est survenue'): string => {
    // Structure Nuxt/Ofetch standard (e.response._data.message)
    if (error?.response?._data?.message) {
      return error.response._data.message;
    }
    
    // Structure alternative (e.data.message)
    if (error?.data?.message) {
      return error.data.message;
    }
    
    // Message natif de l'erreur
    if (error?.message) {
      return error.message;
    }
    
    return defaultMessage;
  };

  /**
   * Extrait les erreurs de champs d'une réponse API (validation errors)
   * @param error L'erreur capturée
   * @returns Un objet { fieldName: errorMessage } ou null
   */
  const extractFieldErrors = (error: any): Record<string, string> | null => {
    // Si le backend renvoie des erreurs de champs structurées
    if (error?.response?._data?.errors) {
      return error.response._data.errors;
    }
    
    if (error?.data?.errors) {
      return error.data.errors;
    }
    
    return null;
  };

  return {
    extractErrorMessage,
    extractFieldErrors
  };
};
