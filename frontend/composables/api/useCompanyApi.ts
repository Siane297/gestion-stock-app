import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

// Interface pour les données de l'organisation
export interface Company {
  id: string;
  name: string;
  emailOrganisation: string;
  telephoneOrganisation: string;
  country: string;
  address?: string;
  schemaName: string;
  logo?: string; // URL du logo de la compagnie
  badgeStyle?: string; // Style du badge employé (primary, emerald, purple)
  currency?: string | null;
}

// Interface pour la mise à jour
export interface UpdateCompanyDto {
  name?: string;
  emailOrganisation?: string;
  telephoneOrganisation?: string;
  country?: string;
  address?: string;
  badgeStyle?: string;
}

export const useCompanyApi = () => {
  const { get, put, post, delete: del } = useSecureApi();

  // Obtenir les informations de l'organisation courante
  const getCurrentCompany = async (): Promise<Company | null> => {
    try {
      // Ajouter un timestamp pour éviter le cache
      const response = await get<ApiResponse<Company>>(`/api/companies/me?t=${Date.now()}`);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'organisation:', error);
      throw error;
    }
  };

  // Mettre à jour les informations de l'organisation
  const updateCompany = async (data: UpdateCompanyDto | FormData): Promise<Company | null> => {
    try {
      const response = await put<ApiResponse<Company>>('/api/companies/me', data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'organisation:', error);
      throw error;
    }
  };

  // Upload du logo de l'organisation
  const uploadLogo = async (file: File): Promise<{ logo: string; company: Company } | null> => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await post<ApiResponse<{ logo: string; company: Company }>>('/api/companies/me/logo', formData);
    return response.data || null;
  };

  // Supprimer le logo de l'organisation
  const deleteLogo = async (): Promise<Company | null> => {
    const response = await del<ApiResponse<Company>>('/api/companies/me/logo');
    return response.data || null;
  };

  // Upload de l'en-tête PDF
  const uploadPdfHeader = async (file: File): Promise<{ pdfHeader: string; company: Company } | null> => {
    const formData = new FormData();
    formData.append('pdfHeader', file);

    const response = await post<ApiResponse<{ pdfHeader: string; company: Company }>>('/api/companies/me/pdf-header', formData);
    return response.data || null;
  };

  // Supprimer l'en-tête PDF
  const deletePdfHeader = async (): Promise<Company | null> => {
    const response = await del<ApiResponse<Company>>('/api/companies/me/pdf-header');
    return response.data || null;
  };

  return {
    getCurrentCompany,
    updateCompany,
    uploadLogo,
    deleteLogo,
    uploadPdfHeader,
    deletePdfHeader,
  };
};
