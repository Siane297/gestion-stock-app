import { PrismaClient } from '@prisma/client';
import { CreateNotificationDto, NotificationResponse, GetNotificationsQuery, TypeNotification } from '../types/notificationTypes.js';
import { prismaPublic } from '../services/tenantService.js';
import { getCurrencyByCountry, getCurrencyByCode } from '../utils/countryCurrency.js';

export class NotificationService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Créer une nouvelle notification
   * IMPORTANT: exclut automatiquement l'emetteur de la notification
   */
  async createNotification(data: CreateNotificationDto): Promise<NotificationResponse> {
    const notification = await this.prisma.notification.create({
      data: {
        type: data.type,
        titre: data.titre,
        message: data.message,
        reference_type: data.reference_type,
        reference_id: data.reference_id,
        destinataire_id: data.destinataire_id,
        emetteur_id: data.emetteur_id,
        metadata: data.metadata || {},
      },
      include: {
        emetteur: {
          select: {
            id: true,
            employee: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    return this.mapToResponse(notification);
  }

  /**
   * Créer des notifications pour tous les utilisateurs d'un tenant SAUF l'emetteur
   */
  async createNotificationForAllExceptEmitter(
    emetteur_id: string,
    data: Omit<CreateNotificationDto, 'destinataire_id' | 'emetteur_id'>
  ): Promise<any[]> {
    // Récupérer tous les utilisateurs du tenant SAUF l'émetteur
    const users = await this.prisma.tenantUser.findMany({
      where: {
        id: {
          not: emetteur_id, // EXCLURE l'émetteur
        },
        isBlocked: false,
      },
      select: {
        id: true,
      },
    });

    // Créer une notification pour chaque utilisateur
    const notifications = await Promise.all(
      users.map((user) =>
        this.createNotification({
          ...data,
          destinataire_id: user.id,
          emetteur_id: emetteur_id,
        })
      )
    );

    return notifications;
  }

  /**
   * Récupérer les notifications d'un utilisateur
   */
  async getNotificationsByUser(
    userId: string,
    query: GetNotificationsQuery = {}
  ): Promise<NotificationResponse[]> {
    const { limit = 50, offset = 0, est_lue, type } = query;

    const where: any = {
      destinataire_id: userId,
    };

    if (est_lue !== undefined) {
      where.est_lue = est_lue;
    }

    if (type) {
      where.type = type;
    }

    const notifications = await this.prisma.notification.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        date_creation: 'desc',
      },
      include: {
        emetteur: {
          select: {
            id: true,
            employee: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    return notifications.map((notif) => this.mapToResponse(notif));
  }

  /**
   * Mapper un objet Prisma Notification vers NotificationResponse
   */
  private mapToResponse(notif: any): NotificationResponse {
    return {
      id: notif.id,
      type: notif.type,
      titre: notif.titre,
      message: notif.message,
      reference_type: notif.reference_type || undefined,
      reference_id: notif.reference_id || undefined,
      est_lue: notif.est_lue,
      date_lecture: notif.date_lecture?.toISOString(),
      date_creation: notif.date_creation.toISOString(),
      emetteur: notif.emetteur
        ? {
            id: notif.emetteur.id,
            nom: notif.emetteur.employee?.fullName || 'Utilisateur',
            prenom: '',
          }
        : undefined,
      metadata: notif.metadata as Record<string, any>,
    };
  }

  /**
   * Compter les notifications non lues d'un utilisateur
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.prisma.notification.count({
      where: {
        destinataire_id: userId,
        est_lue: false,
      },
    });
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        destinataire_id: userId,
      },
      data: {
        est_lue: true,
        date_lecture: new Date(),
      },
    });
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        destinataire_id: userId,
        est_lue: false,
      },
      data: {
        est_lue: true,
        date_lecture: new Date(),
      },
    });
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        destinataire_id: userId,
      },
    });
  }

  /**
   * Supprimer toutes les notifications lues (nettoyage)
   */
  async deleteAllRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: {
        destinataire_id: userId,
        est_lue: true,
      },
    });

    return result.count;
  }

  /**
   * Obtenir le symbole de la devise pour un tenant
   */
  async getCurrencySymbol(tenantId: string): Promise<string> {
    try {
      if (!tenantId) return 'GNF';

      const company = await prismaPublic.company.findUnique({
        where: { schemaName: tenantId },
        select: { currency: true, country: true },
      });

      if (company?.currency) {
        const currencyObj = getCurrencyByCode(company.currency);
        if (currencyObj) return currencyObj.symbol;
        return company.currency;
      }

      if (company?.country) {
        return getCurrencyByCountry(company.country).symbol;
      }

      return 'GNF';
    } catch (error) {
      return 'GNF';
    }
  }
}
