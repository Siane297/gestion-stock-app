import { Router } from 'express';
import {
  getAllTypesConge,
  getTypeCongeById,
  createTypeConge,
  updateTypeConge,
  deleteTypeConge
} from '../controllers/typeCongeController.js';

const router = Router();

// Routes pour les types de congé
router.get('/', getAllTypesConge);
router.get('/:id', getTypeCongeById);
router.post('/', createTypeConge);
router.put('/:id', updateTypeConge);
router.delete('/:id', deleteTypeConge);

export default router;
