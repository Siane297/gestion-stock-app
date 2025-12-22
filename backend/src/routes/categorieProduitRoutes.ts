import { Router } from 'express';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/categorieProduitController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', requirePermission(Module.PRODUITS, Action.VOIR), getAllCategories);
router.get('/:id', requirePermission(Module.PRODUITS, Action.VOIR), getCategoryById);
router.post('/', requirePermission(Module.PRODUITS, Action.CREER), createCategory);
router.put('/:id', requirePermission(Module.PRODUITS, Action.MODIFIER), updateCategory);
router.delete('/:id', requirePermission(Module.PRODUITS, Action.SUPPRIMER), deleteCategory);

export default router;
