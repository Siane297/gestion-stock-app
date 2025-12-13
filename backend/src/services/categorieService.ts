import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

// Types DTO
export interface CreateCategorieDto {
  nom: string;
  description?: string;
}

export interface UpdateCategorieDto {
  nom?: string;
  description?: string;
}

/**
 * Service pour la gestion des catégories de produits
 */
export class CategorieService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Valide les données d'une catégorie
   */
  private validateCategorieData(data: CreateCategorieDto | UpdateCategorieDto): void {
    if ('nom' in data && data.nom !== undefined) {
      const nom = String(data.nom).trim();
      if (!nom || nom.length < 2) {
        throw new Error('Le nom de la catégorie doit contenir au moins 2 caractères');
      }
    }
  }

  /**
   * Vérifie l'unicité du nom
   */
  private async checkNomUnique(nom: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.categorie_produit.findUnique({
      where: { nom }
    });

    if (existing && existing.id !== excludeId) {
      throw new Error('Une catégorie avec ce nom existe déjà');
    }
  }

  /**
   * Récupère toutes les catégories
   */
  async getAll(): Promise<any[]> {
    return this.prisma.categorie_produit.findMany({
      orderBy: { date_creation: 'desc' },
      include: {
        _count: { select: { produits: true } }
      }
    });
  }

  /**
   * Récupère une catégorie par ID
   */
  async getById(id: string): Promise<any> {
    const category = await this.prisma.categorie_produit.findUnique({
      where: { id },
      include: {
        produits: { take: 10 }
      }
    });

    if (!category) {
      throw new Error('Catégorie non trouvée');
    }

    return category;
  }

  /**
   * Crée une nouvelle catégorie
   */
  async create(data: CreateCategorieDto): Promise<any> {
    this.validateCategorieData(data);
    await this.checkNomUnique(data.nom);

    const category = await this.prisma.categorie_produit.create({
      data: {
        nom: String(data.nom).trim(),
        description: data.description?.trim() || null
      }
    });

    logger.info(`Catégorie créée: ${category.id} - ${category.nom}`);
    return category;
  }

  /**
   * Met à jour une catégorie
   */
  async update(id: string, data: UpdateCategorieDto): Promise<any> {
    const existing = await this.prisma.categorie_produit.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Catégorie non trouvée');
    }

    this.validateCategorieData(data);

    if (data.nom && data.nom.trim() !== existing.nom) {
      await this.checkNomUnique(data.nom.trim(), id);
    }

    const category = await this.prisma.categorie_produit.update({
      where: { id },
      data: {
        nom: data.nom?.trim(),
        description: data.description?.trim()
      }
    });

    logger.info(`Catégorie mise à jour: ${category.id} - ${category.nom}`);
    return category;
  }

  /**
   * Supprime une catégorie
   */
  async delete(id: string): Promise<{ deleted: boolean; message: string }> {
    const existing = await this.prisma.categorie_produit.findUnique({
      where: { id },
      include: { _count: { select: { produits: true } } }
    });

    if (!existing) {
      throw new Error('Catégorie non trouvée');
    }

    if (existing._count.produits > 0) {
      throw new Error('Impossible de supprimer une catégorie contenant des produits');
    }

    await this.prisma.categorie_produit.delete({ where: { id } });
    logger.info(`Catégorie supprimée: ${id}`);
    
    return { deleted: true, message: 'Catégorie supprimée avec succès' };
  }
}

export default CategorieService;
