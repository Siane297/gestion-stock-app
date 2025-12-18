import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export interface DashboardStats {
  revenue_today: number;
  revenue_month: number;
  sales_count_today: number;
  low_stock_count: number;
  pending_purchases: number;
}

export interface DashboardCharts {
  sales: Array<{ date: string; amount: number }>;
}

export interface ProductStat {
  name: string;
  quantity: number;
  total: number;
  image_url?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: DashboardCharts;
  top_products: ProductStat[];
}

export const useDashboardApi = () => {
  const { get } = useSecureApi();

  const getDashboardStats = async (magasinId: string): Promise<DashboardData | null> => {
    if (!magasinId) return null;
    const response = await get<ApiResponse<DashboardData>>(`/api/dashboard/stats?magasin_id=${magasinId}`);
    return response.data || null;
  };

  return {
    getDashboardStats,
  };
};
