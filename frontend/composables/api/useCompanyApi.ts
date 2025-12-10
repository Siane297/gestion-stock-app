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
  const { get, put } = useSecureApi();

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
  const updateCompany = async (data: UpdateCompanyDto): Promise<Company | null> => {
    try {
      const response = await put<ApiResponse<Company>>('/api/companies/me', data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'organisation:', error);
      throw error;
    }
  };

  return {
    getCurrentCompany,
    updateCompany,
  };
};
