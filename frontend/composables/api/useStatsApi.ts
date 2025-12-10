import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

// Types pour les statistiques
export interface DashboardStats {
  totalEmployes: number;
  presencesDuJour: number;
  absencesDuJour: number;
  retardsDuJour: number;
  incompletsDuJour: number;
  congesDuJour: number;
  congesApprouvesDuJour: number;
}

export const useStatsApi = () => {
  const { get } = useSecureApi();

  // Obtenir les statistiques du dashboard
  const getDashboardStats = async (date?: Date): Promise<DashboardStats | null> => {
    try {
      const params: any = {};
      if (date) {
        params.date = date.toISOString();
      }
      const response = await get<ApiResponse<DashboardStats>>('/api/stats/dashboard', { params });
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  };

  // Obtenir le top 5 des employés
  const getTopEmployees = async (month?: Date): Promise<any[]> => {
    try {
      const params: any = {};
      if (month) {
        params.month = month.toISOString();
      }
      const response = await get<ApiResponse<any[]>>('/api/stats/top-employees', { params });
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération du top employés:', error);
      throw error;
    }
  };

  return {
    getDashboardStats,
    getTopEmployees,
  };
};
