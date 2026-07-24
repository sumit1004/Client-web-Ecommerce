import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import { pool } from '../config/database.js';
import { cloudinary } from '../config/cloudinary.js';

function mapProduct(p) {
  if (!p) return null;
  // Fallback to legacy fields if JSON_ARRAYAGG didn't return a valid array
  const rawImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
  const gallery = Array.isArray(rawImages) && rawImages.length > 0 && rawImages[0].url ? rawImages : [];
  
  return {
    id: p.id,
    uuid: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    category_id: p.category_id,
    brand: p.brand,
    price: p.price,
    sale_price: p.sale_price,
    cost_price: p.cost_price,
    description: p.description,
    gender: p.gender,
    age_group: p.age_group,
    color: p.color,
    size: p.size,
    weight: p.weight,
    stock: p.stock,
    low_stock_threshold: p.low_stock_threshold,
    featured: p.featured,
    new_arrival: p.new_arrival,
    show_on_homepage: p.show_on_homepage,
    status: p.status,
    seo_title: p.seo_title,
    seo_description: p.seo_description,
    category: p.category_name || 'Uncategorized',
    thumbnail: gallery.length > 0 ? gallery[0].url : (p.image || null),
    gallery: gallery
  };
}

export const productService = {
  getProducts: async (params = {}) => {
    const { search, category, brand, status, featured, homepage, sort, order, page = 1, limit = 20 } = params;
    
    let query = `
      SELECT p.*, c.name as category_name,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', pi.id, 'url', pi.image_url, 'public_id', pi.cloudinary_public_id, 'is_featured', pi.is_featured)) 
       FROM product_images pi WHERE pi.product_id = p.id) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL
    `;
    const queryParams = [];

    if (search) {
      query += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) {
      query += ` AND p.category_id = ?`;
      queryParams.push(category);
    }
    if (brand) {
      query += ` AND p.brand = ?`;
      queryParams.push(brand);
    }
    if (status) {
      query += ` AND p.status = ?`;
      queryParams.push(status);
    }
    if (featured === 'true') {
      query += ` AND p.featured = TRUE`;
    }
    if (homepage === 'true') {
      query += ` AND p.show_on_homepage = TRUE`;
    }

    // Sorting
    const validSortFields = ['name', 'price', 'stock', 'created_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY p.${sortField} ${sortOrder}`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), Number(offset));

    const [rows] = await pool.query(query, queryParams);

    // Count Total
    let countQuery = `SELECT COUNT(*) as total FROM products p WHERE p.deleted_at IS NULL`;
    const countParams = [];
    if (search) { countQuery += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)`; countParams.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (category) { countQuery += ` AND p.category_id = ?`; countParams.push(category); }
    if (brand) { countQuery += ` AND p.brand = ?`; countParams.push(brand); }
    if (status) { countQuery += ` AND p.status = ?`; countParams.push(status); }
    if (featured === 'true') { countQuery += ` AND p.featured = TRUE`; }
    if (homepage === 'true') { countQuery += ` AND p.show_on_homepage = TRUE`; }

    const [countRows] = await pool.query(countQuery, countParams);

    return {
      products: rows.map(mapProduct),
      total: countRows[0].total,
      page: Number(page),
      totalPages: Math.ceil(countRows[0].total / limit)
    };
  },

  getProductById: async (id) => {
    const [rows] = await pool.query(`
      SELECT p.*, c.name as category_name,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', pi.id, 'url', pi.image_url, 'public_id', pi.cloudinary_public_id, 'is_featured', pi.is_featured, 'display_order', pi.display_order)) 
       FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order ASC) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.deleted_at IS NULL
    `, [id]);
    return mapProduct(rows[0]);
  },

  getProductBySlug: async (slug) => {
    const [rows] = await pool.query(`
      SELECT p.*, c.name as category_name,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', pi.id, 'url', pi.image_url, 'public_id', pi.cloudinary_public_id, 'is_featured', pi.is_featured, 'display_order', pi.display_order)) 
       FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order ASC) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.deleted_at IS NULL
    `, [slug]);
    return mapProduct(rows[0]);
  },

  createProduct: async (data, adminId) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const id = uuidv4();
      const slug = data.slug || slugify(data.name, { lower: true, strict: true });
      
      const [existing] = await connection.query('SELECT id FROM products WHERE slug = ? OR sku = ?', [slug, data.sku]);
      if (existing.length > 0) {
        const error = new Error('Product with this slug or SKU already exists.');
        error.status = 400;
        throw error;
      }

      const productFields = {
        id,
        name: data.name,
        slug,
        sku: data.sku,
        category_id: data.category_id,
        brand: data.brand || null,
        price: data.price,
        sale_price: data.sale_price || null,
        cost_price: data.cost_price || null,
        description: data.description || null,
        gender: data.gender || null,
        age_group: data.age_group || null,
        color: data.color || null,
        size: data.size || null,
        weight: data.weight || null,
        stock: data.stock || 0,
        low_stock_threshold: data.low_stock_threshold || 5,
        featured: data.featured ? 1 : 0,
        new_arrival: data.new_arrival ? 1 : 0,
        show_on_homepage: data.show_on_homepage ? 1 : 0,
        status: data.status || 'draft',
        seo_title: data.seo_title || null,
        seo_description: data.seo_description || null,
        created_by: adminId,
        updated_by: adminId
      };

      await connection.query('INSERT INTO products SET ?', [productFields]);

      if (data.gallery && Array.isArray(data.gallery)) {
        for (let i = 0; i < data.gallery.length; i++) {
          const img = data.gallery[i];
          await connection.query('INSERT INTO product_images SET ?', [{
            id: uuidv4(),
            product_id: id,
            cloudinary_public_id: img.public_id,
            image_url: img.url,
            display_order: i,
            is_featured: i === 0 ? 1 : 0
          }]);
        }
      }

      await connection.query('INSERT INTO activity_logs (id, admin_id, action, metadata) VALUES (UUID(), ?, ?, ?)', [
        adminId, 'create_product', JSON.stringify({ product_id: id, sku: data.sku })
      ]);

      await connection.commit();
      return { id, slug };
    } catch (error) {
      await connection.rollback();
      // Cleanup orphan Cloudinary images if insertion failed
      if (data && data.gallery && Array.isArray(data.gallery)) {
        for (const img of data.gallery) {
          try {
            await cloudinary.uploader.destroy(img.public_id);
          } catch(err) {
            console.error('Failed to clean up Cloudinary asset:', img.public_id, err);
          }
        }
      }
      throw error;
    } finally {
      connection.release();
    }
  },

  updateProduct: async (id, data, adminId) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [current] = await connection.query('SELECT * FROM products WHERE id = ?', [id]);
      if (current.length === 0) throw new Error('Product not found');

      let slug = data.slug;
      if (slug && slug !== current[0].slug) {
        const [existing] = await connection.query('SELECT id FROM products WHERE slug = ? AND id != ?', [slug, id]);
        if (existing.length > 0) {
          const err = new Error('Product with this slug already exists.');
          err.status = 400;
          throw err;
        }
      } else {
        slug = current[0].slug;
      }

      if (data.sku && data.sku !== current[0].sku) {
        const [existing] = await connection.query('SELECT id FROM products WHERE sku = ? AND id != ?', [data.sku, id]);
        if (existing.length > 0) {
          const err = new Error('Product with this SKU already exists.');
          err.status = 400;
          throw err;
        }
      }

      const productFields = {
        name: data.name ?? current[0].name,
        slug,
        sku: data.sku ?? current[0].sku,
        category_id: data.category_id ?? current[0].category_id,
        brand: data.brand ?? current[0].brand,
        price: data.price ?? current[0].price,
        sale_price: data.sale_price ?? current[0].sale_price,
        cost_price: data.cost_price ?? current[0].cost_price,
        description: data.description ?? current[0].description,
        gender: data.gender ?? current[0].gender,
        age_group: data.age_group ?? current[0].age_group,
        color: data.color ?? current[0].color,
        size: data.size ?? current[0].size,
        weight: data.weight ?? current[0].weight,
        stock: data.stock ?? current[0].stock,
        low_stock_threshold: data.low_stock_threshold ?? current[0].low_stock_threshold,
        featured: data.featured !== undefined ? (data.featured ? 1 : 0) : current[0].featured,
        new_arrival: data.new_arrival !== undefined ? (data.new_arrival ? 1 : 0) : current[0].new_arrival,
        show_on_homepage: data.show_on_homepage !== undefined ? (data.show_on_homepage ? 1 : 0) : current[0].show_on_homepage,
        status: data.status ?? current[0].status,
        seo_title: data.seo_title ?? current[0].seo_title,
        seo_description: data.seo_description ?? current[0].seo_description,
        updated_by: adminId
      };

      await connection.query('UPDATE products SET ? WHERE id = ?', [productFields, id]);

      // Update images
      if (data.gallery && Array.isArray(data.gallery)) {
        await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
        for (let i = 0; i < data.gallery.length; i++) {
          const img = data.gallery[i];
          await connection.query('INSERT INTO product_images SET ?', [{
            id: uuidv4(),
            product_id: id,
            cloudinary_public_id: img.public_id,
            image_url: img.url,
            display_order: i,
            is_featured: i === 0 ? 1 : 0
          }]);
        }
      }

      await connection.query('INSERT INTO activity_logs (id, admin_id, action, metadata) VALUES (UUID(), ?, ?, ?)', [
        adminId, 'update_product', JSON.stringify({ product_id: id, sku: productFields.sku })
      ]);

      await connection.commit();
      return { id };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  deleteProduct: async (id, adminId) => {
    const [result] = await pool.query('UPDATE products SET deleted_at = NOW(), updated_by = ? WHERE id = ?', [adminId, id]);
    if (result.affectedRows > 0) {
      await pool.query('INSERT INTO activity_logs (id, admin_id, action, metadata) VALUES (UUID(), ?, ?, ?)', [
        adminId, 'delete_product', JSON.stringify({ product_id: id })
      ]);
    }
    return result;
  },
  
  bulkUpdateStatus: async (ids, status, adminId) => {
    if (!ids || ids.length === 0) return;
    const [result] = await pool.query('UPDATE products SET status = ?, updated_by = ? WHERE id IN (?)', [status, adminId, ids]);
    return result;
  },
  
  bulkUpdateFlag: async (ids, flagField, value, adminId) => {
    if (!ids || ids.length === 0) return;
    const [result] = await pool.query(`UPDATE products SET ${flagField} = ?, updated_by = ? WHERE id IN (?)`, [value ? 1 : 0, adminId, ids]);
    return result;
  }
};
