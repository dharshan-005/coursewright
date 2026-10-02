import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Progress from "../models/Progress.js";
import asyncHandler from "../utils/asyncHandler.js";
import { calcProgress } from "../utils/progress.js";

export const enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  if (!courseId)
    return res.status(400).json({ message: "courseId is required!" });

  if (!(await Course.exists({ _id: courseId }))) {
    return res.status(404).json({ message: "Course not found!" });
  }

  const existing = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
  });
  if (existing)
    return res
      .status(400)
      .json({ message: "Already enrolled in this course!" });

  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: courseId,
  });
  res.status(201).json({ message: "Enrolled successfully!", enrollment });
});

export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate("course")
    .sort({ createdAt: -1 });

  const data = await Promise.all(
    enrollments.map(async (e) => ({
      _id: e._id,
      enrolledAt: e.enrolledAt,
      course: e.course,
      progress: await calcProgress(req.user._id, e.course._id),
    })),
  );

  res.status(200).json({ count: data.length, enrollments: data });
});

export const getAllEnrollments = asyncHandler(async (req, res) => {
  let enrollments = await Enrollment.find()
    .populate("student", "name email")
    .populate("course", "title instructor")
    .sort({ createdAt: -1 });

  if (req.user.role !== "admin") {
    enrollments = enrollments.filter(
      (e) => e.course?.instructor?.toString() === req.user._id.toString(),
    );
  }

  res.status(200).json({ count: enrollments.length, enrollments });
});

export const unenroll = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOneAndDelete({
    student: req.user._id,
    course: req.params.courseId,
  });
  if (!enrollment)
    return res.status(404).json({ message: "Enrollment not found!" });

  await Progress.deleteMany({
    student: req.user._id,
    course: req.params.courseId,
  });
  res.status(200).json({ message: "Unenrolled successfully!" });
});
