import express from 'express';
import { getAllOrganizations, toggleBlockOrganization } from '../controllers/organizationController.js';
import { requireSuperAdmin } from '../middleware/superAdminMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Routes de gestion des organisations
 * Toutes les routes nécessitent l'authentification et le rôle SUPER_ADMIN
 */

// Récupérer toutes les organisations
router.get('/', authenticate, requireSuperAdmin, getAllOrganizations);

// Basculer le statut de blocage d'une organisation
router.patch('/:id/block', authenticate, requireSuperAdmin, toggleBlockOrganization);

export default router;
