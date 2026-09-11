import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const TextField = ({ id, label, icon: Icon, className, ...props }) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-[14px] font-medium tracking-[0.01em]">
        {label}
      </Label>
      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
        ) : null}
        <Input
          id={id}
          className={`h-11 rounded-lg text-[16px] md:text-[16px] ${Icon ? "pl-10" : "px-3"} ${className ?? ""}`}
          {...props}
        />
      </div>
    </div>
  )
}

export default TextField
