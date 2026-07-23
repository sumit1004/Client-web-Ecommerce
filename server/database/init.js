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

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // ensures 001 runs before 002

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const statements = sql.split(';').filter((stmt) => stmt.trim() !== '');
      for (const stmt of statements) {
        try {
          await pool.query(stmt);
        } catch (stmtError) {
          // Ignore duplicate column errors or foreign key drop errors if already applied
          if (stmtError.code === 'ER_DUP_FIELDNAME' || stmtError.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
            continue;
          }
          console.error(`Migration error in ${file}:`, stmtError.message);
        }
      }
    }
    console.log('Database schema validated.');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
  }
}

export async function seedAdmin(name, email, password) {
  try {
    if (!name || !email || !password) {
      console.warn('[Seed] ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD missing in .env - admin not seeded.');
      return;
    }
    console.log(`[Seed] Checking admin for: ${email}, password length: ${password.length}`);

    const [rows] = await pool.query('SELECT id, password FROM admins WHERE email = ? LIMIT 1', [email]);
    if (rows.length === 0) {
      // First boot — create default admin
      const hashedPassword = await bcrypt.hash(password, 12);
      const id = uuidv4();
      await pool.query(
        'INSERT INTO admins (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, email, hashedPassword, 'admin', 'active']
      );
      console.log(`[Seed] Default admin created: ${email}`);
    } else {
      // Admin exists — verify hash matches current .env password
      const existing = rows[0];
      const matches = await bcrypt.compare(password, existing.password);
      if (!matches) {
        console.warn(`[Seed] Password hash mismatch detected for ${email}. Re-hashing with current .env password...`);
        const newHash = await bcrypt.hash(password, 12);
        await pool.query('UPDATE admins SET password = ? WHERE id = ?', [newHash, existing.id]);
        console.log(`[Seed] Admin password re-hashed successfully.`);
      } else {
        console.log(`[Seed] Admin account verified OK: ${email}`);
      }
    }
  } catch (error) {
    console.error('[Seed] Failed to seed/verify admin:', error.message);
  }
}
