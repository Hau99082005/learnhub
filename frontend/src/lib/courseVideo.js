import { authForm, authGet, authPost, getAuthToken } from "@/lib/auth"

const CHUNK_SIZE = 8 * 1024 * 1024
const CHUNK_CONCURRENCY = 2
const POLL_MS = 1500
const MAX_WAIT_MS = 20 * 60 * 1000

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function retry(task, times = 3) {
  let last
  for (let attempt = 0; attempt < times; attempt += 1) {
    try {
      return await task()
    } catch (error) {
      last = error
      await sleep(400 * (attempt + 1))
    }
  }
  throw last
}

async function waitForReady(videoBase, sessionId, first, onProgress) {
  let current = first
  const started = Date.now()
  while (!current?.previewVideo && current?.status !== "FAILED") {
    if (Date.now() - started > MAX_WAIT_MS) {
      throw new Error("Máy chủ đang xử lý video quá lâu. Hãy dùng file MP4 H.264 hoặc file nhỏ hơn")
    }
    if (onProgress) {
      const elapsed = Date.now() - started
      onProgress(Math.min(99, 90 + Math.floor((elapsed / 120000) * 9)))
    }
    await sleep(POLL_MS)
    current = await authGet(`${videoBase}/${sessionId}/status`)
  }
  if (current?.status === "FAILED" || !current?.previewVideo) {
    throw new Error(current?.message || "Không thể xử lý video")
  }
  return current
}

async function uploadChunks(file, videoBase, sessionId, totalChunks, onProgress) {
  let next = 0
  let done = 0
  const workers = Array.from(
    { length: Math.min(CHUNK_CONCURRENCY, totalChunks) },
    async () => {
      while (next < totalChunks) {
        const index = next
        next += 1
        const blob = file.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE)
        const payload = new FormData()
        payload.append("chunk", blob, `${file.name}.part${index}`)
        await retry(() =>
          authForm(`${videoBase}/${sessionId}/chunks/${index}`, payload, "PUT"),
        )
        done += 1
        if (onProgress) {
          onProgress(Math.round((done / totalChunks) * 90))
        }
      }
    },
  )
  await Promise.all(workers)
}

export async function uploadCourseVideo(
  file,
  onProgress,
  videoBase = "/api/admin/courses/videos",
) {
  if (!file) {
    throw new Error("Vui lòng chọn video")
  }
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE))
  const session = await authPost(videoBase, {
    filename: file.name,
    size: file.size,
    contentType: file.type || "video/mp4",
    totalChunks,
  })
  let finishing = false
  try {
    await uploadChunks(file, videoBase, session.sessionId, totalChunks, onProgress)
    finishing = true
    if (onProgress) {
      onProgress(90)
    }
    const started = await authPost(`${videoBase}/${session.sessionId}/complete`, {})
    const ready = await waitForReady(videoBase, session.sessionId, started, onProgress)
    if (onProgress) {
      onProgress(100)
    }
    return ready
  } catch (error) {
    if (!finishing) {
      const token = getAuthToken()
      fetch(`${videoBase}/${session.sessionId}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      }).catch(() => {})
    }
    throw error
  }
}
