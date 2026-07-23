import { MessageCircle, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Seo } from '../components/ui/Seo.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { useCart } from '../context/AppProviders.jsx';
import { useAsyncCatalog } from '../hooks/useCatalog.js';
import { catalogService } from '../services/catalogService.js';
import { buildWhatsAppUrl, formatCurrency, productWhatsAppMessage } from '../utils/whatsapp.js';

export default function Product() {
  const { slug } = useParams();
  const { data: product } = useAsyncCatalog(() => catalogService.getProduct(slug), [slug]);
  const [qty, setQty] = useState(1);
  const cart = useCart();
  const toast = useToast();

  if (!product) return <main className="page"><section className="page-hero compact"><h1>Loading product...</h1></section></main>;

  return (
    <main className="page product-detail-page">
      <Seo title={product.name} description={product.description} />
      <section className="product-detail">
        <div className="gallery">
          <img src={product.image} alt={product.name} />
          <div><img src={product.image} alt="" /><img src={product.hoverImage} alt="" /></div>
        </div>
        <div className="product-panel">
          <Link to={`/category/${product.categorySlug}`} className="eyebrow">{product.category}</Link>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="price-row large"><strong>{formatCurrency(product.price)}</strong>{product.oldPrice && <del>{formatCurrency(product.oldPrice)}</del>}</div>
          <dl className="spec-grid">
            <div><dt>Brand</dt><dd>{product.brand}</dd></div>
            <div><dt>SKU</dt><dd>{product.sku}</dd></div>
            <div><dt>Material</dt><dd>{product.material}</dd></div>
            <div><dt>Fit</dt><dd>{product.fit}</dd></div>
            <div><dt>Stock</dt><dd>{product.stock > 0 ? 'Available' : 'Out of stock'}</dd></div>
          </dl>
          <div className="option-row">{product.sizes.map((size) => <button key={size}>{size}</button>)}</div>
          <div className="option-row">{product.colors.map((color) => <button key={color}>{color}</button>)}</div>
          <div className="quantity-row">
            <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
            <span>{qty}</span>
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>
          <div className="sticky-buy">
            <Button onClick={() => { cart.add(product, qty); toast.show(`${product.name} added to cart`); }}><ShoppingBag size={18} /> Add to Cart</Button>
            <Button as="a" variant="outline" href={buildWhatsAppUrl(productWhatsAppMessage(product, qty))}><MessageCircle size={18} /> Buy on WhatsApp</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
