import { useEffect, useState } from "react";
import {
  ChartNoAxesColumn,
  CircleQuestionMark,
  GraduationCap,
  Lightbulb,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Play,
  Wrench,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { clearAuth, getAuthUser, setPendingToast } from "@/lib/auth";

const NAV = [
  { href: "/giang-day/quan-tri", label: "Khóa học", icon: Play },
  { href: "/giang-day/quan-tri/giao-tiep", label: "Giao tiếp", icon: MessageSquare },
  { href: "/giang-day/quan-tri/hieu-suat", label: "Hiệu suất", icon: ChartNoAxesColumn },
  { href: "/giang-day/quan-tri/cong-cu", label: "Công cụ", icon: Wrench },
  { href: "/giang-day/quan-tri/tai-nguyen", label: "Tài nguyên", icon: CircleQuestionMark },
];

function initials(user) {
  const name = user?.fullName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "G";
  }
  return (user?.email?.[0] || "G").toUpperCase();
}

function isActive(href, path) {
  if (href === "/giang-day/quan-tri") {
    return path === href;
  }
  return path === href || path.startsWith(`${href}/`);
}

const SidebarNav = ({ path, onNavigate }) => (
  <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
    {NAV.map((item) => {
      const active = isActive(item.href, path);
      return (
        <a
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-[15px] transition-colors duration-200",
            active
              ? "bg-white/12 text-white"
              : "text-white/70 hover:bg-white/8 hover:text-white",
          )}
        >
          <item.icon className="size-[18px] shrink-0" strokeWidth={1.75} />
          {item.label}
        </a>
      );
    })}
  </nav>
);

const InstructorLayout = ({ children }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [path, setPath] = useState("/giang-day/quan-tri");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getAuthUser());
    setPath(window.location.pathname);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const logout = () => {
    clearAuth();
    setPendingToast("success", "Đã đăng xuất");
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col bg-neutral-950 text-white lg:flex">
        <a
          href="/giang-day/quan-tri"
          className="flex items-center gap-2.5 px-5 py-5"
        >
          <GraduationCap className="size-7" strokeWidth={1.75} />
          <span className="text-[17px] font-semibold tracking-tight">LearnHub</span>
        </a>
        <SidebarNav path={path} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-[240px] flex-col bg-neutral-950 text-white">
            <div className="flex items-center justify-between px-4 py-4">
              <a href="/giang-day/quan-tri" className="flex items-center gap-2">
                <GraduationCap className="size-6" strokeWidth={1.75} />
                <span className="text-[16px] font-semibold">LearnHub</span>
              </a>
              <button
                type="button"
                className="p-1 text-white/70 hover:text-white"
                aria-label="Đóng"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            <SidebarNav path={path} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-border px-4 sm:h-16 sm:px-6">
          <button
            type="button"
            className="p-1 text-foreground lg:hidden"
            aria-label="Mở menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/"
              className="px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Học viên
            </a>
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
                  isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
                )}
                strokeWidth={1.75}
              />
              <Moon
                className={cn(
                  "absolute size-5 transition-all duration-300",
                  isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0",
                )}
                strokeWidth={1.75}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                <Avatar className="size-8">
                  <AvatarFallback>{initials(user)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-medium">{user?.fullName || "Giảng viên"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = "/";
                  }}
                >
                  Về trang chủ
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={logout}>
                  <LogOut />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default InstructorLayout;
