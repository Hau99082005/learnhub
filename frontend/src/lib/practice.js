import { authGet, authPost } from "@/lib/auth";

export function listPractice() {
  return authGet("/api/practice");
}

export function getPracticeQuiz(slug) {
  return authGet(`/api/practice/${encodeURIComponent(slug)}`);
}

export function submitPractice(slug, answers) {
  return authPost(`/api/practice/${encodeURIComponent(slug)}/submit`, { answers });
}
