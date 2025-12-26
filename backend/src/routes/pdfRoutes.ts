import express from 'express';
import { PdfController } from '../controllers/pdfController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { identifyTenant, requireTenant } from '../middleware/tenantMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';
import rateLimit from 'express-rate-limit';

const router: express.Router = express.Router();

/**
 * Rate limiting spécifique pour les PDF (plus restrictif car resource-intensive)
 */
const pdfRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Augmenté pour permettre plusieurs téléchargements
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
 * @route   GET /api/pdf/receipt/:id
 * @desc    Générer le ticket de caisse d'une vente
 * @access  Private (tenant-aware)
 */
router.get('/receipt/:id',
  pdfRateLimit,
  authenticate,
  identifyTenant,
  requireTenant,
  requirePermission(Module.VENTES, Action.VOIR),
  PdfController.generateReceiptPdf
);

/**
 * @route   GET /api/pdf/proforma/:id
 * @desc    Générer la facture proforma d'une vente
 * @access  Private (tenant-aware)
 */
router.get('/proforma/:id',
  pdfRateLimit,
  authenticate,
  identifyTenant,
  requireTenant,
  requirePermission(Module.VENTES, Action.VOIR),
  PdfController.generateProformaPdf
);

export default router;
