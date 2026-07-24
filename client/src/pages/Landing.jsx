import { ArrowDown, MessageCircle, Phone, Star, Store, Truck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CategoryCard } from '../components/categories/CategoryCard.jsx';
import { ProductCard } from '../components/products/ProductCard.jsx';
import { QuickViewModal } from '../components/products/QuickViewModal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ProductSkeletonGrid } from '../components/ui/Skeleton.jsx';
import { Seo } from '../components/ui/Seo.jsx';
import { useSettings } from '../context/AppProviders.jsx';
import { useHomepageSettings, useCategoryTree, useAsyncCatalog } from '../hooks/useCatalog.js';
import { catalogService } from '../services/catalogService.js';
import { useWhatsApp } from '../hooks/useWhatsApp.js';

export default function Landing() {
  const { business } = useSettings();
  const { data: homepageSettings } = useHomepageSettings();
  const { data: categories } = useCategoryTree();
  const { openChat, isConfigured } = useWhatsApp();
  const { loading, data: productData } = useAsyncCatalog(() => catalogService.getProducts({ featured: true }));
  const products = productData || [];
  const [quickView, setQuickView] = useState(null);

  return (
    <main>
      <Seo title="Premium Fashion Since 1964" description="Pasand Showroom is a trusted clothing showroom established in 1964 offering premium fashion for Men, Women and Kids with easy WhatsApp ordering." />
      <section className="hero">
        <div className="hero-copy reveal">
          <span className="eyebrow">Trusted Since 1964</span>
          <div className="hero-content">
            <h1>{homepageSettings?.hero_title || `Welcome to ${business?.storeName || 'Our Store'}`}</h1>
            <p>{homepageSettings?.hero_subtitle || 'Discover our latest collection of premium fashion.'}</p>
            <div className="hero-actions">
              <Button as={Link} to="/products">Shop Collection</Button>
              <Button 
                variant="outline" 
                className={!isConfigured ? 'disabled' : ''}
                onClick={openChat}
                disabled={!isConfigured}
                title={!isConfigured ? 'WhatsApp number is not configured' : ''}
              >
                <MessageCircle size={18} /> Shop on WhatsApp
              </Button>
              {business?.phone && <Button as="a" variant="ghost" href={`tel:${business.phone}`}><Phone size={18} /> Call</Button>}
            </div>
          </div>
          <div className="hero-stats">
            <strong>60+<span>Years of Trust</span></strong>
            <strong>1000+<span>Products</span></strong>
            <strong>5000+<span>Happy Customers</span></strong>
            <strong>100+<span>Brands</span></strong>
          </div>
        </div>
        <div className="hero-image reveal">
          <img src={homepageSettings?.hero_image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85'} alt="Premium fashion model wearing a modern collection" />
        </div>
        <a className="scroll-indicator" href="#categories" aria-label="Scroll to categories"><ArrowDown size={18} /></a>
      </section>

      <section id="categories" className="section">
        <div className="section-header">
          <span className="eyebrow">Browse Categories</span>
          <h2>Find products by category.</h2>
          <Link to="/categories">View all</Link>
        </div>
        <div className="category-grid swipe-row">
          {(categories || []).map((category) => <CategoryCard key={category.slug} category={category} />)}
        </div>
      </section>

      <section className="section soft-section">
        <div className="section-header">
          <span className="eyebrow">Featured Collection</span>
          <h2>Handpicked premium products.</h2>
          <Link to="/products">Shop all</Link>
        </div>
        {loading ? <ProductSkeletonGrid /> : <div className="product-grid swipe-row">{products.map((product) => <ProductCard key={product.id} product={product} onQuickView={setQuickView} />)}</div>}
      </section>

      <section className="section value-grid">
        {[
          [Star, 'Premium Quality', 'Carefully selected fabrics, finishes and fits.'],
          [Truck, 'Trusted Since 1964', 'Decades of offline trust brought online.'],
          [Store, 'Affordable Pricing', 'Premium style without inflated marketplace pricing.'],
          [MessageCircle, 'Quick WhatsApp Support', 'Talk directly with the store before ordering.']
        ].map(([Icon, title, text]) => (
          <article className="value-card reveal" key={title}><Icon size={28} /><h3>{title}</h3><p>{text}</p></article>
        ))}
      </section>

      <section id="legacy" className="legacy section">
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85" alt="Premium clothing store interior" loading="lazy" />
        <div>
          <span className="eyebrow">Our Legacy</span>
          <h2>Serving generations, now with a digital showroom.</h2>
          <p>Pasand Showroom has been serving customers since 1964 with premium quality clothing for every generation. Our mission is to bring trusted fashion to customers through a modern digital shopping experience.</p>
        </div>
      </section>

      <section className="section social-section">
        <div className="section-header">
          <span className="eyebrow">Social</span>
          <h2>Follow the new collection drops.</h2>
        </div>
        <div className="contact-grid">
          {['Visit Store', 'Call Us', 'Email Us', 'WhatsApp'].map((item, index) => {
            if (index === 3) {
              return (
                <button key={item} className="contact-link" onClick={openChat}>
                  <Store size={24} /><strong>{item}</strong><span>Open</span>
                </button>
              );
            }

            const href = index === 0 ? business?.mapsUrl : 
              index === 1 && business?.phone ? `tel:${business.phone}` : 
              index === 2 && business?.email ? `mailto:${business.email}` : '#';

            return (
              <a 
                key={item} 
                href={href}
                target={index === 0 ? '_blank' : undefined}
                rel={index === 0 ? 'noopener noreferrer' : undefined}
              >
                <Store size={24} /><strong>{item}</strong><span>Open</span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="section contact-band">
        <div>
          <span className="eyebrow">Contact</span>
          <h2>Visit the store or order from home.</h2>
          <p>{business.address}</p>
          <p>{business.hours}</p>
        </div>
        <Button as={Link} to="/contact">Contact Store</Button>
      </section>

      <section className="map-section">
        <iframe title="Store location map" src="https://www.google.com/maps?q=India%20fashion%20store&output=embed" loading="lazy" />
      </section>
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </main>
  );
}
