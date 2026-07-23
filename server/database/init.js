import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';
import { env } from '../config/environment.js';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
  try {
    const tempPool = mysql.createPool({
      host: env.database.host,
      user: env.database.user,
      password: env.database.password,
      port: env.database.port
    });
    await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${env.database.database}\``);
    await tempPool.end();

    const schemaPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    const statements = sql.split(';').filter((stmt) => stmt.trim() !== '');

    for (const stmt of statements) {
      await pool.query(stmt);
    }
    console.log('Database schema validated.');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
  }
}

export async function seedAdmin(name, email, password) {
  try {
    const [rows] = await pool.query('SELECT id FROM admins LIMIT 1');
    if (rows.length === 0) {
      if (!name || !email || !password) {
        console.warn('Admin seed variables missing in environment. Admin not created.');
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const id = uuidv4();
      await pool.query(
        'INSERT INTO admins (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, email, hashedPassword, 'admin', 'active']
      );
      console.log(`Default admin created: ${email}`);
    } else {
      console.log('Admin account already exists.');
    }
  } catch (error) {
    console.error('Failed to seed admin:', error.message);
  }
}
