import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService.js';
import { GetNotificationsQuery } from '../types/notificationTypes.js';

interface AuthRequest extends Request {
  tenantPrisma?: any;
  tenantSchema?: string;
  userId?: string;
}

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const query: GetNotificationsQuery = {
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      est_lue: req.query.est_lue === 'true' ? true : req.query.est_lue === 'false' ? false : undefined,
      type: req.query.type as any,
    };

    const notificationService = new NotificationService(req.tenantPrisma);
    const notifications = await notificationService.getNotificationsByUser(userId, query);

    res.status(200).json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error.message,
    });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const notificationService = new NotificationService(req.tenantPrisma);
    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error: any) {
    console.error('Erreur lors du comptage des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du comptage des notifications',
      error: error.message,
    });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const notificationService = new NotificationService(req.tenantPrisma);

    await notificationService.markAsRead(id!, userId);

    res.status(200).json({
      success: true,
      message: 'Notification marquée comme lue',
    });
  } catch (error: any) {
    console.error('Erreur lors du marquage de la notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage de la notification',
      error: error.message,
    });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const notificationService = new NotificationService(req.tenantPrisma);

    await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'Toutes les notifications marquées comme lues',
    });
  } catch (error: any) {
    console.error('Erreur lors du marquage des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage des notifications',
      error: error.message,
    });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const notificationService = new NotificationService(req.tenantPrisma);

    await notificationService.deleteNotification(id!, userId);

    res.status(200).json({
      success: true,
      message: 'Notification supprimée',
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la notification',
      error: error.message,
    });
  }
};

export const deleteAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const notificationService = new NotificationService(req.tenantPrisma);

    const count = await notificationService.deleteAllRead(userId);

    res.status(200).json({
      success: true,
      message: `${count} notifications supprimées`,
      count,
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression des notifications',
      error: error.message,
    });
  }
};
