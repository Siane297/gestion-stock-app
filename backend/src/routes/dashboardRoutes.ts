import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router: Router = Router();
// Toutes les routes dashboard sont protégées
router.use(authenticate);

// GET /api/dashboard/stats?magasin_id=...
router.get('/stats', getDashboardStats);

export default router;
