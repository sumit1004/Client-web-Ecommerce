import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';

export function requireAdmin(req, _res, next) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    const error = new Error('Authentication required.');
    error.status = 401;
    return next(error);
  }
  try {
    req.admin = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    const error = new Error('Invalid session.');
    error.status = 401;
    return next(error);
  }
}
