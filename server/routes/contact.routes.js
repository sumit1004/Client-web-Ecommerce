import { Router } from 'express';
import { createContactMessage, listContactMessages, updateStatus, removeContact } from '../controllers/contact.controller.js';
import { validate } from '../middleware/validate.js';
import { contactValidator } from '../validators/contact.validator.js';
import { requireAdmin, requireRole } from '../middleware/auth.js';

const router = Router();

// Public route for frontend website
router.post('/', contactValidator, validate, createContactMessage);

// Admin routes
router.use(requireAdmin);
router.get('/', listContactMessages);
router.patch('/:id/status', updateStatus);
router.delete('/:id', requireRole(['superadmin', 'manager']), removeContact);

export default router;
