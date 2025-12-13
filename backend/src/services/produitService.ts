import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

// Types DTO
export interface CreateProduitDto {
  nom: string;
  code_barre?: string;
  categorie_id?: string;
  description?: string;
  prix_achat?: number;
  prix_vente: number;
  unite?: 'UNITE' | 'KG' | 'LITRE' | 'METRE' | 'PAQUET' | 'AUTRE';
  marge_min_pourcent?: number;
  est_actif?: boolean;
}

export interface UpdateProduitDto {
  nom?: string;
  code_barre?: string;
  categorie_id?: string;
  description?: string;
  prix_achat?: number;
  prix_vente?: number;
  unite?: 'UNITE' | 'KG' | 'LITRE' | 'METRE' | 'PAQUET' | 'AUTRE';
  marge_min_pourcent?: number;
  est_actif?: boolean;
  raison_changement_prix?: string;
}

export interface ProduitFilters {
  search?: string;
  categorie_id?: string;
  est_actif?: boolean;
}

/**
 * Service pour la gestion des produits
 */
export class ProduitService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Valide les données d'un produit
   */
  private validateProduitData(data: CreateProduitDto | UpdateProduitDto): void {
    if ('nom' in data && data.nom !== undefined) {
      const nom = String(data.nom).trim();
      if (!nom || nom.length < 2) {
        throw new Error('Le nom du produit doit contenir au moins 2 caractères');
      }
    }

    if ('prix_vente' in data && data.prix_vente !== undefined) {
      const prixVente = Number(data.prix_vente);
      if (isNaN(prixVente) || prixVente < 0) {
        throw new Error('Le prix de vente doit être un nombre positif');
      }
    }

    if ('prix_achat' in data && data.prix_achat !== undefined) {
      const prixAchat = Number(data.prix_achat);
      if (isNaN(prixAchat) || prixAchat < 0) {
        throw new Error("Le prix d'achat doit être un nombre positif");
      }
    }

    if ('marge_min_pourcent' in data && data.marge_min_pourcent !== undefined) {
      const marge = Number(data.marge_min_pourcent);
      if (isNaN(marge) || marge < 0 || marge > 100) {
        throw new Error('La marge minimum doit être entre 0 et 100%');
      }
    }
  }

  /**
   * Vérifie l'unicité du code-barre
   */
  private async checkCodeBarreUnique(code_barre: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.produit.findUnique({
      where: { code_barre }
    });

    if (existing && existing.id !== excludeId) {
      throw new Error('Un produit avec ce code-barre existe déjà');
    }
  }

  /**
   * Récupère tous les produits avec filtres
   */
  async getAll(filters?: ProduitFilters): Promise<any[]> {
    const where: any = {};

    if (filters?.est_actif !== undefined) {
      where.est_actif = filters.est_actif;
    } else {
      where.est_actif = true; // Par défaut, seulement les actifs
    }

    if (filters?.search) {
      where.OR = [
        { nom: { contains: filters.search, mode: 'insensitive' } },
        { code_barre: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters?.categorie_id) {
      where.categorie_id = filters.categorie_id;
    }

    return this.prisma.produit.findMany({
      where,
      orderBy: { nom: 'asc' },
      include: {
        categorie: true,
        stocks: {
          include: { magasin: true }
        }
      }
    });
  }

  /**
   * Récupère un produit par ID
   */
  async getById(id: string): Promise<any> {
    const produit = await this.prisma.produit.findUnique({
      where: { id },
      include: {
        categorie: true,
        stocks: {
          include: { magasin: true }
        },
        prix_historiques: {
          orderBy: { date_change: 'desc' },
          take: 10
        }
      }
    });

    if (!produit) {
      throw new Error('Produit non trouvé');
    }

    return produit;
  }

  /**
   * Crée un nouveau produit
   */
  async create(data: CreateProduitDto): Promise<any> {
    this.validateProduitData(data);

    // Vérification code-barre unique
    if (data.code_barre) {
      await this.checkCodeBarreUnique(data.code_barre);
    }

    const produit = await this.prisma.produit.create({
      data: {
        nom: String(data.nom).trim(),
        code_barre: data.code_barre?.trim() || null,
        categorie_id: data.categorie_id || null,
        description: data.description?.trim() || null,
        prix_achat: data.prix_achat !== undefined ? Number(data.prix_achat) : null,
        prix_vente: Number(data.prix_vente),
        unite: data.unite || 'UNITE',
        marge_min_pourcent: data.marge_min_pourcent !== undefined ? Number(data.marge_min_pourcent) : null,
        est_actif: data.est_actif !== undefined ? data.est_actif : true
      }
    });

    logger.info(`Produit créé: ${produit.id} - ${produit.nom}`);
    return produit;
  }

  /**
   * Met à jour un produit
   */
  async update(id: string, data: UpdateProduitDto): Promise<any> {
    const existing = await this.prisma.produit.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Produit non trouvé');
    }

    this.validateProduitData(data);

    // Vérification code-barre unique si modifié
    if (data.code_barre && data.code_barre !== existing.code_barre) {
      await this.checkCodeBarreUnique(data.code_barre, id);
    }

    // Gestion historique prix
    if (data.prix_vente !== undefined && Number(data.prix_vente) !== existing.prix_vente) {
      await this.prisma.historique_prix.create({
        data: {
          produit_id: id,
          ancien_prix: existing.prix_vente,
          nouveau_prix: Number(data.prix_vente),
          raison: data.raison_changement_prix || 'Mise à jour fiche produit'
        }
      });
      logger.info(`Historique prix créé pour produit ${id}: ${existing.prix_vente} -> ${data.prix_vente}`);
    }

    const produit = await this.prisma.produit.update({
      where: { id },
      data: {
        nom: data.nom?.trim(),
        code_barre: data.code_barre?.trim(),
        categorie_id: data.categorie_id,
        description: data.description?.trim(),
        prix_achat: data.prix_achat !== undefined ? Number(data.prix_achat) : undefined,
        prix_vente: data.prix_vente !== undefined ? Number(data.prix_vente) : undefined,
        unite: data.unite,
        marge_min_pourcent: data.marge_min_pourcent !== undefined ? Number(data.marge_min_pourcent) : undefined,
        est_actif: data.est_actif
      }
    });

    logger.info(`Produit mis à jour: ${produit.id} - ${produit.nom}`);
    return produit;
  }

  /**
   * Supprime ou désactive un produit
   */
  async delete(id: string): Promise<{ deleted: boolean; message: string }> {
    const existing = await this.prisma.produit.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Produit non trouvé');
    }

    // Vérifier stock
    const totalStock = await this.prisma.stock_magasin.aggregate({
      where: { produit_id: id },
      _sum: { quantite: true }
    });

    if (totalStock._sum.quantite && totalStock._sum.quantite > 0) {
      throw new Error('Impossible de supprimer un produit qui a du stock positif');
    }

    // Vérifier mouvements historiques
    const hasMovements = await this.prisma.mouvements_stock.count({ where: { produit_id: id } });

    if (hasMovements > 0) {
      // Soft delete
      await this.prisma.produit.update({
        where: { id },
        data: { est_actif: false }
      });
      logger.info(`Produit désactivé (historique existant): ${id}`);
      return { deleted: false, message: 'Produit désactivé (possède un historique de stock)' };
    }

    // Hard delete
    await this.prisma.produit.delete({ where: { id } });
    logger.info(`Produit supprimé: ${id}`);
    return { deleted: true, message: 'Produit supprimé avec succès' };
  }

  /**
   * Récupère l'historique des prix
   */
  async getPriceHistory(produit_id: string, limit: number = 20): Promise<any[]> {
    return this.prisma.historique_prix.findMany({
      where: { produit_id },
      orderBy: { date_change: 'desc' },
      take: limit
    });
  }
}

export default ProduitService;
