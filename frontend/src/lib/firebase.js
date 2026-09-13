import { initializeApp, getApps } from "firebase/app"
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth"

async function loadApp() {
  if (getApps().length) {
    return getApps()[0]
  }
  const response = await fetch("/api/auth/firebase-config")
  const config = await response.json().catch(() => ({}))
  if (!response.ok || !config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    throw new Error("Chưa cấu hình Firebase")
  }
  return initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    measurementId: config.measurementId,
  })
}

export async function signInWithGoogle() {
  const auth = getAuth(await loadApp())
  const provider = new GoogleAuthProvider()
  provider.addScope("email")
  provider.addScope("profile")
  provider.setCustomParameters({ prompt: "select_account" })
  try {
    const result = await signInWithPopup(auth, provider)
    return result.user.getIdToken()
  } catch (error) {
    if (error?.code === "auth/popup-closed-by-user" || error?.code === "auth/cancelled-popup-request") {
      throw new Error("Đã đóng cửa sổ đăng nhập Google")
    }
    if (error?.code === "auth/unauthorized-domain") {
      throw new Error("Tên miền chưa được phép trên Firebase")
    }
    throw new Error(error?.message || "Đăng nhập Google thất bại")
  }
}
