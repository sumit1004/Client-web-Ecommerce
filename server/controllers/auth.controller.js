import { loginAdmin } from '../services/auth.service.js';
import { env } from '../config/environment.js';
import { ok } from '../utils/response.js';

export async function login(req, res, next) {
  try {
    const result = await loginAdmin(req.body.email, req.body.password);
    if (!result) {
      const error = new Error('Invalid email or password.');
      error.status = 401;
      throw error;
    }
    res.cookie('token', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.nodeEnv === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    ok(res, 'Login successful.', result.admin);
  } catch (error) {
    next(error);
  }
}

export function logout(_req, res) {
  res.clearCookie('token');
  ok(res, 'Logged out.');
}
