import { useParams } from 'react-router-dom';
import Products from './Products.jsx';
import { Seo } from '../components/ui/Seo.jsx';
import { useAsyncCatalog } from '../hooks/useCatalog.js';
import { catalogService } from '../services/catalogService.js';

export default function Category() {
  const { slug } = useParams();
  const { data: category } = useAsyncCatalog(() => catalogService.getCategory(slug), [slug]);

  return (
    <>
      <Seo 
        title={category?.seo_title || category?.name || 'Category'} 
        description={category?.seo_description || category?.description || 'Browse category products.'} 
      />
      {category && (category.banner_url || category.description) && (
        <section className="page-hero compact">
          {category.banner_url && <img src={category.banner_url} alt={category.name} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '16px', marginBottom: '16px' }} />}
          <div style={{ textAlign: 'center' }}>
            <h1>{category.name}</h1>
            {category.description && <p>{category.description}</p>}
          </div>
        </section>
      )}
      <Products />
    </>
  );
}
