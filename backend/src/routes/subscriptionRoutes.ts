import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  getSubscriptionDetails,
  activateSubscription,
  renewSubscription,
  getPaymentHistory,
  updateSubscriptionNotes,
  downloadReceipt,
} from '../controllers/subscriptionController.js';

import { requireSuperAdmin } from '../middleware/superAdminMiddleware.js';

const router: Router = Router();

// Toutes les routes nécessitent une authentification Super Admin
router.use(authenticate, requireSuperAdmin);

// GET /api/subscriptions/:companyId - Détails de l'abonnement
router.get('/:companyId', getSubscriptionDetails);

// POST /api/subscriptions/:companyId/activate - Activer un abonnement (après période d'essai)
router.post('/:companyId/activate', activateSubscription);

// POST /api/subscriptions/:companyId/renew - Renouveler un abonnement existant
router.post('/:companyId/renew', renewSubscription);

// GET /api/subscriptions/:companyId/payments - Historique des paiements
router.get('/:companyId/payments', getPaymentHistory);

// PATCH /api/subscriptions/:companyId/notes - Mettre à jour les notes
router.patch('/:companyId/notes', updateSubscriptionNotes);

// GET /api/subscriptions/payments/:paymentId/receipt - Télécharger le reçu
router.get('/payments/:paymentId/receipt', downloadReceipt);

export default router;
