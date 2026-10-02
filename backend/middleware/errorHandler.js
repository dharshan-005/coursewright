import { ApiError } from '../utils/http.js';

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Converts every error into a consistent JSON shape:
//   { success: false, message, errors? }
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errors = err.details;

  // Mongoose schema validation
  if (err.name === 'ValidationError') {
    status = 400;
    errors = Object.fromEntries(Object.entries(err.errors).map(([field, e]) => [field, e.message]));
    message = Object.values(errors)[0] || 'Validation failed';
  }
  // Duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = field === 'email' ? 'An account with this email already exists.' : `Duplicate ${field}.`;
  }
  // Malformed ObjectId in a URL parameter
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}.`;
  }
  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body is not valid JSON.';
  }

  if (status >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === 'production') message = 'Internal server error';
  }

  res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });
}
