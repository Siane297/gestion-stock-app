import { Router } from 'express';
import {
    getStocks,
    createMouvement,
    getMouvements,
    setMinimumStock,
    getTotalStock,
} from '../controllers/stockController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', getStocks);
router.get('/mouvements', getMouvements);
router.get('/total/:produit_id', getTotalStock);
router.post('/mouvements', createMouvement);
router.post('/minimum', setMinimumStock);

export default router;
