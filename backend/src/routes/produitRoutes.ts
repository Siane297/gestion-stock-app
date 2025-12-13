import { Router } from 'express';
import {
    getAllProduits,
    getProduitById,
    createProduit,
    updateProduit,
    deleteProduit,
    getPriceHistory,
} from '../controllers/produitController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', getAllProduits);
router.get('/:id', getProduitById);
router.get('/:id/price-history', getPriceHistory);
router.post('/', createProduit);
router.put('/:id', updateProduit);
router.delete('/:id', deleteProduit);

export default router;
