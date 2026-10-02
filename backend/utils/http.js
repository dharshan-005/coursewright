import jwt from 'jsonwebtoken';

/** An error with an HTTP status code, turned into a JSON response by errorHandler. */
export class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    if (details) this.details = details;
  }
}

/** Wraps an async route handler so rejected promises reach the error handler. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Signs a JWT for the given user. */
export function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/** Standard auth success payload: { token, user }. */
export function sendAuthResponse(res, user, statusCode = 200) {
  res.status(statusCode).json({ success: true, token: signToken(user), user });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmail = (value) => typeof value === 'string' && EMAIL_RE.test(value.trim());
export const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
export const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
