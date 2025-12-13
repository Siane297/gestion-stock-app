import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

// Types DTO
export interface CreateClientDto {
  nom: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  solde_credit?: number;
  limite_credit?: number;
  est_actif?: boolean;
}

export interface UpdateClientDto {
  nom?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  solde_credit?: number;
  limite_credit?: number;
  est_actif?: boolean;
}

/**
 * Service pour la gestion des clients
 */
export class ClientService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Valide les données d'un client
   */
  private validateClientData(data: CreateClientDto | UpdateClientDto): void {
    if ('nom' in data && data.nom !== undefined) {
      const nom = String(data.nom).trim();
      if (!nom || nom.length < 2) {
        throw new Error('Le nom du client doit contenir au moins 2 caractères');
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

    if ('solde_credit' in data && data.solde_credit !== undefined) {
      const solde = Number(data.solde_credit);
      if (isNaN(solde)) {
        throw new Error('Le solde crédit doit être un nombre');
      }
    }

    if ('limite_credit' in data && data.limite_credit !== undefined) {
      const limite = Number(data.limite_credit);
      if (isNaN(limite) || limite < 0) {
        throw new Error('La limite de crédit doit être un nombre positif');
      }
    }
  }

  /**
   * Vérifie l'unicité de l'email
   */
  private async checkEmailUnique(email: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.client.findFirst({
      where: { email }
    });

    if (existing && existing.id !== excludeId) {
      throw new Error('Un client avec cet email existe déjà');
    }
  }

  /**
   * Récupère tous les clients
   */
  async getAll(filters?: { est_actif?: boolean; search?: string }): Promise<any[]> {
    const where: any = {};

    if (filters?.est_actif !== undefined) {
      where.est_actif = filters.est_actif;
    }

    if (filters?.search) {
      where.OR = [
        { nom: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { telephone: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return this.prisma.client.findMany({
      where,
      orderBy: { date_creation: 'desc' }
    });
  }

  /**
   * Récupère un client par ID
   */
  async getById(id: string): Promise<any> {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        ventes: {
          take: 5,
          orderBy: { date_creation: 'desc' }
        }
      }
    });

    if (!client) {
      throw new Error('Client non trouvé');
    }

    return client;
  }

  /**
   * Crée un nouveau client
   */
  async create(data: CreateClientDto): Promise<any> {
    this.validateClientData(data);

    // Vérification email unique
    if (data.email) {
      await this.checkEmailUnique(data.email.trim());
    }

    const client = await this.prisma.client.create({
      data: {
        nom: String(data.nom).trim(),
        telephone: data.telephone?.trim() || null,
        email: data.email?.trim() || null,
        adresse: data.adresse?.trim() || null,
        solde_credit: Number(data.solde_credit || 0),
        limite_credit: data.limite_credit !== undefined ? Number(data.limite_credit) : null,
        est_actif: data.est_actif !== undefined ? data.est_actif : true
      }
    });

    logger.info(`Client créé: ${client.id} - ${client.nom}`);
    return client;
  }

  /**
   * Met à jour un client
   */
  async update(id: string, data: UpdateClientDto): Promise<any> {
    const existing = await this.prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Client non trouvé');
    }

    this.validateClientData(data);

    // Vérification email unique si modifié
    if (data.email && data.email.trim() !== existing.email) {
      await this.checkEmailUnique(data.email.trim(), id);
    }

    const client = await this.prisma.client.update({
      where: { id },
      data: {
        nom: data.nom?.trim(),
        telephone: data.telephone?.trim(),
        email: data.email?.trim(),
        adresse: data.adresse?.trim(),
        solde_credit: data.solde_credit !== undefined ? Number(data.solde_credit) : undefined,
        limite_credit: data.limite_credit !== undefined ? Number(data.limite_credit) : undefined,
        est_actif: data.est_actif
      }
    });

    logger.info(`Client mis à jour: ${client.id} - ${client.nom}`);
    return client;
  }

  /**
   * Supprime ou désactive un client
   */
  async delete(id: string): Promise<{ deleted: boolean; message: string }> {
    const existing = await this.prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Client non trouvé');
    }

    // Vérifier les ventes liées
    const hasSales = await this.prisma.vente.count({ where: { client_id: id } });

    if (hasSales > 0) {
      // Soft delete
      await this.prisma.client.update({
        where: { id },
        data: { est_actif: false }
      });
      logger.info(`Client désactivé (ventes existantes): ${id}`);
      return { deleted: false, message: 'Client désactivé (ne peut pas être supprimé car possède des ventes)' };
    }

    // Hard delete
    await this.prisma.client.delete({ where: { id } });
    logger.info(`Client supprimé: ${id}`);
    return { deleted: true, message: 'Client supprimé avec succès' };
  }

  /**
   * Met à jour le crédit d'un client
   */
  async updateCredit(id: string, montant: number, operation: 'add' | 'subtract'): Promise<any> {
    const existing = await this.prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Client non trouvé');
    }

    const newSolde = operation === 'add' 
      ? existing.solde_credit + montant
      : existing.solde_credit - montant;

    const client = await this.prisma.client.update({
      where: { id },
      data: { solde_credit: newSolde }
    });

    logger.info(`Crédit client ${id} mis à jour: ${existing.solde_credit} -> ${newSolde}`);
    return client;
  }

  /**
   * Vérifie si un client peut utiliser son crédit
   */
  async canUseCredit(id: string, montant: number): Promise<boolean> {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) return false;

    if (client.limite_credit === null) return true;
    return (client.solde_credit + montant) <= client.limite_credit;
  }
}

export default ClientService;
