import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

// Types pour les mouvements de stock
export type TypeMouvementStock = 
  | 'ENTREE_ACHAT'
  | 'ENTREE_RETOUR'
  | 'SORTIE_VENTE'
  | 'SORTIE_PERISSABLE'
  | 'AJUSTEMENT'
  | 'TRANSFERT';

export interface CreateMouvementDto {
  magasin_id: string;
  produit_id: string;
  type: TypeMouvementStock;
  quantite: number;
  utilisateur_id?: string;
  raison?: string;
  vente_id?: string;
  achat_id?: string;
}

export interface StockUpdateResult {
  mouvement: any;
  newStock: any;
}

export interface StockAlertResult {
  id: string;
  magasin_id: string;
  produit_id: string;
  quantite: number;
  quantite_minimum: number;
  magasin: { nom: string };
  produit: { nom: string; code_barre: string | null; unite: string };
  isAlert: boolean;
}

/**
 * Service centralisé pour la gestion des stocks
 * Utilisé par achatService, venteService et stockController
 */
export class StockService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Vérifie si le stock est suffisant pour une sortie
   */
  async checkStockAvailable(
    magasin_id: string,
    produit_id: string,
    quantite: number
  ): Promise<{ available: boolean; currentStock: number }> {
    const stock = await this.prisma.stock_magasin.findUnique({
      where: {
        magasin_id_produit_id: { magasin_id, produit_id }
      }
    });

    const currentStock = stock?.quantite || 0;
    return {
      available: currentStock >= quantite,
      currentStock
    };
  }

  /**
   * Vérifie la disponibilité de stock pour plusieurs produits
   */
  async checkMultipleStockAvailable(
    magasin_id: string,
    items: Array<{ produit_id: string; quantite: number }>
  ): Promise<{ allAvailable: boolean; unavailable: Array<{ produit_id: string; required: number; available: number }> }> {
    const unavailable: Array<{ produit_id: string; required: number; available: number }> = [];

    for (const item of items) {
      const result = await this.checkStockAvailable(magasin_id, item.produit_id, item.quantite);
      if (!result.available) {
        unavailable.push({
          produit_id: item.produit_id,
          required: item.quantite,
          available: result.currentStock
        });
      }
    }

    return {
      allAvailable: unavailable.length === 0,
      unavailable
    };
  }

  /**
   * Crée un mouvement de stock et met à jour la quantité
   * @param tx - Transaction Prisma optionnelle pour atomicité
   */
  async createMouvement(
    data: CreateMouvementDto,
    tx?: any
  ): Promise<StockUpdateResult> {
    const prismaClient = tx || this.prisma;
    
    // Validation quantité
    if (!Number.isInteger(data.quantite) || data.quantite <= 0) {
      throw new Error('La quantité doit être un entier positif');
    }

    // Déterminer l'opération (incrément ou décrément)
    const isIncrement = ['ENTREE_ACHAT', 'ENTREE_RETOUR'].includes(data.type) ||
      (data.type === 'AJUSTEMENT' && data.raison?.toLowerCase().includes('ajout'));
    
    const isDecrement = ['SORTIE_VENTE', 'SORTIE_PERISSABLE'].includes(data.type) ||
      (data.type === 'AJUSTEMENT' && !data.raison?.toLowerCase().includes('ajout'));

    // Vérification du stock actuel
    const currentStock = await prismaClient.stock_magasin.findUnique({
      where: {
        magasin_id_produit_id: {
          magasin_id: data.magasin_id,
          produit_id: data.produit_id
        }
      }
    });

    // Validation pour les sorties
    if (isDecrement) {
      if (!currentStock) {
        throw new Error("Impossible de déstocker un produit qui n'a pas de stock");
      }
      if (currentStock.quantite < data.quantite) {
        throw new Error(`Stock insuffisant. Actuel: ${currentStock.quantite}, Demandé: ${data.quantite}`);
      }
    }

    // 1. Créer le mouvement
    const mouvement = await prismaClient.mouvements_stock.create({
      data: {
        magasin_id: data.magasin_id,
        produit_id: data.produit_id,
        utilisateur_id: data.utilisateur_id || null,
        type: data.type,
        quantite: data.quantite,
        raison: data.raison || (isIncrement ? 'Entrée de stock' : 'Sortie de stock'),
        vente_id: data.vente_id || null,
        achat_id: data.achat_id || null
      }
    });

    // 2. Mettre à jour ou créer le stock
    let newStock;
    if (!currentStock) {
      // Créer le stock (uniquement pour les incréments)
      newStock = await prismaClient.stock_magasin.create({
        data: {
          magasin_id: data.magasin_id,
          produit_id: data.produit_id,
          quantite: data.quantite,
          quantite_minimum: 0
        }
      });
    } else {
      // Mettre à jour le stock existant
      newStock = await prismaClient.stock_magasin.update({
        where: {
          magasin_id_produit_id: {
            magasin_id: data.magasin_id,
            produit_id: data.produit_id
          }
        },
        data: {
          quantite: isDecrement
            ? { decrement: data.quantite }
            : { increment: data.quantite }
        }
      });
    }

    logger.info(`Mouvement stock créé: ${data.type} ${data.quantite} unités pour produit ${data.produit_id} dans magasin ${data.magasin_id}`);

    return { mouvement, newStock };
  }

  /**
   * Incrémente le stock (entrée)
   */
  async incrementStock(
    magasin_id: string,
    produit_id: string,
    quantite: number,
    options: { utilisateur_id?: string; raison?: string; achat_id?: string } = {},
    tx?: any
  ): Promise<StockUpdateResult> {
    return this.createMouvement({
      magasin_id,
      produit_id,
      type: 'ENTREE_ACHAT',
      quantite,
      ...options
    }, tx);
  }

  /**
   * Décrémente le stock (sortie vente)
   */
  async decrementStock(
    magasin_id: string,
    produit_id: string,
    quantite: number,
    options: { utilisateur_id?: string; raison?: string; vente_id?: string } = {},
    tx?: any
  ): Promise<StockUpdateResult> {
    return this.createMouvement({
      magasin_id,
      produit_id,
      type: 'SORTIE_VENTE',
      quantite,
      ...options
    }, tx);
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
        produit: { select: { nom: true, code_barre: true, unite: true } }
      },
      orderBy: { quantite: 'asc' }
    });

    const result = stocks.map(stock => ({
      ...stock,
      isAlert: stock.quantite <= stock.quantite_minimum
    }));

    if (filters?.alertOnly) {
      return result.filter(s => s.isAlert);
    }

    return result;
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
   * Définir le seuil minimum de stock
   */
  async setMinimumStock(
    magasin_id: string,
    produit_id: string,
    quantite_minimum: number
  ): Promise<any> {
    return this.prisma.stock_magasin.upsert({
      where: {
        magasin_id_produit_id: { magasin_id, produit_id }
      },
      update: { quantite_minimum },
      create: {
        magasin_id,
        produit_id,
        quantite: 0,
        quantite_minimum
      }
    });
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

    return this.prisma.mouvements_stock.findMany({
      where,
      include: {
        magasin: { select: { nom: true } },
        produit: { select: { nom: true, code_barre: true } },
        utilisateur: { select: { email: true } }
      },
      orderBy: { date_creation: 'desc' },
      take: filters?.limit || 100
    });
  }
}

export default StockService;
