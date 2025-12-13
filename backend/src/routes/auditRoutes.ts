import { Router } from 'express';
import {
    getAuditLogs,
    getEntityHistory,
    getUserActions,
    getActivitySummary,
} from '../controllers/auditController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', getAuditLogs);
router.get('/summary', getActivitySummary);
router.get('/entity/:entity/:entity_id', getEntityHistory);
router.get('/user/:user_id', getUserActions);

export default router;
