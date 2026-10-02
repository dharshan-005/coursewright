import express from "express";
import {
  getAssignments,
  getPendingAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignmentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/pending", getPendingAssignments);
router.get("/", getAssignments);
router.post("/", authorize("admin", "instructor"), createAssignment);
router.put("/:id", authorize("admin", "instructor"), updateAssignment);
router.delete("/:id", authorize("admin", "instructor"), deleteAssignment);

export default router;
