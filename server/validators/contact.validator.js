import { body } from 'express-validator';

export const contactValidator = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
  body('phone').trim().isLength({ min: 8, max: 20 }).withMessage('Phone is required.'),
  body('message').trim().isLength({ min: 5, max: 1000 }).withMessage('Message must be between 5 and 1000 characters.')
];
