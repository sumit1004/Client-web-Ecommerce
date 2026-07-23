import { findProductBySlug, listProducts } from '../services/product.service.js';
import { ok } from '../utils/response.js';

export async function getProducts(req, res, next) {
  try {
    ok(res, 'Products loaded.', await listProducts(req.query), { page: 1, limit: 60 });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await findProductBySlug(req.params.slug);
    if (!product) {
      const error = new Error('Product not found.');
      error.status = 404;
      throw error;
    }
    ok(res, 'Product loaded.', product);
  } catch (error) {
    next(error);
  }
}
