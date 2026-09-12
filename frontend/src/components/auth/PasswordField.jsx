import { useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const PasswordField = ({ id, label, error, ...props }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-[14px] font-medium tracking-[0.01em]">
        {label}
      </Label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.75}
        />
        <Input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          className="h-11 rounded-lg pr-10 pl-10 text-[16px] md:text-[16px]"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute top-1/2 right-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:text-foreground"
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {visible ? (
            <EyeOff className="size-4" strokeWidth={1.75} />
          ) : (
            <Eye className="size-4" strokeWidth={1.75} />
          )}
        </button>
      </div>
      {error ? (
        <p className="text-[13px] text-destructive">{error}</p>
      ) : null}
    </div>
  )
}

export default PasswordField
