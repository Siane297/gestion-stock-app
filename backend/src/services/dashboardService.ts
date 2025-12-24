import { PrismaClient } from '@prisma/client';

export type DashboardPeriod = 'DAY' | 'WEEK' | 'MONTH';

export class DashboardService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private getDateRanges(period: DashboardPeriod) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let currentStart: Date;
    let previousStart: Date;
    let previousEnd: Date;

    if (period === 'DAY') {
      currentStart = new Date(today);
      previousStart = new Date(today);
      previousStart.setDate(previousStart.getDate() - 1);
      previousEnd = new Date(today);
    } else if (period === 'WEEK') {
      // Start of current week (Monday)
      const day = today.getDay(); // 0 (Sun) to 6 (Sat)
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      currentStart = new Date(today.setDate(diff));
      currentStart.setHours(0, 0, 0, 0);

      previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 7);
      previousEnd = new Date(currentStart);
    } else {
      // Month
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { currentStart, previousStart, previousEnd };
  }

  async getGlobalStats(magasinId?: string, period: DashboardPeriod = 'DAY') {
    const { currentStart, previousStart, previousEnd } = this.getDateRanges(period);
    
    const where: any = {
      statut: 'PAYEE',
      date_creation: { gte: currentStart }
    };
    if (magasinId) where.magasin_id = magasinId;

    const previousWhere: any = {
      statut: 'PAYEE',
      date_creation: { gte: previousStart, lt: previousEnd }
    };
    if (magasinId) previousWhere.magasin_id = magasinId;

    // 1. Metrics for current period
    const currentMetrics = await this.prisma.vente.aggregate({
      where,
      _sum: { montant_total: true },
      _count: true
    });

    // 2. Metrics for previous period (for comparison)
    const previousMetrics = await this.prisma.vente.aggregate({
      where: previousWhere,
      _sum: { montant_total: true },
      _count: true
    });

    // 3. Stock & Purchases
    const stockWhere: any = {};
    if (magasinId) stockWhere.magasin_id = magasinId;

    const lowStocks = await this.prisma.stock_magasin.findMany({
        where: stockWhere,
        select: { quantite: true, quantite_minimum: true }
    });
    const minimalStockCount = lowStocks.filter(s => s.quantite <= s.quantite_minimum).length;

    const achatWhere: any = {
        statut: { in: ['COMMANDE', 'RECU_PARTIELLEMENT'] }
    };
    if (magasinId) achatWhere.magasin_id = magasinId;

    const pendingPurchases = await this.prisma.achat.count({
      where: achatWhere
    });

    // Calculate trends
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      revenue: {
        value: currentMetrics._sum.montant_total || 0,
        previous: previousMetrics._sum.montant_total || 0,
        trend: calculateTrend(currentMetrics._sum.montant_total || 0, previousMetrics._sum.montant_total || 0)
      },
      sales_count: {
        value: currentMetrics._count || 0,
        previous: previousMetrics._count || 0,
        trend: calculateTrend(currentMetrics._count || 0, previousMetrics._count || 0)
      },
      low_stock_count: minimalStockCount,
      pending_purchases: pendingPurchases
    };
  }

  async getSalesChart(magasinId?: string, period: DashboardPeriod = 'DAY') {
    const now = new Date();
    let startDate: Date;
    let groupBy: 'day' | 'week' = 'day';

    if (period === 'DAY') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days
    } else if (period === 'WEEK') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - (4 * 7)); // Last 4 weeks
      groupBy = 'week';
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Current Month
    }

    startDate.setHours(0, 0, 0, 0);

    const where: any = {
      statut: 'PAYEE',
      date_creation: { gte: startDate }
    };
    if (magasinId) where.magasin_id = magasinId;

    const sales = await this.prisma.vente.findMany({
      where,
      select: {
        date_creation: true,
        montant_total: true
      },
      orderBy: { date_creation: 'asc' }
    });

    const chartData: Record<string, number> = {};

    if (groupBy === 'day') {
      // Initialize daily slots
      const end = new Date();
      let curr = new Date(startDate);
      
      const formatDate = (d: Date) => {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
      };

      while(curr <= end) {
        chartData[formatDate(curr)] = 0;
        curr.setDate(curr.getDate() + 1);
      }
      
      sales.forEach(s => {
        const key = formatDate(s.date_creation);
        if (chartData[key] !== undefined) {
             chartData[key] += s.montant_total;
        }
      });
    } else {
      // Weekly aggregation
      sales.forEach(s => {
        const d = new Date(s.date_creation);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff)).toISOString().split('T')[0] as string;
        chartData[monday] = (chartData[monday] || 0) + s.montant_total;
      });
    }

    return Object.entries(chartData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, amount]) => ({ date, amount }));
  }

  async getTopProducts(magasinId?: string, period: DashboardPeriod = 'DAY', limit: number = 5) {
     const { currentStart } = this.getDateRanges(period);

     const where: any = {
         vente: {
             statut: 'PAYEE',
             date_creation: { gte: currentStart }
         }
     };
     if (magasinId) where.vente.magasin_id = magasinId;

     const details = await this.prisma.vente_detail.findMany({
         where,
         include: {
             produit: { select: { nom: true, image_url: true } }
         }
     });

     const productStats: Record<string, {name: string, quantity: number, total: number, image_url?: string}> = {};

     details.forEach(d => {
         if (!productStats[d.produit_id]) {
             productStats[d.produit_id] = { 
                 name: d.produit.nom, 
                 quantity: 0, 
                 total: 0,
                 image_url: d.produit.image_url || undefined
             };
         }
         const stat = productStats[d.produit_id];
         if (stat) {
             stat.quantity += d.quantite;
             stat.total += d.prix_total;
         }
     });

     return Object.values(productStats)
         .sort((a, b) => b.quantity - a.quantity)
         .slice(0, limit);
  }

  async getTopCategories(magasinId?: string, period: DashboardPeriod = 'DAY', limit: number = 5) {
    const { currentStart } = this.getDateRanges(period);

    const where: any = {
        vente: {
            statut: 'PAYEE',
            date_creation: { gte: currentStart }
        }
    };
    if (magasinId) where.vente.magasin_id = magasinId;

    const details = await this.prisma.vente_detail.findMany({
        where,
        include: {
            produit: { 
              include: { 
                categorie: { select: { nom: true } } 
              } 
            }
        }
    });

    const categoryStats: Record<string, {name: string, value: number}> = {};

    details.forEach(d => {
        const categoryId = d.produit.categorie_id || 'uncategorized';
        const categoryName = d.produit.categorie?.nom || 'Sans catégorie';
        
        if (!categoryStats[categoryId]) {
           categoryStats[categoryId] = { name: categoryName, value: 0 };
        }
        categoryStats[categoryId].value += d.prix_total;
    });

    return Object.values(categoryStats)
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);
 }

  async getRecentSales(magasinId?: string, limit: number = 6) {
    const where: any = {};
    if (magasinId) where.magasin_id = magasinId;

    return await this.prisma.vente.findMany({
      where,
      take: limit,
      orderBy: { date_creation: 'desc' },
      include: {
        client: { select: { nom: true } },
        magasin: { select: { nom: true } },
        session_caisse: {
          include: {
            caisse: { select: { nom: true, code: true } }
          }
        },
        utilisateur: { 
          select: { 
            employee: { select: { fullName: true } } 
          } 
        }
      }
    });
  }
}

