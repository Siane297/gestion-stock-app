import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export interface MetricWithTrend {
  value: number;
  previous: number;
  trend: number;
}

export interface DashboardStats {
  revenue: MetricWithTrend;
  sales_count: MetricWithTrend;
  profit: MetricWithTrend;
  low_stock_count: number;
  out_of_stock_count: number;
  pending_purchases: number;
  total_products_count: number;
  expired_products_count: number;
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

export interface CategoryStat {
  name: string;
  value: number;
}

export interface RecentSale {
  id: string;
  numero_vente: string | null;
  montant_total: number;
  statut: string;
  date_creation: string;
  client?: { nom: string };
  magasin?: { nom: string };
  session_caisse?: {
    caisse: { nom: string, code: string }
  };
  utilisateur: { employee: { fullName: string } };
}

export interface DashboardData {
  stats: DashboardStats;
  charts: DashboardCharts;
  top_products: ProductStat[];
  top_categories: CategoryStat[];
  recent_sales: RecentSale[];
}

export const useDashboardApi = () => {
  const { get } = useSecureApi();

  const getDashboardStats = async (magasinId?: string, period: string = 'DAY'): Promise<DashboardData | null> => {
    let url = `/api/dashboard/stats?period=${period}`;
    if (magasinId) {
        url += `&magasin_id=${magasinId}`;
    }
    
    const response = await get<ApiResponse<DashboardData>>(url);
    return response.data || null;
  };

  return {
    getDashboardStats,
  };
};
