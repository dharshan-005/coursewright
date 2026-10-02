import Submission from "../models/Submission.js";
import Assignment from "../models/Assignment.js";
import Enrollment from "../models/Enrollment.js";
import asyncHandler from "../utils/asyncHandler.js";
import { isCourseOwner } from "../utils/ownership.js";

export const submitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId, content, fileUrl } = req.body;
  if (!assignmentId)
    return res.status(400).json({ message: "assignmentId is required!" });
  if (!content && !fileUrl) {
    return res.status(400).json({ message: "Provide content or a file URL!" });
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment)
    return res.status(404).json({ message: "Assignment not found!" });

  const enrolled = await Enrollment.exists({
    student: req.user._id,
    course: assignment.course,
  });
  if (!enrolled) {
    return res
      .status(403)
      .json({ message: "Enroll in this course to submit assignments." });
  }

  if (new Date() > assignment.dueDate) {
    return res
      .status(400)
      .json({ message: "The deadline for this assignment has passed." });
  }

  let submission = await Submission.findOne({
    assignment: assignmentId,
    student: req.user._id,
  });

  // Resubmitting before the deadline overwrites the earlier submission
  if (submission) {
    if (submission.status === "Graded") {
      return res
        .status(400)
        .json({ message: "Already graded, so it can't be resubmitted." });
    }
    submission.content = content ?? submission.content;
    submission.fileUrl = fileUrl ?? submission.fileUrl;
    submission.submittedAt = new Date();
    await submission.save();
    return res.status(200).json({ message: "Submission updated!", submission });
  }

  submission = await Submission.create({
    assignment: assignmentId,
    student: req.user._id,
    content,
    fileUrl,
  });
  res
    .status(201)
    .json({ message: "Assignment submitted successfully!", submission });
});

// Student: track own submission status
export const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ student: req.user._id })
    .populate({
      path: "assignment",
      select: "title dueDate course",
      populate: { path: "course", select: "title" },
    })
    .sort({ submittedAt: -1 });

  res.status(200).json({ count: submissions.length, submissions });
});

// Admin: list submissions, optionally for one assignment (?assignment=<id>)
export const getSubmissions = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.assignment) query.assignment = req.query.assignment;

  let submissions = await Submission.find(query)
    .populate("student", "name email")
    .populate({
      path: "assignment",
      select: "title dueDate course",
      populate: { path: "course", select: "title instructor" },
    })
    .sort({ submittedAt: -1 });

  if (req.user.role !== "admin") {
    submissions = submissions.filter(
      (s) =>
        s.assignment?.course?.instructor?.toString() ===
        req.user._id.toString(),
    );
  }

  res.status(200).json({ count: submissions.length, submissions });
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const { grade } = req.body;
  if (!grade) return res.status(400).json({ message: "Grade is required!" });

  const submission = await Submission.findById(req.params.id).populate({
    path: "assignment",
    populate: { path: "course" },
  });
  if (!submission)
    return res.status(404).json({ message: "Submission not found!" });

  if (!isCourseOwner(req.user, submission.assignment.course)) {
    return res
      .status(403)
      .json({
        message: "You can only grade submissions for your own courses.",
      });
  }

  submission.grade = grade;
  submission.status = "Graded";
  const updated = await submission.save();

  res.status(200).json({ message: "Submission graded!", submission: updated });
});
