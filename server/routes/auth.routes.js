import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { login, logout } from '../controllers/auth.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { loginValidator } from '../validators/auth.validator.js';
import { ok } from '../utils/response.js';
import { env } from '../config/environment.js';

const router = Router();

router.post('/login', loginLimiter, loginValidator, validate, login);
router.post('/logout', logout);
router.get('/me', requireAdmin, (req, res) => ok(res, 'Admin loaded.', req.admin));

// /session — never returns 401. Returns admin data or null.
// Used by the frontend on initial page load to silently hydrate session.
router.get('/session', (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return ok(res, 'No session.', null);
    const decoded = jwt.verify(token, env.jwtSecret);
    return ok(res, 'Session valid.', decoded);
  } catch {
    return ok(res, 'Session expired.', null);
  }
});

export default router;
