import { useSecureApi } from '~/composables/useSecureApi';
import { useSecureAuth } from '~/composables/useSecureAuth';
import type { ApiResponse } from './config';

export type StatutVente = 'EN_ATTENTE' | 'PAYEE' | 'ANNULEE' | 'REMBOURSEE';
export type MethodePaiement = 'ESPECES' | 'CARTE' | 'VIREMENT' | 'CHEQUE' | 'MOBILE_MONEY' | 'CREDIT';

export interface VenteDetail {
  id: string;
  vente_id: string;
  produit_id: string;
  quantite: number;
  prix_unitaire: number;
  remise: number;
  prix_total: number;
  conditionnement_id?: string;
  produit?: { nom: string };
  conditionnement?: { nom: string; quantite_base: number };
}

export interface Facture {
  id: string;
  vente_id: string;
  numero_facture: string;
  date_emission: string;
  date_echeance?: string;
  montant_ht: number;
  montant_ttc: number;
  statut: string;
}

export interface Vente {
  id: string;
  magasin_id: string;
  client_id?: string;
  utilisateur_id: string;
  montant_total: number;
  montant_remise: number;
  statut: StatutVente;
  methode_paiement: MethodePaiement;
  notes?: string;
  date_creation: string;
  client?: { nom: string };
  magasin?: { nom: string };
  utilisateur?: { email: string };
  details?: VenteDetail[];
  facture?: Facture;
  session_caisse?: {
    caisse?: {
      nom: string;
      code: string;
    }
  };
  _count?: { details: number };
}

export interface VenteStats {
  totalVentes: number;
  montantTotal: number;
  venteMoyenne: number;
  parMethode: Record<string, { count: number; montant: number }>;
}

export interface CreateVenteDto {
  magasin_id: string;
  client_id?: string;
  montant_total: number;
  montant_remise?: number;
  montant_paye?: number;    // Montant payé par le client
  montant_rendu?: number;   // Monnaie rendue
  statut?: StatutVente;
  methode_paiement: MethodePaiement;
  notes?: string;
  generer_facture?: boolean;
  details: Array<{
    produit_id: string;
    conditionnement_id?: string;
    quantite: number;
    prix_unitaire: number;
    remise?: number;
    prix_total: number;
  }>;
}

export interface VenteQueryParams {
  magasin_id?: string;
  client_id?: string;
  utilisateur_id?: string;
}

export interface VenteStatsParams {
  magasin_id?: string;
  dateFrom?: string;
  dateTo?: string;
}

import { useMagasinStore } from '~/stores/magasin';

export const useVenteApi = () => {
  const { get, post, patch } = useSecureApi();

  const getVentes = async (params?: VenteQueryParams): Promise<Vente[]> => {
    const store = useMagasinStore();
    const finalParams = {
        ...params,
        magasin_id: params?.magasin_id || store.currentMagasinId || undefined
    };
    const response = await get<ApiResponse<Vente[]>>('/api/ventes', { params: finalParams });
    return response.data || [];
  };

  const getVenteById = async (id: string): Promise<Vente | null> => {
    const response = await get<ApiResponse<Vente>>(`/api/ventes/${id}`);
    return response.data || null;
  };

  const getVenteStats = async (params?: VenteStatsParams): Promise<VenteStats | null> => {
    const store = useMagasinStore();
    const finalParams = {
        ...params,
        magasin_id: params?.magasin_id || store.currentMagasinId || undefined
    };
    const response = await get<ApiResponse<VenteStats>>('/api/ventes/stats', { params: finalParams });
    return response.data || null;
  };

  const createVente = async (data: CreateVenteDto): Promise<Vente | null> => {
    const response = await post<ApiResponse<Vente>>('/api/ventes', data);
    return response.data || null;
  };

  const updateVenteStatut = async (id: string, statut: StatutVente): Promise<boolean> => {
    await patch(`/api/ventes/${id}/statut`, { statut });
    return true;
  };  return {
    getVentes,
    getVenteById,
    getVenteStats,
    createVente,
    updateVenteStatut,
  };
};
