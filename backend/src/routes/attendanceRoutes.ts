import { Router } from 'express';
import {
  createAttendance,
  createAttendanceByQrCode,
  getAttendances,
  getEmployeeAttendanceForDate,
} from '../controllers/attendanceController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Note: La route /scan est désormais publique et définie dans server.ts
// pour éviter les middlewares tenant

// TODO: Activer l'authentification plus tard
// Routes protégées (authentification désactivée temporairement)
// router.use(authenticate);

// GET /api/attendance - Obtenir les pointages avec filtres
router.get('/', getAttendances);

// POST /api/attendance - Créer un pointage
router.post('/', createAttendance);

// GET /api/attendance/employee/:employeeId/date/:date - Pointages d'un employé pour une date
router.get('/employee/:employeeId/date/:date', getEmployeeAttendanceForDate);

export default router;
