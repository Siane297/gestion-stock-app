import express from 'express';
import {
  getAllTenantUsers,
  getTenantUserById,
  createTenantUser,
  updateTenantUser,
  toggleBlockTenantUser,
  deleteTenantUser,
} from '../controllers/tenantUserController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';

const router: express.Router = express.Router();

router.use(authenticate);

// Routes pour la gestion des utilisateurs tenant
router.get('/', requirePermission(Module.UTILISATEURS, Action.VOIR), getAllTenantUsers);
router.get('/:id', requirePermission(Module.UTILISATEURS, Action.VOIR), getTenantUserById);
router.post('/', requirePermission(Module.UTILISATEURS, Action.CREER), createTenantUser);
router.put('/:id', requirePermission(Module.UTILISATEURS, Action.MODIFIER), updateTenantUser);
router.patch('/:id/toggle-block', requirePermission(Module.UTILISATEURS, Action.MODIFIER), toggleBlockTenantUser);
router.delete('/:id', requirePermission(Module.UTILISATEURS, Action.SUPPRIMER), deleteTenantUser);

export default router;
