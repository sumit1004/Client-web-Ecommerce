import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { getNotifications } from '../controllers/notification.controller.js';

const router = Router();

router.use(requireAdmin);
router.get('/', getNotifications);

export default router;
