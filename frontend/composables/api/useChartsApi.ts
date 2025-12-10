import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

// Types pour les données des charts
export interface PointagesChartData {
  categories: string[];
  entrees: number[];
  sorties: number[];
}

export interface StatutsChartData {
  presences: number;
  retards: number;
  absences: number;
  incomplets: number;
  total: number;
}

export const useChartsApi = () => {
  const { get } = useSecureApi();

  // Obtenir les données du chart des pointages
  const getPointagesChart = async (filter: 'day' | 'week' | 'month' = 'day', date?: Date): Promise<PointagesChartData | null> => {
    try {
      const params: any = { filter };
      if (date) {
        params.date = date.toISOString();
      }
      
      const response = await get<ApiResponse<PointagesChartData>>('/api/charts/pointages', { params });
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données du chart des pointages:', error);
      throw error;
    }
  };

  // Obtenir les données du chart des statuts
  const getStatutsChart = async (month?: Date, date?: Date): Promise<StatutsChartData | null> => {
    try {
      const params: any = {};
      if (month) {
        params.month = month.toISOString();
      } else if (date) {
        params.date = date.toISOString();
      }
      
      const response = await get<ApiResponse<StatutsChartData>>('/api/charts/statuts', { params });
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données du chart des statuts:', error);
      throw error;
    }
  };

  return {
    getPointagesChart,
    getStatutsChart,
  };
};
