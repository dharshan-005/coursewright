import express from "express";
import {
  markLessonComplete,
  getCourseProgress,
} from "../controllers/progressController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.patch("/lessons/:lessonId", markLessonComplete);
router.get("/course/:courseId", getCourseProgress);

export default router;
