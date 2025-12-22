import { Router } from 'express';
import {
    getAllFournisseurs,
    getFournisseurById,
    createFournisseur,
    updateFournisseur,
    deleteFournisseur,
    getFournisseurStats,
} from '../controllers/fournisseurController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', requirePermission(Module.FOURNISSEURS, Action.VOIR), getAllFournisseurs);
router.get('/:id', requirePermission(Module.FOURNISSEURS, Action.VOIR), getFournisseurById);
router.get('/:id/stats', requirePermission(Module.FOURNISSEURS, Action.VOIR), getFournisseurStats);
router.post('/', requirePermission(Module.FOURNISSEURS, Action.CREER), createFournisseur);
router.put('/:id', requirePermission(Module.FOURNISSEURS, Action.MODIFIER), updateFournisseur);
router.delete('/:id', requirePermission(Module.FOURNISSEURS, Action.SUPPRIMER), deleteFournisseur);

export default router;
