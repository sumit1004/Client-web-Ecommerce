import { validationResult } from 'express-validator';

export function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const error = new Error('Validation failed.');
  error.status = 422;
  error.errors = result.array().map((item) => ({ field: item.path, message: item.msg }));
  return next(error);
}
