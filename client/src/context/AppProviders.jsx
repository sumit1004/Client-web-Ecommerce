import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

const CartContext = createContext(null);
const SearchContext = createContext(null);
const AuthContext = createContext(null);

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
    initAuth();
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
        const next = existing
          ? items.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item))
          : [...items, { ...product, quantity }];
        persist(next);
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
    <AuthContext.Provider value={auth}>
      <CartContext.Provider value={cart}>
        <SearchContext.Provider value={search}>{children}</SearchContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
export const useSearch = () => useContext(SearchContext);
export const useAuth = () => useContext(AuthContext);
