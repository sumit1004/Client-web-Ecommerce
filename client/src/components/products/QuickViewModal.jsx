import { Link } from 'react-router-dom';
import { MessageCircle, ShoppingBag, X } from 'lucide-react';
import { useCart, useSettings } from '../../context/AppProviders.jsx';
import { buildWhatsAppUrl, formatCurrency, productWhatsAppMessage } from '../../utils/whatsapp.js';
import { Button } from '../ui/Button.jsx';
import { useToast } from '../ui/Toast.jsx';

export function QuickViewModal({ product, onClose }) {
  const cart = useCart();
  const { business } = useSettings();
  const toast = useToast();
  if (!product) return null;

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <button className="modal-backdrop" aria-label="Close quick view" onClick={onClose} />
      <section className="quick-modal">
        <button className="modal-close" aria-label="Close quick view" onClick={onClose}><X size={22} /></button>
        <img src={product.image} alt={product.name} />
        <div>
          <span className="eyebrow">{product.category} · {product.brand}</span>
          <h2>{product.name}</h2>
          <div className="price-row large"><strong>{formatCurrency(product.price)}</strong>{product.oldPrice && <del>{formatCurrency(product.oldPrice)}</del>}</div>
          <p>{product.description}</p>
          <div className="option-row">{product.sizes.map((size) => <span key={size}>{size}</span>)}</div>
          <div className="option-row">{product.colors.map((color) => <span key={color}>{color}</span>)}</div>
          <div className="modal-actions">
            <Button onClick={() => { cart.add(product); toast.show(`${product.name} added to cart`); onClose(); }}><ShoppingBag size={18} /> Add to Cart</Button>
            {business?.whatsapp ? (
              <Button as="a" variant="outline" href={buildWhatsAppUrl(business.whatsapp, productWhatsAppMessage(business.storeName || 'Store', product, 1, `${window.location.origin}/product/${product.slug}`))} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Buy on WhatsApp</Button>
            ) : (
              <Button variant="outline" disabled title="WhatsApp number is not configured"><MessageCircle size={18} /> Buy on WhatsApp</Button>
            )}
            <Button as={Link} variant="ghost" to={`/product/${product.slug}`} onClick={onClose}>View Details</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
