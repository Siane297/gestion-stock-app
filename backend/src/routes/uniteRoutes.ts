import { Router } from 'express';
import {
    getAllUnites,
    getUniteById,
    createUnite,
    updateUnite,
    deleteUnite,
} from '../controllers/uniteController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', getAllUnites);
router.get('/:id', getUniteById);
router.post('/', createUnite);
router.put('/:id', updateUnite);
router.delete('/:id', deleteUnite);

export default router;
