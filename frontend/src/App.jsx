import Header from "@/components/Layout/Header"
import Footer from "@/components/Layout/footer"

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1" />
      <Footer />
    </div>
  )
}

export default App
