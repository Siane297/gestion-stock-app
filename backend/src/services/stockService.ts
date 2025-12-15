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
  lot_id?: string;
  numero_lot?: string;     // Pour mouvement manuel
  date_peremption?: Date; // Pour mouvement manuel
  magasin_dest_id?: string; // Pour transfert
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

    if (data.type === 'TRANSFERT' && !data.magasin_dest_id) {
        throw new Error('Le magasin de destination est requis pour un transfert');
    }
    if (data.type === 'TRANSFERT' && data.magasin_id === data.magasin_dest_id) {
        throw new Error('Le magasin de destination doit être différent du magasin d\'origine');
    }

    // Déterminer l'opération (incrément ou décrément) sur le magasin source
    const isIncrement = ['ENTREE_ACHAT', 'ENTREE_RETOUR'].includes(data.type) ||
      (data.type === 'AJUSTEMENT' && data.raison?.toLowerCase().includes('ajout'));
    
    // TRANSFERT est une sortie pour le magasin source
    const isDecrement = ['SORTIE_VENTE', 'SORTIE_PERISSABLE', 'TRANSFERT'].includes(data.type) ||
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

    // 0. Gestion Lot (Résolution lot_id ou création si manuel)
    if (data.numero_lot && !data.lot_id) {
         // Rechercher ou créer le lot
         const lot = await prismaClient.lot_produit.upsert({
             where: {
                 produit_id_numero_lot: { produit_id: data.produit_id, numero_lot: data.numero_lot }
             },
             create: {
                 produit_id: data.produit_id,
                 numero_lot: data.numero_lot,
                 date_peremption: data.date_peremption
             },
             update: {}
         });
         data.lot_id = lot.id;
    }

    // Mise à jour table stock_lot
    if (data.lot_id) {
       if (isIncrement) {
           await prismaClient.stock_lot.upsert({
               where: {
                   magasin_id_lot_id: { magasin_id: data.magasin_id, lot_id: data.lot_id }
               },
               create: { magasin_id: data.magasin_id, lot_id: data.lot_id, quantite: data.quantite },
               update: { quantite: { increment: data.quantite } }
           });
       } else if (isDecrement) {
           await prismaClient.stock_lot.update({
               where: {
                   magasin_id_lot_id: { magasin_id: data.magasin_id, lot_id: data.lot_id }
               },
               data: { quantite: { decrement: data.quantite } }
           });
       }
    }

    // 0.5. Validation utilisateur et magasin dest
    if (data.utilisateur_id) {
        try {
            const userExists = await prismaClient.tenantUser.findUnique({
                where: { id: data.utilisateur_id },
                select: { id: true }
            });
            if (!userExists) data.utilisateur_id = undefined;
        } catch (e) {
            data.utilisateur_id = undefined;
        }
    }

    // 1. Créer le mouvement (Source)
    // Pour un transfert, ce mouvement représente la SORTIE du magasin A
    const mouvement = await prismaClient.mouvements_stock.create({
      data: {
        magasin_id: data.magasin_id,
        produit_id: data.produit_id,
        utilisateur_id: data.utilisateur_id || null,
        type: data.type,
        quantite: data.quantite,
        raison: data.raison || (isIncrement ? 'Entrée de stock' : (data.type === 'TRANSFERT' ? `Transfert vers autre magasin` : 'Sortie de stock')),
        vente_id: data.vente_id || null,
        achat_id: data.achat_id || null,
        lot_id: data.lot_id || null
      }
    });

    // 2. Mettre à jour le stock Source
    let newStock;
    if (!currentStock) {
      newStock = await prismaClient.stock_magasin.create({
        data: {
          magasin_id: data.magasin_id,
          produit_id: data.produit_id,
          quantite: data.quantite,
          quantite_minimum: 0
        }
      });
    } else {
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

    // 3. Gérer le TRANSFERT (Destination)
    if (data.type === 'TRANSFERT' && data.magasin_dest_id) {
        // Entrée dans le magasin B
        await prismaClient.stock_magasin.upsert({
            where: {
                magasin_id_produit_id: {
                    magasin_id: data.magasin_dest_id,
                    produit_id: data.produit_id
                }
            },
            create: {
                magasin_id: data.magasin_dest_id,
                produit_id: data.produit_id,
                quantite: data.quantite,
                quantite_minimum: 0
            },
            update: {
                quantite: { increment: data.quantite }
            }
        });

        // Créer un mouvement miroir pour l'entrée ?
        // Pour la traçabilité complète, c'est mieux d'avoir une ligne "ENTREE_TRANSFERT" ou juste un TRANSFERT entrant.
        // Mais gardons simple : On trace juste que le stock B a augmenté.
        // Idéalement, on crée un deuxième mouvement pour le magasin B.
        await prismaClient.mouvements_stock.create({
            data: {
              magasin_id: data.magasin_dest_id,
              produit_id: data.produit_id,
              utilisateur_id: data.utilisateur_id || null,
              type: 'TRANSFERT', // On garde le même type, mais magasin est différent
              quantite: data.quantite,
              raison: `Réception transfert depuis ${data.magasin_id}`, // Idéalement le nom du magasin
              lot_id: data.lot_id || null
            }
        });

        // Si stock_lot utilisé, on doit aussi incrémenter le lot dans le magasin B
        if (data.lot_id) {
            await prismaClient.stock_lot.upsert({
                where: {
                    magasin_id_lot_id: { magasin_id: data.magasin_dest_id, lot_id: data.lot_id }
                },
                create: { magasin_id: data.magasin_dest_id, lot_id: data.lot_id, quantite: data.quantite },
                update: { quantite: { increment: data.quantite } }
            });
        }
    }

    logger.info(`Mouvement de stock enregistré : ${data.type} de ${data.quantite} unités pour le produit ${data.produit_id} dans le magasin ${data.magasin_id}`);

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
    const prismaClient = tx || this.prisma;
    
    // Vérifier si le produit gère la péremption
    const produit = await prismaClient.produit.findUnique({ where: { id: produit_id }, select: { gere_peremption: true, nom: true } });
    
    if (produit?.gere_peremption) {
        return this.decrementStockFEFO(magasin_id, produit_id, quantite, options, tx);
    }

    return this.createMouvement({
      magasin_id,
      produit_id,
      type: 'SORTIE_VENTE',
      quantite,
      ...options
    }, tx);
  }

  /**
   * Logique FEFO (First Expired First Out)
   */
  private async decrementStockFEFO(
    magasin_id: string,
    produit_id: string,
    quantite: number,
    options: { utilisateur_id?: string; raison?: string; vente_id?: string } = {},
    tx?: any
  ): Promise<StockUpdateResult> {
    const prismaClient = tx || this.prisma;
    
    // 1. Récupérer les lots disponibles triés par date
    const lots = await prismaClient.stock_lot.findMany({
        where: {
            magasin_id,
            lot: { produit_id },
            quantite: { gt: 0 }
        },
        include: { lot: true },
        orderBy: { lot: { date_peremption: 'asc' } }
    });

    let remainingQty = quantite;
    const details = [];

    for (const stockLot of lots) {
        if (remainingQty <= 0) break;

        const qtyToTake = Math.min(stockLot.quantite, remainingQty);
        
        details.push({
            lot_id: stockLot.lot_id,
            quantite: qtyToTake
        });

        remainingQty -= qtyToTake;
    }

    if (remainingQty > 0) {
        // Fallback: Si pas assez de lots mais stock global OK (incohérence) ou juste pas assez de stock
        // On check le stock global
        throw new Error(`Stock insuffisant en lots pour la péremption. Manque: ${remainingQty}`);
    }

    // 2. Créer les mouvements et décrémenter pour chaque lot
    let lastMouvement;
    let lastNewStock;

    for (const detail of details) {
       const res = await this.createMouvement({
           magasin_id,
           produit_id,
           type: 'SORTIE_VENTE', // Ou PERISSABLE si c'était de la perte, mais ici c'est decrementStock générique (vente)
           quantite: detail.quantite,
           lot_id: detail.lot_id,
           ...options
       }, tx);
       lastMouvement = res.mouvement;
       lastNewStock = res.newStock;
    }

    // Retourne le dernier (juste pour respecter la signature, ou un agrégat si besoin)
    return { mouvement: lastMouvement, newStock: lastNewStock };
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
        utilisateur: { select: { email: true } }
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
   * Traite la réception d'un achat (création des mouvements d'entrée)
   */
  async processAchatReception(
    achatId: string,
    magasinId: string,
    details: any[],
    tx?: any
  ): Promise<void> {
    const prismaClient = tx || this.prisma;
    
    logger.info(`Traitement réception achat ${achatId} pour magasin ${magasinId}`);

    for (const detail of details) {
        let lot_id = undefined;

        // Gestion du LOT si présent
        if (detail.numero_lot && detail.date_peremption) {
             // Upsert lot
             let lot = await prismaClient.lot_produit.findUnique({
                 where: {
                     produit_id_numero_lot: { produit_id: detail.produit_id, numero_lot: detail.numero_lot }
                 }
             });

             if (!lot) {
                 lot = await prismaClient.lot_produit.create({
                     data: {
                         produit_id: detail.produit_id,
                         numero_lot: detail.numero_lot,
                         date_peremption: detail.date_peremption
                     }
                 });
             }
             lot_id = lot.id;
        }

        // Création du mouvement
        await this.createMouvement({
            magasin_id: magasinId,
            produit_id: detail.produit_id,
            type: 'ENTREE_ACHAT',
            quantite: detail.quantite, // Quantité totale (unités)
            achat_id: achatId,
            lot_id: lot_id,
            raison: `Réception achat` // On pourrait ajouter le numéro de commande ici si dispo
        }, prismaClient);
    }
  }
}

export default StockService;
