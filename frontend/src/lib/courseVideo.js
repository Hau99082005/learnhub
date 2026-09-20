import { authForm, authPost, getAuthToken } from "@/lib/auth";

const CHUNK_SIZE = 8 * 1024 * 1024;

export async function uploadCourseVideo(file, onProgress) {
  if (!file) {
    throw new Error("Vui lòng chọn video");
  }
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
  const session = await authPost("/api/admin/courses/videos", {
    filename: file.name,
    size: file.size,
    contentType: file.type || "video/mp4",
    totalChunks,
  });
  try {
    for (let index = 0; index < totalChunks; index += 1) {
      const blob = file.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE);
      const payload = new FormData();
      payload.append("chunk", blob, `${file.name}.part${index}`);
      await authForm(
        `/api/admin/courses/videos/${session.sessionId}/chunks/${index}`,
        payload,
        "PUT",
      );
      if (onProgress) {
        onProgress(Math.round(((index + 1) / totalChunks) * 90));
      }
    }
    const ready = await authPost(
      `/api/admin/courses/videos/${session.sessionId}/complete`,
      {},
    );
    if (onProgress) {
      onProgress(100);
    }
    return ready;
  } catch (error) {
    const token = getAuthToken();
    fetch(`/api/admin/courses/videos/${session.sessionId}`, {
      method: "DELETE",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    }).catch(() => {});
    throw error;
  }
}
