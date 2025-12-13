import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';
import { StockService } from './stockService.js';

// Types
export type StatutAchat = 'COMMANDE' | 'RECU_PARTIELLEMENT' | 'RECU_COMPLET' | 'FACTURE_RECU' | 'PAYE' | 'ANNULE';

export interface AchatDetailDto {
  produit_id: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
}

export interface CreateAchatDto {
  magasin_id: string;
  fournisseur_id: string;
  numero_commande?: string;
  montant_total: number;
  montant_tva?: number;
  statut?: StatutAchat;
  date_livraison_prevue?: Date;
  notes?: string;
  details: AchatDetailDto[];
}

export interface UpdateAchatStatutDto {
  statut: StatutAchat;
  utilisateur_id?: string;
}

/**
 * Service pour la gestion des achats (commandes fournisseurs)
 */
export class AchatService {
  private prisma: PrismaClient;
  private stockService: StockService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.stockService = new StockService(prisma);
  }

  /**
   * Valide les données d'un achat
   */
  private validateAchatData(data: CreateAchatDto): void {
    if (!data.magasin_id?.trim()) {
      throw new Error('Le magasin est obligatoire');
    }
    if (!data.fournisseur_id?.trim()) {
      throw new Error('Le fournisseur est obligatoire');
    }
    if (!data.details || data.details.length === 0) {
      throw new Error("L'achat doit contenir au moins un produit");
    }

    const montant = Number(data.montant_total);
    if (isNaN(montant) || montant < 0) {
      throw new Error('Le montant total doit être un nombre positif');
    }

    // Valider chaque détail
    for (const detail of data.details) {
      if (!detail.produit_id?.trim()) {
        throw new Error('Chaque ligne doit avoir un produit');
      }
      const qty = Number(detail.quantite);
      if (!Number.isInteger(qty) || qty <= 0) {
        throw new Error('La quantité doit être un entier positif');
      }
      const prixUnit = Number(detail.prix_unitaire);
      if (isNaN(prixUnit) || prixUnit < 0) {
        throw new Error('Le prix unitaire doit être un nombre positif');
      }
    }
  }

  /**
   * Récupère tous les achats
   */
  async getAll(): Promise<any[]> {
    return this.prisma.achat.findMany({
      orderBy: { date_commande: 'desc' },
      include: {
        fournisseur: { select: { nom: true } },
        magasin: { select: { nom: true } },
        _count: { select: { details: true } }
      }
    });
  }

  /**
   * Récupère un achat par ID
   */
  async getById(id: string): Promise<any> {
    const achat = await this.prisma.achat.findUnique({
      where: { id },
      include: {
        fournisseur: true,
        magasin: true,
        details: {
          include: { produit: true }
        }
      }
    });

    if (!achat) {
      throw new Error('Achat non trouvé');
    }

    return achat;
  }

  /**
   * Crée un nouvel achat
   */
  async create(data: CreateAchatDto): Promise<any> {
    this.validateAchatData(data);

    const result = await this.prisma.$transaction(async (tx: any) => {
      // Créer l'entête
      const achat = await tx.achat.create({
        data: {
          magasin_id: data.magasin_id,
          fournisseur_id: data.fournisseur_id,
          numero_commande: data.numero_commande?.trim() || null,
          montant_total: Number(data.montant_total),
          montant_tva: Number(data.montant_tva || 0),
          statut: data.statut || 'COMMANDE',
          date_livraison_prevue: data.date_livraison_prevue || null,
          notes: data.notes?.trim() || null,
          date_commande: new Date()
        }
      });

      // Créer les détails
      for (const item of data.details) {
        await tx.achat_detail.create({
          data: {
            achat_id: achat.id,
            produit_id: item.produit_id,
            quantite: Number(item.quantite),
            prix_unitaire: Number(item.prix_unitaire),
            prix_total: Number(item.prix_total)
          }
        });
      }

      return achat;
    });

    logger.info(`Achat créé: ${result.id} - ${data.details.length} produits`);
    return result;
  }

  /**
   * Met à jour le statut d'un achat (avec réception si applicable)
   */
  async updateStatut(id: string, data: UpdateAchatStatutDto): Promise<any> {
    const achat = await this.prisma.achat.findUnique({
      where: { id },
      include: { details: true }
    });

    if (!achat) {
      throw new Error('Achat non trouvé');
    }

    // Si on passe à RECU_COMPLET et que ce n'était pas déjà reçu
    if (data.statut === 'RECU_COMPLET' && 
        achat.statut !== 'RECU_COMPLET' && 
        achat.statut !== 'RECU_PARTIELLEMENT') {
      
      await this.prisma.$transaction(async (tx: any) => {
        const stockServiceTx = new StockService(tx);

        // Créer les mouvements de stock pour chaque produit
        for (const detail of achat.details) {
          await stockServiceTx.createMouvement({
            magasin_id: achat.magasin_id,
            produit_id: detail.produit_id,
            type: 'ENTREE_ACHAT',
            quantite: detail.quantite,
            utilisateur_id: data.utilisateur_id,
            raison: `Réception achat ${achat.numero_commande || id}`,
            achat_id: achat.id
          }, tx);
        }

        // Mettre à jour le statut
        await tx.achat.update({
          where: { id },
          data: {
            statut: 'RECU_COMPLET',
            date_livraison_reelle: new Date()
          }
        });
      });

      logger.info(`Achat ${id} reçu - Stock mis à jour pour ${achat.details.length} produits`);
    } else {
      // Simple mise à jour du statut
      await this.prisma.achat.update({
        where: { id },
        data: { statut: data.statut }
      });

      logger.info(`Achat ${id} statut mis à jour: ${data.statut}`);
    }

    return { success: true, message: 'Statut mis à jour avec succès' };
  }

  /**
   * Supprime un achat (uniquement si pas encore reçu)
   */
  async delete(id: string): Promise<{ deleted: boolean; message: string }> {
    const achat = await this.prisma.achat.findUnique({ where: { id } });
    
    if (!achat) {
      throw new Error('Achat non trouvé');
    }

    if (achat.statut === 'RECU_COMPLET' || achat.statut === 'RECU_PARTIELLEMENT') {
      throw new Error('Impossible de supprimer une commande déjà reçue (impact stock). Annulez-la ou faites un retour.');
    }

    await this.prisma.achat.delete({ where: { id } });
    logger.info(`Achat supprimé: ${id}`);
    
    return { deleted: true, message: 'Achat supprimé' };
  }

  /**
   * Annule un achat
   */
  async cancel(id: string, utilisateur_id?: string): Promise<any> {
    const achat = await this.prisma.achat.findUnique({
      where: { id },
      include: { details: true }
    });

    if (!achat) {
      throw new Error('Achat non trouvé');
    }

    // Si déjà reçu, il faut reverser le stock
    if (achat.statut === 'RECU_COMPLET' || achat.statut === 'RECU_PARTIELLEMENT') {
      await this.prisma.$transaction(async (tx: any) => {
        const stockServiceTx = new StockService(tx);

        for (const detail of achat.details) {
          // Créer un mouvement de sortie (retour fournisseur)
          await stockServiceTx.createMouvement({
            magasin_id: achat.magasin_id,
            produit_id: detail.produit_id,
            type: 'SORTIE_PERISSABLE', // Ou créer un type RETOUR_FOURNISSEUR
            quantite: detail.quantite,
            utilisateur_id,
            raison: `Annulation achat ${achat.numero_commande || id}`,
            achat_id: achat.id
          }, tx);
        }

        await tx.achat.update({
          where: { id },
          data: { statut: 'ANNULE' }
        });
      });

      logger.info(`Achat ${id} annulé avec retour stock`);
    } else {
      await this.prisma.achat.update({
        where: { id },
        data: { statut: 'ANNULE' }
      });

      logger.info(`Achat ${id} annulé`);
    }

    return { success: true, message: 'Achat annulé' };
  }
}

export default AchatService;
