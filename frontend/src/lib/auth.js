const TOKEN_KEY = "learnhub_token"
const USER_KEY = "learnhub_user"
const TOAST_KEY = "learnhub_toast"
const AUTH_EVENT = "learnhub-auth"

function notifyAuth() {
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export class AuthError extends Error {
  constructor(message, field) {
    super(message)
    this.field = field || ""
  }
}

export async function authRequest(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new AuthError(data.message || "Có lỗi xảy ra, vui lòng thử lại", data.field)
  }
  return data
}

export function saveAuth(data) {
  if (!data?.token || !data?.user) {
    throw new Error("Phản hồi đăng nhập không hợp lệ")
  }
  localStorage.setItem(TOKEN_KEY, data.token)
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.fullName || data.user.name || "",
      role: data.user.role || "USER",
    }),
  )
  notifyAuth()
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export async function authPost(path, body) {
  const token = getAuthToken()
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(body || {}),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new AuthError(data.message || "Có lỗi xảy ra, vui lòng thử lại", data.field)
  }
  return data
}

export async function authGet(path) {
  const token = getAuthToken()
  const response = await fetch(path, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new AuthError(data.message || "Có lỗi xảy ra, vui lòng thử lại", data.field)
  }
  return data
}

export async function authDelete(path) {
  const token = getAuthToken()
  const response = await fetch(path, {
    method: "DELETE",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  })
  if (response.status === 204 || response.ok) {
    return true
  }
  const data = await response.json().catch(() => ({}))
  throw new AuthError(data.message || "Có lỗi xảy ra, vui lòng thử lại", data.field)
}

export async function authForm(path, formData, method = "POST") {
  const token = getAuthToken()
  const response = await fetch(path, {
    method,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: formData,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new AuthError(data.message || "Có lỗi xảy ra, vui lòng thử lại", data.field)
  }
  return data
}

export function getAuthUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) {
    return null
  }
  try {
    const user = JSON.parse(raw)
    if (!user || !user.email) {
      return null
    }
    return {
      ...user,
      role: user.role || "USER",
    }
  } catch {
    return null
  }
}

export function updateAuthUser(partial) {
  const user = getAuthUser()
  if (!user) {
    return
  }
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      ...user,
      ...partial,
    }),
  )
  notifyAuth()
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  notifyAuth()
}

export function setPendingToast(type, message) {
  sessionStorage.setItem(TOAST_KEY, JSON.stringify({ type, message }))
}

export function consumePendingToast() {
  const raw = sessionStorage.getItem(TOAST_KEY)
  sessionStorage.removeItem(TOAST_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function onAuthChange(callback) {
  const handler = () => callback(getAuthUser())
  window.addEventListener(AUTH_EVENT, handler)
  window.addEventListener("storage", handler)
  return () => {
    window.removeEventListener(AUTH_EVENT, handler)
    window.removeEventListener("storage", handler)
  }
}
