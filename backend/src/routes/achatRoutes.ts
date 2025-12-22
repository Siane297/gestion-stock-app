import { Router } from 'express';
import {
    getAllAchats,
    getAchatById,
    createAchat,
    updateAchat,
    updateAchatStatut,
    deleteAchat,
    cancelAchat,
} from '../controllers/achatController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', requirePermission(Module.ACHATS, Action.VOIR), getAllAchats);
router.get('/:id', requirePermission(Module.ACHATS, Action.VOIR), getAchatById);
router.post('/', requirePermission(Module.ACHATS, Action.CREER), createAchat);
router.patch('/:id', requirePermission(Module.ACHATS, Action.MODIFIER), updateAchat); // General update
router.patch('/:id/statut', requirePermission(Module.ACHATS, Action.MODIFIER), updateAchatStatut); // Status update
router.patch('/:id/cancel', requirePermission(Module.ACHATS, Action.MODIFIER), cancelAchat);
router.delete('/:id', requirePermission(Module.ACHATS, Action.SUPPRIMER), deleteAchat);

export default router;
