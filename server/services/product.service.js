import { pool } from '../config/database.js';
import { products as fallbackProducts } from '../data/fallbackCatalog.js';

function filterFallback(query) {
  return fallbackProducts.filter((product) => {
    if (query.featured === 'true' && !product.featured) return false;
    if (query.category && product.categorySlug !== query.category) return false;
    if (query.search) {
      const text = `${product.name} ${product.sku} ${product.brand} ${product.category}`.toLowerCase();
      return text.includes(query.search.toLowerCase());
    }
    return true;
  });
}

export async function listProducts(query = {}) {
  try {
    const params = [];
    const where = ["p.status = 'active'"];
    if (query.featured === 'true') where.push('p.featured = 1');
    if (query.category) {
      where.push('c.slug = ?');
      params.push(query.category);
    }
    if (query.search) {
      where.push('(p.name LIKE ? OR p.sku LIKE ? OR p.brand LIKE ? OR c.name LIKE ?)');
      const like = `%${query.search}%`;
      params.push(like, like, like, like);
    }
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.slug, p.sku, p.brand, p.price, p.sale_price price, p.stock,
        p.featured, p.trending, p.new_arrival newArrival, p.material, p.fit, p.description,
        c.name category, c.slug categorySlug,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_featured DESC, display_order ASC LIMIT 1) image
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE ${where.join(' AND ')}
      ORDER BY p.featured DESC, p.created_at DESC
      LIMIT 60
    `, params);
    return rows.length ? rows : filterFallback(query);
  } catch {
    return filterFallback(query);
  }
}

export async function findProductBySlug(slug) {
  const products = await listProducts();
  return products.find((product) => product.slug === slug);
}
