export const ROLES = {
  ADMIN: "ADMIN",
  INSTRUCTOR: "INSTRUCTOR",
  USER: "USER",
}

export const PUBLIC_ROLES = [ROLES.USER, ROLES.INSTRUCTOR]

export const ROLE_LABELS = {
  ADMIN: "Quản trị",
  INSTRUCTOR: "Giảng viên",
  USER: "Học viên",
}

export function normalizeRole(role) {
  const value = String(role || "").trim().toUpperCase()
  return ROLE_LABELS[value] ? value : ROLES.USER
}

export function roleLabel(role) {
  return ROLE_LABELS[normalizeRole(role)]
}

export function isAdmin(user) {
  return normalizeRole(user?.role) === ROLES.ADMIN
}

export function isInstructor(user) {
  return normalizeRole(user?.role) === ROLES.INSTRUCTOR
}
