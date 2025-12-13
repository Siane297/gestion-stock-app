import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export interface CategorieProduit {
  id: string;
  nom: string;
  description?: string;
  date_creation: string;
}

export interface CreateCategorieProduitDto {
  nom: string;
  description?: string;
}

export interface UpdateCategorieProduitDto {
  nom?: string;
  description?: string;
}

export const useCategorieProduitApi = () => {
  const { get, post, put, delete: del } = useSecureApi();

  const getCategories = async (): Promise<CategorieProduit[]> => {
    const response = await get<ApiResponse<CategorieProduit[]>>('/api/categories-produits');
    return response.data || [];
  };

  const getCategoryById = async (id: string): Promise<CategorieProduit | null> => {
    const response = await get<ApiResponse<CategorieProduit>>(`/api/categories-produits/${id}`);
    return response.data || null;
  };

  const createCategory = async (data: CreateCategorieProduitDto): Promise<CategorieProduit | null> => {
    const response = await post<ApiResponse<CategorieProduit>>('/api/categories-produits', data);
    return response.data || null;
  };

  const updateCategory = async (id: string, data: UpdateCategorieProduitDto): Promise<CategorieProduit | null> => {
    const response = await put<ApiResponse<CategorieProduit>>(`/api/categories-produits/${id}`, data);
    return response.data || null;
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    await del(`/api/categories-produits/${id}`);
    return true;
  };

  return {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
