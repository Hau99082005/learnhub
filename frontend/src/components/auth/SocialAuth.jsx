import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebookF, faGoogle } from "@fortawesome/free-brands-svg-icons"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { authRequest, saveAuth, setPendingToast } from "@/lib/auth"
import { clearTeachStart } from "@/lib/teachStart"
import { signInWithGoogle } from "@/lib/firebase"

const buttonStyle = {
  fontFamily: "'Roboto', sans-serif",
  fontSize: "16px",
  fontWeight: "400",
  lineHeight: 1.3,
  letterSpacing: "0.01em",
  borderRadius: "5px",
}

const SocialAuth = ({ role, onBeforeGoogle, extraBody, redirectTo }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const onGoogle = async () => {
    if (onBeforeGoogle) {
      const message = onBeforeGoogle()
      if (message) {
        setError(message)
        return
      }
    }
    setLoading(true)
    setError("")
    try {
      const idToken = await signInWithGoogle()
      const data = await authRequest("/api/auth/google", {
        idToken,
        role,
        ...(extraBody || {}),
      })
      saveAuth(data)
      clearTeachStart()
      setPendingToast("success", "Đăng nhập thành công")
      window.location.href = redirectTo || "/"
    } catch (err) {
      setError(err.message || "Đăng nhập Google thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span
          className="text-[14px] tracking-[0.01em] text-muted-foreground"
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: 1.3,
            letterSpacing: "0.01em",
          }}
        >
          hoặc
        </span>
        <Separator className="flex-1" />
      </div>
      {error ? <p className="mt-3 text-[13px] text-destructive">{error}</p> : null}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          style={buttonStyle}
          disabled={loading}
          onClick={onGoogle}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 w-full gap-2 text-[14px] font-medium tracking-[0.01em]",
          )}
        >
          <FontAwesomeIcon icon={faGoogle} className="size-3.5" />
          {loading ? "Đang xử lý..." : "Google"}
        </button>
        <a
          style={buttonStyle}
          href="/auth/facebook"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 w-full gap-2 text-[14px] font-medium tracking-[0.01em]",
          )}
        >
          <FontAwesomeIcon icon={faFacebookF} className="size-3.5" />
          Facebook
        </a>
      </div>
    </div>
  )
}

export default SocialAuth
