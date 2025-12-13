import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RECEPTION' | 'VENTE' | 'ANNULATION' | 'MOUVEMENT_STOCK';
export type AuditEntity = 'PRODUIT' | 'CLIENT' | 'FOURNISSEUR' | 'MAGASIN' | 'ACHAT' | 'VENTE' | 'STOCK' | 'UTILISATEUR';

export interface AuditLog {
  id: string;
  utilisateur_id: string;
  action: AuditAction;
  table_cible: AuditEntity;
  enregistrement_id: string;
  ancienne_valeur?: string;
  nouvelle_valeur?: string;
  ip_adresse?: string;
  date_action: string;
  utilisateur?: { email: string };
}

export interface ActivitySummary {
  totalActions: number;
  ventes: number;
  achats: number;
  mouvementsStock: number;
  modifications: number;
}

export interface AuditQueryParams {
  entity?: AuditEntity;
  entity_id?: string;
  action?: AuditAction;
  user_id?: string;
  limit?: number;
}

export const useAuditApi = () => {
  const { get } = useSecureApi();

  const getAuditLogs = async (params?: AuditQueryParams): Promise<AuditLog[]> => {
    const response = await get<ApiResponse<AuditLog[]>>('/api/audit', { params });
    return response.data || [];
  };

  const getEntityHistory = async (entity: AuditEntity, entityId: string): Promise<AuditLog[]> => {
    const response = await get<ApiResponse<AuditLog[]>>(`/api/audit/entity/${entity}/${entityId}`);
    return response.data || [];
  };

  const getUserActions = async (userId: string, limit?: number): Promise<AuditLog[]> => {
    const params = limit ? { limit } : undefined;
    const response = await get<ApiResponse<AuditLog[]>>(`/api/audit/user/${userId}`, { params });
    return response.data || [];
  };

  const getActivitySummary = async (hours?: number): Promise<ActivitySummary | null> => {
    const params = hours ? { hours } : undefined;
    const response = await get<ApiResponse<ActivitySummary>>('/api/audit/summary', { params });
    return response.data || null;
  };

  return {
    getAuditLogs,
    getEntityHistory,
    getUserActions,
    getActivitySummary,
  };
};
