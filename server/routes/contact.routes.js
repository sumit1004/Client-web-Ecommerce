import { Router } from 'express';
import { createContactMessage } from '../controllers/contact.controller.js';
import { validate } from '../middleware/validate.js';
import { contactValidator } from '../validators/contact.validator.js';

const router = Router();

router.post('/', contactValidator, validate, createContactMessage);

export default router;
