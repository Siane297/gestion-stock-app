import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';

const router: Router = Router();
// Toutes les routes dashboard sont protégées
router.use(authenticate);

// GET /api/dashboard/stats?magasin_id=...
router.get('/stats', requirePermission(Module.TABLEAU_DE_BORD, Action.VOIR), getDashboardStats);

export default router;
