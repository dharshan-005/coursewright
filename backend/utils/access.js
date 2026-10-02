import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

export const canAccessCourse = async (user, courseId) => {
  if (user.role === "admin") return true;
  if (user.role === "instructor") {
    const owns = await Course.exists({ _id: courseId, instructor: user._id });
    if (owns) return true;
  }
  return !!(await Enrollment.exists({ student: user._id, course: courseId }));
};
