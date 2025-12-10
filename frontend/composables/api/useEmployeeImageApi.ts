export const useEmployeeImageApi = () => {
  const config = useRuntimeConfig();
  const { getAuthHeaders } = useSecureAuth();

  /**
   * Upload de la photo d'un employé
   */
  const uploadEmployeePhoto = async (employeeId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const headers = getAuthHeaders();
      // Supprimer Content-Type pour FormData
      delete headers['Content-Type'];
      
      const response = await $fetch(`${config.public.apiBase}/api/employees/${employeeId}/photo`, {
        method: 'POST',
        headers,
        body: formData,
      });

      return response;
    } catch (error: any) {
      console.error('Erreur upload photo employé:', error);
      throw error;
    }
  };

  /**
   * Suppression de la photo d'un employé
   */
  const deleteEmployeePhoto = async (employeeId: string) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await $fetch(`${config.public.apiBase}/api/employees/${employeeId}/photo`, {
        method: 'DELETE',
        headers,
      });

      return response;
    } catch (error: any) {
      console.error('Erreur suppression photo employé:', error);
      throw error;
    }
  };

  return {
    uploadEmployeePhoto,
    deleteEmployeePhoto,
  };
};
