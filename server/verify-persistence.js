import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

async function testPersistence() {
  const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  const action = process.argv[2];

  if (action === 'seed') {
    const id = uuidv4();
    await pool.query(
      'INSERT INTO products (id, name, slug, price, status) VALUES (?, ?, ?, ?, ?)',
      [id, 'Test Persistence Product', 'test-persistence-' + Date.now(), 99.99, 'active']
    );
    console.log('Seeded a new product.');
  }

  const [rows] = await pool.query('SELECT COUNT(*) as count FROM products');
  console.log(`Current product count: ${rows[0].count}`);
  
  process.exit(0);
}

testPersistence();
