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
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';
import { uploadProductImage } from '../config/uploadConfig.js';
import { attachCompanyName } from '../middleware/uploadMiddleware.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', requirePermission(Module.PRODUITS, Action.VOIR), getAllProduits);
router.get('/:id', requirePermission(Module.PRODUITS, Action.VOIR), getProduitById);
router.get('/:id/price-history', requirePermission(Module.PRODUITS, Action.VOIR), getPriceHistory);

router.post('/', 
    requirePermission(Module.PRODUITS, Action.CREER), 
    attachCompanyName, 
    uploadProductImage.any(), 
    createProduit
);

router.put('/:id', 
    requirePermission(Module.PRODUITS, Action.MODIFIER), 
    attachCompanyName, 
    uploadProductImage.any(), 
    updateProduit
);

router.delete('/:id', requirePermission(Module.PRODUITS, Action.SUPPRIMER), deleteProduit);

export default router;
