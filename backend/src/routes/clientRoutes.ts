import { Router } from 'express';
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  updateClientCredit,
} from '../controllers/clientController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', requirePermission(Module.CLIENTS, Action.VOIR), getAllClients);
router.get('/:id', requirePermission(Module.CLIENTS, Action.VOIR), getClientById);
router.post('/', requirePermission(Module.CLIENTS, Action.CREER), createClient);
router.put('/:id', requirePermission(Module.CLIENTS, Action.MODIFIER), updateClient);
router.patch('/:id/credit', requirePermission(Module.CLIENTS, Action.MODIFIER), updateClientCredit);
router.delete('/:id', requirePermission(Module.CLIENTS, Action.SUPPRIMER), deleteClient);

export default router;
