import { Router } from 'express';
import {
    getAllUnites,
    getUniteById,
    createUnite,
    updateUnite,
    deleteUnite,
} from '../controllers/uniteController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', requirePermission(Module.PRODUITS, Action.VOIR), getAllUnites);
router.get('/:id', requirePermission(Module.PRODUITS, Action.VOIR), getUniteById);
router.post('/', requirePermission(Module.PRODUITS, Action.CREER), createUnite);
router.put('/:id', requirePermission(Module.PRODUITS, Action.MODIFIER), updateUnite);
router.delete('/:id', requirePermission(Module.PRODUITS, Action.SUPPRIMER), deleteUnite);

export default router;
