import { pool } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';

// ----------------------------------------------------------------------
// READ
// ----------------------------------------------------------------------

export async function listCategories(query = {}) {
  let sql = `
    SELECT c.*, 
      (SELECT COUNT(id) FROM products p WHERE p.category_id = c.id AND p.deleted_at IS NULL) as productCount,
      p.name as parent_name
    FROM categories c
    LEFT JOIN categories p ON c.parent_id = p.id
    WHERE c.deleted_at IS NULL
  `;
  const params = [];

  if (query.search) {
    sql += ` AND (c.name LIKE ? OR c.slug LIKE ? OR c.description LIKE ?)`;
    const term = `%${query.search}%`;
    params.push(term, term, term);
  }
  if (query.status) {
    sql += ` AND c.status = ?`;
    params.push(query.status);
  }
  if (query.featured) {
    sql += ` AND c.featured = ?`;
    params.push(query.featured === 'true' ? 1 : 0);
  }
  if (query.show_on_homepage) {
    sql += ` AND c.show_on_homepage = ?`;
    params.push(query.show_on_homepage === 'true' ? 1 : 0);
  }
  if (query.parent_id) {
    sql += ` AND c.parent_id = ?`;
    params.push(query.parent_id);
  }

  // Sorting
  const sort = query.sort || 'display_order';
  const order = query.order === 'desc' ? 'DESC' : 'ASC';
  
  if (sort === 'name') sql += ` ORDER BY c.name ${order}`;
  else if (sort === 'newest') sql += ` ORDER BY c.created_at DESC`;
  else if (sort === 'oldest') sql += ` ORDER BY c.created_at ASC`;
  else if (sort === 'products') sql += ` ORDER BY productCount ${order}`;
  else sql += ` ORDER BY c.display_order ASC, c.name ASC`; // default

  // Pagination (Optional but supported)
  if (query.limit && query.page) {
    const limit = parseInt(query.limit);
    const offset = (parseInt(query.page) - 1) * limit;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
  }

  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function getCategoryTree() {
  const [rows] = await pool.query(`
    SELECT c.id, c.name, c.slug, c.parent_id, c.icon, c.image_url, c.display_order
    FROM categories c
    WHERE c.deleted_at IS NULL AND c.status != 'disabled'
    ORDER BY c.display_order ASC, c.name ASC
  `);

  const categoryMap = new Map();
  const roots = [];

  rows.forEach(cat => {
    cat.children = [];
    categoryMap.set(cat.id, cat);
  });

  rows.forEach(cat => {
    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      categoryMap.get(cat.parent_id).children.push(cat);
    } else {
      roots.push(cat);
    }
  });

  return roots;
}

export async function getCategoryById(id) {
  const [rows] = await pool.query(`
    SELECT c.*, 
      (SELECT COUNT(id) FROM products p WHERE p.category_id = c.id AND p.deleted_at IS NULL) as productCount 
    FROM categories c 
    WHERE c.id = ? AND c.deleted_at IS NULL
  `, [id]);
  return rows[0] || null;
}

export async function findCategoryBySlug(slug) {
  const [rows] = await pool.query(`
    SELECT c.*, 
      (SELECT COUNT(id) FROM products p WHERE p.category_id = c.id AND p.deleted_at IS NULL) as productCount 
    FROM categories c 
    WHERE c.slug = ? AND c.deleted_at IS NULL
  `, [slug]);
  return rows[0] || null;
}

// ----------------------------------------------------------------------
// WRITE
// ----------------------------------------------------------------------

export async function createCategory(data, adminId) {
  const id = uuidv4();
  const slug = data.slug || slugify(data.name, { lower: true, strict: true });
  
  // Validate unique slug
  const existing = await findCategoryBySlug(slug);
  if (existing) {
    throw new Error('A category with this slug already exists.');
  }

  const sql = `
    INSERT INTO categories (
      id, name, slug, parent_id, description, image_url, banner_url, icon, 
      display_order, featured, show_on_homepage, status, seo_title, seo_description, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    id, data.name, slug, data.parent_id || null, data.description || null,
    data.image_url || null, data.banner_url || null, data.icon || null,
    data.display_order || 0, data.featured ? 1 : 0, data.show_on_homepage ? 1 : 0,
    data.status || 'draft', data.seo_title || null, data.seo_description || null,
    adminId
  ];

  await pool.query(sql, values);
  await pool.query('INSERT INTO activity_logs (admin_id, action, metadata) VALUES (?, ?, ?)', [adminId, 'Category Created', JSON.stringify({ id, name: data.name })]);

  return getCategoryById(id);
}

export async function updateCategory(id, data, adminId) {
  const current = await getCategoryById(id);
  if (!current) throw new Error('Category not found.');

  const slug = data.slug || slugify(data.name, { lower: true, strict: true });
  
  if (slug !== current.slug) {
    const [existing] = await pool.query('SELECT id FROM categories WHERE slug = ? AND id != ? AND deleted_at IS NULL', [slug, id]);
    if (existing.length > 0) throw new Error('A category with this slug already exists.');
  }

  const sql = `
    UPDATE categories SET 
      name = ?, slug = ?, parent_id = ?, description = ?, image_url = ?, banner_url = ?, icon = ?, 
      display_order = ?, featured = ?, show_on_homepage = ?, status = ?, seo_title = ?, seo_description = ?, updated_by = ?
    WHERE id = ?
  `;

  const values = [
    data.name, slug, data.parent_id || null, data.description || null,
    data.image_url || null, data.banner_url || null, data.icon || null,
    data.display_order || 0, data.featured ? 1 : 0, data.show_on_homepage ? 1 : 0,
    data.status || 'draft', data.seo_title || null, data.seo_description || null,
    adminId, id
  ];

  await pool.query(sql, values);
  await pool.query('INSERT INTO activity_logs (admin_id, action, metadata) VALUES (?, ?, ?)', [adminId, 'Category Updated', JSON.stringify({ id, name: data.name })]);

  return getCategoryById(id);
}

export async function deleteCategory(id, adminId) {
  const current = await getCategoryById(id);
  if (!current) throw new Error('Category not found.');

  if (current.productCount > 0) {
    throw new Error('Cannot delete category containing active products.');
  }

  const [children] = await pool.query('SELECT id FROM categories WHERE parent_id = ? AND deleted_at IS NULL', [id]);
  if (children.length > 0) {
    throw new Error('Cannot delete category containing active sub-categories.');
  }

  await pool.query('UPDATE categories SET deleted_at = NOW(), updated_by = ? WHERE id = ?', [adminId, id]);
  await pool.query('INSERT INTO activity_logs (admin_id, action, metadata) VALUES (?, ?, ?)', [adminId, 'Category Deleted', JSON.stringify({ id, name: current.name })]);
}

export async function updateCategoryStatus(id, status, adminId) {
  await pool.query('UPDATE categories SET status = ?, updated_by = ? WHERE id = ?', [status, adminId, id]);
  await pool.query('INSERT INTO activity_logs (admin_id, action, metadata) VALUES (?, ?, ?)', [adminId, 'Category Status Changed', JSON.stringify({ id, status })]);
}

export async function bulkUpdateCategoryOrder(updates, adminId) {
  // updates: [{ id: 'uuid', display_order: 1 }, ...]
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const update of updates) {
      await connection.query('UPDATE categories SET display_order = ?, updated_by = ? WHERE id = ?', [update.display_order, adminId, update.id]);
    }
    await connection.query('INSERT INTO activity_logs (admin_id, action, metadata) VALUES (?, ?, ?)', [adminId, 'Category Bulk Reorder', JSON.stringify({ count: updates.length })]);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
