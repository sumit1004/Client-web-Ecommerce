import { pool } from '../config/database.js';
import { ok } from '../utils/response.js';

export async function getActivityLogs(req, res, next) {
  try {
    const { page = 1, limit = 20, action = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT al.*, a.name as admin_name 
      FROM activity_logs al 
      LEFT JOIN admins a ON al.admin_id = a.id
    `;
    let params = [];

    if (action) {
      query += ' WHERE al.action = ?';
      params.push(action);
    }

    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM activity_logs';
    let countParams = [];
    if (action) {
      countQuery += ' WHERE action = ?';
      countParams.push(action);
    }
    const [countRows] = await pool.query(countQuery, countParams);

    ok(res, 'Activity logs fetched', {
      logs: rows,
      total: countRows[0].total,
      page: Number(page),
      totalPages: Math.ceil(countRows[0].total / limit)
    });
  } catch (error) {
    next(error);
  }
}
