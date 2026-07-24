import * as xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import { pool } from '../config/database.js';
import { cloudinary } from '../config/cloudinary.js';
import fs from 'fs';
import { importJobs } from '../controllers/import.controller.js';

export const importService = {
  importProducts: async (fileBuffer, adminId) => {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (rows.length === 0) throw new Error('File is empty.');

    const connection = await pool.getConnection();
    const report = {
      total: rows.length,
      imported: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    try {
      await connection.beginTransaction();

      const [categories] = await connection.query('SELECT id, name FROM categories');
      const categoryMap = categories.reduce((acc, cat) => {
        acc[cat.name.toLowerCase()] = cat.id;
        return acc;
      }, {});

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +1 for header, +1 for 0-index

        if (!row.Name || !row.SKU || !row.Price) {
          report.failed++;
          report.errors.push({ row: rowNumber, sku: row.SKU, reason: 'Missing Name, SKU, or Price' });
          continue;
        }

        const categoryId = row.Category ? categoryMap[row.Category.toLowerCase()] : null;
        if (!categoryId && row.Category) {
          report.failed++;
          report.errors.push({ row: rowNumber, sku: row.SKU, reason: `Category '${row.Category}' not found` });
          continue;
        }

        const sku = String(row.SKU).trim();
        const price = parseFloat(row.Price);
        if (isNaN(price) || price < 0) {
          report.failed++;
          report.errors.push({ row: rowNumber, sku, reason: 'Invalid Price' });
          continue;
        }

        const slug = slugify(row.Name, { lower: true, strict: true }) + '-' + uuidv4().substring(0,6);

        const productFields = {
          name: row.Name,
          sku: sku,
          category_id: categoryId,
          brand: row.Brand || null,
          price: price,
          sale_price: row.Sale_Price ? parseFloat(row.Sale_Price) : null,
          description: row.Description || null,
          gender: row.Gender || null,
          stock: row.Stock ? parseInt(row.Stock) : 0,
          status: row.Status ? String(row.Status).toLowerCase() : 'draft',
          featured: row.Featured === 'Yes' ? 1 : 0,
          show_on_homepage: row.Homepage === 'Yes' ? 1 : 0,
          updated_by: adminId
        };

        const [existing] = await connection.query('SELECT id FROM products WHERE sku = ?', [sku]);
        
        try {
          if (existing.length > 0) {
            // Update
            await connection.query('UPDATE products SET ? WHERE id = ?', [productFields, existing[0].id]);
            report.updated++;
          } else {
            // Insert
            productFields.id = uuidv4();
            productFields.slug = slug;
            productFields.created_by = adminId;
            await connection.query('INSERT INTO products SET ?', [productFields]);
            report.imported++;
          }
        } catch (err) {
          report.failed++;
          report.errors.push({ row: rowNumber, sku, reason: err.message });
          await connection.query('INSERT INTO failed_imports (id, `row_number`, raw_data, error_message) VALUES (UUID(), ?, ?, ?)', [
            rowNumber, JSON.stringify(row), err.message
          ]);
        }
      }

      await connection.query('INSERT INTO bulk_import_history (id, admin_id, imported_count, updated_count, failed_count, skipped_count) VALUES (UUID(), ?, ?, ?, ?, ?)', [
        adminId, report.imported, report.updated, report.failed, report.skipped
      ]);

      await connection.commit();
      return report;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  processBulkImageUpload: async (jobId, files, adminId) => {
    const job = importJobs[jobId];
    console.log(`\n[BulkImport Job ${jobId}] Upload started. Processing ${files.length} files.`);
    const tStart = Date.now();
    let tCloudinaryEnd = 0;
    let tSavingEnd = 0;

    const report = {
      total: files.length,
      matched: 0,
      ignored: 0,
      errors: []
    };

    // 1. CLOUDINARY UPLOAD (Batched)
    job.status = 'Cloudinary...';
    const batchSize = 5;
    const uploadedFiles = [];
    
    // Helper function for uploading with retry
    const uploadWithRetry = async (file, attempt = 1) => {
      try {
        return await cloudinary.uploader.upload(file.path, {
          folder: 'pasandshowroom/bulk',
          use_filename: true,
          unique_filename: true,
        });
      } catch (err) {
        if (attempt < 2) {
          console.log(`[BulkImport Job ${jobId}] Retrying Cloudinary upload for ${file.originalname}`);
          return uploadWithRetry(file, attempt + 1);
        }
        throw err;
      }
    };

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      const results = await Promise.allSettled(batch.map(file => uploadWithRetry(file)));
      
      results.forEach((res, index) => {
        const file = batch[index];
        if (res.status === 'fulfilled') {
          uploadedFiles.push({
            originalname: file.originalname,
            public_id: res.value.public_id,
            url: res.value.secure_url,
            size: res.value.bytes,
            path: file.path
          });
        } else {
          console.error(`[BulkImport Job ${jobId}] Cloudinary upload failed for ${file.originalname}:`, res.reason);
          report.ignored++;
          report.errors.push({ filename: file.originalname, reason: 'Cloudinary upload failed' });
          // Cleanup local file on failure
          try { fs.unlinkSync(file.path); } catch (e) {}
        }
      });
      job.progress = i + batch.length;
    }
    tCloudinaryEnd = Date.now();
    console.log(`[BulkImport Job ${jobId}] Cloudinary uploads finished in ${tCloudinaryEnd - tStart}ms`);

    // 2. DATABASE SAVE (media_library)
    job.status = 'Saving...';
    job.progress = 0;
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const file of uploadedFiles) {
        await connection.query(
          'INSERT INTO media_library (id, url, public_id, filename, size_bytes, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), file.url, file.public_id, file.originalname, file.size || 0, adminId]
        );
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      connection.release();
      console.error(`[BulkImport Job ${jobId}] Database insert failed. Deleting ${uploadedFiles.length} orphan Cloudinary files...`);
      for (const file of uploadedFiles) {
        try { await cloudinary.uploader.destroy(file.public_id); } catch(e) { console.error(`Failed to delete orphan ${file.public_id}`); }
      }
      throw err;
    }
    tSavingEnd = Date.now();
    console.log(`[BulkImport Job ${jobId}] Saving to DB finished in ${tSavingEnd - tCloudinaryEnd}ms`);

    // 3. IMAGE MAPPING
    job.status = 'Mapping...';
    job.progress = 0;
    job.total = uploadedFiles.length;

    try {
      await connection.beginTransaction();
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const filename = file.originalname;
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')).toUpperCase();
        const skuMatch = nameWithoutExt.split(/[_|-]/)[0];

        const [products] = await connection.query('SELECT id FROM products WHERE sku = ?', [skuMatch]);
        
        if (products.length > 0) {
          const productId = products[0].id;
          const [orderRows] = await connection.query('SELECT MAX(display_order) as max_order FROM product_images WHERE product_id = ?', [productId]);
          const nextOrder = orderRows[0].max_order !== null ? orderRows[0].max_order + 1 : 0;

          await connection.query('INSERT INTO product_images (id, product_id, cloudinary_public_id, image_url, display_order, is_featured) VALUES (?, ?, ?, ?, ?, ?)', [
            uuidv4(), productId, file.public_id, file.url, nextOrder, nextOrder === 0 ? 1 : 0
          ]);
          report.matched++;
        } else {
          report.ignored++;
          report.errors.push({ filename, reason: `UNMATCHED (Saved to media library)` });
          
          await connection.query('INSERT INTO pending_images (id, filename, cloudinary_public_id, image_url, match_status) VALUES (?, ?, ?, ?, ?)', [
            uuidv4(), filename, file.public_id, file.url, 'ignored'
          ]);
        }
        
        // Cleanup local file after successful upload & mapping
        try { fs.unlinkSync(file.path); } catch (e) {}
        
        job.progress = i + 1;
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
    const tMappingEnd = Date.now();
    console.log(`[BulkImport Job ${jobId}] Mapping finished in ${tMappingEnd - tSavingEnd}ms`);
    console.log(`[BulkImport Job ${jobId}] Total duration: ${tMappingEnd - tStart}ms. Matched: ${report.matched}, Ignored: ${report.ignored}`);
    
    job.status = 'Completed';
    job.report = report;
  }
};
