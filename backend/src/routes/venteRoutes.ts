import { Router } from 'express';
import {
    getAllVentes,
    getVenteById,
    createVente,
    updateVenteStatut,
    getVenteStats,
} from '../controllers/venteController.js';
import { PdfController } from '../controllers/pdfController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', requirePermission(Module.VENTES, Action.VOIR), getAllVentes);
router.get('/stats', requirePermission(Module.VENTES, Action.VOIR), getVenteStats);
router.get('/:id', requirePermission(Module.VENTES, Action.VOIR), getVenteById);
router.post('/', requirePermission(Module.VENTES, Action.CREER), createVente);
router.patch('/:id/statut', requirePermission(Module.VENTES, Action.MODIFIER), updateVenteStatut);

export default router;
