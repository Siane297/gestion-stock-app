import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';
import type { StockMagasin } from './useStockApi';

export interface Magasin {
  id: string;
  nom: string;
  localisation?: string;
  telephone?: string;
  email?: string;
  gerant_id?: string;
  heure_ouverture?: string;
  heure_fermeture?: string;
  est_actif: boolean;
  date_creation: string;
  gerant?: { id: string; email: string; employee?: { fullName: string } };
  stocks?: StockMagasin[];
}

export interface MagasinStats {
  totalProduits: number;
  produitsEnAlerte: number;
  valeurStock: number;
  totalVentes: number;
  montantVentes: number;
}

export interface CreateMagasinDto {
  nom: string;
  localisation?: string;
  telephone?: string;
  email?: string;
  gerant_id?: string;
  heure_ouverture?: string;
  heure_fermeture?: string;
}

export interface UpdateMagasinDto {
  nom?: string;
  localisation?: string;
  telephone?: string;
  email?: string;
  gerant_id?: string;
  heure_ouverture?: string;
  heure_fermeture?: string;
  est_actif?: boolean;
}

export interface MagasinQueryParams {
  est_actif?: boolean;
}

export interface MagasinStockParams {
  alerte?: boolean;
  search?: string;
}

export const useMagasinApi = () => {
  const { get, post, put, delete: del } = useSecureApi();

  const getMagasins = async (params?: MagasinQueryParams): Promise<Magasin[]> => {
    const response = await get<ApiResponse<Magasin[]>>('/api/magasins', { params });
    return response.data || [];
  };

  const getMagasinById = async (id: string): Promise<Magasin | null> => {
    const response = await get<ApiResponse<Magasin>>(`/api/magasins/${id}`);
    return response.data || null;
  };

  const getMagasinStock = async (id: string, params?: MagasinStockParams): Promise<StockMagasin[]> => {
    const response = await get<ApiResponse<StockMagasin[]>>(`/api/magasins/${id}/stock`, { params });
    return response.data || [];
  };

  const getMagasinStats = async (id: string): Promise<MagasinStats | null> => {
    const response = await get<ApiResponse<MagasinStats>>(`/api/magasins/${id}/stats`);
    return response.data || null;
  };

  const createMagasin = async (data: CreateMagasinDto): Promise<Magasin | null> => {
    const response = await post<ApiResponse<Magasin>>('/api/magasins', data);
    return response.data || null;
  };

  const updateMagasin = async (id: string, data: UpdateMagasinDto): Promise<Magasin | null> => {
    const response = await put<ApiResponse<Magasin>>(`/api/magasins/${id}`, data);
    return response.data || null;
  };

  const deleteMagasin = async (id: string): Promise<boolean> => {
    await del(`/api/magasins/${id}`);
    return true;
  };

  return {
    getMagasins,
    getMagasinById,
    getMagasinStock,
    getMagasinStats,
    createMagasin,
    updateMagasin,
    deleteMagasin,
  };
};
