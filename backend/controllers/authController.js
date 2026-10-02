import User from "../models/User.js";
import {
  ApiError,
  asyncHandler,
  isEmail,
  isNonEmptyString,
  sendAuthResponse,
} from "../utils/http.js";

// -----------------------------------------------------------------------
// Auth controller
//
//   POST   /api/auth/register         register()
//   POST   /api/auth/login            login()
//   POST   /api/auth/logout           logout()          (protected)
//   GET    /api/auth/me               getMe()           (protected)
//   PUT    /api/auth/me               updateMe()        (protected)
//   PUT    /api/auth/change-password  changePassword()  (protected)
//
// Every success that issues a token responds with { success, token, user }.
// -----------------------------------------------------------------------

const MIN_PASSWORD = 8;

/** Roles a visitor may pick on the public Register page. */
function selfServiceRoles() {
  const roles = ["student", "instructor"];
  if (process.env.ALLOW_ADMIN_SIGNUP === "true") roles.push("admin");
  return roles;
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = "student" } = req.body || {};

  const errors = {};
  if (!isNonEmptyString(name)) errors.name = "Name is required";
  if (!isEmail(email)) errors.email = "Please provide a valid email address";
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    errors.password = `Password must be at least ${MIN_PASSWORD} characters`;
  }
  if (!selfServiceRoles().includes(role))
    errors.role = `You can't register as "${role}"`;
  if (Object.keys(errors).length)
    throw new ApiError(400, Object.values(errors)[0], errors);

  const exists = await User.exists({ email: email.trim().toLowerCase() });
  if (exists)
    throw new ApiError(409, "An account with this email already exists.");

  const user = await User.create({
    name: name.trim(),
    email,
    password,
    role,
    lastLogin: new Date(),
  });
  sendAuthResponse(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!isEmail(email) || !isNonEmptyString(password)) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
    "+password",
  );
  // Same message for unknown email and wrong password, so the API doesn't
  // reveal which emails are registered.
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }
  if (!user.isActive) {
    throw new ApiError(
      403,
      "This account has been deactivated. Contact an administrator.",
    );
  }

  user.lastLogin = new Date();
  await user.save({ validateModifiedOnly: true });
  sendAuthResponse(res, user);
});

// JWTs are stateless: the client discards its token. This endpoint exists so
// the frontend has a single place to call (and a hook for future token
// blacklisting / refresh-token revocation).
export const logout = asyncHandler(async (_req, res) => {
  res.json({ success: true, message: "Logged out." });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name, email, bio } = req.body || {};
  if (req.body?.password || req.body?.role) {
    throw new ApiError(
      400,
      "Use /auth/change-password to change your password. Roles can only be changed by an admin.",
    );
  }

  const user = req.user;
  if (name !== undefined) {
    if (!isNonEmptyString(name))
      throw new ApiError(400, "Name cannot be empty.");
    user.name = name.trim();
  }
  if (email !== undefined) {
    if (!isEmail(email))
      throw new ApiError(400, "Please provide a valid email address.");
    const normalized = email.trim().toLowerCase();
    if (normalized !== user.email) {
      const taken = await User.exists({
        email: normalized,
        _id: { $ne: user._id },
      });
      if (taken)
        throw new ApiError(409, "An account with this email already exists.");
      user.email = normalized;
    }
  }
  if (bio !== undefined) user.bio = typeof bio === "string" ? bio : "";

  await user.save();
  res.json({ success: true, user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!isNonEmptyString(currentPassword) || typeof newPassword !== "string") {
    throw new ApiError(400, "Current and new password are required.");
  }
  if (newPassword.length < MIN_PASSWORD) {
    throw new ApiError(
      400,
      `New password must be at least ${MIN_PASSWORD} characters.`,
    );
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect.");
  }
  if (await user.matchPassword(newPassword)) {
    throw new ApiError(
      400,
      "New password must be different from the current one.",
    );
  }

  user.password = newPassword;
  await user.save();
  // Old tokens are now invalid (see protect middleware); hand back a fresh one.
  sendAuthResponse(res, user);
});
