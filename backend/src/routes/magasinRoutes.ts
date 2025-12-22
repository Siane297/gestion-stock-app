import { Router } from 'express';
import {
    getAllMagasins,
    getMagasinById,
    createMagasin,
    updateMagasin,
    deleteMagasin,
    getMagasinStock,
    getMagasinStats,
} from '../controllers/magasinController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', requirePermission(Module.BOUTIQUES, Action.VOIR), getAllMagasins);
router.get('/:id', requirePermission(Module.BOUTIQUES, Action.VOIR), getMagasinById);
router.get('/:id/stock', requirePermission(Module.BOUTIQUES, Action.VOIR), getMagasinStock);
router.get('/:id/stats', requirePermission(Module.BOUTIQUES, Action.VOIR), getMagasinStats);
router.post('/', requirePermission(Module.BOUTIQUES, Action.CREER), createMagasin);
router.put('/:id', requirePermission(Module.BOUTIQUES, Action.MODIFIER), updateMagasin);
router.delete('/:id', requirePermission(Module.BOUTIQUES, Action.SUPPRIMER), deleteMagasin);

export default router;
