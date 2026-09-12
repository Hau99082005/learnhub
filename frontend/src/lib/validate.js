const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function blank(value) {
  return !String(value ?? "").trim()
}

export function validateLogin(values) {
  const errors = {}
  const email = String(values.email ?? "").trim()
  const password = String(values.password ?? "")

  if (blank(email)) {
    errors.email = "Vui lòng nhập email"
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Email không hợp lệ"
  }

  if (blank(password)) {
    errors.password = "Vui lòng nhập mật khẩu"
  }

  return errors
}

export function validateRegister(values) {
  const errors = {}
  const name = String(values.name ?? "").trim()
  const email = String(values.email ?? "").trim()
  const password = String(values.password ?? "")
  const confirmPassword = String(values.confirmPassword ?? "")
  const role = String(values.role ?? "").trim().toUpperCase()

  if (blank(name)) {
    errors.name = "Vui lòng nhập họ và tên"
  }

  if (blank(email)) {
    errors.email = "Vui lòng nhập email"
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Email không hợp lệ"
  }

  if (blank(password)) {
    errors.password = "Vui lòng nhập mật khẩu"
  } else if (password.length < 8) {
    errors.password = "Mật khẩu phải có ít nhất 8 ký tự"
  }

  if (blank(confirmPassword)) {
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu"
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Xác nhận mật khẩu không khớp"
  }

  if (role !== "USER" && role !== "INSTRUCTOR") {
    errors.role = "Vui lòng chọn vai trò"
  }

  if (!values.agree) {
    errors.agree = "Bạn cần đồng ý với điều khoản và chính sách bảo mật"
  }

  return errors
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean)
}
