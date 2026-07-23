export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Something went wrong. Please try again.' : error.message,
    errors: error.errors || []
  });
}
