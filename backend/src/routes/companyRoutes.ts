import express, { Router } from 'express';
import { getCurrentCompany, updateCompany, uploadCompanyLogo, deleteCompanyLogo, uploadCompanyPdfHeader, deleteCompanyPdfHeader } from '../controllers/companyController.js';
import { uploadLogo, uploadPdfHeader } from '../config/uploadConfig.js';
import { attachCompanyName } from '../middleware/uploadMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';

const router: Router = express.Router();

router.use(authenticate);

// Routes pour l'organisation
// Préfixe: /api/companies

router.get('/me', requirePermission(Module.PARAMETRES, Action.VOIR), getCurrentCompany);
router.put('/me', requirePermission(Module.PARAMETRES, Action.MODIFIER), updateCompany);

// Routes pour le logo
router.post('/me/logo', requirePermission(Module.PARAMETRES, Action.MODIFIER), attachCompanyName, uploadLogo.single('logo'), uploadCompanyLogo);
router.delete('/me/logo', requirePermission(Module.PARAMETRES, Action.MODIFIER), deleteCompanyLogo);

// Routes pour l'en-tête PDF
router.post('/me/pdf-header', requirePermission(Module.PARAMETRES, Action.MODIFIER), attachCompanyName, uploadPdfHeader.single('pdfHeader'), uploadCompanyPdfHeader);
router.delete('/me/pdf-header', requirePermission(Module.PARAMETRES, Action.MODIFIER), deleteCompanyPdfHeader);

export default router;

