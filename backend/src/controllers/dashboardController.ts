import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService.js';
import { getTenantConnection } from '../services/tenantService.js';
import { logger } from '../config/logger.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { user } = req;
    // @ts-ignore - tenantSchema is added by middleware
    const tenantId = req.tenantSchema; 
    const magasinId = req.query.magasin_id as string;
    const period = (req.query.period as any) || 'DAY';

    if (!tenantId || !req.tenantPrisma) {
      return res.status(400).json({ message: 'Contexte Tenant (Schema) manquant' });
    }
    
    const dashboardService = new DashboardService(req.tenantPrisma);
    let finalMagasinId = magasinId;

    // Restriction par rôle
    if (user?.role !== 'ADMIN') {
        const tenantUser = await req.tenantPrisma.tenantUser.findUnique({
             where: { id: (user as any)?.userId },
             select: { magasin_id: true }
        });

        if (!tenantUser?.magasin_id) {
             return res.status(403).json({ message: 'Aucun magasin assigné. Accès refusé au dashboard.' });
        }
        finalMagasinId = tenantUser.magasin_id;
    }

    const [globalStats, salesChart, topProducts, recentSales] = await Promise.all([
      dashboardService.getGlobalStats(finalMagasinId, period),
      dashboardService.getSalesChart(finalMagasinId, period),
      dashboardService.getTopProducts(finalMagasinId, period),
      dashboardService.getRecentSales(finalMagasinId, 6)
    ]);

    res.json({
      success: true,
      data: {
        stats: globalStats,
        charts: {
            sales: salesChart
        },
        top_products: topProducts,
        recent_sales: recentSales
      }
    });

  } catch (error: any) {
    logger.error('Erreur dashboard:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du dashboard', error: error.message });
  }
};
