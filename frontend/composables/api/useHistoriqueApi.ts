import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

// Types pour le bilan de présence
export interface BilanEmploye {
  id: string;
  matricule: string;
  fullName: string;
  department: string;
  position: string;
}

export interface BilanPresence {
  id: string;
  createdAt: string; // Remplacement de 'date' par 'createdAt'
  employe: BilanEmploye;
  statut: 'A_L_HEURE' | 'EN_RETARD' | 'ABSENT' | 'INCOMPLET' | 'EN_CONGE';
  heureEntree: string | null;
  heureSortie: string | null;
  dureeTravailMinutes: number;
  retardMinutes: number;
  notes: string | null;
}

export interface BilanQueryParams {
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  statut?: 'A_L_HEURE' | 'EN_RETARD' | 'ABSENT' | 'INCOMPLET' | 'EN_CONGE';
}

/**
 * Composable pour interagir avec l'API des bilans de présence
 */
export const useBilanPresenceApi = () => {
  const { get, post } = useSecureApi();

  /**
   * Récupérer l'historique des bilans avec filtres
   */
  const getHistorique = async (params?: BilanQueryParams): Promise<BilanPresence[]> => {
    try {
      const response = await get<ApiResponse<BilanPresence[]>>('/api/bilans/historique', { params });
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  };

  /**
   * Marquer manuellement les employés absents
   */
  const marquerAbsents = async (date?: string): Promise<{ nombreAbsents: number } | null> => {
    try {
      const body = date ? { date } : {};
      const response = await post<ApiResponse<{ date: string; nombreAbsents: number }>>('/api/bilans/marquer-absents', body);
      return response.data ? { nombreAbsents: response.data.nombreAbsents } : null;
    } catch (error) {
      console.error('Erreur lors du marquage des absents:', error);
      throw error;
    }
  };

  return {
    getHistorique,
    marquerAbsents,
  };
};

// Export de l'ancien nom pour compatibilité
export const useHistoriqueApi = useBilanPresenceApi;
