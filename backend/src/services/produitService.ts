import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

// Types DTO
// Types DTO
// UnitProduit Enum removed

export interface CreateProduitDto {
  nom: string;
  description?: string;
  code_barre?: string; // Sera mis sur le conditionnement par défaut
  categorie_id?: string;
  unite_id?: string;
  prix_achat?: number; // Sera mis sur le conditionnement par défaut
  prix_vente: number;  // Sera mis sur le conditionnement par défaut
  marge_min_pourcent?: number;
  tva_pourcentage?: number;
  gere_peremption?: boolean;
  est_actif?: boolean;
  conditionnements?: Array<{
    nom: string;
    quantite_base: number;
    prix_vente: number;
    code_barre?: string;
    image_url?: string;
    image_id?: string;
  }>;
  image_url?: string;
  image_id?: string;
}

export interface UpdateProduitDto {
  nom?: string;
  description?: string;
  code_barre?: string; // Sera mis sur le conditionnement par défaut
  categorie_id?: string;
  unite_id?: string;
  prix_achat?: number; // Sera mis sur le conditionnement par défaut
  prix_vente?: number; // Sera mis sur le conditionnement par défaut
  marge_min_pourcent?: number;
  tva_pourcentage?: number;
  gere_peremption?: boolean;
  est_actif?: boolean;
  raison_changement_prix?: string;
  conditionnements?: Array<{
    id?: string;
    nom?: string;
    quantite_base?: number;
    prix_vente?: number;
    code_barre?: string;
    image_url?: string;
    image_id?: string;
    action?: 'create' | 'update' | 'delete';
  }>;
  image_url?: string;
  image_id?: string;
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

    // Validation pour le prix de vente du conditionnement par défaut (si présent)
    if ('prix_vente' in data && data.prix_vente !== undefined) {
      const prixVente = Number(data.prix_vente);
      if (isNaN(prixVente) || prixVente < 0) {
        throw new Error('Le prix de vente doit être un nombre positif');
      }
    }

    // Validation pour le prix d'achat du conditionnement par défaut (si présent)
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
    const existing = await this.prisma.conditionnement_produit.findFirst({
      where: { code_barre }
    });

    if (existing && existing.id !== excludeId) {
      throw new Error('Un conditionnement avec ce code-barre existe déjà');
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
        { conditionnements: { some: { code_barre: { contains: filters.search, mode: 'insensitive' } } } },
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
        unite: true,
        conditionnements: true,
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
        unite: true,
        conditionnements: true,
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

    // Vérification code-barre unique pour le conditionnement par défaut
    if (data.code_barre) {
      await this.checkCodeBarreUnique(data.code_barre);
    }
    
    return this.prisma.$transaction(async (tx) => {
      // 1. Création du produit (abstrait)
      const produit = await tx.produit.create({
        data: {
          nom: String(data.nom).trim(),
          description: data.description?.trim(),
          categorie_id: data.categorie_id,
          unite_id: data.unite_id,
          marge_min_pourcent: data.marge_min_pourcent !== undefined ? Number(data.marge_min_pourcent) : undefined,
          gere_peremption: data.gere_peremption || false,
          est_actif: data.est_actif !== undefined ? data.est_actif : true,
          // 2. Création du conditionnement par défaut "Unité"
          conditionnements: {
            create: {
              nom: 'Unité',
              quantite_base: 1,
              prix_vente: Number(data.prix_vente),
              // Si prix_achat est fourni, on le met sur le conditionnement
              prix_achat: data.prix_achat !== undefined ? Number(data.prix_achat) : undefined,
              code_barre: data.code_barre?.trim(),
              est_actif: true
            }
          },
          image_url: data.image_url,
          image_id: data.image_id
        },
        include: {
          categorie: true,
          conditionnements: true
        }
      });

      // 3. Ajout des autres conditionnements si fournis
      if (data.conditionnements && data.conditionnements.length > 0) {
        for (const cond of data.conditionnements) {
            // On vérifie le code barre s'il est présent pour chaque conditionnement
            if (cond.code_barre) {
                 const existing = await tx.conditionnement_produit.findFirst({ where: { code_barre: cond.code_barre } });
                 if (existing) throw new Error(`Un conditionnement avec ce code-barre existe déjà: ${cond.code_barre}`);
            }

           const newCond = await tx.conditionnement_produit.create({
             data: {
               produit_id: produit.id,
               nom: cond.nom,
               quantite_base: Number(cond.quantite_base),
               prix_vente: Number(cond.prix_vente),
               code_barre: cond.code_barre,
               est_actif: true,
               image_url: cond.image_url,
               image_id: cond.image_id
             }
           });
           
           // Ajout au tableau pour le retour API
           (produit.conditionnements as any[]).push(newCond);
        }
      }
      logger.info(`Produit créé: ${produit.id} - ${produit.nom}`);
      
      // On retourne l'objet directement car getById ne verrait pas le produit avant le commit de la transaction
      return {
        ...produit,
        stocks: [],
        prix_historiques: []
      };
    });
  }

  /**
   * Met à jour un produit
   */
  async update(id: string, data: UpdateProduitDto): Promise<any> {
    const existing = await this.prisma.produit.findUnique({ 
        where: { id },
        include: { conditionnements: true }
    });
    if (!existing) {
      throw new Error('Produit non trouvé');
    }

    this.validateProduitData(data);

    // Si on change le prix/code barre "root", on met à jour le conditionnement par défaut (Unité)
    // On cherche le conditionnement "Unité" ou celui avec quantite_base = 1
    const defaultConditionnement = existing.conditionnements.find(c => c.quantite_base === 1);
    
    // Vérification code-barre unique si modifié (sur le cond par défaut)
    if (data.code_barre && defaultConditionnement && data.code_barre !== defaultConditionnement.code_barre) {
      await this.checkCodeBarreUnique(data.code_barre, defaultConditionnement.id);
    }

    const produit = await this.prisma.produit.update({
      where: { id },
      data: {
        nom: data.nom?.trim(),
        // code_barre, prix_achat, prix_vente ne sont plus sur produit
        categorie_id: data.categorie_id,
        description: data.description?.trim(),
        unite_id: data.unite_id,
        marge_min_pourcent: data.marge_min_pourcent !== undefined ? Number(data.marge_min_pourcent) : undefined,
        gere_peremption: data.gere_peremption !== undefined ? data.gere_peremption : undefined,
        est_actif: data.est_actif,
        image_url: data.image_url,
        image_id: data.image_id
      }
    });

    // Mise à jour du conditionnement par défaut via les champs root
    if (defaultConditionnement) {
        const updateDefaultData: any = {};
        if (data.prix_vente !== undefined) updateDefaultData.prix_vente = Number(data.prix_vente);
        if (data.prix_achat !== undefined) updateDefaultData.prix_achat = Number(data.prix_achat);
        if (data.code_barre !== undefined) updateDefaultData.code_barre = data.code_barre;

        if (Object.keys(updateDefaultData).length > 0) {
            await this.prisma.conditionnement_produit.update({
                where: { id: defaultConditionnement.id },
                data: updateDefaultData
            });
        }
    }

    // Gestion des autres conditionnements
    if (data.conditionnements) {
      for (const cond of data.conditionnements) {
        if (cond.action === 'create' && cond.nom && cond.quantite_base && cond.prix_vente) {
// Update method changes
          await this.prisma.conditionnement_produit.create({
            data: {
              produit_id: id,
              nom: cond.nom,
              quantite_base: Number(cond.quantite_base),
              prix_vente: Number(cond.prix_vente),
              code_barre: cond.code_barre,
              image_url: cond.image_url,
              image_id: cond.image_id
            }
          });
        } else if (cond.action === 'update' && cond.id) {
            await this.prisma.conditionnement_produit.update({
                where: { id: cond.id },
                data: {
                    nom: cond.nom,
                    quantite_base: cond.quantite_base ? Number(cond.quantite_base) : undefined,
                    prix_vente: cond.prix_vente ? Number(cond.prix_vente) : undefined,
                    code_barre: cond.code_barre,
                    image_url: cond.image_url,
                    image_id: cond.image_id
                }
            });
        } else if (cond.action === 'delete' && cond.id) {
            await this.prisma.conditionnement_produit.delete({
                where: { id: cond.id }
            });
        }
      }
    }

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

    // Force Soft Delete (Demange utilisateur: rien n'est supprimé en base)
    await this.prisma.produit.update({
      where: { id },
      data: { est_actif: false }
    });
    
    logger.info(`Produit désactivé (soft delete forcé): ${id}`);
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
