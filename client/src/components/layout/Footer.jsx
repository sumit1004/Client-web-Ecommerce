import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { business } from '../../constants/store.js';
import { useCategories } from '../../hooks/useCatalog.js';

export function Footer() {
  const { data } = useCategories();
  const categories = data || [];
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <Link className="logo inverse" to="/"><span>{business.shortName}</span><small>Fashion Store</small></Link>
          <p>A trusted family clothing store since 1964, now online for effortless WhatsApp ordering.</p>
        </div>
        <div>
          <h3>Quick Links</h3>
          <Link to="/categories">Categories</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h3>Categories</h3>
          {categories.map((category) => <Link key={category.slug} to={`/category/${category.slug}`}>{category.name}</Link>)}
        </div>
        <div>
          <h3>Contact</h3>
          <p><Phone size={16} /> {business.phone}</p>
          <p><Mail size={16} /> {business.email}</p>
          <p><MapPin size={16} /> {business.address}</p>
          <a href={business.instagram}><Instagram size={16} /> Instagram</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 {business.name}. All rights reserved.</span>
        <span>Privacy Policy · Terms · Designed by TARQ DIGITAL</span>
      </div>
    </footer>
  );
}
