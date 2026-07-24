import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);

// Protected routes (Admin only)
router.post('/', requireAdmin, productController.createProduct);
router.put('/:id', requireAdmin, productController.updateProduct);
router.delete('/:id', requireAdmin, productController.deleteProduct);

// Bulk Actions
router.patch('/bulk/status', requireAdmin, productController.bulkUpdateStatus);
router.patch('/bulk/flag', requireAdmin, productController.bulkUpdateFlag);

export default router;
