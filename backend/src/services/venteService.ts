import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';
import { StockService } from './stockService.js';

// Enums (alignés avec Prisma)
export type StatutVente = 'BROUILLON' | 'EN_ATTENTE' | 'PAYEE' | 'ANNULEE' | 'REMBOURSEE';
export type MethodePaiement = 'ESPECES' | 'MOBILE_MONEY' | 'CARTE' | 'CHEQUE' | 'VIREMENT' | 'AUTRE';

// DTOs
export interface VenteDetailDto {
  produit_id: string;
  quantite: number;
  conditionnement_id?: string;
  remise?: number; // Montant remise ligne
}

export interface CreateVenteDto {
  magasin_id: string;
  utilisateur_id: string;
  client_id?: string;
  methode_paiement: MethodePaiement;
  statut?: StatutVente;
  notes?: string;
  details: VenteDetailDto[];
  montant_remise?: number; // Remise globale
  montant_tva?: number;
  montant_paye?: number; // Montant effectivement payé par le client
  montant_rendu?: number; // Monnaie rendue au client
}

export interface UpdateVenteStatutDto {
  statut: StatutVente;
  utilisateur_id?: string; // Celui qui fait l'action
}

export interface VenteFilters {
  magasin_id?: string;
  client_id?: string;
  utilisateur_id?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Service pour la gestion des ventes
 */
export class VenteService {
  private prisma: PrismaClient;
  private stockService: StockService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.stockService = new StockService(prisma);
  }

  /**
   * Génère un numéro de ticket au format TC-YYYYMMDD-XXX
   * TC = Ticket de Caisse
   * YYYYMMDD = Date
   * XXX = Séquence journalière (remise à zéro chaque jour)
   */
  /**
   * Génère un numéro de ticket au format TC-STORE-YYYYMMDD-XXX
   * TC = Ticket de Caisse
   * STORE = 4 premiers caractères de l'ID magasin
   * YYYYMMDD = Date
   * XXX = Séquence journalière (remise à zéro chaque jour)
   */
  private async generateReceiptNumber(magasinId: string, tx?: any): Promise<string> {
    const prisma = tx || this.prisma;
    const today = new Date();
    const dateStr = (today.toISOString().split('T')[0] || '').replace(/-/g, ''); // YYYYMMDD
    const storePrefix = magasinId.substring(0, 4).toUpperCase();
    
    // Compter les ventes du jour pour ce magasin
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const countToday = await prisma.vente.count({
      where: {
        magasin_id: magasinId,
        date_creation: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
    
    // Incrémenter pour la nouvelle vente
    const sequence = (countToday + 1).toString().padStart(3, '0');
    
    return `TC-${storePrefix}-${dateStr}-${sequence}`;
  }

  /**
   * Crée une nouvelle vente
   */
  async create(data: CreateVenteDto): Promise<any> {
    // 1. Validation de base
    if (!data.details || data.details.length === 0) {
      throw new Error('La vente doit contenir au moins un produit');
    }

    // 2. Préparation des données et vérification stock
    // On doit récupérer les infos produits/conditionnements pour les prix et les conversions de stock.
    
    // Récupérer tous les produits concernés
    const produitIds = data.details.map(d => d.produit_id);
    const produits = await this.prisma.produit.findMany({
      where: { id: { in: produitIds } },
      include: {
        conditionnements: true
      }
    });

    const produitMap = new Map(produits.map(p => [p.id, p]));
    // 3. Préparer les données de vente
    let prixTotalVente = 0;
    const detailsVente: any[] = [];
    const itemsToCheckStock: Array<{ produit_id: string; quantite: number }> = []; // Pour regrouper les quantités par produit pour le check global

    for (const item of data.details) {
      const produit = produitMap.get(item.produit_id);
      if (!produit) throw new Error(`Produit ${item.produit_id} introuvable`);

      // Résolution du conditionnement
      // Si conditionnement_id n'est pas fourni, on cherche le conditionnement par défaut (Unité / base=1)
      let conditionnement;
      if (item.conditionnement_id) {
          conditionnement = produit.conditionnements.find(c => c.id === item.conditionnement_id);
          if (!conditionnement) throw new Error(`Conditionnement ${item.conditionnement_id} introuvable pour le produit ${produit.nom}`);
      } else {
          // Fallback: chercher le conditionnement de base (celui avec quantite_base = 1)
          conditionnement = produit.conditionnements.find(c => c.quantite_base === 1);
          if (!conditionnement) {
              // Si vraiment aucun conditionnement base=1 (ne devrait pas arriver avec la nouvelle logique), on prend le premier
              conditionnement = produit.conditionnements[0];
          }
          if (!conditionnement) throw new Error(`Aucun conditionnement trouvé pour le produit ${produit.nom}`);
      }

      const quantiteBase = conditionnement.quantite_base;
      const quantiteVendue = item.quantite;
      const quantiteEnUniteBase = quantiteVendue * quantiteBase;

      // Calcul du prix
      // Le prix unitaire est celui du CONDITIONNEMENT, pas du produit abstrait
      const prixUnitaire = conditionnement.prix_vente; // Utilisation du prix de vente du conditionnement
      const prixLigne = (prixUnitaire * quantiteVendue) - (item.remise || 0);
      
      prixTotalVente += prixLigne;

      detailsVente.push({
        produit_id: item.produit_id,
        conditionnement_id: conditionnement.id, // On enregistre TOUJOURS le conditionnement utilisé
        quantite: quantiteVendue,
        prix_unitaire: prixUnitaire,
        remise: item.remise || 0,
        prix_total: prixLigne
      });

      // Préparation pour le check de stock global
      const existingCheck = itemsToCheckStock.find(i => i.produit_id === item.produit_id);
      if (existingCheck) {
        existingCheck.quantite += quantiteEnUniteBase;
      } else {
        itemsToCheckStock.push({
          produit_id: item.produit_id,
          quantite: quantiteEnUniteBase
        });
      }
    }

    // 4. Vérification Stock globale
    const stockCheck = await this.stockService.checkMultipleStockAvailable(data.magasin_id, itemsToCheckStock);
    if (!stockCheck.allAvailable) {
      const missing = stockCheck.unavailable.map(u => {
        const p = produitMap.get(u.produit_id);
        return `${p?.nom} (Manque: ${u.required - u.available})`;
      }).join(', ');
      throw new Error(`Stock insuffisant pour: ${missing}`);
    }

    // 5. Transaction de création
    return this.prisma.$transaction(async (tx) => {
      // a. Générer le numéro de ticket (en utilisant tx pour éviter les collisions)
      const numeroVente = await this.generateReceiptNumber(data.magasin_id, tx);
      
      // b. Créer la vente
      const vente = await tx.vente.create({
        data: {
          numero_vente: numeroVente,
          magasin_id: data.magasin_id,
          utilisateur_id: data.utilisateur_id,
          // Relation client optionnelle
          ...(data.client_id ? { client_id: data.client_id } : {}),
          montant_total: prixTotalVente,
          montant_remise: data.montant_remise || 0,
          montant_paye: data.montant_paye || prixTotalVente,
          montant_rendu: data.montant_rendu || 0,
          statut: data.statut || 'PAYEE',
          methode_paiement: data.methode_paiement,
          notes: data.notes,
          details: {
            create: detailsVente
          }
        },
        include: {
          details: {
            include: {
              produit: true,
              conditionnement: true
            }
          }
        }
      });

      // b. Déstockage
      // On utilise le StockService mais avec la transaction en cours si possible.
      // StockService.increment/decrement accepte 'tx' en dernier argument.
      const stockServiceTx = new StockService(tx as any); 
      
      for (const check of itemsToCheckStock) {
        await stockServiceTx.decrementStock(
          data.magasin_id,
          check.produit_id,
          check.quantite, // Quantité convertie en unité de base
          {
            utilisateur_id: data.utilisateur_id,
            vente_id: vente.id,
            raison: 'Vente client'
          },
          tx
        );
      }

      logger.info(`Vente créée: ${vente.id} - Total: ${vente.montant_total}`);
      return vente;
    });
  }

  /**
   * Récupère toutes les ventes
   */
  async getAll(filters?: VenteFilters): Promise<any[]> {
    const where: any = {};

    if (filters?.magasin_id) where.magasin_id = filters.magasin_id;
    if (filters?.client_id) where.client_id = filters.client_id;
    if (filters?.utilisateur_id) where.utilisateur_id = filters.utilisateur_id;
    if (filters?.dateFrom || filters?.dateTo) {
      where.date_creation = {};
      if (filters.dateFrom) where.date_creation.gte = filters.dateFrom;
      if (filters.dateTo) where.date_creation.lte = filters.dateTo;
    }

    return this.prisma.vente.findMany({
      where,
      include: {
        client: { select: { nom: true } },
        utilisateur: { 
          select: { 
            email: true,
            employee: { select: { fullName: true } } 
          } 
        },
        details: {
            include: {
                produit: { select: { nom: true } },
                conditionnement: { select: { nom: true } }
            }
        },
        _count: { select: { details: true } },
        session_caisse: {
          include: {
            caisse: {
              select: { nom: true, code: true }
            }
          }
        }
      },
      orderBy: { date_creation: 'desc' }
    });
  }

  /**
   * Récupère une vente par ID
   */
  async getById(id: string): Promise<any> {
    const vente = await this.prisma.vente.findUnique({
      where: { id },
      include: {
        client: true,
        utilisateur: { 
          select: { 
            id: true, 
            email: true,
            employee: { select: { fullName: true } }
          } 
        },
        magasin: true,
        details: {
          include: {
            produit: true,
            conditionnement: true
          }
        },
        facture: true,
        session_caisse: {
          include: {
            caisse: true
          }
        }
      }
    });

    if (!vente) throw new Error('Vente non trouvée');
    return vente;
  }

  /**
   * Met à jour le statut d'une vente
   */
  async updateStatut(id: string, data: UpdateVenteStatutDto): Promise<any> {
    const existing = await this.prisma.vente.findUnique({ where: { id } });
    if (!existing) throw new Error('Vente non trouvée');

    // TODO: Gérer l'annulation et le re-stockage si statut passe à ANNULEE
    // Pour l'instant on fait juste l'update statut simple
    
    if (data.statut === 'ANNULEE' && existing.statut !== 'ANNULEE') {
        // Logique d'annulation (remettre le stock)
        // À implémenter avec précaution
    }

    const vente = await this.prisma.vente.update({
      where: { id },
      data: { statut: data.statut }
    });

    return vente;
  }

  /**
   * Statistiques des ventes
   */
  async getStats(filters: { magasin_id?: string, dateFrom?: Date, dateTo?: Date }): Promise<any> {
    const where: any = {};
    if (filters.magasin_id) where.magasin_id = filters.magasin_id;
    if (filters.dateFrom || filters.dateTo) {
      where.date_creation = {};
      if (filters.dateFrom) where.date_creation.gte = filters.dateFrom;
      if (filters.dateTo) where.date_creation.lte = filters.dateTo;
    }

    const [totalVentes, montantTotal] = await Promise.all([
      this.prisma.vente.count({ where }),
      this.prisma.vente.aggregate({
        where,
        _sum: { montant_total: true }
      })
    ]);

    return {
      count: totalVentes,
      total_amount: montantTotal._sum.montant_total || 0
    };
  }
}

export default VenteService;
