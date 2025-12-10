import { Router } from 'express';
import { recalculerDurees, nettoyerDoublonsAbsence } from '../controllers/maintenanceController.js';

const router = Router();

// Route pour recalculer les durées de travail
router.post('/recalculer-durees', recalculerDurees);

// Route pour nettoyer les doublons d'absence
router.post('/nettoyer-doublons', nettoyerDoublonsAbsence);

export default router;
