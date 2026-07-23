import { Router } from 'express';
import { getProduct, getProducts } from '../controllers/product.controller.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', (req, _res, next) => {
  req.query.featured = 'true';
  next();
}, getProducts);
router.get('/search', getProducts);
router.get('/:slug', getProduct);

export default router;
