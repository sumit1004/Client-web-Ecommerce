import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

async function resetAdminPassword() {
  const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: Number(process.env.DATABASE_PORT || 3306)
  });

  const rawPass = process.env.ADMIN_PASSWORD;
  const email = process.env.ADMIN_EMAIL;

  if (!rawPass || !email) {
    console.error('ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
    process.exit(1);
  }

  console.log(`Resetting password for: ${email}`);
  console.log(`Password length: ${rawPass.length}`);

  const hash = await bcrypt.hash(rawPass, 12);
  console.log('Generated hash:', hash);

  // Verify hash works
  const verify = await bcrypt.compare(rawPass, hash);
  console.log('Verification test:', verify);

  await pool.query('UPDATE admins SET password = ? WHERE email = ?', [hash, email]);
  console.log('Password updated in database successfully.');

  // Confirm by reading back
  const [rows] = await pool.query('SELECT id, name, email, status FROM admins WHERE email = ?', [email]);
  console.log('Updated record:', rows[0]);

  process.exit(0);
}

resetAdminPassword().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
