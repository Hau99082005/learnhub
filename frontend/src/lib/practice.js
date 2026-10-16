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

export function listPracticeHistory() {
  return authGet("/api/practice/history");
}

export function formatPracticeAt(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
