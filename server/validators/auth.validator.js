import { body } from 'express-validator';

export const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
];
