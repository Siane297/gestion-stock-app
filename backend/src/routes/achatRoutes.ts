import { Router } from 'express';
import {
    getAllAchats,
    getAchatById,
    createAchat,
    updateAchatStatut,
    deleteAchat,
    cancelAchat,
} from '../controllers/achatController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', getAllAchats);
router.get('/:id', getAchatById);
router.post('/', createAchat);
router.patch('/:id/statut', updateAchatStatut);
router.patch('/:id/cancel', cancelAchat);
router.delete('/:id', deleteAchat);

export default router;
