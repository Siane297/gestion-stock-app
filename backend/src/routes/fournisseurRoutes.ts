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

const router: Router = Router();

router.use(authenticate);

router.get('/', getAllFournisseurs);
router.get('/:id', getFournisseurById);
router.get('/:id/stats', getFournisseurStats);
router.post('/', createFournisseur);
router.put('/:id', updateFournisseur);
router.delete('/:id', deleteFournisseur);

export default router;
