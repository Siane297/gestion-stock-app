import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export interface Departement {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartementDto {
  name: string;
}

export interface UpdateDepartementDto {
  name?: string;
  isActive?: boolean;
}

export const useDepartementApi = () => {
  const { get, post, put, delete: del } = useSecureApi();

  // Obtenir tous les départements
  const getDepartements = async (): Promise<Departement[]> => {
    try {
      const response = await get<ApiResponse<Departement[]>>('/api/departements');
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des départements:', error);
      throw error;
    }
  };

  // Obtenir un département par ID
  const getDepartementById = async (id: string): Promise<Departement | null> => {
    try {
      const response = await get<ApiResponse<Departement>>(`/api/departements/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du département:', error);
      throw error;
    }
  };

  // Créer un nouveau département
  const createDepartement = async (data: CreateDepartementDto): Promise<Departement | null> => {
    try {
      const response = await post<ApiResponse<Departement>>('/api/departements', data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la création du département:', error);
      throw error;
    }
  };

  // Mettre à jour un département
  const updateDepartement = async (id: string, data: UpdateDepartementDto): Promise<Departement | null> => {
    try {
      const response = await put<ApiResponse<Departement>>(`/api/departements/${id}`, data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du département:', error);
      throw error;
    }
  };

  // Supprimer un département
  const deleteDepartement = async (id: string): Promise<boolean> => {
    try {
      await del(`/api/departements/${id}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du département:', error);
      throw error;
    }
  };

  return {
    getDepartements,
    getDepartementById,
    createDepartement,
    updateDepartement,
    deleteDepartement,
  };
};
