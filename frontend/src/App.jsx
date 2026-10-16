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
import CertificatePage from "@/certificate/page"
import NotificationsPage from "@/notifications/page"
import PaymentMethodsPage from "@/payments/page"
import { Toaster } from "@/components/ui/sonner"
import { consumePendingToast, getAuthUser, onAuthChange } from "@/lib/auth"
import { hydrateOwned } from "@/lib/courseAccess"
import { loadInbox } from "@/lib/inbox"
import { loadWishlist } from "@/lib/wishlist"
import { isAdmin, isInstructor } from "@/lib/roles"
import { INSTRUCTOR_STUDIO } from "@/lib/teachStart"
import AiChat from "@/components/AiChat"

const AdminPage = lazy(() => import("@/admin/page"))

function App() {
  const path = window.location.pathname
  const isLogin = path === "/dang-nhap"
  const isRegister = path === "/dang-ky"
  const user = getAuthUser()
  const isTeacher = isInstructor(user) || isAdmin(user)
  const isTeachStart = path === "/giang-day/bat-dau"
  const isInstructorLanding = path === "/giang-day"
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

  if ((isInstructorLanding || isTeachStart) && isTeacher) {
    window.location.replace(INSTRUCTOR_STUDIO)
    return null
  }

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

  const certCode = path.startsWith("/chung-chi/")
    ? decodeURIComponent(path.split("/").filter(Boolean)[1] || "")
    : ""
  if (certCode) {
    return (
      <>
        <CertificatePage code={certCode} />
        <AiChat />
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
        <AiChat />
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
          ) : path === "/phuong-thuc-thanh-toan" ? (
            <PaymentMethodsPage />
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
      <AiChat />
      <Toaster position="top-center" richColors />
    </div>
  )
}

export default App
