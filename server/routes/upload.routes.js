import { Router } from 'express';
import multer from 'multer';
import { cloudinary } from '../config/cloudinary.js';
import { requireAdmin } from '../middleware/auth.js';
import { ok } from '../utils/response.js';
import { pool } from '../config/database.js';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', requireAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'pasandshowroom',
      use_filename: true,
      unique_filename: true,
    });

    try {
      await pool.query(
        'INSERT INTO media_library (id, url, public_id, filename, size_bytes, uploaded_by) VALUES (UUID(), ?, ?, ?, ?, ?)',
        [result.secure_url, result.public_id, req.file.originalname, req.file.size, req.admin.id]
      );
    } catch (dbError) {
      // Error recovery: delete orphan Cloudinary asset
      try { await cloudinary.uploader.destroy(result.public_id); } catch(e) {}
      throw dbError;
    }

    ok(res, 'Image uploaded successfully.', {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format
    });
  } catch (error) {
    next(error);
  }
});

export default router;
