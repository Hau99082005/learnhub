import { lazy, Suspense, useEffect } from "react"
import { toast } from "sonner"
import Header from "@/components/Layout/Header"
import Footer from "@/components/Layout/footer"
import Banner from "@/components/Banner"
import Category from "@/components/Category"
import CategoryPage from "@/category/page"
import Instructors from "@/components/Instructors"
import About from "@/components/About"
import LoginPage from "@/login/page"
import RegisterPage from "@/Register/page"
import { Toaster } from "@/components/ui/sonner"
import { consumePendingToast } from "@/lib/auth"

const AdminPage = lazy(() => import("@/admin/page"))

function App() {
  const path = window.location.pathname
  const isLogin = path === "/dang-nhap"
  const isRegister = path === "/dang-ky"
  const isAdminPage =
    path === "/quan-tri" ||
    path.startsWith("/quan-tri/") ||
    path === "/admin" ||
    path.startsWith("/admin/")

  useEffect(() => {
    const pending = consumePendingToast()
    if (!pending?.message) {
      return
    }
    if (pending.type === "error") {
      toast.error(pending.message)
      return
    }
    toast.success(pending.message)
  }, [])

  if (isAdminPage) {
    return (
      <>
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <AdminPage />
        </Suspense>
        <Toaster position="top-center" richColors />
      </>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      {isLogin ? (
        <LoginPage />
      ) : isRegister ? (
        <RegisterPage />
      ) : (
        <main className="flex-1">
          {path === "/" ? (
            <>
              <Banner />
              <Category />
            </>
          ) : path === "/gioi-thieu" ? (
            <About />
          ) : path === "/giang-day" ? (
            <Instructors />
          ) : path.startsWith("/danh-muc/") && path.split("/").filter(Boolean)[1] ? (
            <CategoryPage slug={decodeURIComponent(path.split("/").filter(Boolean)[1])} />
          ) : null}
        </main>
      )}
      <Footer />
      <Toaster position="top-center" richColors />
    </div>
  )
}

export default App
