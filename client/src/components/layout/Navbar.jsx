import { ChevronDown, Phone, Search, ShoppingBag } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useCart, useSearch, useSettings } from '../../context/AppProviders.jsx';
import { useCategoryTree } from '../../hooks/useCatalog.js';
import { useWhatsApp } from '../../hooks/useWhatsApp.js';
import { Button } from '../ui/Button.jsx';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const cart = useCart();
  const search = useSearch();
  const { business } = useSettings();
  const { openChat, isConfigured } = useWhatsApp();
  const { data } = useCategoryTree();
  const categories = data || [];

  return (
    <header className="navbar">
      <Link className="logo" to="/" aria-label={`${business?.storeName || 'Store'} home`}>
        <span>{business?.storeName || 'Store'}</span>
        <small>{business?.tagline || 'Store'}</small>
      </Link>

      <nav className="desktop-nav" aria-label="Primary navigation">
        <NavLink to="/">Home</NavLink>
        <div className="mega-trigger">
          <NavLink to="/categories">Categories <ChevronDown size={15} /></NavLink>
          <div className="mega-menu">
            {categories.map((category) => (
              <div key={category.slug}>
                <h3>{category.name}</h3>
                {(category.children || []).map((child) => (
                  <Link key={child.slug} to={`/category/${child.slug}`}>{child.name}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <NavLink to="/products">Products</NavLink>
        <a href="/#legacy">About</a>
        <NavLink to="/contact">Contact</NavLink>
      </nav>

      <div className="nav-actions">
        <button className="icon-button" aria-label="Open search" onClick={() => search.setOpen(true)}><Search size={20} /></button>
        {isConfigured && <Button variant="outline" className="mobile-whatsapp" onClick={() => { setIsOpen(false); openChat(); }}>WhatsApp</Button>}
        {business?.phone && <button className="icon-button" aria-label="Call store" onClick={() => window.location.href = `tel:${business.phone}`}><Phone size={19} /></button>}
        <Link className="icon-button cart-dot" aria-label="Open cart" to="/cart">
          <ShoppingBag size={20} />
          {cart.count > 0 && <span>{cart.count}</span>}
        </Link>
      </div>

      <div className="mobile-header-actions">
        <button className="icon-button" aria-label="Open search" onClick={() => search.setOpen(true)}><Search size={20} /></button>
        <Link className="icon-button cart-dot" aria-label="Open cart" to="/cart">
          <ShoppingBag size={20} />
          {cart.count > 0 && <span>{cart.count}</span>}
        </Link>
      </div>
    </header>
  );
}
