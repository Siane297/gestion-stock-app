import { Router } from 'express';
import {
  getAllDepartements,
  getDepartementById,
  createDepartement,
  updateDepartement,
  deleteDepartement
} from '../controllers/departementController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// TODO: Activer l'authentification plus tard
// Routes publiques temporairement (pour chargement dans formulaire)
router.get('/', getAllDepartements);
router.get('/:id', getDepartementById);

// Routes protégées
router.post('/', authenticate, createDepartement);
router.put('/:id', authenticate, updateDepartement);
router.delete('/:id', authenticate, deleteDepartement);

export default router;
