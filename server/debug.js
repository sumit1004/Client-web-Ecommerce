import { pool } from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testExecuteArray() {
  try {
    const adminId = 'd8272f38-2d03-4f93-841f-823d778d91b4';
    const minFields = {
      id: 'test-id-3',
      name: 'Test Product Debug 3',
      slug: 'test-slug-3',
      sku: 'DEBUG-SKU-103',
      price: 199.99
    };
    
    await pool.query('INSERT INTO products SET ?', [minFields]);
    fs.writeFileSync(path.join(__dirname, 'debug_output.txt'), 'SUCCESS ARRAY INSERT');
  } catch (err) {
    fs.writeFileSync(path.join(__dirname, 'debug_output.txt'), 'ARRAY ERROR: ' + err.message);
  }
}

testExecuteArray();
