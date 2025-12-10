import { Router } from 'express';
import { getHistorique, marquerAbsentsManuel } from '../controllers/bilanPresenceController.js';

const router = Router();

// Route pour récupérer l'historique des bilans
router.get('/historique', getHistorique);

// Route pour marquer manuellement les absents
router.post('/marquer-absents', marquerAbsentsManuel);

export default router;
