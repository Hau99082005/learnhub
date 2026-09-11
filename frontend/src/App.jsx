import Header from "@/components/Layout/Header"
import Footer from "@/components/Layout/footer"
import LoginPage from "@/login/page"
import RegisterPage from "@/Register/page"

function App() {
  const path = window.location.pathname
  const isLogin = path === "/dang-nhap"
  const isRegister = path === "/dang-ky"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      {isLogin ? <LoginPage /> : isRegister ? <RegisterPage /> : <main className="flex-1" />}
      <Footer />
    </div>
  )
}

export default App
