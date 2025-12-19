import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService.js';
import { getTenantConnection } from '../services/tenantService.js';
import { logger } from '../config/logger.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { user } = req;
    // @ts-ignore - tenantSchema is added by middleware
    const tenantId = (req as any).tenantSchema; 
    const magasinId = req.query.magasin_id as string;
    const period = (req.query.period as any) || 'DAY';

    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID (Schema) manquant' });
    }
    
    if (!magasinId) {
        return res.status(400).json({ message: 'Magasin ID requis' });
    }

    const prisma = await getTenantConnection(tenantId);
    const dashboardService = new DashboardService(prisma);

    const [globalStats, salesChart, topProducts] = await Promise.all([
      dashboardService.getGlobalStats(magasinId, period),
      dashboardService.getSalesChart(magasinId, period),
      dashboardService.getTopProducts(magasinId, period)
    ]);

    res.json({
      success: true,
      data: {
        stats: globalStats,
        charts: {
            sales: salesChart
        },
        top_products: topProducts
      }
    });

  } catch (error: any) {
    logger.error('Erreur dashboard:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du dashboard', error: error.message });
  }
};
