import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const TextField = ({ id, label, icon: Icon, className, error, ...props }) => {
  return (
    <div className="grid gap-2">
      <Label
        htmlFor={id}
        className="text-[14px] font-medium tracking-[0.01em]"
        style={{
          fontFamily: "'Roboto', sans-serif",
          fontWeight: "500",
          fontStyle: "normal",
          lineHeight: 1.4,
          letterSpacing: "0.01em",
        }}
      >
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
          aria-invalid={error ? true : undefined}
          className={`h-11 rounded-lg text-[16px] md:text-[16px] ${Icon ? "pl-10" : "px-3"} ${className ?? ""}`}
          {...props}
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontStyle: "normal",
            fontWeight: "400",
            lineHeight: 1.4,
            letterSpacing: "0.01em",
          }}
        />
      </div>
      {error ? (
        <p className="text-[13px] text-destructive">{error}</p>
      ) : null}
    </div>
  );
};

export default TextField;
