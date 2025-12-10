import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export interface TypeConge {
  id: string;
  nom: string;
  description?: string;
  estPaye: boolean;
  necessiteDocument: boolean;
  couleur: string;
  estActif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTypeCongeDto {
  nom: string;
  couleur: string;
  description?: string;
  estPaye?: boolean;
  necessiteDocument?: boolean;
}

export interface UpdateTypeCongeDto {
  nom?: string;
  couleur?: string;
  description?: string;
  estPaye?: boolean;
  necessiteDocument?: boolean;
  estActif?: boolean;
}

export const useTypeCongeApi = () => {
  const { get, post, put, delete: del } = useSecureApi();

  // Obtenir tous les types de congé
  const getTypesConge = async (): Promise<TypeConge[]> => {
    try {
      const response = await get<ApiResponse<TypeConge[]>>('/api/types-conge');
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des types de congé:', error);
      throw error;
    }
  };

  // Obtenir un type de congé par ID
  const getTypeCongeById = async (id: string): Promise<TypeConge | null> => {
    try {
      const response = await get<ApiResponse<TypeConge>>(`/api/types-conge/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du type de congé:', error);
      throw error;
    }
  };

  // Créer un nouveau type de congé
  const createTypeConge = async (data: CreateTypeCongeDto): Promise<TypeConge | null> => {
    try {
      const response = await post<ApiResponse<TypeConge>>('/api/types-conge', data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la création du type de congé:', error);
      throw error;
    }
  };

  // Mettre à jour un type de congé
  const updateTypeConge = async (id: string, data: UpdateTypeCongeDto): Promise<TypeConge | null> => {
    try {
      const response = await put<ApiResponse<TypeConge>>(`/api/types-conge/${id}`, data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du type de congé:', error);
      throw error;
    }
  };

  // Supprimer un type de congé
  const deleteTypeConge = async (id: string): Promise<boolean> => {
    try {
      await del(`/api/types-conge/${id}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du type de congé:', error);
      throw error;
    }
  };

  return {
    getTypesConge,
    getTypeCongeById,
    createTypeConge,
    updateTypeConge,
    deleteTypeConge,
  };
};
