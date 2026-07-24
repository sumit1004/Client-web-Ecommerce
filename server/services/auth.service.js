import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { env } from '../config/environment.js';

export async function loginAdmin(email, password) {
  const [rows] = await pool.query('SELECT id, name, email, password, role, status, profile_image FROM admins WHERE email = ? LIMIT 1', [email]);
  const admin = rows[0];
  if (!admin) return null;
  if (admin.status !== 'active') throw new Error('Account disabled.');
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return null;
  const token = jwt.sign({ id: admin.id, email: admin.email, name: admin.name, role: admin.role, profile_image: admin.profile_image }, env.jwtSecret, { expiresIn: '7d' });
  await pool.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);
  await pool.query('INSERT INTO activity_logs (id, admin_id, action, metadata) VALUES (UUID(), ?, ?, ?)', [admin.id, 'Login', JSON.stringify({ ip: 'server' })]);
  return { token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, profile_image: admin.profile_image } };
}
