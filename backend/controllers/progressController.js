import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";
import asyncHandler from "../utils/asyncHandler.js";
import { canAccessCourse } from "../utils/access.js";
import { calcProgress } from "../utils/progress.js";

// Body: { completed: true | false } (defaults to true, so it can also un-mark)
export const markLessonComplete = asyncHandler(async (req, res) => {
  const completed = req.body.completed !== false;

  const lesson = await Lesson.findById(req.params.lessonId);
  if (!lesson) return res.status(404).json({ message: "Lesson not found!" });

  if (!(await canAccessCourse(req.user, lesson.course))) {
    return res.status(403).json({ message: "Enroll in this course first." });
  }

  const progress = await Progress.findOneAndUpdate(
    { student: req.user._id, lesson: lesson._id },
    {
      student: req.user._id,
      course: lesson.course,
      lesson: lesson._id,
      completed,
      completedAt: completed ? new Date() : null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const courseProgress = await calcProgress(req.user._id, lesson.course);
  res.status(200).json({
    message: completed
      ? "Lesson marked as completed!"
      : "Lesson marked as incomplete.",
    progress,
    courseProgress,
  });
});

export const getCourseProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const [courseProgress, done] = await Promise.all([
    calcProgress(req.user._id, courseId),
    Progress.find({
      student: req.user._id,
      course: courseId,
      completed: true,
    }).select("lesson"),
  ]);

  res.status(200).json({
    progress: courseProgress,
    completedLessons: done.map((p) => p.lesson),
  });
});
