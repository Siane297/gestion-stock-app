import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export type TypeMouvementStock = 'ENTREE_ACHAT' | 'ENTREE_RETOUR' | 'SORTIE_VENTE' | 'SORTIE_PERISSABLE' | 'SORTIE_INVENDU' | 'AJUSTEMENT' | 'TRANSFERT';

export interface StockMagasin {
  id: string;
  magasin_id: string;
  produit_id: string;
  quantite: number;
  quantite_minimum: number;
  isAlert?: boolean;
  magasin?: { nom: string };
  produit?: { nom: string; code_barre?: string; unite?: { nom: string }; prix_vente?: number };
}

export interface MouvementStock {
  id: string;
  magasin_id: string;
  produit_id: string;
  utilisateur_id?: string;
  type: TypeMouvementStock;
  quantite: number;
  raison?: string;
  date_mouvement: string;
  produit?: { nom: string };
  magasin?: { nom: string };
  utilisateur?: { email: string };
}

export interface CreateMouvementDto {
  magasin_id: string;
  produit_id: string;
  type: TypeMouvementStock;
  quantite: number;
  raison?: string;
  numero_lot?: string;
  date_peremption?: Date;
  magasin_dest_id?: string;
  isAjoutStock?: boolean; // Pour AJUSTEMENT: true = entrée, false = sortie
}

export interface SetMinimumStockDto {
  magasin_id: string;
  produit_id: string;
  quantite_minimum: number;
}

export interface StockQueryParams {
  magasin_id?: string;
  produit_id?: string;
  alerte?: boolean;
}

export interface MouvementQueryParams {
  magasin_id?: string;
  produit_id?: string;
  type?: TypeMouvementStock;
  limit?: number;
}

import { useMagasinStore } from '~/stores/magasin';

export const useStockApi = () => {
  const { get, post } = useSecureApi();

  const getStocks = async (params?: StockQueryParams): Promise<StockMagasin[]> => {
    const store = useMagasinStore();
    const finalParams = {
        ...params,
        magasin_id: params?.magasin_id || store.currentMagasinId || undefined
    };
    const response = await get<ApiResponse<StockMagasin[]>>('/api/stock', { params: finalParams });
    return response.data || [];
  };

  const getMouvements = async (params?: MouvementQueryParams): Promise<MouvementStock[]> => {
    const store = useMagasinStore();
    const finalParams = {
        ...params,
        magasin_id: params?.magasin_id || store.currentMagasinId || undefined
    };
    const response = await get<ApiResponse<MouvementStock[]>>('/api/stock/mouvements', { params: finalParams });
    return response.data || [];
  };

  const getTotalStock = async (produitId: string): Promise<number> => {
    const response = await get<ApiResponse<{ produit_id: string; total: number }>>(`/api/stock/total/${produitId}`);
    return response.data?.total || 0;
  };

  const createMouvement = async (data: CreateMouvementDto): Promise<{ mouvement: MouvementStock; newStock: StockMagasin } | null> => {
    const response = await post<ApiResponse<{ mouvement: MouvementStock; newStock: StockMagasin }>>('/api/stock/mouvements', data);
    return response.data || null;
  };

  const setMinimumStock = async (data: SetMinimumStockDto): Promise<StockMagasin | null> => {
    const response = await post<ApiResponse<StockMagasin>>('/api/stock/minimum', data);
    return response.data || null;
  };

  const getLotsByStock = async (magasinId: string, produitId: string): Promise<any[]> => {
    const response = await get<ApiResponse<any[]>>('/api/stock/lots', { params: { magasin_id: magasinId, produit_id: produitId } });
    return response.data || [];
  };

  const getStockById = async (id: string): Promise<StockMagasin | null> => {
      // Temporaire: On récupère tout et on filtre (Idéalement endpoint dédié)
      const stocks = await getStocks(); 
      return stocks.find(s => s.id === id) || null;
  };


  
  const getProductStockDetails = async (produitId: string, magasinId?: string | null): Promise<ProductStockDetails | null> => {
      const store = useMagasinStore();
      const magId = magasinId === undefined ? (store.currentMagasinId || undefined) : magasinId; // undefined = all, null = all explicit

      const response = await get<ApiResponse<ProductStockDetails>>(`/api/stock/products/${produitId}/details`, { params: { magasin_id: magId } });
      return response.data || null;
  }

  return {
    getStocks,
    getStockById,
    getMouvements,
    getTotalStock,
    createMouvement,
    setMinimumStock,
    getLotsByStock,
    getProductStockDetails
  };
};

export interface ProductStockDetails {
    product: {
        id: string;
        nom: string;
        image_url?: string;
        code_barre?: string;
        prix_vente: number;
        unite: { nom: string; symbole?: string };
        categorie: { nom: string };
        gere_peremption: boolean;
    };
    kpi: {
        total_stock: number;
        stock_value: number;
        rotation_30d: number;
        is_low_stock: boolean;
    };
    stocks_by_store: {
        id: string; // Stock ID
        quantite: number;
        magasin: { id: string; nom: string };
    }[];
    lots: {
        id: string; // Lot ID
        numero_lot: string;
        date_peremption: string;
        quantite: number;
        magasin_nom: string;
    }[];
    recent_movements: MouvementStock[];
}
