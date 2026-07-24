import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { ok } from '../utils/response.js';

export async function getProfile(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, status, profile_image, last_login, created_at FROM admins WHERE id = ?',
      [req.admin.id]
    );
    
    if (rows.length === 0) {
      const error = new Error('Admin not found');
      error.status = 404;
      throw error;
    }
    
    ok(res, 'Profile fetched successfully', rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, profile_image } = req.body;
    
    if (!name) {
      const error = new Error('Name is required');
      error.status = 400;
      throw error;
    }

    await pool.query(
      'UPDATE admins SET name = ?, profile_image = ? WHERE id = ?',
      [name, profile_image || null, req.admin.id]
    );
    
    await pool.query('INSERT INTO activity_logs (id, admin_id, action, metadata) VALUES (UUID(), ?, ?, ?)', [
      req.admin.id, 'update_profile', JSON.stringify({ name })
    ]);

    ok(res, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      const error = new Error('Current and new passwords are required');
      error.status = 400;
      throw error;
    }

    if (newPassword.length < 8) {
      const error = new Error('New password must be at least 8 characters long');
      error.status = 400;
      throw error;
    }

    const [rows] = await pool.query('SELECT password FROM admins WHERE id = ?', [req.admin.id]);
    if (rows.length === 0) {
      const error = new Error('Admin not found');
      error.status = 404;
      throw error;
    }

    const isValid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isValid) {
      const error = new Error('Incorrect current password');
      error.status = 401;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, req.admin.id]);

    await pool.query('INSERT INTO activity_logs (id, admin_id, action, metadata) VALUES (UUID(), ?, ?, ?)', [
      req.admin.id, 'change_password', JSON.stringify({})
    ]);

    ok(res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
}

export async function getLoginHistory(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT action, created_at as time, metadata FROM activity_logs WHERE admin_id = ? AND action = ? ORDER BY created_at DESC LIMIT 50',
      [req.admin.id, 'login']
    );
    ok(res, 'Login history fetched', rows);
  } catch (error) {
    next(error);
  }
}
