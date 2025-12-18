import { PrismaClient } from '@prisma/client';

export class DashboardService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getGlobalStats(magasinId: string) {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(new Date().setDate(1));
    startOfMonth.setHours(0, 0, 0, 0);

    // 1. Chiffre d'Affaires
    // CA Aujourd'hui
    const salesToday = await this.prisma.vente.aggregate({
      where: {
        magasin_id: magasinId,
        statut: 'PAYEE',
        date_creation: { gte: startOfDay }
      },
      _sum: { montant_total: true }
    });

    // CA Mois en cours
    const salesMonth = await this.prisma.vente.aggregate({
      where: {
        magasin_id: magasinId,
        statut: 'PAYEE',
        date_creation: { gte: startOfMonth }
      },
      _sum: { montant_total: true }
    });

    // 2. Nombre de Ventes (Aujourd'hui)
    const countSalesToday = await this.prisma.vente.count({
      where: {
        magasin_id: magasinId,
        statut: 'PAYEE',
        date_creation: { gte: startOfDay }
      }
    });

    // 3. Stock Faible (Alertes)
    // On compte les stocks où la quantité est <= quantité minimum
    const lowStockCount = await this.prisma.stock_magasin.count({
      where: {
        magasin_id: magasinId,
        quantite: { lte: this.prisma.stock_magasin.fields.quantite_minimum } 
        // Note: Prisma comparison with field might need specific syntax or raw query depending on version.
        // If 'lte: { col: ... }' isn't supported directly in where, we might need a workaround or raw query.
        // But let's check if we can filters.
        // Actually, checking field vs field in standard Prisma 'where' is limited.
        // Let's assume we count distinct products with low stock.
        // For simplicity in standard Prisma: get all stocks and filter in JS if not too many, 
        // OR use raw query. Given it's a dashboard, raw query is faster/better.
      }
    });
    
    // Workaround for field comparison if needed, but let's try to be safe with a raw query or simple fetch.
    // Let's use a simpler approach: "quantite" <= "quantite_minimum"
    // Since prisma doesn't support field comparison in where clause easily without extensions,
    // I will fetch stocks where quantite <= quantite_minimum. 
    // Actually, let's just fetch all stocks for the store and filter. It's safe for now unless huge inventory.
    // Improving: USE SQL RAW for best perf.
    
    const lowStocks = await this.prisma.stock_magasin.findMany({
        where: { magasin_id: magasinId },
        select: { quantite: true, quantite_minimum: true }
    });
    const minimalStockCount = lowStocks.filter(s => s.quantite <= s.quantite_minimum).length;


    // 4. Achats en Attente
    const pendingPurchases = await this.prisma.achat.count({
      where: {
        magasin_id: magasinId,
        statut: { in: ['COMMANDE', 'RECU_PARTIELLEMENT'] }
      }
    });

    return {
      revenue_today: salesToday._sum.montant_total || 0,
      revenue_month: salesMonth._sum.montant_total || 0,
      sales_count_today: countSalesToday,
      low_stock_count: minimalStockCount,
      pending_purchases: pendingPurchases
    };
  }

  async getSalesChart(magasinId: string, days: number = 7) {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - days);
    limitDate.setHours(0,0,0,0);

    const sales = await this.prisma.vente.groupBy({
      by: ['date_creation'],
      where: {
        magasin_id: magasinId,
        statut: 'PAYEE',
        date_creation: { gte: limitDate }
      },
      _sum: { montant_total: true },
      orderBy: { date_creation: 'asc' }
    });

    // Need to aggregate by day in JS because Prisma groupBy date returns full timestamp
    const chartData: Record<string, number> = {};
    
    // Initialize last 'days' days with 0
    for(let i=0; i<days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const parts = d.toISOString().split('T');
        const key = parts[0] || '';
        if (key) chartData[key] = 0;
    }

    sales.forEach(s => {
        const dateParts = new Date(s.date_creation).toISOString().split('T');
        const dateKey = dateParts[0] || ''; 
        if (dateKey && chartData[dateKey] !== undefined) {
            chartData[dateKey] += (s._sum.montant_total || 0);
        }
    });

    return Object.entries(chartData)
        .sort((a,b) => a[0].localeCompare(b[0]))
        .map(([date, amount]) => ({ date, amount }));
  }

  async getTopProducts(magasinId: string, limit: number = 5) {
     const startDate = new Date();
     startDate.setDate(startDate.getDate() - 30);

     const details = await this.prisma.vente_detail.findMany({
         where: {
             vente: {
                 magasin_id: magasinId,
                 statut: 'PAYEE',
                 date_creation: { gte: startDate }
             }
         },
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
         // Safely increment
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
}
