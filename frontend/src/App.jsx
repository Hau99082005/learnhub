import { lazy, Suspense, useEffect } from "react"
import { toast } from "sonner"
import Header from "@/components/Layout/Header"
import Footer from "@/components/Layout/footer"
import Banner from "@/components/Banner"
import Category from "@/components/Category"
import Course from "@/components/Course"
import HomeBlogs from "@/components/HomeBlogs"
import CoursePage from "@/course/page"
import CategoryPage from "@/category/page"
import Instructors from "@/components/Instructors"
import TeachStart from "@/components/TeachStart"
import InstructorPage from "@/instructor/page"
import About from "@/components/About"
import NewsPage from "@/news/page"
import LoginPage from "@/login/page"
import RegisterPage from "@/Register/page"
import CartPage from "@/cart/page"
import CheckoutPage from "@/checkout/page"
import PurchaseHistoryPage from "@/purchases/page"
import SettingsPage from "@/settings/page"
import LearningPage from "@/learning/page"
import CoursePlayerPage from "@/learn/page"
import NotificationsPage from "@/notifications/page"
import { Toaster } from "@/components/ui/sonner"
import { consumePendingToast, onAuthChange } from "@/lib/auth"
import { hydrateOwned } from "@/lib/courseAccess"
import { loadInbox } from "@/lib/inbox"
import { loadWishlist } from "@/lib/wishlist"

const AdminPage = lazy(() => import("@/admin/page"))

function App() {
  const path = window.location.pathname
  const isLogin = path === "/dang-nhap"
  const isRegister = path === "/dang-ky"
  const isTeachStart = path === "/giang-day/bat-dau"
  const isInstructorStudio =
    path === "/giang-day/quan-tri" || path.startsWith("/giang-day/quan-tri/")
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

  useEffect(() => {
    hydrateOwned()
    loadWishlist()
    loadInbox()
    return onAuthChange(() => {
      hydrateOwned()
      loadWishlist()
      loadInbox()
    })
  }, [])

  if (isTeachStart) {
    return (
      <>
        <TeachStart />
        <Toaster position="top-center" richColors />
      </>
    )
  }

  if (isInstructorStudio) {
    return (
      <>
        <InstructorPage />
        <Toaster position="top-center" richColors />
      </>
    )
  }

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

  const playerSlug = path.startsWith("/hoc/")
    ? decodeURIComponent(path.split("/").filter(Boolean)[1] || "")
    : ""
  if (playerSlug) {
    return (
      <>
        <CoursePlayerPage slug={playerSlug} />
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
              <Course />
              <HomeBlogs />
            </>
          ) : path === "/khoa-hoc" ? (
            <CoursePage />
          ) : path.startsWith("/khoa-hoc/") && path.split("/").filter(Boolean)[1] ? (
            <CoursePage slug={decodeURIComponent(path.split("/").filter(Boolean)[1])} />
          ) : path === "/gio-hang" ? (
            <CartPage />
          ) : path === "/hoc-tap" || path === "/danh-sach-mong-uoc" ? (
            <LearningPage />
          ) : path === "/thanh-toan" || path.startsWith("/thanh-toan/") ? (
            <CheckoutPage />
          ) : path === "/lich-su-mua" ? (
            <PurchaseHistoryPage />
          ) : path === "/cai-dat-tai-khoan" ? (
            <SettingsPage />
          ) : path === "/thong-bao" ? (
            <NotificationsPage />
          ) : path === "/gioi-thieu" ? (
            <About />
          ) : path === "/tin-tuc" || path.startsWith("/tin-tuc/") ? (
            <NewsPage />
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
