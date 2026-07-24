import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import { pool } from '../config/database.js';

export function requireAdmin(req, _res, next) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    const error = new Error('Authentication required.');
    error.status = 401;
    return next(error);
  }
  try {
    req.admin = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    const error = new Error('Invalid session.');
    error.status = 401;
    return next(error);
  }
}

export function requireRole(allowedRoles) {
  return async (req, _res, next) => {
    try {
      if (!req.admin || !req.admin.id) {
        const error = new Error('Authentication required.');
        error.status = 401;
        throw error;
      }
      
      const [rows] = await pool.query('SELECT role FROM admins WHERE id = ?', [req.admin.id]);
      if (rows.length === 0) {
        const error = new Error('Admin not found.');
        error.status = 401;
        throw error;
      }

      const adminRole = rows[0].role;
      if (!allowedRoles.includes(adminRole)) {
        const error = new Error('Insufficient permissions.');
        error.status = 403;
        throw error;
      }

      req.admin.role = adminRole;
      next();
    } catch (error) {
      next(error);
    }
  };
}
