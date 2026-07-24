import { useEffect, useState } from 'react';
import { catalogService } from '../services/catalogService.js';

export function useAsyncCatalog(loader, dependencies = []) {
  const [state, setState] = useState({ loading: true, data: null, error: '' });

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: '' }));
    loader()
      .then((data) => active && setState({ loading: false, data, error: '' }))
      .catch(() => active && setState({ loading: false, data: null, error: 'Unable to load this section.' }));
    return () => {
      active = false;
    };
  }, dependencies);

  return state;
}

export function useCategories(params = {}) {
  return useAsyncCatalog(() => catalogService.getCategories(params), [JSON.stringify(params)]);
}

export function useCategoryTree() {
  return useAsyncCatalog(() => catalogService.getCategoryTree(), []);
}

export function useProducts(params = {}) {
  return useAsyncCatalog(() => catalogService.getProducts(params), [JSON.stringify(params)]);
}

export function useHomepageSettings() {
  return useAsyncCatalog(() => catalogService.getHomepageSettings(), []);
}
