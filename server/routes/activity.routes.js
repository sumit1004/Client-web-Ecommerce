import { Router } from 'express';
import { requireAdmin, requireRole } from '../middleware/auth.js';
import { getActivityLogs } from '../controllers/activity.controller.js';

const router = Router();

router.use(requireAdmin);
// Only superadmin and manager can view global activity logs
router.get('/', requireRole(['superadmin', 'manager']), getActivityLogs);

export default router;
