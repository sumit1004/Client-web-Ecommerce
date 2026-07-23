import { ChevronDown, Menu, Phone, Search, ShoppingBag } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { business } from '../../constants/store.js';
import { useCart, useSearch } from '../../context/AppProviders.jsx';
import { useCategories } from '../../hooks/useCatalog.js';
import { Button } from '../ui/Button.jsx';

export function Navbar() {
  const cart = useCart();
  const search = useSearch();
  const { data } = useCategories();
  const categories = data || [];

  return (
    <header className="navbar">
      <Link className="logo" to="/" aria-label={`${business.name} home`}>
        <span>{business.shortName}</span>
        <small>Fashion Store</small>
      </Link>

      <nav className="desktop-nav" aria-label="Primary navigation">
        <NavLink to="/">Home</NavLink>
        <div className="mega-trigger">
          <NavLink to="/categories">Categories <ChevronDown size={15} /></NavLink>
          <div className="mega-menu">
            {categories.map((category) => (
              <div key={category.slug}>
                <h3>{category.name}</h3>
                {category.children.map((child) => <Link key={child} to={`/category/${category.slug}`}>{child}</Link>)}
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
        <Button as="a" variant="outline" href={`https://wa.me/${business.whatsapp}`}>WhatsApp</Button>
        <a className="icon-button" aria-label="Call store" href={`tel:${business.phone}`}><Phone size={19} /></a>
      </div>

      <div className="mobile-header-actions">
        <button className="icon-button" aria-label="Open menu"><Menu size={20} /></button>
        <button className="icon-button" aria-label="Open search" onClick={() => search.setOpen(true)}><Search size={20} /></button>
        <Link className="icon-button cart-dot" aria-label="Open cart" to="/cart">
          <ShoppingBag size={20} />
          {cart.count > 0 && <span>{cart.count}</span>}
        </Link>
      </div>
    </header>
  );
}
