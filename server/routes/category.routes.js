import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
  getCategories,
  getCategoryTree,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
  updateCategoryOrder
} from '../controllers/category.controller.js';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategory);

// Protected routes (Admin only)
router.use(requireAdmin);

router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.patch('/status/:id', updateCategoryStatus);
router.patch('/order', updateCategoryOrder);

export default router;
