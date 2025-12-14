import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export type UniteProduit = 'PIECE' | 'KG' | 'LITRE' | 'METRE' | 'CARTON' | 'PALETTE' | 'UNITE' | 'PAQUET' | 'AUTRE';

export interface Conditionnement {
  id: string;
  nom: string;
  quantite_base: number;
  prix_vente: number;
  code_barre?: string;
  est_actif: boolean;
}

export interface Produit {
  id: string;
  nom: string;
  description?: string;
  code_barre?: string;
  categorie_id?: string;
  categorie?: { id: string; nom: string };
  unite: UniteProduit;
  prix_achat: number;
  prix_vente: number;
  marge_min_pourcent?: number;
  tva_pourcentage?: number;
  est_actif: boolean;
  date_creation: string;
  conditionnements?: Conditionnement[];
}

export interface HistoriquePrix {
  id: string;
  produit_id: string;
  ancien_prix_achat?: number;
  ancien_prix_vente?: number;
  nouveau_prix_achat?: number;
  nouveau_prix_vente?: number;
  date_modification: string;
  raison?: string;
}

export interface CreateProduitDto {
  nom: string;
  description?: string;
  code_barre?: string;
  categorie_id?: string;
  unite?: UniteProduit;
  prix_achat?: number;
  prix_vente: number;
  marge_min_pourcent?: number;
  tva_pourcentage?: number;
  conditionnements?: Array<{
    nom: string;
    quantite_base: number;
    prix_vente: number;
    code_barre?: string;
  }>;
}

export interface UpdateProduitDto {
  nom?: string;
  description?: string;
  code_barre?: string;
  categorie_id?: string;
  unite?: UniteProduit;
  prix_achat?: number;
  prix_vente?: number;
  marge_min_pourcent?: number;
  tva_pourcentage?: number;
  est_actif?: boolean;
  conditionnements?: Array<{
    id?: string;
    nom?: string;
    quantite_base?: number;
    prix_vente?: number;
    code_barre?: string;
    action?: 'create' | 'update' | 'delete';
  }>;
}

export interface ProduitQueryParams {
  search?: string;
  categorie_id?: string;
  est_actif?: boolean;
}

export const useProduitApi = () => {
  const { get, post, put, delete: del } = useSecureApi();

  const getProduits = async (params?: ProduitQueryParams): Promise<Produit[]> => {
    const response = await get<ApiResponse<Produit[]>>('/api/produits', { params });
    return response.data || [];
  };

  const getProduitById = async (id: string): Promise<Produit | null> => {
    const response = await get<ApiResponse<Produit>>(`/api/produits/${id}`);
    return response.data || null;
  };

  const getPriceHistory = async (id: string, limit?: number): Promise<HistoriquePrix[]> => {
    const params = limit ? { limit } : undefined;
    const response = await get<ApiResponse<HistoriquePrix[]>>(`/api/produits/${id}/price-history`, { params });
    return response.data || [];
  };

  const createProduit = async (data: CreateProduitDto): Promise<Produit | null> => {
    const response = await post<ApiResponse<Produit>>('/api/produits', data);
    return response.data || null;
  };

  const updateProduit = async (id: string, data: UpdateProduitDto): Promise<Produit | null> => {
    const response = await put<ApiResponse<Produit>>(`/api/produits/${id}`, data);
    return response.data || null;
  };

  const deleteProduit = async (id: string): Promise<boolean> => {
    await del(`/api/produits/${id}`);
    return true;
  };

  return {
    getProduits,
    getProduitById,
    getPriceHistory,
    createProduit,
    updateProduit,
    deleteProduit,
  };
};
