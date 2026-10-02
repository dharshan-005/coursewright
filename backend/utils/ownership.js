export const isCourseOwner = (user, course) => {
  if (user.role === "admin") return true;
  return course.instructor.toString() === user._id.toString();
};
