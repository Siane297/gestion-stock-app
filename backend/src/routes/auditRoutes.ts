import { Router } from 'express';
import {
    getAuditLogs,
    getEntityHistory,
    getUserActions,
    getActivitySummary,
} from '../controllers/auditController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { Module, Action } from '../types/permissions.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', requirePermission(Module.RAPPORTS, Action.VOIR), getAuditLogs);
router.get('/summary', requirePermission(Module.RAPPORTS, Action.VOIR), getActivitySummary);
router.get('/entity/:entity/:entity_id', requirePermission(Module.RAPPORTS, Action.VOIR), getEntityHistory);
router.get('/user/:user_id', requirePermission(Module.RAPPORTS, Action.VOIR), getUserActions);

export default router;
