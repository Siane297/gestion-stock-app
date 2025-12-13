import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

// Types pour l'audit
export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'RECEPTION' 
  | 'VENTE' 
  | 'ANNULATION'
  | 'MOUVEMENT_STOCK';

export type AuditEntity = 
  | 'PRODUIT'
  | 'CLIENT'
  | 'FOURNISSEUR'
  | 'MAGASIN'
  | 'ACHAT'
  | 'VENTE'
  | 'STOCK'
  | 'UTILISATEUR';

export interface AuditLogEntry {
  entity: AuditEntity;
  entity_id: string;
  action: AuditAction;
  utilisateur_id: string;
  details?: Record<string, any>;
  ip_address?: string;
}

export interface AuditFilters {
  entity?: AuditEntity;
  entity_id?: string;
  action?: AuditAction;
  utilisateur_id?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}

/**
 * Service pour la traçabilité et l'audit des opérations sensibles
 * Compatible avec le schéma audit_log existant
 */
export class AuditService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Crée une entrée d'audit
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Vérifier que l'utilisateur existe
      if (!entry.utilisateur_id) {
        logger.info(`[AUDIT] ${entry.action} ${entry.entity} ${entry.entity_id}`, entry.details);
        return;
      }

      await this.prisma.audit_log.create({
        data: {
          utilisateur_id: entry.utilisateur_id,
          action: entry.action,
          table_cible: entry.entity,
          enregistrement_id: entry.entity_id,
          ancienne_valeur: entry.details?.before ? JSON.stringify(entry.details.before) : null,
          nouvelle_valeur: entry.details?.after ? JSON.stringify(entry.details.after) : 
                           entry.details ? JSON.stringify(entry.details) : null,
          ip_adresse: entry.ip_address || null
        }
      });
    } catch (error: any) {
      // Si erreur (ex: table inexistante, clé étrangère invalide), on log juste dans la console
      logger.info(`[AUDIT] ${entry.action} ${entry.entity} ${entry.entity_id}`, {
        ...entry.details,
        utilisateur_id: entry.utilisateur_id
      });
    }
  }

  /**
   * Log création
   */
  async logCreate(
    entity: AuditEntity, 
    entity_id: string, 
    utilisateur_id: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      entity,
      entity_id,
      action: 'CREATE',
      utilisateur_id,
      details
    });
  }

  /**
   * Log mise à jour
   */
  async logUpdate(
    entity: AuditEntity,
    entity_id: string,
    utilisateur_id: string,
    changes?: { before?: Record<string, any>; after?: Record<string, any> }
  ): Promise<void> {
    await this.log({
      entity,
      entity_id,
      action: 'UPDATE',
      utilisateur_id,
      details: changes
    });
  }

  /**
   * Log suppression
   */
  async logDelete(
    entity: AuditEntity,
    entity_id: string,
    utilisateur_id: string,
    entityData?: Record<string, any>
  ): Promise<void> {
    await this.log({
      entity,
      entity_id,
      action: 'DELETE',
      utilisateur_id,
      details: { deletedData: entityData }
    });
  }

  /**
   * Log vente
   */
  async logVente(
    vente_id: string,
    utilisateur_id: string,
    details: {
      montant_total: number;
      nb_produits: number;
      client_id?: string;
      magasin_id: string;
    }
  ): Promise<void> {
    await this.log({
      entity: 'VENTE',
      entity_id: vente_id,
      action: 'VENTE',
      utilisateur_id,
      details
    });
  }

  /**
   * Log réception achat
   */
  async logReception(
    achat_id: string,
    utilisateur_id: string,
    details?: {
      nb_produits: number;
      montant_total: number;
      fournisseur_id: string;
    }
  ): Promise<void> {
    await this.log({
      entity: 'ACHAT',
      entity_id: achat_id,
      action: 'RECEPTION',
      utilisateur_id,
      details
    });
  }

  /**
   * Log mouvement de stock
   */
  async logMouvementStock(
    mouvement_id: string,
    utilisateur_id: string,
    details?: {
      produit_id: string;
      magasin_id: string;
      type: string;
      quantite: number;
    }
  ): Promise<void> {
    await this.log({
      entity: 'STOCK',
      entity_id: mouvement_id,
      action: 'MOUVEMENT_STOCK',
      utilisateur_id,
      details
    });
  }

  /**
   * Log annulation
   */
  async logAnnulation(
    entity: AuditEntity,
    entity_id: string,
    utilisateur_id: string,
    raison?: string
  ): Promise<void> {
    await this.log({
      entity,
      entity_id,
      action: 'ANNULATION',
      utilisateur_id,
      details: { raison }
    });
  }

  /**
   * Récupère les logs d'audit
   */
  async getLogs(filters?: AuditFilters): Promise<any[]> {
    try {
      const where: any = {};
      
      if (filters?.entity) where.table_cible = filters.entity;
      if (filters?.entity_id) where.enregistrement_id = filters.entity_id;
      if (filters?.action) where.action = filters.action;
      if (filters?.utilisateur_id) where.utilisateur_id = filters.utilisateur_id;
      
      if (filters?.dateFrom || filters?.dateTo) {
        where.date_action = {};
        if (filters.dateFrom) where.date_action.gte = filters.dateFrom;
        if (filters.dateTo) where.date_action.lte = filters.dateTo;
      }

      return await this.prisma.audit_log.findMany({
        where,
        orderBy: { date_action: 'desc' },
        take: filters?.limit || 100,
        include: {
          utilisateur: {
            select: { email: true }
          }
        }
      });
    } catch (error) {
      // Table n'existe pas ou erreur
      logger.warn('Table audit_log non disponible ou erreur');
      return [];
    }
  }

  /**
   * Historique d'une entité
   */
  async getEntityHistory(entity: AuditEntity, entity_id: string): Promise<any[]> {
    return this.getLogs({ entity, entity_id });
  }

  /**
   * Actions d'un utilisateur
   */
  async getUserActions(utilisateur_id: string, limit: number = 50): Promise<any[]> {
    return this.getLogs({ utilisateur_id, limit });
  }

  /**
   * Résumé des activités récentes
   */
  async getRecentActivitySummary(hours: number = 24): Promise<{
    totalActions: number;
    ventes: number;
    achats: number;
    mouvementsStock: number;
    modifications: number;
  }> {
    const dateFrom = new Date();
    dateFrom.setHours(dateFrom.getHours() - hours);

    try {
      const logs = await this.prisma.audit_log.groupBy({
        by: ['action'],
        where: { date_action: { gte: dateFrom } },
        _count: { action: true }
      });

      const counts: Record<string, number> = {};
      for (const log of logs) {
        counts[log.action] = log._count.action;
      }

      const totalActions = Object.values(counts).reduce((a, b) => a + b, 0);

      return {
        totalActions,
        ventes: counts['VENTE'] || 0,
        achats: (counts['RECEPTION'] || 0) + (counts['CREATE'] || 0),
        mouvementsStock: counts['MOUVEMENT_STOCK'] || 0,
        modifications: counts['UPDATE'] || 0
      };
    } catch (error) {
      return {
        totalActions: 0,
        ventes: 0,
        achats: 0,
        mouvementsStock: 0,
        modifications: 0
      };
    }
  }
}

export default AuditService;
