import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';
import { apiClient } from '../services/apiClient.js';
import { getProductImage, getProductCategory } from '../utils/product.js';

const CartContext = createContext(null);
const SearchContext = createContext(null);
const AuthContext = createContext(null);
const SettingsContext = createContext(null);

function getStoredCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
}

function getStoredAdmin() {
  try {
    return JSON.parse(sessionStorage.getItem('adminSession') || 'null');
  } catch {
    return null;
  }
}

export function AppProviders({ children }) {
  const [items, setItems] = useState(getStoredCart);
  const [searchOpen, setSearchOpen] = useState(false);
  const [admin, setAdmin] = useState(getStoredAdmin);
  const [authLoading, setAuthLoading] = useState(true);
  const [businessSettings, setBusinessSettings] = useState(null);

  useEffect(() => {
    async function initAuth() {
      const realAdmin = await authService.me();
      if (realAdmin) {
        setAdmin(realAdmin);
        sessionStorage.setItem('adminSession', JSON.stringify(realAdmin));
      } else {
        setAdmin(null);
        sessionStorage.removeItem('adminSession');
      }
      setAuthLoading(false);
    }
    
    async function fetchSettings() {
      try {
        const res = await apiClient.get('/settings/business');
        setBusinessSettings(res.data?.data || {});
      } catch (err) {
        console.error('Failed to load global settings', err);
        setBusinessSettings({});
      }
    }
    
    initAuth();
    fetchSettings();
  }, []);

  const cart = useMemo(() => {
    const persist = (next) => {
      setItems(next);
      localStorage.setItem('cart', JSON.stringify(next));
    };
    return {
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      total: items.reduce((sum, item) => sum + item.quantity * item.price, 0),
      add(product, quantity = 1) {
        const existing = items.find((item) => item.id === product.id);
        if (existing) {
          const next = items.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item));
          persist(next);
        } else {
          // Strictly map the standardized model for local storage
          const normalizedProduct = {
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            thumbnail: product.thumbnail || getProductImage(product),
            category: product.category,
            quantity
          };
          persist([...items, normalizedProduct]);
        }
      },
      update(id, quantity) {
        persist(items.map((item) => (item.id === id ? { ...item, quantity } : item)).filter((item) => item.quantity > 0));
      },
      remove(id) {
        persist(items.filter((item) => item.id !== id));
      },
      clear() {
        persist([]);
      }
    };
  }, [items]);

  const search = useMemo(() => ({ open: searchOpen, setOpen: setSearchOpen }), [searchOpen]);
  const auth = useMemo(() => ({
    admin,
    loading: authLoading,
    async login(credentials) {
      const loggedInAdmin = await authService.login(credentials);
      setAdmin(loggedInAdmin);
      sessionStorage.setItem('adminSession', JSON.stringify(loggedInAdmin));
      return loggedInAdmin;
    },
    async logout() {
      await authService.logout();
      setAdmin(null);
      sessionStorage.removeItem('adminSession');
    }
  }), [admin, authLoading]);

  return (
    <SettingsContext.Provider value={{ business: businessSettings }}>
      <AuthContext.Provider value={auth}>
        <CartContext.Provider value={cart}>
          <SearchContext.Provider value={search}>{children}</SearchContext.Provider>
        </CartContext.Provider>
      </AuthContext.Provider>
    </SettingsContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
export const useSearch = () => useContext(SearchContext);
export const useAuth = () => useContext(AuthContext);
export const useSettings = () => useContext(SettingsContext);
