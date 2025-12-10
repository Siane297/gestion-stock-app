import { Router } from 'express';
import {
  getAllPostes,
  getPosteById,
  createPoste,
  updatePoste,
  deletePoste
} from '../controllers/posteController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// TODO: Activer l'authentification plus tard
// Routes publiques temporairement (pour chargement dans formulaire)
router.get('/', getAllPostes);
router.get('/:id', getPosteById);

// Routes protégées
router.post('/', authenticate, createPoste);
router.put('/:id', authenticate, updatePoste);
router.delete('/:id', authenticate, deletePoste);

export default router;
