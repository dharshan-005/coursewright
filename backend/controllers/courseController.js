import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Progress from "../models/Progress.js";
import asyncHandler from "../utils/asyncHandler.js";
import { isCourseOwner } from "../utils/ownership.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getCourses = asyncHandler(async (req, res) => {
  const { search, category } = req.query;
  const query = {};

  if (search) {
    const regex = { $regex: escapeRegex(search), $options: "i" };
    query.$or = [{ title: regex }, { description: regex }];
  }
  if (category) query.category = category;

  const courses = await Course.find(query)
    .populate("instructor", "name")
    .sort({ createdAt: -1 });

  res.status(200).json({ count: courses.length, courses });
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Course.distinct("category");
  res.status(200).json({ categories });
});

export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate(
    "instructor",
    "name",
  );
  if (!course) return res.status(404).json({ message: "Course not found!" });

  const lessonCount = await Lesson.countDocuments({ course: course._id });
  res.status(200).json({ course, lessonCount });
});
export const getMyCourses = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { instructor: req.user._id };
  const courses = await Course.find(filter)
    .populate("instructor", "name")
    .sort({ createdAt: -1 });
  res.status(200).json({ count: courses.length, courses });
});

export const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, thumbnail, instructorId } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required!" });

  // Admins may assign a course to a specific instructor; instructors always own what they create.
  const instructor =
    req.user.role === "admin" && instructorId ? instructorId : req.user._id;

  const course = await Course.create({
    title,
    description,
    category,
    thumbnail,
    instructor,
  });
  res.status(201).json({ message: "Course created successfully!", course });
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { title, description, category, thumbnail } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found!" });

  if (!isCourseOwner(req.user, course)) {
    return res
      .status(403)
      .json({ message: "You can only edit your own courses." });
  }

  course.title = title ?? course.title;
  course.description = description ?? course.description;
  course.category = category ?? course.category;
  course.thumbnail = thumbnail ?? course.thumbnail;

  const updated = await course.save();
  res
    .status(200)
    .json({ message: "Course updated successfully!", course: updated });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found!" });

  if (!isCourseOwner(req.user, course)) {
    return res
      .status(403)
      .json({ message: "You can only delete your own courses." });
  }

  const assignments = await Assignment.find({ course: course._id }).select(
    "_id",
  );
  await Submission.deleteMany({
    assignment: { $in: assignments.map((a) => a._id) },
  });

  await Promise.all([
    Lesson.deleteMany({ course: course._id }),
    Assignment.deleteMany({ course: course._id }),
    Enrollment.deleteMany({ course: course._id }),
    Progress.deleteMany({ course: course._id }),
  ]);
  await course.deleteOne();

  res.status(200).json({ message: "Course deleted successfully!" });
});
