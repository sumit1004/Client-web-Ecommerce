import { Router } from 'express';
import { login, logout } from '../controllers/auth.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { loginValidator } from '../validators/auth.validator.js';
import { ok } from '../utils/response.js';

const router = Router();

router.post('/login', loginLimiter, loginValidator, validate, login);
router.post('/logout', logout);
router.get('/me', requireAdmin, (req, res) => ok(res, 'Admin loaded.', req.admin));

export default router;
