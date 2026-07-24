import { Router } from 'express';
import { requireAdmin, requireRole } from '../middleware/auth.js';
import { getSettingsGroup, getAllSettings, updateSettingsGroup } from '../controllers/settings.controller.js';

const router = Router();

// Publicly accessible settings (for frontend website consumption)
router.get('/public', getAllSettings);

// Admin only settings routes
router.use(requireAdmin);
router.get('/:group', getSettingsGroup);
router.put('/:group', requireRole(['superadmin', 'manager']), updateSettingsGroup);

export default router;
