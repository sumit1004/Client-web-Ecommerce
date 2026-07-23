import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../../context/AppProviders.jsx';
import { catalogService } from '../../services/catalogService.js';
import { formatCurrency } from '../../utils/whatsapp.js';

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
    }, 120);
    return () => window.clearTimeout(timer);
  }, [query]);

  const recent = useMemo(() => ['kurti', 'shirt', 'denim', 'saree'], []);
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
          <div className="search-chips">
            {recent.map((item) => <button key={item} onClick={() => setQuery(item)}>{item}</button>)}
          </div>
        )}
        <div className="search-results">
          {query && results.length === 0 && <p className="empty-note">No products found. Try another collection.</p>}
          {results.map((product) => (
            <Link key={product.id} to={`/product/${product.slug}`} onClick={() => setOpen(false)}>
              <img src={product.image} alt={product.name} loading="lazy" />
              <span><strong>{product.name}</strong><small>{product.category}</small></span>
              <b>{formatCurrency(product.price)}</b>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
