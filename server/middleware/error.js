export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  res.status(status).json({
    success: false,
    message: error.message || 'Something went wrong. Please try again.',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    errors: error.errors || []
  });
}
