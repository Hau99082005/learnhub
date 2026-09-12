import { useEffect, useState } from "react";
import {
  CircleUser,
  GraduationCap,
  Lightbulb,
  Lighthouse,
  Moon,
  ShoppingBag,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/", label: "Trang chủ" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/khoa-hoc", label: "Các khóa học" },
  { href: "/tai-lieu", label: "Tài liệu" },
  { href: "/bai-viet", label: "Bài viết" },
  { href: "/thu-vien", label: "Thư viện" },
  { href: "/tin-tuc", label: "Tin tức" },
];

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={isDark ? "Bật chế độ sáng" : "Bật chế độ tối"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Lightbulb
        className={cn(
          "size-5 transition-all duration-300",
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100",
        )}
        strokeWidth={1.75}
      />
      <Moon
        className={cn(
          "absolute size-5 transition-all duration-300",
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0",
        )}
        strokeWidth={1.75}
      />
    </Button>
  );
};

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState("/");

  useEffect(() => {
    setPath(window.location.pathname);
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/75 backdrop-blur-xl transition-[border-color,box-shadow] duration-300",
        scrolled
          ? "border-border shadow-[0_8px_24px_-18px_oklch(0_0_0/0.35)]"
          : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
        <a
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:gap-2.5"
        >
          <span
            style={{
              border: "1px solid none",
              borderRadius: "8px",
            }}
            className="flex size-10 items-center justify-center rounded-none bg-foreground text-background transition-transform duration-300 group-hover:scale-[1.04]"
          >
            <GraduationCap className="size-6" strokeWidth={1.75} />
          </span>
          <span
            className="truncate text-[16px] font-semibold tracking-tight text-foreground"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontWeight: "600",
              fontStyle: "normal",
              lineHeight: 1.4,
              letterSpacing: "0.01em",
            }}
          >
            LearnHub
          </span>
        </a>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center xl:flex"
          aria-label="Điều hướng chính"
        >
          <ul className="flex items-center">
            {NAV_ITEMS.map((item) => {
              const active = path === item.href;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={cn(
                      "relative inline-flex h-9 items-center px-2.5 text-[13px] font-medium tracking-tight text-muted-foreground transition-colors duration-200 hover:text-foreground",
                      "after:absolute after:inset-x-2.5 after:bottom-1 after:h-px after:origin-center after:scale-x-0 after:bg-foreground after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100",
                      active && "text-foreground after:scale-x-100",
                    )}
                    style={{
                      fontFamily: "Roboto",
                      fontSize: "16px",
                      fontWeight: "400",
                      fontStyle: "normal",
                      lineHeight: 1.4,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <ThemeToggle />

          <a
            href="/gio-hang"
            aria-label="Giỏ hàng"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "relative",
            )}
          >
            <ShoppingBag className="size-5" strokeWidth={1.75} />
          </a>

          <a
            href="/dang-nhap"
            aria-label="Tài khoản"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <CircleUser className="size-5" strokeWidth={1.75} />
          </a>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="xl:hidden"
                  aria-label={open ? "Đóng menu" : "Mở menu"}
                />
              }
            >
              <span className="relative flex size-4 flex-col items-center justify-center gap-[5px]">
                <span
                  className={cn(
                    "block h-px w-4 bg-foreground transition-transform duration-300 ease-out",
                    open && "translate-y-[6px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "block h-px w-4 bg-foreground transition-all duration-300 ease-out",
                    open && "scale-x-0 opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "block h-px w-4 bg-foreground transition-transform duration-300 ease-out",
                    open && "-translate-y-[6px] -rotate-45",
                  )}
                />
              </span>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(100%,20rem)] gap-0 p-0"
            >
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle className="flex items-center gap-2.5 text-[15px] font-semibold">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
                    <GraduationCap className="size-4" strokeWidth={1.75} />
                  </span>
                  LearnHub
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Menu điều hướng website khóa học
                </SheetDescription>
              </SheetHeader>
              <nav className="flex-1 px-3 py-3" aria-label="Menu di động">
                <ul className="flex flex-col">
                  {NAV_ITEMS.map((item, index) => {
                    const active = path === item.href;
                    return (
                      <li
                        key={item.href}
                        className="animate-in fade-in slide-in-from-right-2 duration-300 fill-mode-both"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <SheetClose
                          render={
                            <a
                              href={item.href}
                              className={cn(
                                "flex h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground",
                                active && "bg-muted text-foreground",
                              )}
                            />
                          }
                        >
                          {item.label}
                        </SheetClose>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
