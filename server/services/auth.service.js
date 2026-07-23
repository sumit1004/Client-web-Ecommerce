import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { env } from '../config/environment.js';

export async function loginAdmin(email, password) {
  const [rows] = await pool.query('SELECT id, name, email, password FROM admins WHERE email = ? LIMIT 1', [email]);
  const admin = rows[0];
  if (!admin) return null;
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return null;
  const token = jwt.sign({ id: admin.id, email: admin.email, name: admin.name }, env.jwtSecret, { expiresIn: '7d' });
  await pool.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);
  return { token, admin: { id: admin.id, name: admin.name, email: admin.email } };
}
