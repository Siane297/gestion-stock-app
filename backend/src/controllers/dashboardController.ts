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

    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID (Schema) manquant' });
    }
    
    // Si pas de magasin spécifié, on essaie de prendre celui de l'utilisateur ou le premier dispo ?
    // Pour l'instant on requiert le magasin_id ou on retourne une erreur si multi-magasin n'est pas géré
    // Mais on peut optionnellement sommer pour tous les magasins si magasinId est null (TODO)
    
    if (!magasinId) {
        return res.status(400).json({ message: 'Magasin ID requis' });
    }

    const prisma = await getTenantConnection(tenantId);
    const dashboardService = new DashboardService(prisma);

    const [globalStats, salesChart, topProducts] = await Promise.all([
      dashboardService.getGlobalStats(magasinId),
      dashboardService.getSalesChart(magasinId),
      dashboardService.getTopProducts(magasinId)
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
