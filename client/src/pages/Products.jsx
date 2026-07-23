import { Filter, Grid2X2, List, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductCard } from '../components/products/ProductCard.jsx';
import { QuickViewModal } from '../components/products/QuickViewModal.jsx';
import { Seo } from '../components/ui/Seo.jsx';
import { useProducts } from '../hooks/useCatalog.js';

export default function Products() {
  const { data } = useProducts();
  const products = data || [];
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [view, setView] = useState(localStorage.getItem('viewMode') || 'grid');
  const [quickView, setQuickView] = useState(null);

  const filtered = useMemo(() => {
    const next = products.filter((product) => `${product.name} ${product.category} ${product.brand}`.toLowerCase().includes(query.toLowerCase()));
    return next.sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'az') return a.name.localeCompare(b.name);
      return Number(b.featured) - Number(a.featured);
    });
  }, [products, query, sort]);

  const setMode = (mode) => {
    setView(mode);
    localStorage.setItem('viewMode', mode);
  };

  return (
    <main className="page">
      <Seo title="Products" description="Shop premium fashion products and order instantly through WhatsApp." />
      <section className="page-hero compact">
        <span className="eyebrow">Products</span>
        <h1>Premium pieces, simple ordering.</h1>
        <p>Filter, compare and add products to cart before sending one clean WhatsApp order.</p>
      </section>
      <section className="section catalog-layout">
        <aside className="filter-panel">
          <h2><Filter size={18} /> Filters</h2>
          <label><input type="checkbox" /> In stock</label>
          <label><input type="checkbox" /> Featured</label>
          <label><input type="checkbox" /> New arrivals</label>
        </aside>
        <div>
          <div className="catalog-toolbar">
            <label className="search-field"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" /></label>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products">
              <option value="featured">Featured First</option>
              <option value="price-low">Price Low to High</option>
              <option value="price-high">Price High to Low</option>
              <option value="az">Alphabetical</option>
            </select>
            <div className="segmented">
              <button className={view === 'grid' ? 'active' : ''} onClick={() => setMode('grid')} aria-label="Grid view"><Grid2X2 size={18} /></button>
              <button className={view === 'list' ? 'active' : ''} onClick={() => setMode('list')} aria-label="List view"><List size={18} /></button>
            </div>
          </div>
          {filtered.length === 0 ? <p className="empty-note">No products found.</p> : <div className={view === 'grid' ? 'product-grid' : 'product-list'}>{filtered.map((product) => <ProductCard key={product.id} product={product} mode={view} onQuickView={setQuickView} />)}</div>}
        </div>
      </section>
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </main>
  );
}
