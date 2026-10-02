import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";
import Progress from "../models/Progress.js";
import asyncHandler from "../utils/asyncHandler.js";
import { canAccessCourse } from "../utils/access.js";
import { isCourseOwner } from "../utils/ownership.js";

export const getLessons = asyncHandler(async (req, res) => {
  const { course } = req.query;
  if (!course)
    return res.status(400).json({ message: "course query param is required!" });

  if (!(await canAccessCourse(req.user, course))) {
    return res
      .status(403)
      .json({ message: "Enroll in this course to access its lessons." });
  }

  const lessons = await Lesson.find({ course }).sort({
    order: 1,
    createdAt: 1,
  });
  res.status(200).json({ count: lessons.length, lessons });
});

export const getLessonById = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ message: "Lesson not found!" });

  if (!(await canAccessCourse(req.user, lesson.course))) {
    return res
      .status(403)
      .json({ message: "Enroll in this course to access its lessons." });
  }

  res.status(200).json({ lesson });
});

export const createLesson = asyncHandler(async (req, res) => {
  const { course: courseId, title, content, videoUrl, order } = req.body;
  if (!courseId || !title) {
    return res.status(400).json({ message: "Course and title are required!" });
  }

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: "Course not found!" });
  if (!isCourseOwner(req.user, course)) {
    return res
      .status(403)
      .json({ message: "You can only add lessons to your own courses." });
  }

  const lesson = await Lesson.create({
    course: courseId,
    title,
    content,
    videoUrl,
    order,
  });
  res.status(201).json({ message: "Lesson created successfully!", lesson });
});

export const updateLesson = asyncHandler(async (req, res) => {
  const { title, content, videoUrl, order } = req.body;
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ message: "Lesson not found!" });

  const course = await Course.findById(lesson.course);
  if (!course || !isCourseOwner(req.user, course)) {
    return res
      .status(403)
      .json({ message: "You can only edit lessons in your own courses." });
  }

  lesson.title = title ?? lesson.title;
  lesson.content = content ?? lesson.content;
  lesson.videoUrl = videoUrl ?? lesson.videoUrl;
  lesson.order = order ?? lesson.order;

  const updated = await lesson.save();
  res
    .status(200)
    .json({ message: "Lesson updated successfully!", lesson: updated });
});

export const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ message: "Lesson not found!" });

  const course = await Course.findById(lesson.course);
  if (!course || !isCourseOwner(req.user, course)) {
    return res
      .status(403)
      .json({ message: "You can only delete lessons in your own courses." });
  }

  await Progress.deleteMany({ lesson: lesson._id });
  await lesson.deleteOne();

  res.status(200).json({ message: "Lesson deleted successfully!" });
});
