import { Router } from 'express';
import {
    getStocks,
    createMouvement,
    getMouvements,
    setMinimumStock,
    getTotalStock,
} from '../controllers/stockController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', requirePermission(Module.STOCK, Action.VOIR), getStocks);
router.get('/mouvements', requirePermission(Module.STOCK, Action.VOIR), getMouvements);
router.get('/total/:produit_id', requirePermission(Module.STOCK, Action.VOIR), getTotalStock);
router.post('/mouvements', requirePermission(Module.STOCK, Action.CREER), createMouvement);
router.post('/minimum', requirePermission(Module.STOCK, Action.MODIFIER), setMinimumStock);

export default router;
