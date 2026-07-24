import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const connection = await pool.getConnection();
  try {
    console.log('Running 004_uuid_standardization.sql...');
    const sqlPath = path.join(__dirname, 'database', 'migrations', '004_uuid_standardization.sql');
    const sqlStatements = fs.readFileSync(sqlPath, 'utf8')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
      
    for (const stmt of sqlStatements) {
      if (stmt.startsWith('--')) {
        continue;
      }
      try {
        await connection.query(stmt);
      } catch (err) {
        console.error('Error executing statement:', stmt);
        console.error(err.message);
      }
    }
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    connection.release();
  }
}

export default runMigration;
