import { apiRequest, getToken } from "./client.js";

export async function getAssignments() {
  // /assignments/pending is protected and returns the logged-in student's
  // assignments from courses they are enrolled in.
  if (!getToken()) return [];

  const data = await apiRequest("/assignments/pending");

  return (data.assignments || []).map((assignment) => ({
    ...assignment,
    id: assignment.id || assignment._id,
    course:
      typeof assignment.course === "object"
        ? assignment.course?.title || ""
        : "",
    status: "pending",
  }));
}

export async function submitAssignment(assignmentId, payload = {}) {
  return apiRequest("/submissions", {
    method: "POST",
    body: { assignmentId, ...payload },
  });
}
