import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

// ============================================
// INTERFACES - CAISSE
// ============================================

export type StatutCaisse = 'ACTIVE' | 'INACTIVE' | 'EN_MAINTENANCE';
export type StatutSessionCaisse = 'OUVERTE' | 'FERMEE' | 'SUSPENDUE';

export interface Caisse {
  id: string;
  code: string;
  nom: string;
  magasin_id: string;
  statut: StatutCaisse;
  description?: string;
  date_creation: string;
  magasin?: { nom: string };
  sessions?: SessionCaisse[];
}

export interface SessionCaisse {
  id: string;
  caisse_id: string;
  utilisateur_id: string;
  fond_initial: number;
  fond_final?: number;
  total_especes: number;
  total_carte: number;
  total_mobile: number;
  total_cheque: number;
  total_autre: number;
  ecart?: number;
  statut: StatutSessionCaisse;
  date_ouverture: string;
  date_fermeture?: string;
  notes_ouverture?: string;
  notes_fermeture?: string;
  caisse?: { id: string; nom: string; code: string };
  utilisateur?: { email: string; employee?: { fullName: string } };
  _count?: { ventes: number };
}

export interface RapportSession {
  id: string;
  caisse: { id: string; nom: string; code: string };
  utilisateur: { id: string; email: string; fullName?: string };
  fond_initial: number;
  fond_final: number | null;
  total_especes: number;
  total_carte: number;
  total_mobile: number;
  total_cheque: number;
  total_autre: number;
  ecart: number | null;
  nombre_ventes: number;
  chiffre_affaires: number;
  statut: StatutSessionCaisse;
  date_ouverture: string;
  date_fermeture: string | null;
  notes_ouverture?: string;
  notes_fermeture?: string;
}

// ============================================
// DTOs
// ============================================

export interface CreateCaisseDto {
  code: string;
  nom: string;
  magasin_id: string;
  description?: string;
}

export interface UpdateCaisseDto {
  code?: string;
  nom?: string;
  description?: string;
  statut?: StatutCaisse;
}

export interface OuvrirSessionDto {
  fond_initial: number;
  notes?: string;
}

export interface OuvrirSessionParPinDto {
  pin: string;
  fond_initial: number;
  notes?: string;
}

export interface FermerSessionDto {
  fond_final: number;
  notes?: string;
}

// ============================================
// COMPOSABLE
// ============================================

export const useCaisseApi = () => {
  const { get, post, put, delete: del } = useSecureApi();

  // ============================================
  // CRUD CAISSES
  // ============================================

  const getCaisses = async (magasinId?: string): Promise<Caisse[]> => {
    const response = await get<ApiResponse<Caisse[]>>('/api/caisses', { 
      params: magasinId ? { magasin_id: magasinId } : undefined
    });
    return response.data || [];
  };

  const getCaisseById = async (id: string): Promise<Caisse | null> => {
    const response = await get<ApiResponse<Caisse>>(`/api/caisses/${id}`);
    return response.data || null;
  };

  const createCaisse = async (data: CreateCaisseDto): Promise<Caisse | null> => {
    const response = await post<ApiResponse<Caisse>>('/api/caisses', data);
    return response.data || null;
  };

  const updateCaisse = async (id: string, data: UpdateCaisseDto): Promise<Caisse | null> => {
    const response = await put<ApiResponse<Caisse>>(`/api/caisses/${id}`, data);
    return response.data || null;
  };

  const deleteCaisse = async (id: string): Promise<boolean> => {
    await del(`/api/caisses/${id}`);
    return true;
  };

  // ============================================
  // SESSIONS DE CAISSE
  // ============================================

  /**
   * Ouvrir une session de caisse (via JWT authentifié)
   */
  const ouvrirSession = async (caisseId: string, data: OuvrirSessionDto): Promise<SessionCaisse | null> => {
    const response = await post<ApiResponse<SessionCaisse>>(`/api/caisses/${caisseId}/ouvrir`, data);
    return response.data || null;
  };

  /**
   * Ouvrir une session de caisse via PIN (authentification caissier)
   * Cet endpoint ne nécessite pas de JWT, juste le contexte tenant
   */
  const ouvrirSessionParPin = async (caisseId: string, data: OuvrirSessionParPinDto): Promise<SessionCaisse | null> => {
    const response = await post<ApiResponse<SessionCaisse>>(`/api/caisses/${caisseId}/ouvrir-pin`, data);
    return response.data || null;
  };

  /**
   * Fermer (clôturer) la session active d'une caisse
   */
  const fermerSession = async (caisseId: string, data: FermerSessionDto): Promise<RapportSession | null> => {
    const response = await post<ApiResponse<RapportSession>>(`/api/caisses/${caisseId}/fermer`, data);
    return response.data || null;
  };

  /**
   * Récupérer la session active d'une caisse
   */
  const getSessionActive = async (caisseId: string): Promise<SessionCaisse | null> => {
    const response = await get<ApiResponse<SessionCaisse>>(`/api/caisses/${caisseId}/session-active`);
    return response.data || null;
  };

  /**
   * Récupérer l'historique des sessions d'une caisse
   */
  const getHistoriqueSessions = async (caisseId: string, limit = 30): Promise<SessionCaisse[]> => {
    const response = await get<ApiResponse<SessionCaisse[]>>(`/api/caisses/${caisseId}/historique`, {
      params: { limit }
    });
    return response.data || [];
  };

  /**
   * Récupérer la session active de l'utilisateur connecté
   */
  const getMaSession = async (): Promise<SessionCaisse | null> => {
    const response = await get<ApiResponse<SessionCaisse>>('/api/caisses/sessions/ma-session');
    return response.data || null;
  };

  /**
   * Détail complet d'une session (rapport)
   */
  const getSessionDetail = async (sessionId: string): Promise<RapportSession | null> => {
    const response = await get<ApiResponse<RapportSession>>(`/api/caisses/sessions/${sessionId}`);
    return response.data || null;
  };

  return {
    // CRUD Caisses
    getCaisses,
    getCaisseById,
    createCaisse,
    updateCaisse,
    deleteCaisse,
    // Sessions
    ouvrirSession,
    ouvrirSessionParPin,
    fermerSession,
    getSessionActive,
    getHistoriqueSessions,
    getMaSession,
    getSessionDetail,
  };
};
