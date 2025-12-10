import express from 'express';
import { 
  getBadgeCustomization, 
  upsertBadgeCustomization, 
  deleteBadgeCustomization 
} from '../controllers/badgeCustomizationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// GET /api/badge-customization - Récupérer la configuration
router.get('/', getBadgeCustomization);

// POST /api/badge-customization - Créer ou mettre à jour la configuration
router.post('/', upsertBadgeCustomization);

// DELETE /api/badge-customization - Supprimer la personnalisation
router.delete('/', deleteBadgeCustomization);

export default router;
