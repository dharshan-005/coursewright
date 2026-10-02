import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/http.js';

// -----------------------------------------------------------------------
// protect — requires a valid "Authorization: Bearer <token>" header.
// Loads the user from the database on every request so that a deleted,
// deactivated, or password-changed account is locked out immediately,
// even if its old token hasn't expired yet. Sets req.user.
// -----------------------------------------------------------------------
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Not authenticated. Please log in.');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid token. Please log in again.';
    throw new ApiError(401, message);
  }

  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'This account no longer exists.');
  if (!user.isActive) throw new ApiError(403, 'This account has been deactivated. Contact an administrator.');
  if (user.changedPasswordAfter(payload.iat)) {
    throw new ApiError(401, 'Password was changed recently. Please log in again.');
  }

  req.user = user;
  next();
});

// -----------------------------------------------------------------------
// authorize('admin', ...) — role-based access. Use after protect.
// -----------------------------------------------------------------------
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };
