export const useCompanyImageApi = () => {
  const config = useRuntimeConfig();
  const { getAuthHeaders } = useSecureAuth();

  /**
   * Upload du logo de la compagnie
   */
  const uploadCompanyLogo = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const headers = getAuthHeaders();
      // Supprimer Content-Type pour FormData
      delete headers['Content-Type'];
      
      const response = await $fetch(`${config.public.apiBase}/api/companies/me/logo`, {
        method: 'POST',
        headers,
        body: formData,
      });

      return response;
    } catch (error: any) {
      console.error('Erreur upload logo:', error);
      throw error;
    }
  };

  /**
   * Suppression du logo de la compagnie
   */
  const deleteCompanyLogo = async () => {
    try {
      const headers = getAuthHeaders();
      
      const response = await $fetch(`${config.public.apiBase}/api/companies/me/logo`, {
        method: 'DELETE',
        headers,
      });

      return response;
    } catch (error: any) {
      console.error('Erreur suppression logo:', error);
      throw error;
    }
  };

  /**
   * Upload de l'en-tête PDF de la compagnie
   */
  const uploadCompanyPdfHeader = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('pdfHeader', file);

      const headers = getAuthHeaders();
      // Supprimer Content-Type pour FormData
      delete headers['Content-Type'];
      
      const response = await $fetch(`${config.public.apiBase}/api/companies/me/pdf-header`, {
        method: 'POST',
        headers,
        body: formData,
      });

      return response;
    } catch (error: any) {
      console.error('Erreur upload en-tête PDF:', error);
      throw error;
    }
  };

  /**
   * Suppression de l'en-tête PDF de la compagnie
   */
  const deleteCompanyPdfHeader = async () => {
    try {
      const headers = getAuthHeaders();
      
      const response = await $fetch(`${config.public.apiBase}/api/companies/me/pdf-header`, {
        method: 'DELETE',
        headers,
      });

      return response;
    } catch (error: any) {
      console.error('Erreur suppression en-tête PDF:', error);
      throw error;
    }
  };

  return {
    uploadCompanyLogo,
    deleteCompanyLogo,
    uploadCompanyPdfHeader,
    deleteCompanyPdfHeader,
  };
};
