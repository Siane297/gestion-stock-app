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

const router: Router = Router();

router.use(authenticate);

router.get('/', getAllMagasins);
router.get('/:id', getMagasinById);
router.get('/:id/stock', getMagasinStock);
router.get('/:id/stats', getMagasinStats);
router.post('/', createMagasin);
router.put('/:id', updateMagasin);
router.delete('/:id', deleteMagasin);

export default router;
