import { Router } from 'express';
import { identifyTenant, requireTenant } from '../middleware/tenantMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
} from '../controllers/notificationController.js';

const router: Router = Router();

// Toutes les routes nécessitent authentification et tenant
router.use(identifyTenant, requireTenant, authenticate);

// GET /api/notifications - Liste des notifications paginées
router.get('/', getNotifications);

// GET /api/notifications/count - Nombre de notifications non lues
router.get('/count', getUnreadCount);

// PATCH /api/notifications/read-all - Marquer toutes comme lues
router.patch('/read-all', markAllAsRead);

// PATCH /api/notifications/:id/read - Marquer une notification comme lue
router.patch('/:id/read', markAsRead);

// DELETE /api/notifications/read-all - Supprimer toutes les notifications lues
router.delete('/read-all', deleteAllRead);

// DELETE /api/notifications/:id - Supprimer une notification
router.delete('/:id', deleteNotification);

export default router;
