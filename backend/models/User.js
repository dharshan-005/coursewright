import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// -----------------------------------------------------------------------
// User model (Auth model)
//
// One collection for every account on the platform. The `role` field
// drives authorization on both the API (middleware/auth.js → authorize())
// and the frontend route guards.
//
// Passwords are hashed with bcrypt in a pre-save hook and are never
// returned from queries unless explicitly requested with .select('+password').
// -----------------------------------------------------------------------

export const ROLES = ["student", "instructor", "admin"];
const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name must be at most 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ROLES,
        message: "Role must be student, instructor or admin",
      },
      default: "student",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio must be at most 500 characters"],
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    passwordChangedAt: Date,
  },
  { timestamps: true },
);

// Hash the password whenever it is set or changed.
userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  if (!this.isNew) {
    // Back-date by 1s so a token issued right after the change is still valid.
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
});

/** Compare a plain-text password with the stored hash. */
userSchema.methods.matchPassword = function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

/** True if the password was changed after the given JWT "issued at" (seconds). */
userSchema.methods.changedPasswordAfter = function changedPasswordAfter(
  jwtIat,
) {
  if (!this.passwordChangedAt) return false;
  return Math.floor(this.passwordChangedAt.getTime() / 1000) > jwtIat;
};

userSchema.virtual("avatarInitials").get(function avatarInitials() {
  return (
    (this.name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
});

// Shape the JSON the frontend receives: `id` instead of `_id`, a `joined`
// date string (what the existing UI already renders), and no secrets.
userSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    ret.joined = ret.createdAt
      ? new Date(ret.createdAt).toISOString().slice(0, 10)
      : undefined;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.passwordChangedAt;
    return ret;
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
