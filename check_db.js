import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

async function checkDB() {
  const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT
  });

  const [rows] = await pool.query('SELECT * FROM admins');
  console.log('Admins in DB:', rows);
  process.exit(0);
}

checkDB();
