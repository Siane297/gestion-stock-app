import { Router } from 'express';
import { getPointagesChart, getStatutsChart } from '../controllers/chartsController.js';

const router = Router();

// Route pour obtenir les données du chart des pointages
router.get('/pointages', getPointagesChart);

// Route pour obtenir les données du chart des statuts
router.get('/statuts', getStatutsChart);

export default router;
