import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

// Types DTO
export interface CreateUniteDto {
  nom: string;
}

export interface UpdateUniteDto {
  nom?: string;
}

/**
 * Service pour la gestion des unités de produits
 */
export class UniteService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Valide les données d'une unité
   */
  private validateUniteData(data: CreateUniteDto | UpdateUniteDto): void {
    if ('nom' in data && data.nom !== undefined) {
      const nom = String(data.nom).trim();
      if (!nom || nom.length < 1) {
        throw new Error('Le nom de l\'unité doit contenir au moins 1 caractère');
      }
    }
  }

  /**
   * Vérifie l'unicité du nom
   */
  private async checkNomUnique(nom: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.unite_produit.findUnique({
      where: { nom }
    });

    if (existing && existing.id !== excludeId) {
      throw new Error('Une unité avec ce nom existe déjà');
    }
  }

  /**
   * Récupère toutes les unités
   */
  async getAll(): Promise<any[]> {
    return this.prisma.unite_produit.findMany({
      orderBy: { date_creation: 'desc' },
      include: {
        _count: { select: { produits: true } }
      }
    });
  }

  /**
   * Récupère une unité par ID
   */
  async getById(id: string): Promise<any> {
    const unite = await this.prisma.unite_produit.findUnique({
      where: { id },
      include: {
        produits: { take: 10 }
      }
    });

    if (!unite) {
      throw new Error('Unité non trouvée');
    }

    return unite;
  }

  /**
   * Crée une nouvelle unité
   */
  async create(data: CreateUniteDto): Promise<any> {
    this.validateUniteData(data);
    await this.checkNomUnique(data.nom);

    const unite = await this.prisma.unite_produit.create({
      data: {
        nom: String(data.nom).trim()
      }
    });

    logger.info(`Unité créée: ${unite.id} - ${unite.nom}`);
    return unite;
  }

  /**
   * Met à jour une unité
   */
  async update(id: string, data: UpdateUniteDto): Promise<any> {
    const existing = await this.prisma.unite_produit.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Unité non trouvée');
    }

    this.validateUniteData(data);

    if (data.nom && data.nom.trim() !== existing.nom) {
      await this.checkNomUnique(data.nom.trim(), id);
    }

    const unite = await this.prisma.unite_produit.update({
      where: { id },
      data: {
        nom: data.nom?.trim()
      }
    });

    logger.info(`Unité mise à jour: ${unite.id} - ${unite.nom}`);
    return unite;
  }

  /**
   * Supprime une unité
   */
  async delete(id: string): Promise<{ deleted: boolean; message: string }> {
    const existing = await this.prisma.unite_produit.findUnique({
      where: { id },
      include: { _count: { select: { produits: true } } }
    });

    if (!existing) {
      throw new Error('Unité non trouvée');
    }

    if (existing._count.produits > 0) {
      throw new Error('Impossible de supprimer une unité utilisée par des produits');
    }

    await this.prisma.unite_produit.delete({ where: { id } });
    logger.info(`Unité supprimée: ${id}`);
    
    return { deleted: true, message: 'Unité supprimée avec succès' };
  }
}

export default UniteService;
