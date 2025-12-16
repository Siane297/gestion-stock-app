import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export interface UniteProduit {
  id: string;
  nom: string;
  date_creation: string;
}

export interface CreateUniteDto {
  nom: string;
}

export interface UpdateUniteDto {
  nom?: string;
}

export const useUniteApi = () => {
  const { get, post, put, delete: del } = useSecureApi();

  const getUnites = async (): Promise<UniteProduit[]> => {
    const response = await get<ApiResponse<UniteProduit[]>>('/api/unites-produits');
    return response.data || [];
  };

  const getUniteById = async (id: string): Promise<UniteProduit | null> => {
    const response = await get<ApiResponse<UniteProduit>>(`/api/unites-produits/${id}`);
    return response.data || null;
  };

  const createUnite = async (data: CreateUniteDto): Promise<UniteProduit | null> => {
    const response = await post<ApiResponse<UniteProduit>>('/api/unites-produits', data);
    return response.data || null;
  };

  const updateUnite = async (id: string, data: UpdateUniteDto): Promise<UniteProduit | null> => {
    const response = await put<ApiResponse<UniteProduit>>(`/api/unites-produits/${id}`, data);
    return response.data || null;
  };

  const deleteUnite = async (id: string): Promise<boolean> => {
    await del(`/api/unites-produits/${id}`);
    return true;
  };

  return {
    getUnites,
    getUniteById,
    createUnite,
    updateUnite,
    deleteUnite,
  };
};
