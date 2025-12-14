import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';
import { StockService } from './stockService.js';

// Types
export type StatutAchat = 'COMMANDE' | 'RECU_PARTIELLEMENT' | 'RECU_COMPLET' | 'FACTURE_RECU' | 'PAYE' | 'ANNULE';

export interface AchatDetailDto {
  produit_id: string;
  conditionnement_id?: string; // Ajout
  quantite: number; // Unités totales (calculé ou saisi)
  quantite_conditionnement?: number; // Nombre de colis (saisi)
  prix_unitaire: number; // Prix par UNITE (calculé ou saisi)
  prix_unitaire_conditionnement?: number; // Prix par COLIS (saisi)
  prix_total: number;
  numero_lot?: string;
  date_peremption?: Date;
}



export interface UpdateAchatDto {
    magasin_id?: string;
    fournisseur_id?: string;
    numero_commande?: string;
    date_livraison_prevue?: Date;
    notes?: string;
    details?: Array<AchatDetailDto & { id?: string }>; // id si mise à jour ligne existante
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
        fournisseur: { select: { nom_entreprise: true } },
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
    // Calculer automatiquement le montant total basé sur les détails
    if (data.details && data.details.length > 0) {
      const total = data.details.reduce((acc, item) => {
        const pTotal = Number(item.prix_total);
        return acc + (isNaN(pTotal) ? 0 : pTotal);
      }, 0);
      data.montant_total = total;
    }

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
        let quantiteFinale = Number(item.quantite);
        let prixUnitaireFinale = Number(item.prix_unitaire);

        // LOGIQUE CONDITIONNEMENT
        if (item.conditionnement_id) {
             const cond = await tx.conditionnement_produit.findUnique({
                 where: { id: item.conditionnement_id }
             });
             
             if (cond) {
                 const qtyColis = Number(item.quantite_conditionnement || 0);
                 if (qtyColis > 0) {
                     // Conversion: 5 cartons * 12 unités = 60 unités
                     quantiteFinale = qtyColis * cond.quantite_base;
                     
                     // Si le prix unitaire envoyé est celui du colis (car sélectionné en front)
                     // OU si on a envie de recalculer le PU unitaire.
                     // En général, le front envoie prix_total et prix_unitaire.
                     // Si conditionnement est utilisé, le prix_unitaire envoyé par le front est probablement celui du COLIS.
                     // On doit le convertir en PU unitaire.
                     if (item.prix_unitaire && item.prix_unitaire > 0) {
                       // Si item.prix_unitaire correspond au prix du COLIS (car c'est ce que l'user voit),
                       // alors PU_Réel = PrixColis / QtyBase.
                       // MAIS attention, validateData check PU > 0.
                       // Supposons que le front envoie le prix du colis dans prix_unitaire_conditionnement SI défini dans DTO,
                       // sinon dans prix_unitaire.
                       // D'après ma modif DTO: prix_unitaire_conditionnement existe.
                       
                       if (item.prix_unitaire_conditionnement) {
                           prixUnitaireFinale = Number(item.prix_unitaire_conditionnement) / cond.quantite_base;
                       } else {
                           // Fallback: si le front envoie le prix colis dans prix_unitaire
                           // Comment savoir ?
                           // On va dire que si quantite_conditionnement > 0, on trust le calcul du front ou on recalcule le PU
                           // PU = PrixTotal / QtyFinale
                           if (item.prix_total) {
                               prixUnitaireFinale = Number(item.prix_total) / quantiteFinale;
                           }
                       }
                     }
                 }
             }
        }

        await tx.achat_detail.create({
          data: {
            achat_id: achat.id,
            produit_id: item.produit_id,
            quantite: quantiteFinale, 
            prix_unitaire: prixUnitaireFinale, 
            prix_total: Number(item.prix_total),
            numero_lot: item.numero_lot,
            date_peremption: item.date_peremption,
            conditionnement_id: item.conditionnement_id || null,
            quantite_conditionnement: item.quantite_conditionnement ? Number(item.quantite_conditionnement) : null
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
          let lot_id = undefined;

          // Si présence de numéro de lot, on gère le lot
          if (detail.numero_lot && detail.date_peremption) {
              // Vérifier si le produit gère la péremption (optionnel, mais mieux pour la cohérence)
              const prod = await tx.produit.findUnique({ where: { id: detail.produit_id } });
              
              if (prod) { // On stocke le lot même si gere_peremption est false pour l'instant, ou on force true ?
                 // On assume que si l'utilisateur saisit un lot, on le crée.
                 
                 // Upsert du lot
                 // On cherche d'abord s'il existe (unique contrainte)
                 let lot = await tx.lot_produit.findUnique({
                     where: {
                         produit_id_numero_lot: { produit_id: detail.produit_id, numero_lot: detail.numero_lot }
                     }
                 });

                 if (!lot) {
                     lot = await tx.lot_produit.create({
                         data: {
                             produit_id: detail.produit_id,
                             numero_lot: detail.numero_lot,
                             date_peremption: detail.date_peremption
                         }
                     });
                 }
                 lot_id = lot.id;
              }
          }

          await stockServiceTx.createMouvement({
            magasin_id: achat.magasin_id,
            produit_id: detail.produit_id,
            type: 'ENTREE_ACHAT',
            quantite: detail.quantite,
            utilisateur_id: data.utilisateur_id,
            raison: `Réception achat ${achat.numero_commande || id}`,
            achat_id: achat.id,
            lot_id: lot_id
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
   * Met à jour un achat (avant réception)
   */
  async update(id: string, data: UpdateAchatDto): Promise<any> {
    const existing = await this.prisma.achat.findUnique({ where: { id }, include: { details: true } });
    if (!existing) throw new Error('Achat non trouvé');

    if (existing.statut === 'RECU_COMPLET' || existing.statut === 'ANNULE') {
        throw new Error('Impossible de modifier une commande reçue ou annulée');
    }

    return this.prisma.$transaction(async (tx) => {
        // Mise à jour en-tête
        await tx.achat.update({
            where: { id },
            data: {
                magasin_id: data.magasin_id,
                fournisseur_id: data.fournisseur_id,
                numero_commande: data.numero_commande,
                date_livraison_prevue: data.date_livraison_prevue,
                notes: data.notes
            }
        });

        // Mise à jour détails (Full replace ou smart update ? Smart update est plus complexe, faisons delete/create partiel pour simplifier ou gérer les cas)
        // Ici on suppose que le frontend envoie TOUS les détails valides.
        if (data.details) {
            // Supprimer les détails non présents
            // C'est complexe, pour l'instant on supprime tout et on recrée ? 
            // Risqué si un détail avait une ID externe référencée ailleurs (pas le cas ici).
            // Mieux: On supprime tout et on recrée pour cet MVP.
            
            await tx.achat_detail.deleteMany({ where: { achat_id: id } });

            for (const item of data.details) {
                await tx.achat_detail.create({
                    data: {
                        achat_id: id,
                        produit_id: item.produit_id,
                        quantite: Number(item.quantite),
                        prix_unitaire: Number(item.prix_unitaire),
                        prix_total: Number(item.prix_total),
                        numero_lot: item.numero_lot,
                        date_peremption: item.date_peremption
                    }
                });
            }
            
            // Recalcul total
            const total = data.details.reduce((acc, d) => acc + Number(d.prix_total), 0);
            await tx.achat.update({ where: { id }, data: { montant_total: total } });
        }
        
        return tx.achat.findUnique({ where: { id }, include: { details: true } });
    });
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
