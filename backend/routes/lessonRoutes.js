import express from "express";
import {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getLessons);
router.get("/:id", getLessonById);
router.post("/", authorize("admin", "instructor"), createLesson);
router.put("/:id", authorize("admin", "instructor"), updateLesson);
router.delete("/:id", authorize("admin", "instructor"), deleteLesson);

export default router;
