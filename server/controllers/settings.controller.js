import { env } from '../config/environment.js';
import { ok } from '../utils/response.js';

export function getSettings(_req, res) {
  ok(res, 'Settings loaded.', {
    businessName: '1964 Fashion Store',
    whatsapp: env.whatsappNumber,
    theme: { primary: '#111111', accent: '#C89B3C' }
  });
}
