import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  getLoginHistory
} from '../controllers/admin.controller.js';

const router = Router();

router.use(requireAdmin);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.get('/login-history', getLoginHistory);

export default router;
