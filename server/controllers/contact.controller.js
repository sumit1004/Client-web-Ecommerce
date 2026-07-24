import { saveContactMessage, getContactMessages, updateContactStatus, deleteContactMessage } from '../services/contact.service.js';
import { created, ok } from '../utils/response.js';

export async function createContactMessage(req, res, next) {
  try {
    created(res, 'Message received.', await saveContactMessage(req.body));
  } catch (error) {
    next(error);
  }
}

export async function listContactMessages(req, res, next) {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const data = await getContactMessages(page, limit, status);
    ok(res, 'Contact messages loaded', data);
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['new', 'read', 'resolved'].includes(status)) {
      const error = new Error('Invalid status');
      error.status = 400;
      throw error;
    }

    await updateContactStatus(id, status);
    ok(res, 'Status updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function removeContact(req, res, next) {
  try {
    const { id } = req.params;
    await deleteContactMessage(id);
    ok(res, 'Message deleted successfully');
  } catch (error) {
    next(error);
  }
}
