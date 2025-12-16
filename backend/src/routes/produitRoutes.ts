import express, { Router } from 'express';
import {
    getAllProduits,
    getProduitById,
    createProduit,
    updateProduit,
    deleteProduit,
    getPriceHistory,
} from '../controllers/produitController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadProductImage } from '../config/uploadConfig.js';
import { attachCompanyName } from '../middleware/uploadMiddleware.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', getAllProduits);
router.get('/:id', getProduitById);
router.get('/:id/price-history', getPriceHistory);
router.post('/', attachCompanyName, uploadProductImage.any(), createProduit);
router.put('/:id', attachCompanyName, uploadProductImage.any(), updateProduit);

router.delete('/:id', deleteProduit);

export default router;
