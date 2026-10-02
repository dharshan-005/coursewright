import User, { ROLES } from "../models/User.js";
import {
  ApiError,
  asyncHandler,
  escapeRegex,
  isEmail,
  isNonEmptyString,
} from "../utils/http.js";

// -----------------------------------------------------------------------
// User management (admin only) — backs the Admin "Manage Users" page.
//
//   GET    /api/users          listUsers()   ?search=&role=
//   POST   /api/users          createUser()
//   GET    /api/users/:id      getUser()
//   PUT    /api/users/:id      updateUser()
//   DELETE /api/users/:id      deleteUser()
// -----------------------------------------------------------------------

export const listUsers = asyncHandler(async (req, res) => {
  const { search, role } = req.query;
  const filter = {};
  if (role && ROLES.includes(role)) filter.role = role;
  if (typeof search === "string" && search.trim()) {
    const re = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ name: re }, { email: re }];
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ success: true, user });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = "student" } = req.body || {};
  if (!isNonEmptyString(name)) throw new ApiError(400, "Name is required.");
  if (!isEmail(email))
    throw new ApiError(400, "Please provide a valid email address.");
  if (typeof password !== "string" || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters.");
  }
  if (!ROLES.includes(role)) throw new ApiError(400, "Invalid role.");

  const user = await User.create({ name: name.trim(), email, password, role });
  res.status(201).json({ success: true, user });
});

/** Throws if the change would leave the platform with no active admin. */
async function assertNotLastAdmin(target) {
  if (target.role !== "admin" || !target.isActive) return;
  const otherAdmins = await User.countDocuments({
    role: "admin",
    isActive: true,
    _id: { $ne: target._id },
  });
  if (otherAdmins === 0)
    throw new ApiError(400, "You cannot remove the last active admin.");
}

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");

  const { name, email, role, isActive, password } = req.body || {};
  const isSelf = user._id.equals(req.user._id);

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
  if (role !== undefined && role !== user.role) {
    if (!ROLES.includes(role)) throw new ApiError(400, "Invalid role.");
    if (isSelf) throw new ApiError(400, "You cannot change your own role.");
    await assertNotLastAdmin(user);
    user.role = role;
  }
  if (isActive !== undefined && Boolean(isActive) !== user.isActive) {
    if (isSelf)
      throw new ApiError(400, "You cannot deactivate your own account.");
    if (!isActive) await assertNotLastAdmin(user);
    user.isActive = Boolean(isActive);
  }
  if (password !== undefined && password !== "") {
    if (typeof password !== "string" || password.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters.");
    }
    user.password = password; // re-hashed by the model; invalidates the user's sessions
  }

  await user.save();
  res.json({ success: true, user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");
  if (user._id.equals(req.user._id))
    throw new ApiError(400, "You cannot delete your own account.");
  await assertNotLastAdmin(user);

  await user.deleteOne();
  res.json({ success: true, message: "User deleted.", id: req.params.id });
});
