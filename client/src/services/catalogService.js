import { apiClient, safeRequest } from './apiClient.js';

export const catalogService = {
  getCategories: (params = {}) => safeRequest(() => apiClient.get('/categories', { params }), []),
  getCategoryTree: () => safeRequest(() => apiClient.get('/categories/tree'), []),
  getCategory: async (slug) => {
    const res = await safeRequest(() => apiClient.get(`/categories/slug/${slug}`));
    return res;
  },
  getProducts: async (params = {}) => {
    // Transform params to match backend expectations (e.g. query -> search)
    const apiParams = { ...params };
    if (apiParams.query) {
      apiParams.search = apiParams.query;
      delete apiParams.query;
    }
    const res = await safeRequest(() => apiClient.get('/products', { params: apiParams }));
    // API returns { products, total, page, totalPages }, we extract products for frontend if not using pagination
    // But since the frontend uses products as an array right now, we return res.products or res.data.products depending on how safeRequest handles it.
    // Let's return just the products array to keep it compatible with existing hooks
    return res?.products || [];
  },
  getProduct: async (slug) => {
    const res = await safeRequest(() => apiClient.get(`/products/slug/${slug}`));
    return res;
  },
  search: (query) => catalogService.getProducts({ query }),
  getHomepageSettings: async () => {
    const res = await safeRequest(() => apiClient.get('/settings/homepage'));
    return res;
  }
};
