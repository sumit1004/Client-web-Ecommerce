import { Router } from 'express';
import multer from 'multer';
import { cloudinary } from '../config/cloudinary.js';
import { requireAdmin } from '../middleware/auth.js';
import { ok } from '../utils/response.js';

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
