import { Eye, MessageCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/AppProviders.jsx';
import { formatCurrency } from '../../utils/whatsapp.js';
import { Badge } from '../ui/Badge.jsx';
import { useToast } from '../ui/Toast.jsx';
import { useWhatsApp } from '../../hooks/useWhatsApp.js';

export function ProductCard({ product, onQuickView, mode = 'grid' }) {
  const cart = useCart();
  const toast = useToast();
  const { buyProduct, isConfigured } = useWhatsApp();
  const currentPrice = product.sale_price || product.price;
  const oldPrice = product.sale_price ? product.price : null;
  const discount = oldPrice ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0;
  const imageUrl = product.thumbnail;
  const hoverImageUrl = product.gallery?.[1]?.url || product.hoverImage || imageUrl;
  const categoryName = product.category_name || product.category;

  return (
    <article className={`product-card product-card-${mode}`}>
      <Link className="product-media" to={`/product/${product.slug}`}>
        {imageUrl ? <img src={imageUrl} alt={product.name} loading="lazy" /> : <div style={{height: '300px', background: '#eee'}}></div>}
        {hoverImageUrl && <img className="hover-img" src={hoverImageUrl} alt="" loading="lazy" aria-hidden="true" />}
        <div className="product-badges">
          {product.featured ? <Badge tone="gold">Featured</Badge> : null}
          {product.new_arrival ? <Badge tone="info">New</Badge> : null}
          {discount > 0 && <Badge>{discount}% Off</Badge>}
        </div>
      </Link>
      <div className="product-info">
        <span>{categoryName}</span>
        <Link to={`/product/${product.slug}`}><h3>{product.name}</h3></Link>
        <p>{product.short_description || product.description}</p>
        <div className="price-row">
          <strong>{formatCurrency(currentPrice)}</strong>
          {oldPrice && <del>{formatCurrency(oldPrice)}</del>}
        </div>
      </div>
      <div className="product-actions">
        <button aria-label={`Quick view ${product.name}`} onClick={() => onQuickView(product)}><Eye size={18} /> Quick View</button>
        <button onClick={() => { cart.add(product); toast.show(`${product.name} added to cart`); }}><ShoppingBag size={18} /> Add</button>
        <button 
          className={!isConfigured ? 'disabled' : ''} 
          onClick={(e) => {
            e.preventDefault();
            buyProduct(product, 1, `${window.location.origin}/product/${product.slug}`);
          }}
          disabled={!isConfigured} 
          title={!isConfigured ? 'WhatsApp number is not configured' : ''}
        >
          <MessageCircle size={18} /> Buy
        </button>
      </div>
    </article>
  );
}
