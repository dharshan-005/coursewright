import express from "express";
import {
  getCourses,
  getCategories,
  getMyCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/categories", getCategories);
router.get("/mine", protect, authorize("admin", "instructor"), getMyCourses);
router.get("/:id", getCourseById);
router.post("/", protect, authorize("admin", "instructor"), createCourse);
router.put("/:id", protect, authorize("admin", "instructor"), updateCourse);
router.delete("/:id", protect, authorize("admin", "instructor"), deleteCourse);

export default router;
