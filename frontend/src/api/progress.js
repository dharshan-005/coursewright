import { apiRequest, getToken } from "./client.js";

export async function getProgress(courseId) {
  if (!getToken()) {
    return { progress: 0, completedLessons: [] };
  }

  return apiRequest(`/progress/course/${encodeURIComponent(courseId)}`);
}

// The backend updates progress by lesson ID, with a completed boolean.
export async function updateProgress(lessonId, completed = true) {
  return apiRequest(`/progress/lessons/${encodeURIComponent(lessonId)}`, {
    method: "PATCH",
    body: { completed },
  });
}
