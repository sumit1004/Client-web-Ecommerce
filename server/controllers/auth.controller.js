import { loginAdmin } from '../services/auth.service.js';
import { env } from '../config/environment.js';
import { ok } from '../utils/response.js';
import { pool } from '../config/database.js';
import jwt from 'jsonwebtoken';

export async function login(req, res, next) {
  try {
    const result = await loginAdmin(req.body.email, req.body.password);
    if (!result) {
      const error = new Error('Invalid email or password.');
      error.status = 401;
      throw error;
    }
    res.cookie('token', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.nodeEnv === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    ok(res, 'Login successful.', result.admin);
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, env.jwtSecret);
      if (decoded && decoded.id) {
        await pool.query('INSERT INTO activity_logs (id, admin_id, action, metadata) VALUES (UUID(), ?, ?, ?)', [decoded.id, 'Logout', JSON.stringify({ ip: 'server' })]);
      }
    }
  } catch (err) {
    // Ignore verification errors during logout
  }
  res.clearCookie('token');
  ok(res, 'Logged out.');
}
