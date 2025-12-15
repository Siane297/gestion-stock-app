import { Router } from 'express';
import {
    getAllVentes,
    getVenteById,
    createVente,
    updateVenteStatut,
    getVenteStats,
} from '../controllers/venteController.js';
import { PdfController } from '../controllers/pdfController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', getAllVentes);
router.get('/stats', getVenteStats);
router.get('/:id', getVenteById);
router.get('/:id/pdf', PdfController.generateReceiptPdf);
router.post('/', createVente);
router.patch('/:id/statut', updateVenteStatut);

export default router;
