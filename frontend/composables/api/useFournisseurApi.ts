import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export interface Fournisseur {
  id: string;
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  responsable?: string;
  delai_livraison?: number;
  est_actif: boolean;
  date_creation: string;
  achats?: Array<{ id: string; montant_total: number; date_commande: string }>;
}

export interface FournisseurStats {
  totalAchats: number;
  montantTotal: number;
  delaiMoyenLivraison: number | null;
}

export interface CreateFournisseurDto {
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  responsable?: string;
  delai_livraison?: number;
}

export interface UpdateFournisseurDto {
  nom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  responsable?: string;
  delai_livraison?: number;
  est_actif?: boolean;
}

export interface FournisseurQueryParams {
  est_actif?: boolean;
  search?: string;
}

export const useFournisseurApi = () => {
  const { get, post, put, delete: del } = useSecureApi();

  const getFournisseurs = async (params?: FournisseurQueryParams): Promise<Fournisseur[]> => {
    const response = await get<ApiResponse<Fournisseur[]>>('/api/fournisseurs', { params });
    return response.data || [];
  };

  const getFournisseurById = async (id: string): Promise<Fournisseur | null> => {
    const response = await get<ApiResponse<Fournisseur>>(`/api/fournisseurs/${id}`);
    return response.data || null;
  };

  const getFournisseurStats = async (id: string): Promise<FournisseurStats | null> => {
    const response = await get<ApiResponse<FournisseurStats>>(`/api/fournisseurs/${id}/stats`);
    return response.data || null;
  };

  const createFournisseur = async (data: CreateFournisseurDto): Promise<Fournisseur | null> => {
    const response = await post<ApiResponse<Fournisseur>>('/api/fournisseurs', data);
    return response.data || null;
  };

  const updateFournisseur = async (id: string, data: UpdateFournisseurDto): Promise<Fournisseur | null> => {
    const response = await put<ApiResponse<Fournisseur>>(`/api/fournisseurs/${id}`, data);
    return response.data || null;
  };

  const deleteFournisseur = async (id: string): Promise<boolean> => {
    await del(`/api/fournisseurs/${id}`);
    return true;
  };

  return {
    getFournisseurs,
    getFournisseurById,
    getFournisseurStats,
    createFournisseur,
    updateFournisseur,
    deleteFournisseur,
  };
};
