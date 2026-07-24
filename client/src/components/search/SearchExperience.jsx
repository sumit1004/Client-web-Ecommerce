import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../../context/AppProviders.jsx';
import { catalogService } from '../../services/catalogService.js';
import { formatCurrency } from '../../utils/whatsapp.js';

const HighlightMatch = ({ text = '', query = '' }) => {
  if (!query) return text;
  const cleanQuery = query.replace(/[^a-zA-Z0-9\s]/g, ' ').trim().replace(/\s+/g, '|');
  if (!cleanQuery) return text;
  
  const regex = new RegExp(`(${cleanQuery})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} style={{ backgroundColor: 'transparent', color: 'var(--accent)', fontWeight: '900' }}>{part}</mark> : part
  );
};

export function SearchExperience() {
  const { open, setOpen } = useSearch();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      catalogService.search(query).then(setResults);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const recent = useMemo(() => ['kurti', 'shirt', 'denim', 'saree'], []);
  const trending = useMemo(() => ['Summer Collection', 'Men Casuals', 'Party Wear'], []);
  if (!open) return null;

  return (
    <div className="search-shell" role="dialog" aria-modal="true">
      <button className="search-backdrop" aria-label="Close search" onClick={() => setOpen(false)} />
      <section className="search-panel">
        <div className="search-input-row">
          <Search size={22} />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search shirts, kurtis, denim..." aria-label="Search products" />
          <button aria-label="Close search" onClick={() => setOpen(false)}><X size={22} /></button>
        </div>
        
        {!query && (
          <div style={{ padding: '24px 0 12px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' }}>Recent Searches</h4>
            <div className="search-chips">
              {recent.map((item) => (
                <button key={item} onClick={() => setQuery(item)}>
                  <Clock size={14} style={{ marginRight: 6, opacity: 0.6 }} />{item}
                </button>
              ))}
            </div>
            
            <h4 style={{ margin: '24px 0 12px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' }}>Trending Categories</h4>
            <div className="search-chips">
              {trending.map((item) => (
                <button key={item} onClick={() => setQuery(item)}>
                  <TrendingUp size={14} style={{ marginRight: 6, opacity: 0.6 }} />{item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="search-results">
          {query && results.length === 0 && <p className="empty-note">No products found for "{query}". Try checking your spelling or use more general terms.</p>}
          {results.map((product) => (
            <Link key={product.id} to={`/product/${product.slug}`} onClick={() => setOpen(false)}>
              <img src={product.thumbnail} alt={product.name} loading="lazy" />
              <span>
                <strong><HighlightMatch text={product.name} query={query} /></strong>
                <small>{product.category} {product.brand ? `• ${product.brand}` : ''}</small>
              </span>
              <b>{formatCurrency(product.price)}</b>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
