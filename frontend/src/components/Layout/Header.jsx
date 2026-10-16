import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  Lightbulb,
  LogOut,
  Moon,
  Search,
  ShoppingBag,
} from "lucide-react";
import logoLearnHub from "@/assets/icons/Logo LearnHub (1)-Photoroom.png";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  clearAuth,
  getAuthUser,
  onAuthChange,
  setPendingToast,
} from "@/lib/auth";
import { cartCount, loadCart, onCartChange } from "@/lib/cart";
import { inboxUnread, loadInboxCount, onInboxChange } from "@/lib/inbox";
import { loadWishlist, onWishlistChange, wishlistCount } from "@/lib/wishlist";
import { isAdmin, isInstructor, roleLabel } from "@/lib/roles";
import { getData as getCategories } from "@/components/Category";

const NAV_ITEMS = [
  { href: "/", label: "Trang chủ" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/khoa-hoc", label: "Các khóa học" },
  { href: "/tai-lieu", label: "Tài liệu" },
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

function userInitials(user) {
  const name = user?.fullName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    const letters = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
    return letters.toUpperCase() || "U";
  }
  return (user?.email?.[0] || "U").toUpperCase();
}

function logout() {
  clearAuth();
  setPendingToast("success", "Đã đăng xuất");
  window.location.href = "/";
}

function goSearch(query) {
  const term = query.trim();
  window.location.href = term
    ? `/khoa-hoc?q=${encodeURIComponent(term)}`
    : "/khoa-hoc";
}

function SearchForm({ className, autoFocus = false, onSearch }) {
  const [query, setQuery] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("q") || "";
    } catch {
      return "";
    }
  });

  return (
    <form
      className={cn("relative w-full", className)}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch?.(query);
        goSearch(query);
      }}
    >
      <button
        type="submit"
        aria-label="Tìm kiếm"
        className="absolute top-1/2 left-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
      >
        <Search className="size-4" />
      </button>
      <Input
        type="search"
        value={query}
        autoFocus={autoFocus}
        placeholder="Tìm kiếm khóa học"
        aria-label="Tìm kiếm khóa học"
        className="h-10 rounded-full border-border bg-muted/70 pr-3 pl-10 text-sm shadow-none transition-colors focus-visible:bg-background focus-visible:ring-violet-700/20"
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSearch?.(query);
            goSearch(query);
          }
        }}
      />
    </form>
  );
}

function UserMenuLink({ href, children, count }) {
  return (
    <DropdownMenuItem
      className="h-9 justify-between px-2 text-[14px]"
      render={<a href={href} />}
    >
      <span>{children}</span>
      {count ? (
        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
          {count}
        </span>
      ) : null}
    </DropdownMenuItem>
  );
}

function UserMenu({ user, cartItems = 0, wishItems = 0, unread = 0 }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "rounded-full",
        )}
        aria-label="Tài khoản"
      >
        <Avatar size="sm">
          <AvatarFallback className="bg-foreground text-[11px] font-medium text-background">
            {userInitials(user)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64 w-80 p-2">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar>
            <AvatarFallback className="bg-foreground text-xs font-medium text-background">
              {userInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user.fullName || "Học viên"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            <Badge variant="secondary" className="mt-1">
              {roleLabel(user.role)}
            </Badge>
          </div>
        </div>
        {isAdmin(user) ? (
          <>
            <DropdownMenuSeparator />
            <UserMenuLink href="/quan-tri">Trang quản trị</UserMenuLink>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <UserMenuLink href="/hoc-tap">Học tập</UserMenuLink>
        <UserMenuLink href="/bai-tap">Bài tập</UserMenuLink>
        <DropdownMenuSeparator />
        <UserMenuLink href="/gio-hang" count={cartItems}>
          Giỏ hàng của tôi
        </UserMenuLink>
        <UserMenuLink href="/danh-sach-mong-uoc" count={wishItems}>
          Danh sách mong ước
        </UserMenuLink>
        {isInstructor(user) ? (
          <>
            <UserMenuLink href="/giang-day/quan-tri">Giảng dạy trên LearnHub</UserMenuLink>
            <UserMenuLink href="/giang-day/quan-tri">Quản lý khóa học</UserMenuLink>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <UserMenuLink href="/thong-bao" count={unread}>
          Thông báo
        </UserMenuLink>
        <UserMenuLink href="/tin-nhan">Tin nhắn</UserMenuLink>
        <DropdownMenuSeparator />
        <UserMenuLink href="/cai-dat-tai-khoan">Cài đặt tài khoản</UserMenuLink>
        <UserMenuLink href="/phuong-thuc-thanh-toan">
          Phương thức thanh toán
        </UserMenuLink>
        <UserMenuLink href="/lich-su-mua">Lịch sử mua</UserMenuLink>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2 py-2 text-[14px]">
          <span>Ngôn ngữ</span>
          <span className="text-muted-foreground">Tiếng Việt</span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={logout}>
          <LogOut />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ExploreMenu({ categories }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "hidden h-10 gap-1 px-2.5 text-sm font-medium text-foreground hover:text-violet-700 md:inline-flex",
        )}
      >
        Khám phá
        <ChevronDown className="size-3.5 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-64 p-1.5">
        <p className="px-2 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Danh mục
        </p>
        {categories.length ? (
          categories.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className="h-9 px-2 text-sm"
              render={<a href={`/danh-muc/${item.slug}`} />}
            >
              {item.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem
            className="h-9 px-2 text-sm"
            render={<a href="/khoa-hoc" />}
          >
            Tất cả khóa học
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {NAV_ITEMS.filter((item) => item.href !== "/").map((item) => (
          <DropdownMenuItem
            key={item.href}
            className="h-9 px-2 text-sm"
            render={<a href={item.href} />}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [path, setPath] = useState("/");
  const [user, setUser] = useState(null);
  const [itemsInCart, setItemsInCart] = useState(0);
  const [itemsInWish, setItemsInWish] = useState(0);
  const [unread, setUnread] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setPath(window.location.pathname);
    setUser(getAuthUser());
    setItemsInCart(cartCount());
    setItemsInWish(wishlistCount());
    setUnread(inboxUnread());
    const unsubscribe = onAuthChange((next) => {
      setUser(next);
      loadWishlist().then(() => setItemsInWish(wishlistCount()));
      loadInboxCount().then(setUnread);
    });
    const stopCart = onCartChange(() => setItemsInCart(cartCount()));
    const stopWish = onWishlistChange(() => setItemsInWish(wishlistCount()));
    const stopInbox = onInboxChange((state) => setUnread(state.unread || 0));
    loadCart().then(() => setItemsInCart(cartCount()));
    loadWishlist().then(() => setItemsInWish(wishlistCount()));
    loadInboxCount().then(setUnread);
    const poll = window.setInterval(() => {
      loadInboxCount().then(setUnread);
    }, 20000);
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      unsubscribe();
      stopCart();
      stopWish();
      stopInbox();
      window.clearInterval(poll);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/85 backdrop-blur-xl transition-[border-color,box-shadow] duration-300",
        scrolled
          ? "border-border shadow-[0_10px_28px_-20px_oklch(0_0_0/0.4)]"
          : "border-border/70",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
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
          <SheetContent side="left" className="w-[min(100%,20rem)] gap-0 p-0">
            <SheetHeader className="border-b border-border px-5 py-4">
              <SheetTitle className="flex items-center">
                <img
                  src={logoLearnHub}
                  alt="LearnHub"
                  className="h-8 w-8 bg-transparent object-contain sm:h-9 sm:w-9"
                />
              </SheetTitle>
              <SheetDescription className="sr-only">
                Menu điều hướng website khóa học
              </SheetDescription>
            </SheetHeader>
            {user ? (
              <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                <Avatar>
                  <AvatarFallback className="bg-foreground text-xs font-medium text-background">
                    {userInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user.fullName || "Học viên"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {roleLabel(user.role)}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 border-b border-border p-4">
                <SheetClose
                  render={
                    <a
                      href="/dang-nhap"
                      className={buttonVariants({ variant: "outline" })}
                    />
                  }
                >
                  Đăng nhập
                </SheetClose>
                <SheetClose
                  render={
                    <a
                      href="/dang-ky"
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "bg-violet-700 text-white hover:bg-violet-800",
                      )}
                    />
                  }
                >
                  Đăng ký
                </SheetClose>
              </div>
            )}
            <div className="border-b border-border px-4 py-3">
              <SearchForm onSearch={() => setOpen(false)} />
            </div>
            {categories.length ? (
              <div className="border-b border-border px-3 py-3">
                <p className="px-2 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Danh mục
                </p>
                <ul className="flex flex-col">
                  {categories.map((item) => (
                    <li key={item.id}>
                      <SheetClose
                        render={
                          <a
                            href={`/danh-muc/${item.slug}`}
                            className="flex h-10 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          />
                        }
                      >
                        {item.name}
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <nav className="flex-1 px-3 py-3" aria-label="Menu di động">
              <ul className="flex flex-col">
                {NAV_ITEMS.map((item) => {
                  const active = path === item.href;
                  return (
                    <li key={item.href}>
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
                {user ? (
                  <>
                    <li>
                      <SheetClose
                        render={
                          <a
                            href="/hoc-tap"
                            className={cn(
                              "flex h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                              path === "/hoc-tap" && "bg-muted text-foreground",
                            )}
                          />
                        }
                      >
                        Học tập
                      </SheetClose>
                    </li>
                    <li>
                      <SheetClose
                        render={
                          <a
                            href="/bai-tap"
                            className={cn(
                              "flex h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                              path === "/bai-tap" || path.startsWith("/bai-tap/")
                                ? "bg-muted text-foreground"
                                : "",
                            )}
                          />
                        }
                      >
                        Bài tập
                      </SheetClose>
                    </li>
                  </>
                ) : null}
                {isInstructor(user) ? (
                  <li>
                    <SheetClose
                      render={
                        <a
                          href="/giang-day/quan-tri"
                          className="flex h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        />
                      }
                    >
                      Giảng dạy
                    </SheetClose>
                  </li>
                ) : null}
              </ul>
            </nav>
            {user ? (
              <div className="border-t border-border p-3">
                {isAdmin(user) ? (
                  <SheetClose
                    render={
                      <a
                        href="/quan-tri"
                        className="mb-1 flex h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground hover:bg-muted"
                      />
                    }
                  >
                    Trang quản trị
                  </SheetClose>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={logout}
                >
                  <LogOut className="size-4" />
                  Đăng xuất
                </Button>
              </div>
            ) : null}
          </SheetContent>
        </Sheet>

        <a
          href="/"
          aria-label="LearnHub"
          className="group flex min-w-0 shrink-0 items-center outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <img
            src={logoLearnHub}
            alt="LearnHub"
            className="h-9 w-9 bg-transparent object-contain transition-transform duration-300 group-hover:scale-[1.04] sm:h-10 sm:w-10 md:h-11 md:w-11"
          />
        </a>

        <ExploreMenu categories={categories} />

        <SearchForm className="hidden min-w-0 flex-1 md:block" />

        <nav
          className="hidden items-center 2xl:flex"
          aria-label="Điều hướng chính"
        >
          <ul className="flex items-center">
            {NAV_ITEMS.filter((item) => item.href !== "/").map((item) => {
              const active = path === item.href;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={cn(
                      "relative inline-flex h-9 items-center px-2 text-[13px] font-medium tracking-tight text-muted-foreground transition-colors duration-200 hover:text-foreground",
                      "after:absolute after:inset-x-2 after:bottom-1 after:h-px after:origin-center after:scale-x-0 after:bg-foreground after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100",
                      active && "text-foreground after:scale-x-100",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          {user ? (
            <>
              <a
                href="/hoc-tap"
                className="hidden h-10 items-center px-2 text-sm font-medium text-foreground transition-colors hover:text-violet-700 lg:inline-flex"
              >
                Học tập
              </a>
              <a
                href="/bai-tap"
                className="hidden h-10 items-center px-2 text-sm font-medium text-foreground transition-colors hover:text-violet-700 lg:inline-flex"
              >
                Bài tập
              </a>
            </>
          ) : null}
          {isInstructor(user) ? (
            <a
              href="/giang-day/quan-tri"
              className="hidden h-10 items-center px-2 text-sm font-medium text-foreground transition-colors hover:text-violet-700 lg:inline-flex"
            >
              Giảng dạy
            </a>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Tìm kiếm"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((value) => !value)}
          >
            <Search className="size-5" strokeWidth={1.75} />
          </Button>

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
            {itemsInCart > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-700 px-1 text-[10px] font-semibold text-white">
                {itemsInCart > 9 ? "9+" : itemsInCart}
              </span>
            ) : null}
          </a>

          {user ? (
            <>
              <a
                href="/thong-bao"
                aria-label="Thông báo"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "relative",
                )}
              >
                <Bell className="size-5" strokeWidth={1.75} />
                {unread > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-700 px-1 text-[10px] font-semibold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </a>
              <UserMenu
                user={user}
                cartItems={itemsInCart}
                wishItems={itemsInWish}
                unread={unread}
              />
            </>
          ) : (
            <div className="hidden items-center gap-1.5 lg:flex">
              <a
                href="/dang-nhap"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-9 px-3",
                )}
              >
                Đăng nhập
              </a>
              <a
                href="/dang-ky"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "h-9 bg-violet-700 px-3 text-white hover:bg-violet-800",
                )}
              >
                Đăng ký
              </a>
            </div>
          )}
        </div>
      </div>
      {searchOpen ? (
        <div className="border-t border-border px-3 py-2 md:hidden">
          <SearchForm autoFocus onSearch={() => setSearchOpen(false)} />
        </div>
      ) : null}
    </header>
  );
};

export default Header;
