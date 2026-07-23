import { categories, products } from '../data/catalog.js';
import { apiClient, safeRequest } from './apiClient.js';

export const catalogService = {
  getCategories: (params = {}) => safeRequest(() => apiClient.get('/categories', { params }), categories),
  getCategory: async (slug) => {
    const res = await safeRequest(() => apiClient.get(`/categories/slug/${slug}`));
    return res;
  },
  getProducts: (params = {}) => {
    const filtered = products.filter((product) => {
      if (params.category && product.categorySlug !== params.category) return false;
      if (params.featured && !product.featured) return false;
      if (params.query) {
        const text = `${product.name} ${product.category} ${product.brand} ${product.sku}`.toLowerCase();
        return text.includes(params.query.toLowerCase());
      }
      return true;
    });
    return safeRequest(() => apiClient.get('/products', { params }), filtered);
  },
  getProduct: async (slug) => {
    const list = await catalogService.getProducts();
    return list.find((product) => product.slug === slug);
  },
  search: (query) => catalogService.getProducts({ query })
};
