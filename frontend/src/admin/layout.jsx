import { useState } from "react";
import {
  Bell,
  Calendar,
  ChevronDown,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LayoutGrid,
  ChartLine,
  LogOut,
  Mail,
  Menu,
  Puzzle,
  Search,
  Shield,
  Star,
  Sun,
  Table2,
  PanelsTopLeft,
  Images,
  Tags,
  Newspaper,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { clearAuth, setPendingToast } from "@/lib/auth";
import { roleLabel } from "@/lib/roles";

const NAV_GROUPS = [
  {
    title: "Core",
    items: [
      {
        href: "/quan-tri",
        label: "Dashboard",
        icon: LayoutDashboard,
        badge: "NEW",
      },
    ],
  },
  {
    title: "UI Elements",
    items: [
      { href: "/admin/banners", label: "Banners", icon: Images },
      { href: "/admin/categories", label: "Danh mục", icon: Tags },
      { href: "/admin/news", label: "Tin nổi bật", icon: Newspaper },
      { href: "/admin/newsblogs", label: "Bài viết", icon: FileText },
      {
        href: "/quan-tri/thanh-phan",
        label: "Components",
        icon: Puzzle,
        chevron: true,
      },
      {
        href: "/quan-tri/bang-du-lieu",
        label: "Data Grid",
        icon: Table2,
        badge: "ADD-ON",
        badgeTone: "amber",
      },
      { href: "/quan-tri/form", label: "Forms", icon: FileText, chevron: true },
      { href: "/quan-tri/icon", label: "Icons", icon: Star },
      {
        href: "/quan-tri/lich",
        label: "Scheduler",
        icon: Calendar,
        badge: "ADD-ON",
        badgeTone: "amber",
      },
      {
        href: "/quan-tri/bang",
        label: "Smart Table",
        icon: Table2,
        badge: "PRO",
        badgeTone: "rose",
      },
      {
        href: "/quan-tri/widget",
        label: "Widgets",
        icon: PanelsTopLeft,
        badge: "NEW",
      },
    ],
  },
  {
    title: "Extras",
    items: [
      {
        href: "/quan-tri/xac-thuc",
        label: "Authentication",
        icon: Shield,
        chevron: true,
      },
    ],
  },
];

function userInitials(user) {
  const name = user?.fullName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    const letters = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
    return letters.toUpperCase() || "A";
  }
  return (user?.email?.[0] || "A").toUpperCase();
}

function NavBadge({ label, tone }) {
  return (
    <span
      className={cn(
        "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
        tone === "amber" && "bg-amber-400 text-amber-950",
        tone === "rose" && "bg-rose-500 text-white",
        !tone && "bg-sky-500 text-white",
      )}
    >
      {label}
    </span>
  );
}

function logout() {
  clearAuth();
  setPendingToast("success", "Đã đăng xuất");
  window.location.href = "/";
}

function AdminUserMenu({ user }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "ml-1 rounded-full",
        )}
        aria-label="Tài khoản"
      >
        <Avatar size="sm">
          <AvatarFallback
            className="bg-sky-600 font-medium text-white"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontWeight: "400",
              fontStyle: "normal",
              lineHeight: 1.4,
              fontSize: "11px",
              letterSpacing: "0.01em",
            }}
          >
            {userInitials(user)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 min-w-64 w-72 p-2">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar>
            <AvatarFallback
              className="bg-sky-600 text-xs font-medium text-white"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontWeight: "400",
                fontStyle: "normal",
                lineHeight: 1.4,
                fontSize: "13px",
                letterSpacing: "0.01em",
              }}
            >
              {userInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.fullName || "Quản trị viên"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
            <Badge variant="secondary" className="mt-1">
              {roleLabel(user?.role)}
            </Badge>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="h-9 px-2 text-[14px]" render={<a href="/" />}>
          Về trang chủ
        </DropdownMenuItem>
        <DropdownMenuItem
          className="h-9 px-2 text-[14px]"
          render={<a href="/cai-dat-tai-khoan" />}
        >
          Cài đặt tài khoản
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={logout}>
          <LogOut />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Sidebar({ path }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
      <a
        href="/quan-tri"
        className="flex h-14 items-center gap-2.5 border-b border-border px-4"
      >
        <span
          className="flex size-9 items-center justify-center rounded-none bg-sky-600 text-white"
          style={{
            borderRadius: "5px",
          }}
        >
          <GraduationCap className="size-6" strokeWidth={1.75} />
        </span>
        <span
          className="text-sm font-semibold tracking-tight"
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: "16px",
            fontWeight: "600",
            fontStyle: "normal",
            lineHeight: 1.4,
            letterSpacing: "0.01em",
          }}
        >
          LearnHub Admin
        </span>
      </a>
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-4">
            <p
              className="px-2 pb-2 text-[14px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontWeight: "600",
                fontStyle: "normal",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
              }}
            >
              {group.title}
            </p>
            <ul className="grid gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = path === item.href;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={cn(
                        "flex h-9 items-center gap-2.5 rounded-lg px-2 text-[14px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        active && "bg-muted font-medium text-foreground",
                      )}
                      style={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: "400",
                        fontStyle: "normal",
                        lineHeight: 1.4,
                        letterSpacing: "0.01em",
                      }}
                    >
                      <Icon className="size-5" strokeWidth={1.75} />
                      <span
                        className="min-w-0 truncate"
                        style={{
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: "400",
                          fontStyle: "normal",
                          lineHeight: 1.4,
                          letterSpacing: "0.01em",
                          fontSize: "14px",
                        }}
                      >
                        {item.label}
                      </span>
                      {item.badge ? (
                        <NavBadge label={item.badge} tone={item.badgeTone} />
                      ) : null}
                      {item.chevron ? (
                        <ChevronDown className="ml-auto size-3.5" />
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default function AdminLayout({ user, children }) {
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const path = window.location.pathname;

  return (
    <div className="flex min-h-screen bg-muted/40">
      <div className="hidden lg:block">
        <Sidebar path={path} />
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Đóng menu"
          />
          <div className="relative z-10 h-full w-64">
            <Sidebar path={path} />
          </div>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-card px-3 sm:px-5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Mở menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="relative hidden min-w-0 flex-1 md:block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search"
              className="h-9 max-w-md rounded-full pl-9"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontWeight: "400",
                fontStyle: "normal",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
              }}
            />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Ứng dụng"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Thông báo"
            >
              <Bell className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Tin nhắn"
            >
              <Mail className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Đổi giao diện"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              <Sun className="size-4" />
            </Button>
            <AdminUserMenu user={user} />
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted-foreground">
            <p
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontWeight: "400",
                fontStyle: "normal",
                lineHeight: 1.4,
                fontSize: "14px",
                letterSpacing: "0.01em",
              }}
            >
              Home <span className="px-1">/</span>{" "}
              <span
                className="text-foreground"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: "400",
                  fontStyle: "normal",
                  lineHeight: 1.4,
                  fontSize: "14px",
                  letterSpacing: "0.01em",
                }}
              >
                Dashboard
              </span>
            </p>
            <p
              className="text-xs"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontWeight: "400",
                fontStyle: "normal",
                lineHeight: 1.4,
                fontSize: "14px",
                letterSpacing: "0.01em",
              }}
            >
              {roleLabel(user?.role)}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
