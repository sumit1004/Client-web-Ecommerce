import { Eye, MessageCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/AppProviders.jsx';
import { buildWhatsAppUrl, formatCurrency, productWhatsAppMessage } from '../../utils/whatsapp.js';
import { Badge } from '../ui/Badge.jsx';
import { useToast } from '../ui/Toast.jsx';

export function ProductCard({ product, onQuickView, mode = 'grid' }) {
  const cart = useCart();
  const toast = useToast();
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  return (
    <article className={`product-card product-card-${mode}`}>
      <Link className="product-media" to={`/product/${product.slug}`}>
        <img src={product.image} alt={product.name} loading="lazy" />
        <img className="hover-img" src={product.hoverImage} alt="" loading="lazy" aria-hidden="true" />
        <div className="product-badges">
          {product.featured && <Badge tone="gold">Featured</Badge>}
          {discount > 0 && <Badge>{discount}% Off</Badge>}
        </div>
      </Link>
      <div className="product-info">
        <span>{product.category}</span>
        <Link to={`/product/${product.slug}`}><h3>{product.name}</h3></Link>
        <p>{product.description}</p>
        <div className="price-row">
          <strong>{formatCurrency(product.price)}</strong>
          {product.oldPrice && <del>{formatCurrency(product.oldPrice)}</del>}
        </div>
      </div>
      <div className="product-actions">
        <button aria-label={`Quick view ${product.name}`} onClick={() => onQuickView(product)}><Eye size={18} /> Quick View</button>
        <button onClick={() => { cart.add(product); toast.show(`${product.name} added to cart`); }}><ShoppingBag size={18} /> Add</button>
        <a href={buildWhatsAppUrl(productWhatsAppMessage(product))}><MessageCircle size={18} /> Buy</a>
      </div>
    </article>
  );
}
