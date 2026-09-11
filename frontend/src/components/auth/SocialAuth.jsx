import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebookF, faGoogle } from "@fortawesome/free-brands-svg-icons"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const SocialAuth = () => {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-[14px] tracking-[0.01em] text-muted-foreground">hoặc</span>
        <Separator className="flex-1" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <a
          href="/auth/google"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 w-full gap-2 text-[14px] font-medium tracking-[0.01em]"
          )}
        >
          <FontAwesomeIcon icon={faGoogle} className="size-3.5" />
          Google
        </a>
        <a
          href="/auth/facebook"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 w-full gap-2 text-[14px] font-medium tracking-[0.01em]"
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
