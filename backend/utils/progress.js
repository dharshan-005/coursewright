import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";

export const calcProgress = async (studentId, courseId) => {
  const [total, completed] = await Promise.all([
    Lesson.countDocuments({ course: courseId }),
    Progress.countDocuments({
      student: studentId,
      course: courseId,
      completed: true,
    }),
  ]);
  return {
    completed,
    total,
    percent: total ? Math.round((completed / total) * 100) : 0,
  };
};
