import { Router } from 'express';
import {
    getAllCaisses,
    getCaisseById,
    createCaisse,
    updateCaisse,
    deleteCaisse,
    ouvrirSession,
    ouvrirSessionParPin,
    fermerSession,
    getSessionActive,
    getHistoriqueSessions,
    getMaSession,
    getSessionDetail,
} from '../controllers/caisseController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router: Router = Router();

// ============================================
// CRUD CAISSES (nécessite authentification)
// ============================================
router.get('/', authenticate, getAllCaisses);
router.get('/:id', authenticate, getCaisseById);
router.post('/', authenticate, createCaisse);
router.put('/:id', authenticate, updateCaisse);
router.delete('/:id', authenticate, deleteCaisse);

// ============================================
// SESSIONS DE CAISSE
// ============================================
// Ouverture par PIN (ne nécessite PAS le JWT, juste le contexte tenant)
router.post('/:id/ouvrir-pin', ouvrirSessionParPin);

// Ouverture classique (via JWT)
router.post('/:id/ouvrir', authenticate, ouvrirSession);
router.post('/:id/fermer', authenticate, fermerSession);
router.get('/:id/session-active', authenticate, getSessionActive);
router.get('/:id/historique', authenticate, getHistoriqueSessions);

// ============================================
// SESSION UTILISATEUR
// ============================================
router.get('/sessions/ma-session', authenticate, getMaSession);
router.get('/sessions/:sessionId', authenticate, getSessionDetail);

export default router;
