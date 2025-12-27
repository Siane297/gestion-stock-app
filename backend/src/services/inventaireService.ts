import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';
import { StockService } from './stockService.js';
import { NotificationService } from './NotificationService.js';
import { socketService } from './socketService.js';
import { TypeNotification } from '../types/notificationTypes.js';

// Types pour l'inventaire
export type StatutInventaire = 'BROUILLON' | 'EN_COURS' | 'TERMINE' | 'VALIDE';

// DTOs
export interface CreateInventaireDto {
  magasin_id: string;
  commentaire?: string;
  produit_ids?: string[]; // Si non fourni, inclure tous les produits du magasin
}

export interface UpdateComptageDto {
  quantite_comptee: number;
}

export interface InventaireFilters {
  magasin_id?: string;
  statut?: StatutInventaire;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface InventaireStats {
  total_produits: number;
  produits_comptes: number;
  progression: number;
  ecart_total: number;
  valeur_ecart_positif: number;
  valeur_ecart_negatif: number;
}

/**
 * Service pour la gestion des inventaires physiques
 */
export class InventaireService {
  private prisma: PrismaClient;
  private stockService: StockService;
  private notificationService: NotificationService;
  private tenantId?: string;

  constructor(prisma: PrismaClient, tenantId?: string) {
    this.prisma = prisma;
    this.stockService = new StockService(prisma, tenantId);
    this.notificationService = new NotificationService(prisma);
    this.tenantId = tenantId;
  }

  /**
   * Génère un numéro d'inventaire au format INV-YYYY-NNN
   */
  private async generateInventaireNumber(tx?: any): Promise<string> {
    const prisma = tx || this.prisma;
    const year = new Date().getFullYear();
    
    // Compter les inventaires de l'année
    const count = await prisma.inventaire.count({
      where: {
        numero: {
          startsWith: `INV-${year}-`
        }
      }
    });
    
    const sequence = (count + 1).toString().padStart(3, '0');
    return `INV-${year}-${sequence}`;
  }

  /**
   * Crée un nouvel inventaire (statut BROUILLON)
   */
  async create(data: CreateInventaireDto, utilisateurId?: string): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Générer le numéro d'inventaire
      const numero = await this.generateInventaireNumber(tx);
      
      // 2. Récupérer les stocks du magasin
      let stocksWhere: any = { magasin_id: data.magasin_id };
      if (data.produit_ids && data.produit_ids.length > 0) {
        stocksWhere.produit_id = { in: data.produit_ids };
      }
      
      const stocks = await tx.stock_magasin.findMany({
        where: stocksWhere,
        include: {
          produit: {
            include: {
              lots: true
            }
          }
        }
      });
      
      // 3. Créer l'inventaire
      const inventaire = await tx.inventaire.create({
        data: {
          numero,
          magasin_id: data.magasin_id,
          statut: 'BROUILLON',
          commentaire: data.commentaire,
        },
        include: {
          magasin: { select: { nom: true } }
        }
      });
      
      // 4. Créer les détails d'inventaire pour chaque stock
      const detailsToCreate: any[] = [];
      
      for (const stock of stocks) {
        // Si le produit gère la péremption, créer un détail par lot
        if (stock.produit.gere_peremption && stock.produit.lots.length > 0) {
          // Récupérer les quantités par lot
          const stocksLot = await tx.stock_lot.findMany({
            where: {
              magasin_id: data.magasin_id,
              lot: { produit_id: stock.produit_id }
            },
            include: { lot: true }
          });
          
          for (const stockLot of stocksLot) {
            detailsToCreate.push({
              inventaire_id: inventaire.id,
              produit_id: stock.produit_id,
              lot_id: stockLot.lot_id,
              quantite_theorique: Math.round(stockLot.quantite),
              est_compte: false
            });
          }
        } else {
          // Produit sans péremption : un seul détail
          detailsToCreate.push({
            inventaire_id: inventaire.id,
            produit_id: stock.produit_id,
            quantite_theorique: stock.quantite,
            est_compte: false
          });
        }
      }
      
      if (detailsToCreate.length > 0) {
        await tx.inventaire_detail.createMany({
          data: detailsToCreate
        });
      }
      
      logger.info(`Inventaire créé: ${inventaire.numero} avec ${detailsToCreate.length} lignes`);
      
      // Notifications (Hors transaction)
      this.triggerInventaireNotifications(inventaire, utilisateurId || 'system', TypeNotification.INVENTAIRE_NOUVEAU);
      
      return this.getById(inventaire.id, tx);
    });
  }

  /**
   * Démarre un inventaire (BROUILLON -> EN_COURS)
   * Fige les quantités théoriques au moment du démarrage
   */
  async start(id: string, utilisateurId: string): Promise<any> {
    const inventaire = await this.prisma.inventaire.findUnique({
      where: { id },
      include: { details: true }
    });
    
    if (!inventaire) throw new Error('Inventaire non trouvé');
    if (inventaire.statut !== 'BROUILLON') {
      throw new Error('Seul un inventaire en BROUILLON peut être démarré');
    }
    
    return this.prisma.$transaction(async (tx) => {
      // Rafraîchir les quantités théoriques au moment du démarrage
      for (const detail of inventaire.details) {
        let quantiteTheorique = 0;
        
        if (detail.lot_id) {
          // Récupérer la quantité du lot
          const stockLot = await tx.stock_lot.findUnique({
            where: {
              magasin_id_lot_id: {
                magasin_id: inventaire.magasin_id,
                lot_id: detail.lot_id
              }
            }
          });
          quantiteTheorique = stockLot ? Math.round(stockLot.quantite) : 0;
        } else {
          // Récupérer la quantité globale du produit
          const stock = await tx.stock_magasin.findUnique({
            where: {
              magasin_id_produit_id: {
                magasin_id: inventaire.magasin_id,
                produit_id: detail.produit_id
              }
            }
          });
          quantiteTheorique = stock?.quantite || 0;
        }
        
        await tx.inventaire_detail.update({
          where: { id: detail.id },
          data: { quantite_theorique: quantiteTheorique }
        });
      }
      
      // Mettre à jour le statut
      const updated = await tx.inventaire.update({
        where: { id },
        data: {
          statut: 'EN_COURS',
          date_debut: new Date(),
          utilisateur_debut_id: utilisateurId
        }
      });
      
      logger.info(`Inventaire démarré: ${updated.numero}`);
      return this.getById(id, tx);
    });
  }

  /**
   * Met à jour le comptage d'un détail
   */
  async updateComptage(
    inventaireId: string, 
    detailId: string, 
    data: UpdateComptageDto
  ): Promise<any> {
    const inventaire = await this.prisma.inventaire.findUnique({
      where: { id: inventaireId }
    });
    
    if (!inventaire) throw new Error('Inventaire non trouvé');
    if (inventaire.statut !== 'EN_COURS') {
      throw new Error('Le comptage n\'est possible que sur un inventaire EN_COURS');
    }
    
    const detail = await this.prisma.inventaire_detail.findUnique({
      where: { id: detailId },
      include: { produit: { select: { prix_achat: true } } }
    });
    
    if (!detail) throw new Error('Détail d\'inventaire non trouvé');
    if (detail.inventaire_id !== inventaireId) {
      throw new Error('Ce détail n\'appartient pas à cet inventaire');
    }
    
    // Calcul de l'écart et de la valeur
    const quantiteComptee = Math.round(data.quantite_comptee);
    const ecart = quantiteComptee - detail.quantite_theorique;
    const valeurEcart = ecart * (detail.produit.prix_achat || 0);
    
    const updated = await this.prisma.inventaire_detail.update({
      where: { id: detailId },
      data: {
        quantite_comptee: quantiteComptee,
        ecart,
        valeur_ecart: valeurEcart,
        est_compte: true
      },
      include: {
        produit: {
          select: {
            id: true,
            nom: true,
            code_barre: true,
            prix_achat: true,
            unite: { select: { nom: true } }
          }
        },
        lot: {
          select: {
            numero_lot: true,
            date_peremption: true
          }
        }
      }
    });
    
    return updated;
  }

  /**
   * Finalise un inventaire (EN_COURS -> TERMINE)
   * Les produits non comptés garderont leur stock théorique
   */
  async finalize(id: string): Promise<any> {
    const inventaire = await this.prisma.inventaire.findUnique({
      where: { id },
      include: { details: true }
    });
    
    if (!inventaire) throw new Error('Inventaire non trouvé');
    if (inventaire.statut !== 'EN_COURS') {
      throw new Error('Seul un inventaire EN_COURS peut être finalisé');
    }
    
    // Log des produits non comptés (information seulement, pas de blocage)
    const nonComptes = inventaire.details.filter(d => !d.est_compte);
    if (nonComptes.length > 0) {
      logger.info(
        `Inventaire ${inventaire.numero} finalisé avec ${nonComptes.length} produit(s) non comptés. ` +
        `Ces produits conserveront leur stock théorique.`
      );
    }
    
    const updated = await this.prisma.inventaire.update({
      where: { id },
      data: {
        statut: 'TERMINE',
        date_fin: new Date()
      }
    });
    
    logger.info(`Inventaire finalisé: ${updated.numero}`);
    return this.getById(id);
  }

  /**
   * Valide un inventaire et remplace les stocks par les quantités comptées (TERMINE -> VALIDE)
   * Le stock est remplacé par la quantité réelle comptée, pas ajusté par l'écart
   */
  async validate(id: string, utilisateurId: string): Promise<any> {
    const inventaire = await this.prisma.inventaire.findUnique({
      where: { id },
      include: {
        details: {
          include: {
            produit: { select: { nom: true } }
          }
        }
      }
    });
    
    if (!inventaire) throw new Error('Inventaire non trouvé');
    if (inventaire.statut !== 'TERMINE') {
      throw new Error('Seul un inventaire TERMINE peut être validé');
    }
    
    return this.prisma.$transaction(async (tx) => {
      // Pour chaque produit compté, remplacer le stock par la quantité comptée
      for (const detail of inventaire.details) {
        // Ne traiter que les produits qui ont été comptés
        if (!detail.est_compte) continue;
        
        // Récupérer le stock actuel
        let stockActuel = 0;
        if (detail.lot_id) {
          // Stock par lot
          const stockLot = await tx.stock_lot.findUnique({
            where: {
              magasin_id_lot_id: {
                magasin_id: inventaire.magasin_id,
                lot_id: detail.lot_id
              }
            }
          });
          stockActuel = stockLot ? Math.round(stockLot.quantite) : 0;
        } else {
          // Stock global
          const stock = await tx.stock_magasin.findUnique({
            where: {
              magasin_id_produit_id: {
                magasin_id: inventaire.magasin_id,
                produit_id: detail.produit_id
              }
            }
          });
          stockActuel = stock?.quantite || 0;
        }
        
        // Calculer l'ajustement nécessaire pour atteindre la quantité comptée
        const quantiteComptee = detail.quantite_comptee || 0;
        const ajustement = quantiteComptee - stockActuel;
        
        // Si l'ajustement est nécessaire (différence entre réel et compté)
        if (ajustement !== 0) {
          const stockServiceTx = new StockService(tx as any);
          const isPositive = ajustement > 0;
          const quantiteAbs = Math.abs(ajustement);
          
          // Créer un mouvement d'ajustement avec la différence stock actuel vs compté
          await stockServiceTx.createMouvement({
            magasin_id: inventaire.magasin_id,
            produit_id: detail.produit_id,
            type: 'AJUSTEMENT',
            quantite: quantiteAbs,
            utilisateur_id: utilisateurId,
            isAjoutStock: isPositive, // Paramètre explicite pour le sens du mouvement
            raison: isPositive 
              ? `Inventaire ${inventaire.numero} - Surplus comptage (Stock: ${stockActuel} → ${quantiteComptee})`
              : `Inventaire ${inventaire.numero} - Manque comptage (Stock: ${stockActuel} → ${quantiteComptee})`,
            lot_id: detail.lot_id || undefined
          }, tx);
          
          logger.info(
            `Inventaire ${inventaire.numero} - Produit ${detail.produit.nom}: ` +
            `Stock avant: ${stockActuel}, Compté: ${quantiteComptee}, Ajustement: ${ajustement > 0 ? '+' : ''}${ajustement}`
          );
        }
      }
      
      // Mettre à jour le statut
      const updated = await tx.inventaire.update({
        where: { id },
        data: {
          statut: 'VALIDE',
          date_validation: new Date(),
          utilisateur_validation_id: utilisateurId
        }
      });
      
      logger.info(`Inventaire validé: ${updated.numero} - Stocks remplacés par quantités comptées`);
      
      // Notifications (Hors transaction)
      this.triggerInventaireNotifications(updated, utilisateurId, TypeNotification.INVENTAIRE_VALIDE);
      
      return this.getById(id, tx);
    });
  }

  /**
   * Déclenche les notifications pour un inventaire
   */
  private async triggerInventaireNotifications(inventaire: any, authorId: string, type: TypeNotification): Promise<void> {
    try {
      const emetteur = await this.prisma.tenantUser.findUnique({
        where: { id: authorId },
        include: { employee: true }
      });

      const nomEmetteur = emetteur?.employee ? emetteur.employee.fullName : (authorId === 'system' ? 'Système' : authorId);
      
      let message = '';
      let titre = '';

      switch (type) {
        case TypeNotification.INVENTAIRE_NOUVEAU:
          titre = 'Nouvel Inventaire';
          message = `${nomEmetteur} a ouvert un nouvel inventaire (N°: ${inventaire.numero})`;
          break;
        case TypeNotification.INVENTAIRE_VALIDE:
          titre = 'Inventaire Validé';
          message = `L'inventaire ${inventaire.numero} a été validé. Les stocks ont été mis à jour.`;
          break;
      }

      const notifications = await this.notificationService.createNotificationForAllExceptEmitter(authorId, {
        type,
        titre,
        message,
        reference_type: 'inventaire',
        reference_id: inventaire.id,
        metadata: {
          numero: inventaire.numero,
          magasin_id: inventaire.magasin_id
        }
      });

      if (notifications.length > 0 && this.tenantId) {
        socketService.emitToTenantExceptUser(this.tenantId, authorId, 'notification:new', {
          type,
          titre,
          message,
          reference_type: 'inventaire',
          reference_id: inventaire.id
        });
      }
    } catch (error) {
      logger.error('Erreur lors du déclenchement des notifications d\'inventaire:', error);
    }
  }

  /**
   * Récupère un inventaire par ID avec tous ses détails
   */
  async getById(id: string, tx?: any): Promise<any> {
    const prisma = tx || this.prisma;
    
    const inventaire = await prisma.inventaire.findUnique({
      where: { id },
      include: {
        magasin: { select: { id: true, nom: true } },
        utilisateur_debut: { 
          select: { 
            email: true,
            employee: { select: { fullName: true } }
          } 
        },
        utilisateur_validation: { 
          select: { 
            email: true,
            employee: { select: { fullName: true } }
          } 
        },
        details: {
          include: {
            produit: {
              select: {
                id: true,
                nom: true,
                code_barre: true,
                prix_achat: true,
                image_url: true,
                unite: { select: { nom: true } }
              }
            },
            lot: {
              select: {
                id: true,
                numero_lot: true,
                date_peremption: true
              }
            }
          },
          orderBy: [
            { est_compte: 'asc' }, // Non comptés en premier
            { produit: { nom: 'asc' } }
          ]
        }
      }
    });
    
    if (!inventaire) throw new Error('Inventaire non trouvé');
    
    // Calculer les statistiques
    const stats = this.calculateStats(inventaire.details);
    
    return {
      ...inventaire,
      stats
    };
  }

  /**
   * Liste tous les inventaires avec filtres
   */
  async getAll(filters?: InventaireFilters): Promise<any[]> {
    const where: any = {};
    
    if (filters?.magasin_id) where.magasin_id = filters.magasin_id;
    if (filters?.statut) where.statut = filters.statut;
    if (filters?.dateFrom || filters?.dateTo) {
      where.date_creation = {};
      if (filters.dateFrom) where.date_creation.gte = filters.dateFrom;
      if (filters.dateTo) where.date_creation.lte = filters.dateTo;
    }
    
    const inventaires = await this.prisma.inventaire.findMany({
      where,
      include: {
        magasin: { select: { nom: true } },
        utilisateur_debut: { 
          select: { 
            email: true,
            employee: { select: { fullName: true } }
          } 
        },
        _count: { select: { details: true } }
      },
      orderBy: { date_creation: 'desc' }
    });
    
    // Ajouter les stats de progression pour chaque inventaire
    const result = await Promise.all(inventaires.map(async (inv) => {
      const details = await this.prisma.inventaire_detail.findMany({
        where: { inventaire_id: inv.id }
      });
      
      const stats = this.calculateStats(details);
      
      return {
        ...inv,
        stats: {
          total_produits: stats.total_produits,
          produits_comptes: stats.produits_comptes,
          progression: stats.progression
        }
      };
    }));
    
    return result;
  }

  /**
   * Supprime un inventaire (BROUILLON uniquement)
   */
  async delete(id: string): Promise<void> {
    const inventaire = await this.prisma.inventaire.findUnique({
      where: { id }
    });
    
    if (!inventaire) throw new Error('Inventaire non trouvé');
    if (inventaire.statut !== 'BROUILLON') {
      throw new Error('Seul un inventaire en BROUILLON peut être supprimé');
    }
    
    await this.prisma.inventaire.delete({
      where: { id }
    });
    
    logger.info(`Inventaire supprimé: ${inventaire.numero}`);
  }

  /**
   * Récupère les statistiques détaillées d'un inventaire
   */
  async getStats(id: string): Promise<InventaireStats> {
    const inventaire = await this.prisma.inventaire.findUnique({
      where: { id },
      include: { details: true }
    });
    
    if (!inventaire) throw new Error('Inventaire non trouvé');
    
    return this.calculateStats(inventaire.details);
  }

  /**
   * Calcule les statistiques à partir des détails
   */
  private calculateStats(details: any[]): InventaireStats {
    const total_produits = details.length;
    const produits_comptes = details.filter(d => d.est_compte).length;
    const progression = total_produits > 0 
      ? Math.round((produits_comptes / total_produits) * 100) 
      : 0;
    
    const ecarts = details.filter(d => d.ecart !== null && d.ecart !== 0);
    const ecart_total = ecarts.reduce((sum, d) => sum + (d.ecart || 0), 0);
    
    const valeur_ecart_positif = details
      .filter(d => (d.valeur_ecart || 0) > 0)
      .reduce((sum, d) => sum + d.valeur_ecart, 0);
    
    const valeur_ecart_negatif = details
      .filter(d => (d.valeur_ecart || 0) < 0)
      .reduce((sum, d) => sum + Math.abs(d.valeur_ecart), 0);
    
    return {
      total_produits,
      produits_comptes,
      progression,
      ecart_total,
      valeur_ecart_positif,
      valeur_ecart_negatif
    };
  }
}

export default InventaireService;
