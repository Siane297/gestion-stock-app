import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

// Types DTO
export interface CreateFournisseurDto {
  nom_entreprise: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  responsable?: string;
  delai_livraison?: number;
  est_actif?: boolean;
}

export interface UpdateFournisseurDto {
  nom_entreprise?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  responsable?: string;
  delai_livraison?: number;
  est_actif?: boolean;
}

/**
 * Service pour la gestion des fournisseurs
 */
export class FournisseurService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Valide les données d'un fournisseur
   */
  private validateFournisseurData(data: CreateFournisseurDto | UpdateFournisseurDto): void {
    if ('nom_entreprise' in data && data.nom_entreprise !== undefined) {
      const nom = String(data.nom_entreprise).trim();
      if (!nom || nom.length < 2) {
        throw new Error('Le nom de l\'entreprise doit contenir au moins 2 caractères');
      }
    }

    if ('email' in data && data.email !== undefined && data.email !== null) {
      const email = String(data.email).trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Format d'email invalide");
      }
    }

    if ('telephone' in data && data.telephone !== undefined && data.telephone !== null) {
      const tel = String(data.telephone).trim();
      if (tel && tel.length < 8) {
        throw new Error('Le numéro de téléphone doit contenir au moins 8 chiffres');
      }
    }

    if ('delai_livraison' in data && data.delai_livraison !== undefined) {
      const delai = Number(data.delai_livraison);
      if (!Number.isInteger(delai) || delai < 0) {
        throw new Error('Le délai de livraison doit être un nombre entier positif (jours)');
      }
    }
  }

  /**
   * Récupère tous les fournisseurs
   */
  async getAll(filters?: { est_actif?: boolean; search?: string }): Promise<any[]> {
    const where: any = {};

    if (filters?.est_actif !== undefined) {
      where.est_actif = filters.est_actif;
    } else {
        where.est_actif = true;
    }

    if (filters?.search) {
      where.OR = [
        { nom_entreprise: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { responsable: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return this.prisma.fournisseur.findMany({
      where,
      orderBy: { date_creation: 'desc' }
    });
  }

  /**
   * Récupère un fournisseur par ID
   */
  async getById(id: string): Promise<any> {
    const fournisseur = await this.prisma.fournisseur.findUnique({
      where: { id },
      include: {
        achats: {
          take: 5,
          orderBy: { date_commande: 'desc' }
        }
      }
    });

    if (!fournisseur) {
      throw new Error('Fournisseur non trouvé');
    }

    return fournisseur;
  }

  /**
   * Crée un nouveau fournisseur
   */
  async create(data: CreateFournisseurDto): Promise<any> {
    this.validateFournisseurData(data);

    const fournisseur = await this.prisma.fournisseur.create({
      data: {
        nom_entreprise: String(data.nom_entreprise).trim(),
        telephone: data.telephone?.trim() || null,
        email: data.email?.trim() || null,
        adresse: data.adresse?.trim() || null,
        responsable: data.responsable?.trim() || null,
        delai_livraison: data.delai_livraison !== undefined ? Number(data.delai_livraison) : null,
        est_actif: data.est_actif !== undefined ? data.est_actif : true
      }
    });

    logger.info(`Fournisseur créé: ${fournisseur.id} - ${fournisseur.nom_entreprise}`);
    return fournisseur;
  }

  /**
   * Met à jour un fournisseur
   */
  async update(id: string, data: UpdateFournisseurDto): Promise<any> {
    const existing = await this.prisma.fournisseur.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Fournisseur non trouvé');
    }

    this.validateFournisseurData(data);

    const fournisseur = await this.prisma.fournisseur.update({
      where: { id },
      data: {
        nom_entreprise: data.nom_entreprise?.trim(),
        telephone: data.telephone?.trim(),
        email: data.email?.trim(),
        adresse: data.adresse?.trim(),
        responsable: data.responsable?.trim(),
        delai_livraison: data.delai_livraison !== undefined ? Number(data.delai_livraison) : undefined,
        est_actif: data.est_actif
      }
    });

    logger.info(`Fournisseur mis à jour: ${fournisseur.id} - ${fournisseur.nom_entreprise}`);
    return fournisseur;
  }

  /**
   * Supprime ou désactive un fournisseur
   */
  async delete(id: string): Promise<{ deleted: boolean; message: string }> {
    const existing = await this.prisma.fournisseur.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Fournisseur non trouvé');
    }

    // Force Soft Delete (Demande utilisateur: rien n'est supprimé en base)
    await this.prisma.fournisseur.update({
      where: { id },
      data: { est_actif: false }
    });

    logger.info(`Fournisseur désactivé (soft delete forcé): ${id}`);
    return { deleted: true, message: 'Fournisseur supprimé avec succès' };
  }

  /**
   * Statistiques fournisseur
   */
  async getStats(id: string): Promise<{
    totalAchats: number;
    montantTotal: number;
    delaiMoyenLivraison: number | null;
  }> {
    const stats = await this.prisma.achat.aggregate({
      where: { 
        fournisseur_id: id,
        statut: { in: ['RECU_COMPLET', 'PAYE'] }
      },
      _count: true,
      _sum: { montant_total: true }
    });

    // Calcul délai moyen si données disponibles
    const achatsAvecLivraison = await this.prisma.achat.findMany({
      where: {
        fournisseur_id: id,
        date_livraison_reelle: { not: null }
      },
      select: {
        date_commande: true,
        date_livraison_reelle: true
      }
    });

    let delaiMoyen: number | null = null;
    if (achatsAvecLivraison.length > 0) {
      const totalDelai = achatsAvecLivraison.reduce((acc, a) => {
        if (a.date_livraison_reelle) {
          const diff = (a.date_livraison_reelle.getTime() - a.date_commande.getTime()) / (1000 * 60 * 60 * 24);
          return acc + diff;
        }
        return acc;
      }, 0);
      delaiMoyen = Math.round(totalDelai / achatsAvecLivraison.length);
    }

    return {
      totalAchats: stats._count || 0,
      montantTotal: stats._sum.montant_total || 0,
      delaiMoyenLivraison: delaiMoyen
    };
  }
}

export default FournisseurService;
