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
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';
import { uploadEmployeePhoto as uploadEmployeePhotoMiddleware } from '../config/uploadConfig.js';
import { attachCompanyName } from '../middleware/uploadMiddleware.js';

const router: Router = Router();

// Routes publiques (pour le scan QR)
// route QR supprimée

// TODO: Activer l'authentification plus tard
// Routes protégées
router.use(authenticate);

// GET /api/employees - Obtenir tous les employés
router.get('/', getAllEmployees);

// GET /api/employees/:id - Obtenir un employé par ID
router.get('/:id', getEmployeeById);

// POST /api/employees - Créer un nouvel employé (ADMIN/MANAGER seulement)
router.post('/', requireAdmin, createEmployee);

// PUT /api/employees/:id - Mettre à jour un employé (ADMIN/MANAGER seulement)
router.put('/:id', requireAdmin, updateEmployee);

// DELETE /api/employees/:id - Supprimer un employé (ADMIN seulement)
router.delete('/:id', requireAdmin, deleteEmployee);

// Routes pour la photo de l'employé
router.post('/:id/photo', requireAdmin, attachCompanyName, uploadEmployeePhotoMiddleware.single('photo'), uploadEmployeePhoto);
router.delete('/:id/photo', requireAdmin, attachCompanyName, deleteEmployeePhoto);

export default router;
