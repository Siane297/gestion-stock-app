import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export type StatutAchat = 'COMMANDE' | 'CONFIRMEE' | 'EN_LIVRAISON' | 'RECU_PARTIELLEMENT' | 'RECU_COMPLET' | 'ANNULEE';

export interface AchatDetail {
  id: string;
  achat_id: string;
  produit_id: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
  produit?: { nom: string };
}

export interface Achat {
  id: string;
  magasin_id: string;
  fournisseur_id: string;
  numero_commande?: string;
  date_commande: string;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;
  montant_total: number;
  montant_tva: number;
  statut: StatutAchat;
  notes?: string;
  fournisseur?: { nom_entreprise: string };
  magasin?: { nom: string };
  details?: AchatDetail[];
  _count?: { details: number };
}

export interface CreateAchatDto {
  magasin_id: string;
  fournisseur_id: string;
  numero_commande?: string;
  date_livraison_prevue?: string;
  montant_total?: number;
  montant_tva?: number;
  statut?: StatutAchat;
  notes?: string;
  details: Array<{
    produit_id: string;
    quantite: number;
    prix_unitaire: number;
    prix_total: number;
    numero_lot?: string;
    date_peremption?: Date;
    conditionnement_id?: string;
    quantite_conditionnement?: number;
    prix_unitaire_conditionnement?: number;
  }>;
}

export const useAchatApi = () => {
  const { get, post, patch, delete: del } = useSecureApi();

  const getAchats = async (magasin_id?: string): Promise<Achat[]> => {
    const params: any = {};
    if (magasin_id) params.magasin_id = magasin_id;

    const response = await get<ApiResponse<Achat[]>>('/api/achats', { params });
    return response.data || [];
  };

  const getAchatById = async (id: string): Promise<Achat | null> => {
    const response = await get<ApiResponse<Achat>>(`/api/achats/${id}`);
    return response.data || null;
  };

  const createAchat = async (data: CreateAchatDto): Promise<Achat | null> => {
    const response = await post<ApiResponse<Achat>>('/api/achats', data);
    return response.data || null;
  };

  const updateAchat = async (id: string, data: Partial<CreateAchatDto>): Promise<Achat | null> => {
    const response = await patch<ApiResponse<Achat>>(`/api/achats/${id}`, data);
    return response.data || null;
  };

  const updateAchatStatut = async (id: string, statut: StatutAchat): Promise<boolean> => {
    await patch(`/api/achats/${id}/statut`, { statut });
    return true;
  };

  const cancelAchat = async (id: string): Promise<boolean> => {
    await patch(`/api/achats/${id}/cancel`, {});
    return true;
  };

  const deleteAchat = async (id: string): Promise<boolean> => {
    await del(`/api/achats/${id}`);
    return true;
  };

  return {
    getAchats,
    getAchatById,
    createAchat,
    updateAchat,
    updateAchatStatut,
    cancelAchat,
    deleteAchat,
  };
};
