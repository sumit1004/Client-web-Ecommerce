import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAdmin, mediaController.getMedia);
router.delete('/:id', requireAdmin, mediaController.deleteMedia);

export default router;
