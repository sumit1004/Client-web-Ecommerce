import { importService } from '../services/import.service.js';
import { ok, badRequest } from '../utils/response.js';
import { v4 as uuidv4 } from 'uuid';

export const importJobs = {};

export const importController = {
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
