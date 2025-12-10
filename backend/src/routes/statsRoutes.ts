import { Router } from 'express';
import { getDashboardStats, getTopEmployees } from '../controllers/statsController.js';

const router = Router();

// GET /api/stats/dashboard - Statistiques du dashboard
router.get('/dashboard', getDashboardStats);

// GET /api/stats/top-employees - Top 5 employés
router.get('/top-employees', getTopEmployees);

export default router;
