import { pool } from '../config/database.js';
import { cloudinary } from '../config/cloudinary.js';

export const mediaService = {
  getMedia: async (params = {}) => {
    const { search, sort, order, page = 1, limit = 40 } = params;
    
    let query = `
      SELECT m.*,
      a.name as uploader_name,
      (SELECT GROUP_CONCAT(p.sku SEPARATOR ', ') FROM product_images pi JOIN products p ON p.id = pi.product_id WHERE pi.cloudinary_public_id = m.public_id) as mapped_products
      FROM media_library m
      LEFT JOIN admins a ON m.uploaded_by = a.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (search) {
      query += ` AND (m.filename LIKE ? OR m.public_id LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const sortField = sort === 'size' ? 'size_bytes' : 'created_at';
    const sortOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY m.${sortField} ${sortOrder}`;

    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), Number(offset));

    const [rows] = await pool.query(query, queryParams);

    let countQuery = `SELECT COUNT(*) as total FROM media_library m WHERE 1=1`;
    const countParams = [];
    if (search) {
      countQuery += ` AND (m.filename LIKE ? OR m.public_id LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    const [countRows] = await pool.query(countQuery, countParams);

    return {
      media: rows,
      total: countRows[0].total,
      page: Number(page),
      totalPages: Math.ceil(countRows[0].total / limit)
    };
  },

  deleteMedia: async (id, adminId) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [mediaRows] = await connection.query('SELECT * FROM media_library WHERE id = ?', [id]);
      if (mediaRows.length === 0) throw new Error('Media not found');
      
      const media = mediaRows[0];
      
      // Delete from cloudinary
      await cloudinary.uploader.destroy(media.public_id);
      
      // Delete from db
      await connection.query('DELETE FROM media_library WHERE id = ?', [id]);
      
      // Log
      await connection.query('INSERT INTO activity_logs (id, admin_id, action, metadata) VALUES (UUID(), ?, ?, ?)', [
        adminId, 'delete_media', JSON.stringify({ public_id: media.public_id })
      ]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};
