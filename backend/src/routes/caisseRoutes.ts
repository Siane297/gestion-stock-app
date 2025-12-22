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
    getSessions,
} from '../controllers/caisseController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';

const router: Router = Router();

// ============================================
// BASE & SESSIONS (Priorité Haute)
// ============================================
router.get('/', authenticate, requirePermission(Module.CAISSES, Action.VOIR), getAllCaisses);
router.get('/sessions', authenticate, requirePermission(Module.CAISSES, Action.VOIR), getSessions);
router.get('/sessions/ma-session', authenticate, requirePermission(Module.CAISSES, Action.VOIR), getMaSession);
router.get('/sessions/:sessionId', authenticate, requirePermission(Module.CAISSES, Action.VOIR), getSessionDetail);

// ============================================
// CRUD CAISSES
// ============================================
router.get('/:id', authenticate, requirePermission(Module.CAISSES, Action.VOIR), getCaisseById);
router.post('/', authenticate, requirePermission(Module.CAISSES, Action.CREER), createCaisse);
router.put('/:id', authenticate, requirePermission(Module.CAISSES, Action.MODIFIER), updateCaisse);
router.delete('/:id', authenticate, requirePermission(Module.CAISSES, Action.SUPPRIMER), deleteCaisse);

// ============================================
// SESSIONS DE CAISSE (Actions sur caisse spécifique)
// ============================================
// Ouverture par PIN (ne nécessite PAS le JWT, juste le contexte tenant)
router.post('/:id/ouvrir-pin', ouvrirSessionParPin);

// Ouverture classique (via JWT)
router.post('/:id/ouvrir', authenticate, requirePermission(Module.CAISSES, Action.VOIR), ouvrirSession);
router.post('/:id/fermer', authenticate, requirePermission(Module.CAISSES, Action.VOIR), fermerSession);
router.get('/:id/session-active', authenticate, requirePermission(Module.CAISSES, Action.VOIR), getSessionActive);
router.get('/:id/historique', authenticate, requirePermission(Module.CAISSES, Action.VOIR), getHistoriqueSessions);

export default router;
