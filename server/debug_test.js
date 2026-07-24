import { productService } from './services/product.service.js';
import { pool } from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAll() {
  try {
    const [admins] = await pool.query('SELECT id FROM admins LIMIT 1');
    const adminId = admins[0].id;
    
    // 1. Required fields only
    const reqOnly = await productService.createProduct({
      name: 'Req Only Product',
      sku: 'REQ-001',
      price: 99.99
    }, adminId);
    console.log('Created Req Only:', reqOnly.id);

    // 2. With Optional fields
    const optFields = await productService.createProduct({
      name: 'Opt Fields Product',
      sku: 'OPT-001',
      price: 149.99,
      description: 'Test description',
      stock: 100,
      featured: true
    }, adminId);
    console.log('Created Opt Fields:', optFields.id);

    // 3. With Images (simulated)
    const withImages = await productService.createProduct({
      name: 'Images Product',
      sku: 'IMG-001',
      price: 199.99,
      images: [
        { public_id: 'test_image_1', url: 'http://example.com/1.jpg' }
      ]
    }, adminId);
    console.log('Created with Images:', withImages.id);

    fs.writeFileSync(path.join(__dirname, 'debug_output.txt'), 'ALL TESTS PASSED\n' + JSON.stringify({ reqOnly, optFields, withImages }, null, 2));
  } catch (error) {
    fs.writeFileSync(path.join(__dirname, 'debug_output.txt'), 'TEST FAILED\n' + error.stack);
  }
}

testAll();
