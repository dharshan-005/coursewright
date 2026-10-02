import Assignment from "../models/Assignment.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Submission from "../models/Submission.js";
import asyncHandler from "../utils/asyncHandler.js";
import { canAccessCourse } from "../utils/access.js";
import { isCourseOwner } from "../utils/ownership.js";

export const getAssignments = asyncHandler(async (req, res) => {
  const { course } = req.query;
  if (!course)
    return res.status(400).json({ message: "course query param is required!" });

  if (!(await canAccessCourse(req.user, course))) {
    return res
      .status(403)
      .json({ message: "Enroll in this course to view its assignments." });
  }

  const assignments = await Assignment.find({ course }).sort({ dueDate: 1 });
  res.status(200).json({ count: assignments.length, assignments });
});

// Assignments in the student's enrolled courses that they haven't submitted yet
export const getPendingAssignments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).select(
    "course",
  );
  const submitted = await Submission.find({ student: req.user._id }).select(
    "assignment",
  );

  const assignments = await Assignment.find({
    course: { $in: enrollments.map((e) => e.course) },
    _id: { $nin: submitted.map((s) => s.assignment) },
  })
    .populate("course", "title")
    .sort({ dueDate: 1 });

  res.status(200).json({ count: assignments.length, assignments });
});

export const createAssignment = asyncHandler(async (req, res) => {
  const { course: courseId, title, description, dueDate } = req.body;
  if (!courseId || !title || !dueDate) {
    return res
      .status(400)
      .json({ message: "Course, title and due date are required!" });
  }

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: "Course not found!" });
  if (!isCourseOwner(req.user, course)) {
    return res
      .status(403)
      .json({ message: "You can only add assignments to your own courses." });
  }

  const assignment = await Assignment.create({
    course: courseId,
    title,
    description,
    dueDate,
  });
  res
    .status(201)
    .json({ message: "Assignment created successfully!", assignment });
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const { title, description, dueDate } = req.body;
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment)
    return res.status(404).json({ message: "Assignment not found!" });

  const course = await Course.findById(assignment.course);
  if (!course || !isCourseOwner(req.user, course)) {
    return res
      .status(403)
      .json({ message: "You can only edit assignments in your own courses." });
  }

  assignment.title = title ?? assignment.title;
  assignment.description = description ?? assignment.description;
  assignment.dueDate = dueDate ?? assignment.dueDate;

  const updated = await assignment.save();
  res
    .status(200)
    .json({ message: "Assignment updated successfully!", assignment: updated });
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment)
    return res.status(404).json({ message: "Assignment not found!" });

  const course = await Course.findById(assignment.course);
  if (!course || !isCourseOwner(req.user, course)) {
    return res
      .status(403)
      .json({
        message: "You can only delete assignments in your own courses.",
      });
  }

  await Submission.deleteMany({ assignment: assignment._id });
  await assignment.deleteOne();

  res.status(200).json({ message: "Assignment deleted successfully!" });
});
