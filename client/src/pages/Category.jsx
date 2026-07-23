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
      <Seo title={category?.name || 'Category'} description={category?.description || 'Browse category products.'} />
      <Products />
    </>
  );
}
