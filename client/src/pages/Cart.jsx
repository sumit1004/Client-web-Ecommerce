import { MessageCircle, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Seo } from '../components/ui/Seo.jsx';
import { useCart, useSettings } from '../context/AppProviders.jsx';
import { buildWhatsAppUrl, cartWhatsAppMessage, formatCurrency } from '../utils/whatsapp.js';
import { getProductImage, getProductCategory } from '../utils/product.js';

export default function Cart() {
  const cart = useCart();
  const { business } = useSettings();

  return (
    <main className="page">
      <Seo title="Cart" description="Review your fashion order and send it to the store through WhatsApp." />
      <section className="page-hero compact"><span className="eyebrow">Cart</span><h1>Review your WhatsApp order.</h1></section>
      <section className="section cart-layout">
        <div className="cart-items">
          {cart.items.length === 0 && <p className="empty-note">Your cart is empty. Add products to create a WhatsApp order.</p>}
          {cart.items.map((item) => (
            <article className="cart-item" key={item.id}>
              <img src={getProductImage(item)} alt={item.name} loading="lazy" />
              <div><h3>{item.name}</h3><p>{getProductCategory(item)}</p><strong>{formatCurrency(item.price)}</strong></div>
              <div className="quantity-row">
                <button onClick={() => cart.update(item.id, item.quantity - 1)}><Minus size={16} /></button>
                <span>{item.quantity}</span>
                <button onClick={() => cart.update(item.id, item.quantity + 1)}><Plus size={16} /></button>
              </div>
              <button className="icon-button" aria-label={`Remove ${item.name}`} onClick={() => cart.remove(item.id)}><Trash2 size={18} /></button>
            </article>
          ))}
        </div>
        <aside className="order-summary">
          <h2>Order Summary</h2>
          <p>{cart.count} item(s)</p>
          <strong>{formatCurrency(cart.total)}</strong>
          {business?.whatsapp ? (
            <Button as="a" className={cart.items.length === 0 ? 'disabled' : ''} href={cart.items.length ? buildWhatsAppUrl(business.whatsapp, cartWhatsAppMessage(business.storeName || 'Store', cart.items)) : undefined} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Checkout on WhatsApp</Button>
          ) : (
            <Button className={cart.items.length === 0 ? 'disabled' : ''} disabled title="WhatsApp number is not configured"><MessageCircle size={18} /> Checkout on WhatsApp</Button>
          )}
        </aside>
      </section>
    </main>
  );
}
