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

const router: Router = Router();

router.use(authenticate);

router.get('/', getAllAchats);
router.get('/:id', getAchatById);
router.post('/', createAchat);
router.patch('/:id', updateAchat); // General update
router.patch('/:id/statut', updateAchatStatut); // Status update
router.patch('/:id/cancel', cancelAchat);
router.delete('/:id', deleteAchat);

export default router;
