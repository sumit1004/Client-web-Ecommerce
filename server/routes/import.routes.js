import { Router } from 'express';
import multer from 'multer';
import { importController } from '../controllers/import.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Setup in-memory multer for Excel
const uploadMemory = multer({ storage: multer.memoryStorage() });

// Setup disk multer for bulk images - Support up to 1000 images
const uploadDisk = multer({ dest: 'uploads/' });

router.post('/products', requireAdmin, uploadMemory.single('file'), importController.importProducts);

// Post images to server, return Job ID immediately
router.post('/images', requireAdmin, uploadDisk.array('images', 1000), importController.startImageImport);

// Check job status
router.get('/status/:jobId', requireAdmin, importController.getJobStatus);

export default router;
