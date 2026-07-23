import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
  getStats,
  getActivity,
  getLowStock,
  getOutOfStock,
  getRecentProducts
} from '../controllers/dashboard.controller.js';

const router = Router();

router.use(requireAdmin);

router.get('/stats', getStats);
router.get('/activity', getActivity);
router.get('/low-stock', getLowStock);
router.get('/out-of-stock', getOutOfStock);
router.get('/recent-products', getRecentProducts);

export default router;
