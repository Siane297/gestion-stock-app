import express from 'express';
import { getCurrentCompany, updateCompany, uploadCompanyLogo, deleteCompanyLogo, uploadCompanyPdfHeader, deleteCompanyPdfHeader } from '../controllers/companyController.js';
import { uploadLogo, uploadPdfHeader } from '../config/uploadConfig.js';
import { attachCompanyName } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Routes pour l'organisation
// Préfixe: /api/companies

router.get('/me', getCurrentCompany);
router.put('/me', updateCompany);

// Routes pour le logo
router.post('/me/logo', attachCompanyName, uploadLogo.single('logo'), uploadCompanyLogo);
router.delete('/me/logo', deleteCompanyLogo);

// Routes pour l'en-tête PDF
router.post('/me/pdf-header', attachCompanyName, uploadPdfHeader.single('pdfHeader'), uploadCompanyPdfHeader);
router.delete('/me/pdf-header', deleteCompanyPdfHeader);

export default router;

