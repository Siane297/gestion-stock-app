import { Router } from 'express';
import {
  getAllPostes,
  getPosteById,
  createPoste,
  updatePoste,
  deletePoste
} from '../controllers/posteController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';

const router: Router = Router();

router.use(authenticate);

// Routes
router.get('/', requirePermission(Module.PERSONNEL, Action.VOIR), getAllPostes);
router.get('/:id', requirePermission(Module.PERSONNEL, Action.VOIR), getPosteById);

router.post('/', requirePermission(Module.PERSONNEL, Action.MODIFIER), createPoste);
router.put('/:id', requirePermission(Module.PERSONNEL, Action.MODIFIER), updatePoste);
router.delete('/:id', requirePermission(Module.PERSONNEL, Action.SUPPRIMER), deletePoste);

export default router;
