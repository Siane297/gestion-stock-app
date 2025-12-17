import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

// Types DTO
export interface CreateMagasinDto {
  nom: string;
  localisation?: string;
  telephone?: string;
  email?: string;
  gerant_id?: string;
  heure_ouverture?: string;
  heure_fermeture?: string;
  est_actif?: boolean;
}

export interface UpdateMagasinDto {
  nom?: string;
  localisation?: string;
  telephone?: string;
  email?: string;
  gerant_id?: string;
  heure_ouverture?: string;
  heure_fermeture?: string;
  est_actif?: boolean;
}

/**
 * Service pour la gestion des magasins
 */
export class MagasinService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Valide les données d'un magasin
   */
  private validateMagasinData(data: CreateMagasinDto | UpdateMagasinDto): void {
    if ('nom' in data && data.nom !== undefined) {
      const nom = String(data.nom).trim();
      if (!nom || nom.length < 2) {
        throw new Error('Le nom du magasin doit contenir au moins 2 caractères');
      }
    }

    if ('email' in data && data.email !== undefined && data.email !== null) {
      const email = String(data.email).trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Format d'email invalide");
      }
    }

    // Validation format heure (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if ('heure_ouverture' in data && data.heure_ouverture !== undefined && data.heure_ouverture !== null) {
      if (!timeRegex.test(data.heure_ouverture)) {
        throw new Error("Format d'heure d'ouverture invalide (ex: 09:00)");
      }
    }

    if ('heure_fermeture' in data && data.heure_fermeture !== undefined && data.heure_fermeture !== null) {
      if (!timeRegex.test(data.heure_fermeture)) {
        throw new Error("Format d'heure de fermeture invalide (ex: 18:00)");
      }
    }
  }

  /**
   * Récupère tous les magasins
   */
  async getAll(filters?: { est_actif?: boolean }): Promise<any[]> {
    const where: any = {};

    if (filters?.est_actif !== undefined) {
      where.est_actif = filters.est_actif;
    } else {
        where.est_actif = true;
    }

    return this.prisma.magasin.findMany({
      where,
      orderBy: { date_creation: 'desc' },
      include: {
        gerant: {
          select: {
            id: true,
            email: true,
            employee: {
              select: { fullName: true }
            }
          }
        }
      }
    });
  }

  /**
   * Récupère un magasin par ID
   */
  async getById(id: string): Promise<any> {
    const magasin = await this.prisma.magasin.findUnique({
      where: { id },
      include: {
        gerant: {
          select: {
            id: true,
            email: true,
            employee: {
              select: { fullName: true }
            }
          }
        },
        stocks: {
          take: 10,
          include: {
            produit: { 
                select: { 
                    nom: true,
                    conditionnements: {
                         where: { quantite_base: 1 },
                         select: { code_barre: true },
                         take: 1
                    }
                } 
            }
          }
        }
      }
    });

    if (!magasin) {
      throw new Error('Magasin non trouvé');
    }

    return magasin;
  }

  /**
   * Crée un nouveau magasin
   */
  async create(data: CreateMagasinDto): Promise<any> {
    this.validateMagasinData(data);

    const magasin = await this.prisma.magasin.create({
      data: {
        nom: String(data.nom).trim(),
        localisation: data.localisation?.trim() || null,
        telephone: data.telephone?.trim() || null,
        email: data.email?.trim() || null,
        gerant_id: data.gerant_id || null,
        heure_ouverture: data.heure_ouverture || null,
        heure_fermeture: data.heure_fermeture || null,
        est_actif: data.est_actif !== undefined ? data.est_actif : true
      }
    });

    logger.info(`Magasin créé: ${magasin.id} - ${magasin.nom}`);
    return magasin;
  }

  /**
   * Met à jour un magasin
   */
  async update(id: string, data: UpdateMagasinDto): Promise<any> {
    const existing = await this.prisma.magasin.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Magasin non trouvé');
    }

    this.validateMagasinData(data);

    const magasin = await this.prisma.magasin.update({
      where: { id },
      data: {
        nom: data.nom?.trim(),
        localisation: data.localisation?.trim(),
        telephone: data.telephone?.trim(),
        email: data.email?.trim(),
        gerant_id: data.gerant_id,
        heure_ouverture: data.heure_ouverture,
        heure_fermeture: data.heure_fermeture,
        est_actif: data.est_actif
      }
    });

    logger.info(`Magasin mis à jour: ${magasin.id} - ${magasin.nom}`);
    return magasin;
  }

  /**
   * Supprime ou désactive un magasin
   */
  async delete(id: string): Promise<{ deleted: boolean; message: string }> {
    const existing = await this.prisma.magasin.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Magasin non trouvé');
    }

    // Vérifier stock positif
    const hasStock = await this.prisma.stock_magasin.count({
      where: { magasin_id: id, quantite: { gt: 0 } }
    });

    if (hasStock > 0) {
      throw new Error('Impossible de supprimer un magasin contenant du stock');
    }

    // Force Soft Delete (Demande utilisateur: rien n'est supprimé en base)
    await this.prisma.magasin.update({
      where: { id },
      data: { est_actif: false }
    });

    logger.info(`Magasin désactivé (soft delete forcé): ${id}`);
    return { deleted: true, message: 'Magasin supprimé avec succès' };
  }

  /**
   * Récupère le stock d'un magasin
   */
  async getStock(id: string, filters?: { 
    alertOnly?: boolean;
    search?: string;
  }): Promise<any[]> {
    const magasin = await this.prisma.magasin.findUnique({ where: { id } });
    if (!magasin) {
      throw new Error('Magasin non trouvé');
    }

    let where: any = { magasin_id: id };

    const stocks = await this.prisma.stock_magasin.findMany({
      where,
      include: {
        produit: {
          select: {
            id: true,
            nom: true,
            // unite: true, // unite relation was removed or changed in schema, verifying... existing code had it
            // prix_vente: true, // REMOVED
            conditionnements: {
                 where: { quantite_base: 1 },
                 select: { code_barre: true, prix_vente: true },
                 take: 1
            }
          }
        }
      },
      orderBy: { quantite: 'asc' }
    });

    let result = stocks.map(s => ({
      ...s,
      prix_vente: s.produit.conditionnements?.[0]?.prix_vente, // Map for frontend convenience
      isAlert: s.quantite <= s.quantite_minimum
    }));

    if (filters?.alertOnly) {
      result = result.filter(s => s.isAlert);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(s => 
        s.produit.nom.toLowerCase().includes(searchLower) ||
        // @ts-ignore
        s.produit.conditionnements?.[0]?.code_barre?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }

  async getStats(id: string): Promise<{
    totalProduits: number;
    produitsEnAlerte: number;
    valeurStock: number;
    totalVentes: number;
    montantVentes: number;
  }> {
    const magasin = await this.prisma.magasin.findUnique({ where: { id } });
    if (!magasin) {
      throw new Error('Magasin non trouvé');
    }

    // Stocks
    const stocks = await this.prisma.stock_magasin.findMany({
      where: { magasin_id: id },
      include: { 
        produit: { 
          include: {
            conditionnements: {
              where: { quantite_base: 1 },
              take: 1
            }
          }
        } 
      }
    });

    const totalProduits = stocks.length;
    const produitsEnAlerte = stocks.filter(s => s.quantite <= s.quantite_minimum).length;
    // Calculer la valeur du stock en utilisant le prix de vente du conditionnement de base (unité)
    const valeurStock = stocks.reduce((acc, s) => {
      // @ts-ignore
      const prixVente = s.produit.conditionnements?.[0]?.prix_vente || 0;
      return acc + (s.quantite * prixVente);
    }, 0);

    // Ventes
    const ventesStats = await this.prisma.vente.aggregate({
      where: { magasin_id: id, statut: 'PAYEE' },
      _count: true,
      _sum: { montant_total: true }
    });

    return {
      totalProduits,
      produitsEnAlerte,
      valeurStock,
      totalVentes: ventesStats._count || 0,
      montantVentes: ventesStats._sum.montant_total || 0
    };
  }
}

export default MagasinService;
