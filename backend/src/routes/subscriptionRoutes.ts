import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  getSubscriptionDetails,
  activateSubscription,
  renewSubscription,
  getPaymentHistory,
  updateSubscriptionNotes,
} from '../controllers/subscriptionController.js';

const router: Router = Router();

// Toutes les routes nécessitent une authentification Super Admin
// (La vérification du rôle SUPER_ADMIN est faite dans le middleware global)

// GET /api/subscriptions/:companyId - Détails de l'abonnement
router.get('/:companyId', authenticate, getSubscriptionDetails);

// POST /api/subscriptions/:companyId/activate - Activer un abonnement (après période d'essai)
router.post('/:companyId/activate', authenticate, activateSubscription);

// POST /api/subscriptions/:companyId/renew - Renouveler un abonnement existant
router.post('/:companyId/renew', authenticate, renewSubscription);

// GET /api/subscriptions/:companyId/payments - Historique des paiements
router.get('/:companyId/payments', authenticate, getPaymentHistory);

// PATCH /api/subscriptions/:companyId/notes - Mettre à jour les notes
router.patch('/:companyId/notes', authenticate, updateSubscriptionNotes);

export default router;
