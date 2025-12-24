import { PrismaClient } from '@prisma/client';
import { TypeMouvementStock } from './stockService.js';

export interface StockAlertResult {
  id: string;
  magasin_id: string;
  produit_id: string;
  quantite: number;
  quantite_minimum: number;
  magasin: { nom: string };
  produit: { nom: string; code_barre: string | null; unite: { nom: string } | null };
  isAlert: boolean;
}

export class StockDetailService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Récupère tous les stocks avec alertes
   */
  async getStocksWithAlerts(filters?: {
    magasin_id?: string;
    produit_id?: string;
    alertOnly?: boolean;
  }): Promise<StockAlertResult[]> {
    const where: any = {};
    if (filters?.magasin_id) where.magasin_id = filters.magasin_id;
    if (filters?.produit_id) where.produit_id = filters.produit_id;

    const stocks = await this.prisma.stock_magasin.findMany({
      where,
      include: {
        magasin: { select: { nom: true } },
        produit: { 
            select: { 
                nom: true, 
                unite: true,
                conditionnements: {
                    where: { quantite_base: 1 },
                    select: { code_barre: true },
                    take: 1
                }
            } 
        }
      },
      orderBy: { quantite: 'asc' }
    });

    const result = stocks.map(stock => ({
      ...stock,
      produit: {
          nom: stock.produit.nom,
          unite: stock.produit.unite,
          code_barre: stock.produit.conditionnements[0]?.code_barre || null
      },
      isAlert: stock.quantite <= stock.quantite_minimum
    }));

    if (filters?.alertOnly) {
      return result.filter(s => s.isAlert);
    }

    return result;
  }

  /**
   * Récupère le détail des stocks par lot pour un produit et un magasin
   */
  async getLotsByStock(magasin_id: string, produit_id: string): Promise<any[]> {
    return this.prisma.stock_lot.findMany({
      where: {
        magasin_id,
        lot: { produit_id }
      },
      include: {
        lot: true
      },
      orderBy: {
        lot: { date_peremption: 'asc' }
      }
    });
  }
 
  /**
   * Obtenir le stock total d'un produit (tous magasins)
   */
  async getTotalStock(produit_id: string): Promise<number> {
    const result = await this.prisma.stock_magasin.aggregate({
      where: { produit_id },
      _sum: { quantite: true }
    });
    return result._sum.quantite || 0;
  }

  /**
   * Historique des mouvements
   */
  async getMouvements(filters?: {
    magasin_id?: string;
    produit_id?: string;
    type?: TypeMouvementStock;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
  }): Promise<any[]> {
    const where: any = {};
    if (filters?.magasin_id) where.magasin_id = filters.magasin_id;
    if (filters?.produit_id) where.produit_id = filters.produit_id;
    if (filters?.type) where.type = filters.type;
    if (filters?.dateFrom || filters?.dateTo) {
      where.date_creation = {};
      if (filters.dateFrom) where.date_creation.gte = filters.dateFrom;
      if (filters.dateTo) where.date_creation.lte = filters.dateTo;
    }

    const mvmts = await this.prisma.mouvements_stock.findMany({
      where,
      include: {
        magasin: { select: { nom: true } },
        produit: { 
            select: { 
                nom: true, 
                conditionnements: {
                    where: { quantite_base: 1 },
                    select: { code_barre: true },
                    take: 1
                }
            } 
        },
        lot: true, // Include Lot info
        utilisateur: { 
            select: { 
                email: true,
                employee: {
                    select: { fullName: true }
                }
            } 
        }
      },
      orderBy: { date_creation: 'desc' },
      take: filters?.limit || 100
    });
    
    return mvmts.map(m => ({
        ...m,
        produit: {
            ...m.produit,
            code_barre: m.produit.conditionnements[0]?.code_barre || null
        }
    }));
  }

  /**
   * Récupère les détails complets du stock pour un produit spécifique (Dashboard Detail Produit)
   */
  async getProductStockDetails(produitId: string, magasinId?: string) {
      // 1. Info Produit de base
      const produit = await this.prisma.produit.findUnique({
          where: { id: produitId },
          include: {
              unite: true,
              categorie: true,
              conditionnements: { where: { quantite_base: 1 }, take: 1 }
          }
      });

      if (!produit) throw new Error("Produit non trouvé");

      // 2. Stock Actuel (Filtrer par magasin si fourni)
      const stockWhere: any = { produit_id: produitId };
      if (magasinId) stockWhere.magasin_id = magasinId;

      const stocks = await this.prisma.stock_magasin.findMany({
          where: stockWhere,
          include: { magasin: { select: { nom: true, id: true } } }
      });
      
      const totalStock = stocks.reduce((acc, s) => acc + s.quantite, 0);
      const stockValue = totalStock * (produit.prix_achat ?? 0);

      // 3. Stats (Ventes 30 derniers jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const salesStats = await this.prisma.vente_detail.aggregate({
          where: {
              produit_id: produitId,
              vente: {
                  statut: 'PAYEE',
                  date_creation: { gte: thirtyDaysAgo },
                  ...(magasinId ? { magasin_id: magasinId } : {})
              }
          },
          _sum: { quantite: true }
      });
      const rotation30j = salesStats._sum.quantite || 0;

      // 4. Lots (Si périssable)
      let lots: any[] = [];
      if (produit.gere_peremption) {
          const lotWhere: any = {
              magasin_id: magasinId || undefined,
              lot: { produit_id: produitId },
              quantite: { gt: 0 }
          };
          
          lots = await this.prisma.stock_lot.findMany({
              where: lotWhere,
              include: { 
                  lot: true,
                  magasin: { select: { nom: true } }
              },
              orderBy: { lot: { date_peremption: 'asc' } }
          });
      }

      // 5. Derniers Mouvements
      const mouvements = await this.getMouvements({
          produit_id: produitId,
          magasin_id: magasinId,
          limit: 20
      });

      return {
          product: {
              ...produit,
              code_barre: produit.conditionnements[0]?.code_barre || produit.code_barre // Fallback
          },
          kpi: {
              total_stock: totalStock,
              stock_value: stockValue,
              rotation_30d: rotation30j,
              is_low_stock: stocks.some(s => s.quantite <= s.quantite_minimum)
          },
          stocks_by_store: stocks,
          lots: lots.map(l => ({
              ...l.lot,
              quantite: l.quantite,
              magasin_nom: l.magasin.nom
          })),
          recent_movements: mouvements
      };
  }
}
