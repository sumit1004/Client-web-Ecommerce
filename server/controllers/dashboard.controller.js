import { pool } from '../config/database.js';
import { ok } from '../utils/response.js';

export async function getStats(req, res, next) {
  try {
    const [[products]] = await pool.query('SELECT COUNT(*) as count FROM products');
    const [[categories]] = await pool.query('SELECT COUNT(*) as count FROM categories');
    const [[featuredProducts]] = await pool.query('SELECT COUNT(*) as count FROM products WHERE featured = true');
    const [[collections]] = await pool.query('SELECT COUNT(*) as count FROM collections');
    const [[media]] = await pool.query('SELECT COUNT(*) as count FROM media_library');
    const [[lowStock]] = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock > 0 AND stock < low_stock_threshold');
    const [[outOfStock]] = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock = 0');
    const [[messages]] = await pool.query('SELECT COUNT(*) as count FROM contact_messages WHERE status = "new"');

    // Catalog Health Calculation
    const [[healthStats]] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN description IS NOT NULL AND description != '' AND price > 0 THEN 1 ELSE 0 END) as healthy
      FROM products
    `);
    
    let catalogHealth = 100;
    if (healthStats.total > 0) {
      catalogHealth = Math.round((healthStats.healthy / healthStats.total) * 100);
    }

    const stats = {
      totalProducts: products.count,
      totalCategories: categories.count,
      featuredProducts: featuredProducts.count,
      collections: collections.count,
      mediaImages: media.count,
      lowStock: lowStock.count,
      outOfStock: outOfStock.count,
      contactMessages: messages.count,
      catalogHealth
    };
    ok(res, 'Dashboard stats fetched.', stats);
  } catch (error) {
    next(error);
  }
}

export async function getActivity(req, res, next) {
  try {
    const [logs] = await pool.query(`
      SELECT a.*, d.name as admin_name 
      FROM activity_logs a 
      LEFT JOIN admins d ON a.admin_id = d.id 
      ORDER BY a.created_at DESC LIMIT 20
    `);
    ok(res, 'Recent activity fetched.', logs);
  } catch (error) {
    next(error);
  }
}

export async function getLowStock(req, res, next) {
  try {
    const [products] = await pool.query(`
      SELECT id, name, sku, stock, low_stock_threshold 
      FROM products 
      WHERE stock > 0 AND stock < low_stock_threshold 
      ORDER BY stock ASC 
      LIMIT 10
    `);
    ok(res, 'Low stock products fetched.', products);
  } catch (error) {
    next(error);
  }
}

export async function getOutOfStock(req, res, next) {
  try {
    const [products] = await pool.query(`
      SELECT p.id, p.name, p.sku, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock = 0 
      ORDER BY p.updated_at DESC 
      LIMIT 10
    `);
    ok(res, 'Out of stock products fetched.', products);
  } catch (error) {
    next(error);
  }
}

export async function getRecentProducts(req, res, next) {
  try {
    const [products] = await pool.query(`
      SELECT p.id, p.name, p.sku, p.price, p.stock, p.status, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC 
      LIMIT 10
    `);
    ok(res, 'Recent products fetched.', products);
  } catch (error) {
    next(error);
  }
}
