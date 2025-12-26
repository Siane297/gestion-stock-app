import { Router } from 'express';
import {
    getAllInventaires,
    getInventaireById,
    createInventaire,
    startInventaire,
    updateComptage,
    finalizeInventaire,
    validateInventaire,
    deleteInventaire,
    getInventaireStats,
} from '../controllers/inventaireController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';

const router: Router = Router();

router.use(authenticate);

// Liste des inventaires
router.get('/', requirePermission(Module.INVENTAIRE, Action.VOIR), getAllInventaires);

// Détail d'un inventaire
router.get('/:id', requirePermission(Module.INVENTAIRE, Action.VOIR), getInventaireById);

// Statistiques d'un inventaire
router.get('/:id/stats', requirePermission(Module.INVENTAIRE, Action.VOIR), getInventaireStats);

// Créer un inventaire
router.post('/', requirePermission(Module.INVENTAIRE, Action.CREER), createInventaire);

// Démarrer un inventaire (BROUILLON -> EN_COURS)
router.post('/:id/start', requirePermission(Module.INVENTAIRE, Action.MODIFIER), startInventaire);

// Mettre à jour le comptage d'un détail
router.patch('/:id/details/:detailId', requirePermission(Module.INVENTAIRE, Action.MODIFIER), updateComptage);

// Finaliser un inventaire (EN_COURS -> TERMINE)
router.post('/:id/finalize', requirePermission(Module.INVENTAIRE, Action.MODIFIER), finalizeInventaire);

// Valider un inventaire et ajuster les stocks (TERMINE -> VALIDE)
router.post('/:id/validate', requirePermission(Module.INVENTAIRE, Action.VALIDER), validateInventaire);

// Supprimer un inventaire (BROUILLON uniquement)
router.delete('/:id', requirePermission(Module.INVENTAIRE, Action.SUPPRIMER), deleteInventaire);

export default router;
