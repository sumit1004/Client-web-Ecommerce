import { findCategoryBySlug, listCategories } from '../services/category.service.js';
import { ok } from '../utils/response.js';

export async function getCategories(_req, res, next) {
  try {
    ok(res, 'Categories loaded.', await listCategories());
  } catch (error) {
    next(error);
  }
}

export async function getCategory(req, res, next) {
  try {
    const category = await findCategoryBySlug(req.params.slug);
    if (!category) {
      const error = new Error('Category not found.');
      error.status = 404;
      throw error;
    }
    ok(res, 'Category loaded.', category);
  } catch (error) {
    next(error);
  }
}
