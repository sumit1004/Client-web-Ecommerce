import * as CategoryService from '../services/category.service.js';
import { ok } from '../utils/response.js';

export async function getCategories(req, res, next) {
  try {
    const categories = await CategoryService.listCategories(req.query);
    ok(res, 'Categories loaded.', categories);
  } catch (error) {
    next(error);
  }
}

export async function getCategoryTree(req, res, next) {
  try {
    const tree = await CategoryService.getCategoryTree();
    ok(res, 'Category tree loaded.', tree);
  } catch (error) {
    next(error);
  }
}

export async function getCategory(req, res, next) {
  try {
    const category = await CategoryService.getCategoryById(req.params.id);
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

export async function getCategoryBySlug(req, res, next) {
  try {
    const category = await CategoryService.findCategoryBySlug(req.params.slug);
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

export async function createCategory(req, res, next) {
  try {
    const category = await CategoryService.createCategory(req.body, req.admin.id);
    ok(res, 'Category created successfully.', category, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await CategoryService.updateCategory(req.params.id, req.body, req.admin.id);
    ok(res, 'Category updated successfully.', category);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    await CategoryService.deleteCategory(req.params.id, req.admin.id);
    ok(res, 'Category deleted successfully.');
  } catch (error) {
    next(error);
  }
}

export async function updateCategoryStatus(req, res, next) {
  try {
    await CategoryService.updateCategoryStatus(req.params.id, req.body.status, req.admin.id);
    ok(res, 'Category status updated.');
  } catch (error) {
    next(error);
  }
}

export async function updateCategoryOrder(req, res, next) {
  try {
    await CategoryService.bulkUpdateCategoryOrder(req.body.updates, req.admin.id);
    ok(res, 'Category order updated.');
  } catch (error) {
    next(error);
  }
}
