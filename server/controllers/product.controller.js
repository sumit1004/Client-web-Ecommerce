import { productService } from '../services/product.service.js';
import { ok, created, badRequest } from '../utils/response.js';

export const productController = {
  getProducts: async (req, res, next) => {
    try {
      const data = await productService.getProducts(req.query);
      ok(res, 'Products loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  getProductById: async (req, res, next) => {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) return badRequest(res, 'Product not found.');
      ok(res, 'Product loaded.', product);
    } catch (error) {
      next(error);
    }
  },

  getProductBySlug: async (req, res, next) => {
    try {
      const product = await productService.getProductBySlug(req.params.slug);
      if (!product) return badRequest(res, 'Product not found.');
      ok(res, 'Product loaded.', product);
    } catch (error) {
      next(error);
    }
  },

  createProduct: async (req, res, next) => {
    try {
      if (!req.body.name || !req.body.sku || !req.body.category_id || !req.body.price) {
        return badRequest(res, 'Name, SKU, Category, and Price are required.');
      }
      const data = await productService.createProduct(req.body, req.admin.id);
      created(res, 'Product created successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  updateProduct: async (req, res, next) => {
    try {
      const data = await productService.updateProduct(req.params.id, req.body, req.admin.id);
      ok(res, 'Product updated successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  deleteProduct: async (req, res, next) => {
    try {
      await productService.deleteProduct(req.params.id, req.admin.id);
      ok(res, 'Product deleted successfully.');
    } catch (error) {
      next(error);
    }
  },

  bulkUpdateStatus: async (req, res, next) => {
    try {
      const { ids, status } = req.body;
      if (!ids || !status) return badRequest(res, 'IDs and status are required.');
      await productService.bulkUpdateStatus(ids, status, req.admin.id);
      ok(res, 'Products updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  bulkUpdateFlag: async (req, res, next) => {
    try {
      const { ids, field, value } = req.body;
      const allowedFields = ['featured', 'show_on_homepage', 'new_arrival'];
      if (!ids || !allowedFields.includes(field)) return badRequest(res, 'Invalid field.');
      await productService.bulkUpdateFlag(ids, field, value, req.admin.id);
      ok(res, 'Products updated successfully.');
    } catch (error) {
      next(error);
    }
  }
};
