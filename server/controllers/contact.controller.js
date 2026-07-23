import { saveContactMessage } from '../services/contact.service.js';
import { created } from '../utils/response.js';

export async function createContactMessage(req, res, next) {
  try {
    created(res, 'Message received.', await saveContactMessage(req.body));
  } catch (error) {
    next(error);
  }
}
