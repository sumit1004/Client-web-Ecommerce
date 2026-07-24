import { importService } from '../services/import.service.js';
import { ok, badRequest } from '../utils/response.js';
import { v4 as uuidv4 } from 'uuid';
import * as xlsx from 'xlsx';
import { IMPORT_SCHEMA } from '../utils/importSchema.js';

export const importJobs = {};

export const importController = {
  getTemplate: (req, res, next) => {
    try {
      const workbook = xlsx.utils.book_new();

      // Products Sheet
      const headers = IMPORT_SCHEMA.map(col => col.column);
      const exampleRow = IMPORT_SCHEMA.reduce((acc, col) => {
        acc[col.column] = col.example;
        return acc;
      }, {});
      const productsSheet = xlsx.utils.json_to_sheet([exampleRow], { header: headers });
      productsSheet['!views'] = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]; // Freeze first row
      xlsx.utils.book_append_sheet(workbook, productsSheet, 'Products');

      // Instructions Sheet
      const instructionHeaders = ['Column', 'Description', 'Required', 'Example'];
      const instructionRows = IMPORT_SCHEMA.map(col => ({
        Column: col.column,
        Description: col.desc,
        Required: col.required ? 'YES' : 'Optional',
        Example: String(col.example)
      }));
      const instructionsSheet = xlsx.utils.json_to_sheet(instructionRows, { header: instructionHeaders });
      instructionsSheet['!views'] = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
      
      // Auto-fit widths for instructions
      instructionsSheet['!cols'] = [
        { wch: 20 },
        { wch: 40 },
        { wch: 15 },
        { wch: 30 }
      ];
      xlsx.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Disposition', 'attachment; filename="Product_Import_Template.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  },

  importProducts: async (req, res, next) => {
    try {
      if (!req.file) return badRequest(res, 'No excel file uploaded.');
      const report = await importService.importProducts(req.file.buffer, req.admin.id);
      ok(res, 'Import completed.', report);
    } catch (error) {
      next(error);
    }
  },

  startImageImport: async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) return badRequest(res, 'No images uploaded.');
      
      const jobId = uuidv4();
      
      // Initialize job status
      importJobs[jobId] = {
        status: 'Cloudinary...',
        progress: 0,
        total: req.files.length,
        report: null,
        error: null,
        startedAt: Date.now()
      };

      // Return immediately so the frontend knows upload to server is done
      ok(res, 'Upload received. Processing started.', { jobId });

      // Process heavy lifting in background
      importService.processBulkImageUpload(jobId, req.files, req.admin.id).catch(err => {
        console.error(`[BulkImport Job ${jobId}] Failed fundamentally:`, err);
        importJobs[jobId].status = 'Error';
        importJobs[jobId].error = err.message;
      });

    } catch (error) {
      next(error);
    }
  },

  getJobStatus: async (req, res, next) => {
    try {
      const job = importJobs[req.params.jobId];
      if (!job) return badRequest(res, 'Job not found.');
      ok(res, 'Job status', job);
    } catch (error) {
      next(error);
    }
  }
};
