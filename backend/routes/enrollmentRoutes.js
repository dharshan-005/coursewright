import express from "express";
import {
  enrollInCourse,
  getMyEnrollments,
  getAllEnrollments,
  unenroll,
} from "../controllers/enrollmentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", enrollInCourse);
router.get("/my", getMyEnrollments);
router.get("/", authorize("admin", "instructor"), getAllEnrollments);
router.delete("/:courseId", unenroll);

export default router;
