import { Grid2X2, Home, Search, Shirt, ShoppingBag } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCart, useSearch } from '../../context/AppProviders.jsx';

export function MobileBottomNav() {
  const cart = useCart();
  const search = useSearch();
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <NavLink to="/"><Home size={20} /><span>Home</span></NavLink>
      <NavLink to="/categories"><Grid2X2 size={20} /><span>Categories</span></NavLink>
      <button onClick={() => search.setOpen(true)}><Search size={20} /><span>Search</span></button>
      <NavLink to="/products"><Shirt size={20} /><span>Products</span></NavLink>
      <NavLink to="/cart"><ShoppingBag size={20} /><span>Cart</span>{cart.count > 0 && <b>{cart.count}</b>}</NavLink>
    </nav>
  );
}
