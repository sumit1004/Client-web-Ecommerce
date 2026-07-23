import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CategoryCard({ category }) {
  return (
    <Link className="category-card reveal" to={`/category/${category.slug}`}>
      <img src={category.image} alt={`${category.name} collection`} loading="lazy" />
      <span className="category-overlay" />
      <div>
        <h3>{category.name}</h3>
        <p>{category.productCount} products</p>
      </div>
      <ArrowUpRight size={22} />
    </Link>
  );
}
