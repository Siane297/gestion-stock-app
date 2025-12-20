import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';
import { StockService } from './stockService.js';

// Types
export type StatutAchat = 'COMMANDE' | 'RECU_PARTIELLEMENT' | 'RECU_COMPLET' | 'FACTURE_RECU' | 'PAYE' | 'ANNULE';

export interface AchatDetailDto {
  produit_id: string;
  conditionnement_id?: string; // Ajout
  quantite: number; // Unités totales (calculé ou saisi)
  quantite_recue?: number; // Added
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
    create_reliquat?: boolean;
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
  async getAll(filters?: { magasin_id?: string }): Promise<any[]> {
    const where: any = {};
    if (filters?.magasin_id) where.magasin_id = filters.magasin_id;

    return this.prisma.achat.findMany({
      where,
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
    try {
      const achat = await this.prisma.achat.findUnique({
        where: { id },
        include: { details: true }
      });

      if (!achat) {
        throw new Error('Achat non trouvé');
      }

      // Déterminer le type de transition
      const isReception = this.isReceptionStatus(data.statut) && !this.isReceptionStatus(achat.statut);
      const isCancellationAfterReception = data.statut === 'ANNULE' && this.isReceptionStatus(achat.statut);

      // Utiliser le bon handler selon le type de transition
      if (isReception) {
        return await this.handleReception(id, achat, data);
      } else if (isCancellationAfterReception) {
        return await this.handleCancellationWithStockReversal(id, achat, data);
      } else {
        return await this.handleSimpleStatusUpdate(id, data.statut);
      }
    } catch (error: any) {
      logger.error(`Erreur lors de la mise à jour du statut de l'achat ${id}: ${error.message}`);
      throw new Error(`Impossible de mettre à jour le statut: ${error.message}`);
    }
  }

  /**
   * Vérifie si un statut correspond à une réception
   */
  private isReceptionStatus(statut: string): boolean {
    return statut === 'RECU_COMPLET' || statut === 'RECU_PARTIELLEMENT';
  }

  /**
   * Gère la réception d'un achat avec mise à jour du stock
   */
  private async handleReception(id: string, achat: any, data: UpdateAchatStatutDto): Promise<any> {
    return this.prisma.$transaction(async (tx: any) => {
      const stockServiceTx = new StockService(tx);

      // Mise à jour du stock via réception
      await stockServiceTx.processAchatReception(
        id,
        achat.magasin_id,
        achat.details,
        tx
      );

      // Mise à jour du statut et date de livraison
      await tx.achat.update({
        where: { id },
        data: {
          statut: data.statut,
          date_livraison_reelle: new Date()
        }
      });

      logger.info(`Achat ${id} reçu - Stock mis à jour pour ${achat.details.length} produits`);
      return { success: true, message: 'Réception enregistrée avec succès' };
    });
  }

  /**
   * Gère l'annulation d'un achat déjà reçu avec retour du stock
   */
  private async handleCancellationWithStockReversal(id: string, achat: any, data: UpdateAchatStatutDto): Promise<any> {
    return this.prisma.$transaction(async (tx: any) => {
      const stockServiceTx = new StockService(tx);

      // Retirer du stock les quantités qui avaient été reçues
      for (const detail of achat.details) {
        const qtyToRemove = (detail.quantite_recue && detail.quantite_recue > 0) 
          ? detail.quantite_recue 
          : detail.quantite;

        if (qtyToRemove > 0) {
          await stockServiceTx.createMouvement({
            magasin_id: achat.magasin_id,
            produit_id: detail.produit_id,
            type: 'SORTIE_VENTE', // Décrément du stock
            quantite: qtyToRemove,
            utilisateur_id: data.utilisateur_id,
            raison: `Annulation achat ${achat.numero_commande || id}`,
            achat_id: achat.id
          }, tx);
        }
      }

      // Mise à jour du statut
      await tx.achat.update({
        where: { id },
        data: { statut: 'ANNULE' }
      });

      logger.info(`Achat ${id} annulé - Stock reversé pour ${achat.details.length} produits`);
      return { success: true, message: 'Achat annulé et stock reversé' };
    });
  }

  /**
   * Gère une simple mise à jour de statut sans impact stock
   */
  private async handleSimpleStatusUpdate(id: string, statut: StatutAchat): Promise<any> {
    await this.prisma.achat.update({
      where: { id },
      data: { statut }
    });

    logger.info(`Achat ${id} - Statut mis à jour: ${statut}`);
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

        // Mise à jour détails et gestion Stock (Partial Reception)
        if (data.details) {
             const oldDetails = await tx.achat_detail.findMany({ where: { achat_id: id } });
             const oldDetailsMap = new Map(oldDetails.map(d => [d.produit_id, d]));

             // On va tracker les mouvements de stock nécessaires
             const stockMovements = [];
             
             // Nettoyage existant : On supprime tout et on recrée ? 
             // Le problème de tout supprimer c'est qu'on perd l'historique 'quantite_recue' si on ne le renvoie pas. 
             // Mais ici on suppose que le frontend renvoie tout l'état désiré.
             
             // Attention : Si on supprime et recrée, on perd la référence ID de la ligne, mais pour le stock c'est pas grave tant qu'on compare.
             // MAIS pour calculer le diff, il nous faut l'ancien état.
             
             await tx.achat_detail.deleteMany({ where: { achat_id: id } });

             let totalOrdered = 0;
             let totalReceived = 0;

             for (const item of data.details) {
                const qtyOrdered = Number(item.quantite);
                
                // Nouvelle propriété quantite_recue (si pas envoyée, on assume 0 OU on garde l'ancienne si c'est un patch partiel ?)
                // Ici on assume que le frontend envoie la nouvelle valeur désirée.
                // Attention: 'item' est un DTO, il faut s'assurer qu'il a 'quantite_recue'. 
                // Je vais devoir update le DTO interface aussi, mais JS s'en fiche.
                const qtyReceivedNew = Number((item as any).quantite_recue || 0);

                totalOrdered += qtyOrdered;
                totalReceived += qtyReceivedNew;

                // Comparaison avec l'ancien état pour stock
                const oldDetail = oldDetailsMap.get(item.produit_id);
                const qtyReceivedOld = oldDetail ? oldDetail.quantite_recue : 0;
                
                const diff = qtyReceivedNew - qtyReceivedOld;

                if (diff > 0) {
                     // Réception incrémentale
                     // Conversion si conditionnement ? 
                     // Simplification : On gère le stock en UNITÉS pures ici pour éviter la complexité collis/vrac mélangés.
                     // Le frontend doit envoyer des unités ou on convertit ?
                     // A priori 'quantite' et 'quantite_recue' sont en UNITÉS de base (pas colis).
                     
                     stockMovements.push({
                         produit_id: item.produit_id,
                         quantite: diff,
                         // On essaie de préserver lot/peremption si fournis
                         numero_lot: item.numero_lot,
                         date_peremption: item.date_peremption
                     });
                }
                // Si diff < 0 (correction erreur saisie), on devrait sortir du stock ? 
                // Pour l'instant on gère que l'entrée.

                // Recréation ligne
                await tx.achat_detail.create({
                    data: {
                        achat_id: id,
                        produit_id: item.produit_id,
                        quantite: qtyOrdered,
                        quantite_recue: qtyReceivedNew,
                        prix_unitaire: Number(item.prix_unitaire),
                        prix_total: Number(item.prix_total),
                        numero_lot: item.numero_lot,
                        date_peremption: item.date_peremption,
                        conditionnement_id: item.conditionnement_id,
                        quantite_conditionnement: item.quantite_conditionnement ? Number(item.quantite_conditionnement) : null
                    }
                });
             }
             
             // Application mouvements stock
             if (stockMovements.length > 0) {
                 const stockServiceTx = new StockService(tx as any);
                 for (const mvmt of stockMovements) {
                     // Gestion Lot (si nécessaire)
                     let lot_id = undefined;
                     if (mvmt.numero_lot && mvmt.date_peremption) {
                        // ... code lot (copié de processAchatReception ou similar)
                        // Pour simplifier, on appelle processAchatReception avec juste ce produit ?
                        // Non, processAchatReception fait createMouvement 'ENTREE_ACHAT'.
                        // On peut l'appeler pour un 'mini' update.
                        await stockServiceTx.processAchatReception(id, existing.magasin_id, [{
                            produit_id: mvmt.produit_id,
                            quantite: mvmt.quantite,
                            numero_lot: mvmt.numero_lot,
                            date_peremption: mvmt.date_peremption
                        }], tx);
                     } else {
                         await stockServiceTx.incrementStock(
                             existing.magasin_id, 
                             mvmt.produit_id, 
                             mvmt.quantite, 
                             { achat_id: id, raison: 'Réception partielle achat' },
                             tx
                         );
                     }
                 }
                 logger.info(`Stock mis à jour pour achat ${id} (+${stockMovements.length} lignes)`);
             }
            
            // Mise à jour automatique du statut
            // Si on a commencé à recevoir : RECU_PARTIELLEMENT
            // Si tout reçu : RECU_COMPLET
            let newStatut = existing.statut;
            if (totalReceived > 0 && totalReceived < totalOrdered) {
                newStatut = 'RECU_PARTIELLEMENT';
            } else if (totalReceived >= totalOrdered && totalOrdered > 0) {
                newStatut = 'RECU_COMPLET';
                // TODO: Gérer date_livraison_reelle si pas encore mise
            } else if (totalReceived === 0 && existing.statut !== 'COMMANDE') {
                // Retour à commande ? Possible si correction erreur.
                // newStatut = 'COMMANDE'; 
            }
            
            // On ne change le statut que si ce n'est pas déjà Annulé ou Payé/Facturé (sauf si upgrade vers complet ?)
            if (existing.statut !== 'ANNULE' && existing.statut !== 'PAYE' && existing.statut !== 'FACTURE_RECU') {
                 if (newStatut !== existing.statut) {
                      await tx.achat.update({ where: { id }, data: { 
                          statut: newStatut,
                          ...(newStatut === 'RECU_COMPLET' ? { date_livraison_reelle: new Date() } : {})
                      }});
                 }
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
