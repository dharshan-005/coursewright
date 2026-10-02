import { apiRequest, getToken } from "./client.js";

function toFrontendCourse(course) {
  return {
    ...course,
    id: course.id || course._id,
    instructor:
      typeof course.instructor === "object"
        ? course.instructor?.name || "Instructor"
        : "Instructor",
    thumbnail: course.thumbnail || "",
    color: "#1f6f54",
    level: course.level || "All levels",
    duration: course.duration || "Self-paced",
    rating: course.rating ?? 0,
    students: course.students ?? 0,
    progress: course.progress ?? 0,
    syllabus: course.syllabus || [],
  };
}

export async function getCourses() {
  const data = await apiRequest("/courses", { auth: false });
  return (data.courses || []).map(toFrontendCourse);
}

export async function enrollInCourse(courseId) {
  return apiRequest("/enrollments", {
    method: "POST",
    body: { courseId },
  });
}

export async function getMyEnrollments() {
  if (!getToken()) return [];

  const data = await apiRequest("/enrollments/my");
  return data.enrollments || [];
}
