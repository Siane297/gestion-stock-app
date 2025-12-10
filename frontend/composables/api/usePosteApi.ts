import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export interface Poste {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePosteDto {
  name: string;
}

export interface UpdatePosteDto {
  name?: string;
  isActive?: boolean;
}

export const usePosteApi = () => {
  const { get, post, put, delete: del } = useSecureApi();

  // Obtenir tous les postes
  const getPostes = async (): Promise<Poste[]> => {
    try {
      const response = await get<ApiResponse<Poste[]>>('/api/postes');
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des postes:', error);
      throw error;
    }
  };

  // Obtenir un poste par ID
  const getPosteById = async (id: string): Promise<Poste | null> => {
    try {
      const response = await get<ApiResponse<Poste>>(`/api/postes/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du poste:', error);
      throw error;
    }
  };

  // Créer un nouveau poste
  const createPoste = async (data: CreatePosteDto): Promise<Poste | null> => {
    try {
      const response = await post<ApiResponse<Poste>>('/api/postes', data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la création du poste:', error);
      throw error;
    }
  };

  // Mettre à jour un poste
  const updatePoste = async (id: string, data: UpdatePosteDto): Promise<Poste | null> => {
    try {
      const response = await put<ApiResponse<Poste>>(`/api/postes/${id}`, data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du poste:', error);
      throw error;
    }
  };

  // Supprimer un poste
  const deletePoste = async (id: string): Promise<boolean> => {
    try {
      await del(`/api/postes/${id}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du poste:', error);
      throw error;
    }
  };

  return {
    getPostes,
    getPosteById,
    createPoste,
    updatePoste,
    deletePoste,
  };
};
