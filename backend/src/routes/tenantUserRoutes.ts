import express from 'express';
import {
  getAllTenantUsers,
  getTenantUserById,
  createTenantUser,
  updateTenantUser,
  toggleBlockTenantUser,
  deleteTenantUser,
} from '../controllers/tenantUserController.js';

const router: express.Router = express.Router();

// Routes pour la gestion des utilisateurs tenant
router.get('/', getAllTenantUsers);
router.get('/:id', getTenantUserById);
router.post('/', createTenantUser);
router.put('/:id', updateTenantUser);
router.patch('/:id/toggle-block', toggleBlockTenantUser);
router.delete('/:id', deleteTenantUser);

export default router;
