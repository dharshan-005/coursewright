import express from "express";
import {
  submitAssignment,
  getMySubmissions,
  getSubmissions,
  gradeSubmission,
} from "../controllers/submissionController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", submitAssignment);
router.get("/my", getMySubmissions);
router.get("/", authorize("admin", "instructor"), getSubmissions);
router.patch("/:id/grade", authorize("admin", "instructor"), gradeSubmission);

export default router;
