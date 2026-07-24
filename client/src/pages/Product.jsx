import { MessageCircle, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Seo } from '../components/ui/Seo.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { useCart, useSettings } from '../context/AppProviders.jsx';
import { useAsyncCatalog } from '../hooks/useCatalog.js';
import { catalogService } from '../services/catalogService.js';
import { buildWhatsAppUrl, formatCurrency, productWhatsAppMessage } from '../utils/whatsapp.js';

export default function Product() {
  const { slug } = useParams();
  const { data: product } = useAsyncCatalog(() => catalogService.getProduct(slug), [slug]);
  const [qty, setQty] = useState(1);
  const cart = useCart();
  const { business } = useSettings();
  const toast = useToast();

  if (!product) return <main className="page"><section className="page-hero compact"><h1>Loading product...</h1></section></main>;

  const currentPrice = product.sale_price || product.price;
  const oldPrice = product.sale_price ? product.price : null;
  const imageUrl = product.images?.[0]?.url || product.image;
  const gallery = product.images?.map(img => img.url) || [product.image, product.hoverImage].filter(Boolean);
  const categoryName = product.category_name || product.category;
  
  const sizes = product.size ? product.size.split(',').map(s => s.trim()) : (product.sizes || []);
  const colors = product.color ? product.color.split(',').map(c => c.trim()) : (product.colors || []);

  return (
    <main className="page product-detail-page">
      <Seo title={product.name} description={product.description} />
      <section className="product-detail">
        <div className="gallery">
          <img src={imageUrl} alt={product.name} />
          <div>{gallery.slice(1, 3).map((url, i) => <img key={i} src={url} alt="" />)}</div>
        </div>
        <div className="product-panel">
          <Link to={`/category/${product.slug}`} className="eyebrow">{categoryName}</Link>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="price-row large"><strong>{formatCurrency(currentPrice)}</strong>{oldPrice && <del>{formatCurrency(oldPrice)}</del>}</div>
          <dl className="spec-grid">
            <div><dt>Brand</dt><dd>{product.brand || '-'}</dd></div>
            <div><dt>SKU</dt><dd>{product.sku}</dd></div>
            <div><dt>Material</dt><dd>{product.material || product.fabric || '-'}</dd></div>
            <div><dt>Gender</dt><dd>{product.gender || '-'}</dd></div>
            <div><dt>Stock</dt><dd>{product.stock > 0 ? 'Available' : 'Out of stock'}</dd></div>
          </dl>
          {sizes.length > 0 && <div className="option-row">{sizes.map((size) => <button key={size}>{size}</button>)}</div>}
          {colors.length > 0 && <div className="option-row">{colors.map((color) => <button key={color}>{color}</button>)}</div>}
          <div className="quantity-row">
            <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
            <span>{qty}</span>
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>
          <div className="product-actions">
            <Button onClick={() => { cart.add(product, qty); toast.show(`${product.name} added to cart`); }}><ShoppingBag size={18} /> Add to Cart</Button>
            {business?.whatsapp ? (
              <Button as="a" variant="outline" href={buildWhatsAppUrl(business.whatsapp, productWhatsAppMessage(business.storeName || 'Store', product, qty))} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Buy on WhatsApp</Button>
            ) : (
              <Button variant="outline" disabled title="WhatsApp number is not configured"><MessageCircle size={18} /> Buy on WhatsApp</Button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
