import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  uploadEmployeePhoto,
  deleteEmployeePhoto,
} from '../controllers/employeeController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';
import { uploadEmployeePhoto as uploadEmployeePhotoMiddleware } from '../config/uploadConfig.js';
import { attachCompanyName } from '../middleware/uploadMiddleware.js';

const router: Router = Router();

// Routes publiques (pour le scan QR)
// route QR supprimée

// TODO: Activer l'authentification plus tard
// Routes protégées
router.use(authenticate);

// GET /api/employees - Obtenir tous les employés
router.get('/', requirePermission(Module.PERSONNEL, Action.VOIR), getAllEmployees);

// GET /api/employees/:id - Obtenir un employé par ID
router.get('/:id', requirePermission(Module.PERSONNEL, Action.VOIR), getEmployeeById);

// POST /api/employees - Créer un nouvel employé (ADMIN/MANAGER seulement)
router.post('/', requirePermission(Module.PERSONNEL, Action.CREER), createEmployee);

// PUT /api/employees/:id - Mettre à jour un employé (ADMIN/MANAGER seulement)
router.put('/:id', requirePermission(Module.PERSONNEL, Action.MODIFIER), updateEmployee);

// DELETE /api/employees/:id - Supprimer un employé (ADMIN seulement)
router.delete('/:id', requirePermission(Module.PERSONNEL, Action.SUPPRIMER), deleteEmployee);

// Routes pour la photo de l'employé
router.post('/:id/photo', requirePermission(Module.PERSONNEL, Action.MODIFIER), attachCompanyName, uploadEmployeePhotoMiddleware.single('photo'), uploadEmployeePhoto);
router.delete('/:id/photo', requirePermission(Module.PERSONNEL, Action.MODIFIER), attachCompanyName, deleteEmployeePhoto);

export default router;
