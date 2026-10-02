import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  logout,
  getMe,
  updateMe,
  changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Slow down brute-force attempts on the credential endpoints.
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT || 20),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

router.post("/register", credentialLimiter, register);
router.post("/login", credentialLimiter, login);

router.post("/logout", protect, logout);
router.route("/me").get(protect, getMe).put(protect, updateMe);
router.put("/change-password", protect, credentialLimiter, changePassword);

export default router;
