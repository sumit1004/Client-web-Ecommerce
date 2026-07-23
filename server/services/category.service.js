import { pool } from '../config/database.js';
import { categories as fallbackCategories } from '../data/fallbackCatalog.js';

export async function listCategories() {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.name, c.slug, c.description, c.image_url image, c.featured,
        COUNT(p.id) productCount
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
      WHERE c.status = 'active'
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC
    `);
    return rows.length ? rows : fallbackCategories;
  } catch {
    return fallbackCategories;
  }
}

export async function findCategoryBySlug(slug) {
  const categories = await listCategories();
  return categories.find((category) => category.slug === slug);
}
