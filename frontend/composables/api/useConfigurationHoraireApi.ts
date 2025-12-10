import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

// Types pour les configurations horaires
export interface ConfigurationHoraire {
  id: string;
  heureDebut: string;
  heureFin: string;
  heureDebutPause?: string | null;
  heureFinPause?: string | null;
  toleranceRetardMinutes: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConfigurationHoraireDto {
  heureDebut: string;
  heureFin: string;
  heureDebutPause?: string;
  heureFinPause?: string;
  toleranceRetardMinutes?: number;
  description?: string;
  isActive?: boolean; // Si true, la config sera activée immédiatement
}

export interface UpdateConfigurationHoraireDto {
  heureDebut?: string;
  heureFin?: string;
  heureDebutPause?: string;
  heureFinPause?: string;
  toleranceRetardMinutes?: number;
  description?: string;
  isActive?: boolean;
}

export const useConfigurationHoraireApi = () => {
  const { get, post, put, delete: del } = useSecureApi();

  // Obtenir la configuration active
  const getActiveConfiguration = async (): Promise<ConfigurationHoraire | null> => {
    try {
      const response = await get<ApiResponse<ConfigurationHoraire>>('/api/configurations-horaire/active');
      return response.data || null;
    } catch (error: any) {
      // Ne pas logger les erreurs 404 (normal si aucune config active)
      const is404 = error.status === 404 || error.statusCode === 404;
      if (!is404) {
        console.error('Erreur lors de la récupération de la configuration active:', error);
      }
      return null;
    }
  };

  // Obtenir toutes les configurations
  const getAllConfigurations = async (): Promise<ConfigurationHoraire[]> => {
    try {
      const response = await get<ApiResponse<ConfigurationHoraire[]>>('/api/configurations-horaire');
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des configurations:', error);
      throw error;
    }
  };

  // Créer une nouvelle configuration
  const createConfiguration = async (data: CreateConfigurationHoraireDto): Promise<ConfigurationHoraire | null> => {
    try {
      const response = await post<ApiResponse<ConfigurationHoraire>>('/api/configurations-horaire', data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la création de la configuration:', error);
      throw error;
    }
  };

  // Mettre à jour une configuration
  const updateConfiguration = async (
    id: string,
    data: UpdateConfigurationHoraireDto
  ): Promise<ConfigurationHoraire | null> => {
    try {
      const response = await put<ApiResponse<ConfigurationHoraire>>(`/api/configurations-horaire/${id}`, data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration:', error);
      throw error;
    }
  };

  // Supprimer une configuration
  const deleteConfiguration = async (id: string): Promise<boolean> => {
    try {
      await del(`/api/configurations-horaire/${id}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la configuration:', error);
      throw error;
    }
  };

  return {
    getActiveConfiguration,
    getAllConfigurations,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
  };
};
