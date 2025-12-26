import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';
import { useMagasinStore } from '~/stores/magasin';

// Types pour l'inventaire
export type StatutInventaire = 'BROUILLON' | 'EN_COURS' | 'TERMINE' | 'VALIDE';

export interface InventaireStats {
  total_produits: number;
  produits_comptes: number;
  progression: number;
  ecart_total: number;
  valeur_ecart_positif: number;
  valeur_ecart_negatif: number;
}

export interface InventaireDetail {
  id: string;
  inventaire_id: string;
  produit_id: string;
  lot_id?: string;
  quantite_theorique: number;
  quantite_comptee?: number;
  ecart?: number;
  valeur_ecart?: number;
  est_compte: boolean;
  produit?: {
    id: string;
    nom: string;
    code_barre?: string;
    prix_achat?: number;
    image_url?: string;
    unite?: { nom: string };
  };
  lot?: {
    id: string;
    numero_lot: string;
    date_peremption: string;
  };
}

export interface Inventaire {
  id: string;
  numero: string;
  magasin_id: string;
  statut: StatutInventaire;
  date_debut?: string;
  date_fin?: string;
  date_validation?: string;
  date_creation: string;
  commentaire?: string;
  magasin?: { id: string; nom: string };
  utilisateur_debut?: { 
    email: string;
    employee?: { fullName: string };
  };
  utilisateur_validation?: { 
    email: string;
    employee?: { fullName: string };
  };
  details?: InventaireDetail[];
  stats?: InventaireStats;
  _count?: { details: number };
}

export interface CreateInventaireDto {
  magasin_id: string;
  commentaire?: string;
  produit_ids?: string[];
}

export interface UpdateComptageDto {
  quantite_comptee: number;
}

export interface InventaireQueryParams {
  magasin_id?: string;
  statut?: StatutInventaire;
  dateFrom?: string;
  dateTo?: string;
}

export const useInventaireApi = () => {
  const { get, post, patch, delete: del } = useSecureApi();

  /**
   * Liste tous les inventaires avec filtres
   */
  const getInventaires = async (params?: InventaireQueryParams): Promise<Inventaire[]> => {
    const store = useMagasinStore();
    const finalParams = {
      ...params,
      magasin_id: params?.magasin_id || store.currentMagasinId || undefined
    };
    const response = await get<ApiResponse<Inventaire[]>>('/api/inventaire', { params: finalParams });
    return response.data || [];
  };

  /**
   * Récupère un inventaire par ID avec tous ses détails
   */
  const getInventaireById = async (id: string): Promise<Inventaire | null> => {
    const response = await get<ApiResponse<Inventaire>>(`/api/inventaire/${id}`);
    return response.data || null;
  };

  /**
   * Récupère les statistiques d'un inventaire
   */
  const getInventaireStats = async (id: string): Promise<InventaireStats | null> => {
    const response = await get<ApiResponse<InventaireStats>>(`/api/inventaire/${id}/stats`);
    return response.data || null;
  };

  /**
   * Crée un nouvel inventaire
   */
  const createInventaire = async (data: CreateInventaireDto): Promise<Inventaire | null> => {
    const response = await post<ApiResponse<Inventaire>>('/api/inventaire', data);
    return response.data || null;
  };

  /**
   * Démarre un inventaire (BROUILLON -> EN_COURS)
   */
  const startInventaire = async (id: string): Promise<Inventaire | null> => {
    const response = await post<ApiResponse<Inventaire>>(`/api/inventaire/${id}/start`);
    return response.data || null;
  };

  /**
   * Met à jour le comptage d'un détail d'inventaire
   */
  const updateComptage = async (
    inventaireId: string, 
    detailId: string, 
    data: UpdateComptageDto
  ): Promise<InventaireDetail | null> => {
    const response = await patch<ApiResponse<InventaireDetail>>(
      `/api/inventaire/${inventaireId}/details/${detailId}`, 
      data
    );
    return response.data || null;
  };

  /**
   * Finalise un inventaire (EN_COURS -> TERMINE)
   */
  const finalizeInventaire = async (id: string): Promise<Inventaire | null> => {
    const response = await post<ApiResponse<Inventaire>>(`/api/inventaire/${id}/finalize`);
    return response.data || null;
  };

  /**
   * Valide un inventaire et ajuste les stocks (TERMINE -> VALIDE)
   */
  const validateInventaire = async (id: string): Promise<Inventaire | null> => {
    const response = await post<ApiResponse<Inventaire>>(`/api/inventaire/${id}/validate`);
    return response.data || null;
  };

  /**
   * Supprime un inventaire (BROUILLON uniquement)
   */
  const deleteInventaire = async (id: string): Promise<boolean> => {
    await del(`/api/inventaire/${id}`);
    return true;
  };

  return {
    getInventaires,
    getInventaireById,
    getInventaireStats,
    createInventaire,
    startInventaire,
    updateComptage,
    finalizeInventaire,
    validateInventaire,
    deleteInventaire,
  };
};
