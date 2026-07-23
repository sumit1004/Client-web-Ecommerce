import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CategoryCard } from '../components/categories/CategoryCard.jsx';
import { Seo } from '../components/ui/Seo.jsx';
import { useCategories } from '../hooks/useCatalog.js';

export default function Categories() {
  const { data } = useCategories();
  const categories = data || [];
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => categories.filter((category) => category.name.toLowerCase().includes(query.toLowerCase())), [categories, query]);

  return (
    <main className="page">
      <Seo title="Categories" description="Browse premium fashion categories for men, women, kids and occasion wear." />
      <section className="page-hero compact">
        <span className="eyebrow">Categories</span>
        <h1>Browse every collection.</h1>
        <p>Search by department and open the collection that matches your next purchase.</p>
      </section>
      <section className="section">
        <label className="search-field"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories" /></label>
        <div className="chip-row">{categories.map((category) => <button key={category.slug} onClick={() => setQuery(category.name)}>{category.name}</button>)}</div>
        <div className="category-grid">{filtered.map((category) => <CategoryCard key={category.slug} category={category} />)}</div>
      </section>
    </main>
  );
}
