import express from 'express';
import { PdfController } from '../controllers/pdfController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { identifyTenant, requireTenant } from '../middleware/tenantMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

/**
 * Rate limiting spécifique pour les PDF (plus restrictif car resource-intensive)
 */
const pdfRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Maximum 10 PDF par 5 minutes par IP
  message: {
    success: false,
    message: 'Trop de demandes de génération PDF. Veuillez patienter.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Routes pour la génération de PDF
 * Toutes les routes nécessitent : authentification + tenant + rate limiting
 */

/**
 * @route   POST /api/pdf/employees
 * @desc    Générer PDF de la liste des employés du tenant
 * @access  Private (tenant-aware)
 */
router.post('/employees', 
  pdfRateLimit,
  authenticate,
  identifyTenant,
  requireTenant,
  PdfController.generateEmployeesPdf
);

/**
 * @route   POST /api/pdf/attendances  
 * @desc    Générer PDF de l'historique des pointages du tenant
 * @access  Private (tenant-aware)
 */
router.post('/attendances',
  pdfRateLimit, 
  authenticate,
  identifyTenant,
  requireTenant,
  PdfController.generateAttendancePdf
);

/**
 * @route   POST /api/pdf/users
 * @desc    Générer PDF de la liste des utilisateurs du tenant  
 * @access  Private (tenant-aware)
 */
router.post('/users',
  pdfRateLimit,
  authenticate, 
  identifyTenant,
  requireTenant,
  PdfController.generateUsersPdf
);

/**
 * @route   POST /api/pdf/bilans  
 * @desc    Générer PDF des bilans de présence du tenant
 * @access  Private (tenant-aware)
 */
router.post('/bilans',
  pdfRateLimit, 
  authenticate,
  identifyTenant,
  requireTenant,
  PdfController.generateBilanPdf
);

/**
 * @route   POST /api/pdf/conges  
 * @desc    Générer PDF de la liste des congés du tenant
 * @access  Private (tenant-aware)
 */
router.post('/conges',
  pdfRateLimit,
  authenticate,
  identifyTenant,
  requireTenant,
  PdfController.generateCongesPdf
);

export default router;
