import { authGet, authPost, getAuthToken } from "@/lib/auth"

const CHUNK_SIZE = 8 * 1024 * 1024
const CHUNK_CONCURRENCY = 2
const CHUNK_TIMEOUT_MS = 3 * 60 * 1000
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

function putChunk(url, formData, onUploadProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)
    const token = getAuthToken()
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    }
    xhr.timeout = CHUNK_TIMEOUT_MS
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onUploadProgress) {
        onUploadProgress(event.loaded / event.total)
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }
      let message = "Không thể tải mảnh video"
      try {
        const data = JSON.parse(xhr.responseText)
        message = data.message || data.detail || data.error || message
      } catch {
        if (xhr.status === 413) {
          message = "File quá lớn. Hãy chọn video nhỏ hơn 512MB"
        } else if (xhr.status >= 500) {
          message = "Máy chủ không lưu được video. Kiểm tra dung lượng ổ đĩa rồi thử lại"
        }
      }
      reject(new Error(message))
    }
    xhr.onerror = () => reject(new Error("Mất kết nối khi tải video"))
    xhr.ontimeout = () =>
      reject(new Error("Tải video bị đứng quá lâu. Thử lại hoặc kiểm tra dung lượng máy chủ"))
    xhr.send(formData)
  })
}

async function uploadChunks(file, videoBase, sessionId, totalChunks, onProgress) {
  let next = 0
  let done = 0
  const inflight = new Map()
  const report = () => {
    if (!onProgress) {
      return
    }
    let loaded = done
    inflight.forEach((part) => {
      loaded += part
    })
    onProgress(Math.min(90, Math.round((loaded / totalChunks) * 90)))
  }
  const workers = Array.from(
    { length: Math.min(CHUNK_CONCURRENCY, totalChunks) },
    async () => {
      while (next < totalChunks) {
        const index = next
        next += 1
        const blob = file.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE)
        const payload = new FormData()
        payload.append("chunk", blob, `${file.name}.part${index}`)
        inflight.set(index, 0)
        await retry(() =>
          putChunk(`${videoBase}/${sessionId}/chunks/${index}`, payload, (part) => {
            inflight.set(index, part)
            report()
          }),
        )
        inflight.delete(index)
        done += 1
        report()
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
