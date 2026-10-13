import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  Award,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Flame,
  FolderPlus,
  MoreVertical,
  Play,
  Plus,
  Search,
  Share2,
  Sparkles,
  Trophy,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { formatDuration, LEVELS } from "@/components/Course";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authGet, getAuthUser } from "@/lib/auth";
import { addOwnedMany } from "@/lib/courseAccess";
import {
  addToList,
  createList,
  getArchivedIds,
  getLastAccessMap,
  getLists,
  getStreak,
  getWishlistIds,
  recordStreakVisit,
  setArchived,
} from "@/lib/learning";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "Tất cả khóa học" },
  { id: "lists", label: "Danh sách của tôi" },
  { id: "wishlist", label: "Danh sách mong ước" },
  { id: "certs", label: "Chứng chỉ" },
  { id: "archived", label: "Đã lưu trữ" },
  { id: "tools", label: "Công cụ học tập" },
];

function loginHref() {
  return `/dang-nhap?next=${encodeURIComponent("/hoc-tap")}`;
}

function registerHref() {
  return `/dang-ky?next=${encodeURIComponent("/hoc-tap")}`;
}

function progressOf(item) {
  const value = Number(item.progressPercent);
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
}

function progressLabel(value) {
  if (value <= 0) {
    return "Bắt đầu học";
  }
  if (value >= 100) {
    return "Hoàn thành";
  }
  return "Tiếp tục học";
}

function weekdayDots() {
  const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const streak = getStreak();
  const start = new Date(`${streak.weekStart}T00:00:00`);
  return labels.map((label, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const key = day.toISOString().slice(0, 10);
    return {
      label,
      active: streak.days.includes(key),
    };
  });
}

function LearningCard({ item, lists, archived, onArchive, onAddList }) {
  const progress = progressOf(item);
  const href = `/hoc/${item.slug}`;
  const duration = formatDuration(item.durationSeconds);
  const level = LEVELS[item.level] || LEVELS.ALL;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_12px_32px_-24px_oklch(0_0_0/0.45)] transition duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_22px_40px_-22px_oklch(0.488_0.243_264/0.45)] dark:hover:border-violet-500/40">
      <a href={href} className="relative block aspect-[16/9] overflow-hidden bg-muted">
        {item.images ? (
          <img
            src={item.images}
            alt={item.title}
            className="size-full object-cover transition duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <span className="flex size-full items-center justify-center bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-900 text-white/80">
            <Play className="size-10 fill-current" />
          </span>
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="flex size-12 items-center justify-center rounded-full bg-white text-violet-700 shadow-lg">
            <Play className="size-5 fill-current" />
          </span>
        </span>
      </a>
      <div className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <a href={href} className="min-w-0">
            <h3 className="line-clamp-2 text-[15px] font-semibold tracking-tight text-foreground transition-colors group-hover:text-violet-700">
              {item.title}
            </h3>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {item.instructorName}
            </p>
          </a>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "size-8 shrink-0 rounded-full",
              )}
              aria-label="Tùy chọn khóa học"
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              <DropdownMenuItem onClick={() => onArchive(item, !archived)}>
                <Archive />
                {archived ? "Khôi phục" : "Lưu trữ"}
              </DropdownMenuItem>
              {lists.map((list) => (
                <DropdownMenuItem
                  key={list.id}
                  onClick={() => onAddList(list.id, item)}
                >
                  <FolderPlus />
                  Thêm vào {list.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `${window.location.origin}${href}`,
                    );
                    toast.success("Đã sao chép liên kết khóa học");
                  } catch {
                    toast.error("Không thể sao chép liên kết");
                  }
                }}
              >
                <Share2 />
                Chia sẻ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {progress >= 100
                ? "Đã hoàn thành"
                : `${Math.round(progress)}% hoàn thành`}
            </span>
            <span className="inline-flex items-center gap-1">
              {duration ? (
                <>
                  <Clock className="size-3" />
                  {duration}
                </>
              ) : (
                level
              )}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progress >= 100 ? "bg-emerald-500" : "bg-violet-700",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <a
            href={href}
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-9 w-full bg-violet-700 text-white hover:bg-violet-800",
            )}
          >
            {progressLabel(progress)}
          </a>
        </div>
      </div>
    </article>
  );
}

const LearningPage = () => {
  const [user] = useState(() => getAuthUser());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(getAuthUser()));
  const [error, setError] = useState("");
  const [tab, setTab] = useState(() => {
    const value = new URLSearchParams(window.location.search).get("tab");
    if (window.location.pathname === "/danh-sach-mong-uoc") {
      return "wishlist";
    }
    return TABS.some((entry) => entry.id === value) ? value : "all";
  });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [progressFilter, setProgressFilter] = useState("all");
  const [instructor, setInstructor] = useState("all");
  const [sort, setSort] = useState("recent");
  const [archivedIds, setArchivedIds] = useState(() => getArchivedIds());
  const [wishlistIds] = useState(() => getWishlistIds());
  const [lists, setLists] = useState(() => getLists());
  const [listName, setListName] = useState("");
  const [streak, setStreak] = useState(() => getStreak());

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    recordStreakVisit();
    setStreak(getStreak());
    const handle = window.setTimeout(() => {
      const term = query.trim();
      const path = term
        ? `/api/learning?q=${encodeURIComponent(term)}`
        : "/api/learning";
      authGet(path)
        .then((data) => {
          if (cancelled) {
            return;
          }
          const rows = Array.isArray(data) ? data : [];
          setItems(rows);
          addOwnedMany(rows.map((row) => row.courseId));
          setLoading(false);
        })
        .catch((err) => {
          if (cancelled) {
            return;
          }
          setError(err.message || "Không tải được khóa học");
          setLoading(false);
        });
    }, query.trim() ? 280 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [user, query]);

  const categories = useMemo(() => {
    const names = [
      ...new Set(items.map((item) => item.categoryName).filter(Boolean)),
    ];
    return names.sort((a, b) => a.localeCompare(b, "vi"));
  }, [items]);

  const instructors = useMemo(() => {
    const names = [
      ...new Set(items.map((item) => item.instructorName).filter(Boolean)),
    ];
    return names.sort((a, b) => a.localeCompare(b, "vi"));
  }, [items]);

  const visible = useMemo(() => {
    const archived = new Set(archivedIds);
    const wished = new Set(wishlistIds);
    const access = getLastAccessMap();
    let rows = items.filter((item) => {
      const isArchived = archived.has(Number(item.courseId));
      if (tab === "archived") {
        return isArchived;
      }
      if (isArchived) {
        return false;
      }
      if (tab === "wishlist") {
        return wished.has(Number(item.courseId));
      }
      if (tab === "certs") {
        return item.issuesCertificate && progressOf(item) >= 100;
      }
      if (tab === "lists" || tab === "tools") {
        return false;
      }
      return true;
    });
    if (category !== "all") {
      rows = rows.filter((item) => item.categoryName === category);
    }
    if (instructor !== "all") {
      rows = rows.filter((item) => item.instructorName === instructor);
    }
    if (progressFilter === "not-started") {
      rows = rows.filter((item) => progressOf(item) <= 0);
    } else if (progressFilter === "in-progress") {
      rows = rows.filter((item) => {
        const value = progressOf(item);
        return value > 0 && value < 100;
      });
    } else if (progressFilter === "done") {
      rows = rows.filter((item) => progressOf(item) >= 100);
    }
    rows = [...rows].sort((a, b) => {
      if (sort === "title") {
        return String(a.title).localeCompare(String(b.title), "vi");
      }
      if (sort === "enrolled") {
        return String(b.enrolledAt || "").localeCompare(String(a.enrolledAt || ""));
      }
      const left = Number(access[a.courseId]) || 0;
      const right = Number(access[b.courseId]) || 0;
      if (right !== left) {
        return right - left;
      }
      return String(b.enrolledAt || "").localeCompare(String(a.enrolledAt || ""));
    });
    return rows;
  }, [
    archivedIds,
    category,
    instructor,
    items,
    progressFilter,
    sort,
    tab,
    wishlistIds,
  ]);

  const archiveItem = (item, archived) => {
    setArchivedIds(setArchived(item.courseId, archived));
    toast.success(archived ? "Đã lưu trữ khóa học" : "Đã khôi phục khóa học");
  };

  const addItemToList = (listId, item) => {
    setLists(addToList(listId, item.courseId));
    toast.success("Đã thêm vào danh sách");
  };

  const makeList = (event) => {
    event.preventDefault();
    const next = createList(listName);
    setLists(next);
    setListName("");
    toast.success("Đã tạo danh sách");
  };

  if (!user) {
    return (
      <section className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{
            fontFamily: 'Roboto',
            fontSize: '24px',
            fontWeight: '700',
            fontStyle: "normal",
            lineHeight: 1.4,
            letterSpacing: '0.01em'
          }}>Học tập</h1>
        <div className="mt-8 rounded-2xl border border-border px-4 py-12 text-center sm:px-8">
          <BookOpen className="mx-auto size-10 text-violet-700" />
          <p className="mt-4 text-base font-medium">
            Đăng nhập để xem khóa học bạn đã mua
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tiến độ, danh sách và chứng chỉ được lưu theo tài khoản của bạn.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={loginHref()}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 w-full sm:w-40",
              )}
            >
              Đăng nhập
            </a>
            <a
              href={registerHref()}
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-10 w-full bg-violet-700 text-white hover:bg-violet-800 sm:w-40",
              )}
            >
              Đăng ký
            </a>
          </div>
        </div>
      </section>
    );
  }

  const dots = weekdayDots();
  const rangeLabel = (() => {
    const start = new Date(`${streak.weekStart}T00:00:00`);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (value) =>
      value.toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
    return `${fmt(start)} - ${fmt(end)}`;
  })();

  return (
    <div className="w-full">
      <section className="bg-zinc-950 text-white">
        <div className="mx-auto w-full max-w-7xl px-3 pt-8 sm:px-6 sm:pt-10">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Học tập</h1>
          <div className="mt-6 flex gap-1 overflow-x-auto lh-hide-scroll">
            {TABS.map((entry) => {
              const active = tab === entry.id;
              return (
                <button
                  style={{
                    fontSize: '16px',
                    fontFamily: 'Roboto',
                    fontWeight: '400',
                    fontStyle: 'normal',
                    lineHeight: 1.4,
                    letterSpacing: '0.01em'
                  }}
                  key={entry.id}
                  type="button"
                  className={cn(
                    "relative shrink-0 px-3 py-3 text-sm font-medium transition-colors",
                    active ? "text-white" : "text-white/60 hover:text-white",
                  )}
                  onClick={() => setTab(entry.id)}
                >
                  {entry.label}
                  <span
                    className={cn(
                      "absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-white transition-opacity",
                      active ? "opacity-100" : "opacity-0",
                    )}

                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
        {tab !== "tools" ? (
          <div className="rounded-none border border-border bg-gradient-to-r from-violet-50 via-background to-emerald-50 p-4 shadow-[0_16px_40px_-28px_oklch(0.488_0.243_264/0.4)] sm:p-5 dark:from-violet-950/40 dark:via-background dark:to-emerald-950/30"
            style={{
              borderRadius: '5px',
            }}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-md">
                <p className="text-lg font-semibold tracking-tight"
                  style={{
                    fontSize: '20px',
                    fontFamily: 'Roboto',
                    fontWeight: '700',
                    fontStyle: 'normal',
                    lineHeight: 1.4,
                    letterSpacing: '0.01em'
                  }}>
                  {streak.count > 0
                    ? "Giữ chuỗi học tập của bạn"
                    : "Bắt đầu một chuỗi hàng tuần"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground"
                  style={{
                    fontSize: '16px',
                    fontFamily: 'Roboto',
                    fontWeight: '400',
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    letterSpacing: '0.01em'
                  }}>
                  Hãy học một bài mỗi ngày để duy trì thói quen. Bạn đã học {streak.count}/7 ngày tuần này.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <div
                  style={{
                    borderRadius: '5px'
                  }}
                  className="flex items-center gap-2 rounded-none border border-border bg-background px-3 py-2">
                  <Flame className="size-8 text-orange-500" />
                  <div>
                    <p className="text-sm font-semibold"
                      style={{
                        fontSize: '16px',
                        fontFamily: 'Roboto',
                        fontWeight: '600',
                        fontStyle: 'normal',
                        lineHeight: 1.4,
                        letterSpacing: '0.01em'
                      }}>{streak.count} ngày</p>
                    <p className="text-xs text-muted-foreground"
                      style={{
                        fontSize: '16px',
                        fontFamily: 'Roboto',
                        fontWeight: '400',
                        fontStyle: 'italic',
                        lineHeight: 1.7,
                        letterSpacing: '0.01em'
                      }}>Chuỗi hiện tại</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative size-12">
                    <svg viewBox="0 0 36 36" className="-rotate-90 size-12">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        className="stroke-muted"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        className="stroke-violet-700"
                        strokeWidth="3"
                        strokeDasharray={`${(streak.count / 7) * 97} 97`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <Sparkles className="absolute inset-0 m-auto size-4 text-violet-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{
                      fontSize: '16px',
                      fontFamily: 'Roboto',
                      fontWeight: '600',
                      fontStyle: 'normal',
                      lineHeight: 1.4,
                      letterSpacing: '0.01em'
                    }}>{streak.count}/7 ngày khóa học</p>
                    <p className="text-xs text-muted-foreground" style={{
                      fontSize: '16px',
                      fontFamily: 'Roboto',
                      fontWeight: '400',
                      fontStyle: 'italic',
                      lineHeight: 1.7,
                      letterSpacing: '0.01em'
                    }}>{rangeLabel}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {dots.map((day) => (
                <span
                  style={{
                    fontSize: '16px',
                    fontFamily: 'Roboto',
                    fontWeight: '400',
                    fontStyle: 'normal',
                    lineHeight: 1.7,
                    letterSpacing: '0.01em'
                  }}
                  key={day.label}
                  className={cn(
                    "flex h-8 min-w-8 flex-1 items-center justify-center rounded-full text-[11px] font-medium",
                    day.active
                      ? "bg-violet-700 text-white"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {day.label}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "tools" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Ghi chú học tập",
                text: "Lưu ý quan trọng khi xem bài giảng và ôn lại nhanh.",
              },
              {
                icon: Trophy,
                title: "Thử thách tuần",
                text: "Hoàn thành ít nhất một bài học mỗi ngày trong tuần này.",
              },
              {
                icon: Wrench,
                title: "Tài nguyên khóa học",
                text: "Mở khóa học đã mua để tải tài liệu và xem bài tập.",
              },
            ].map((tool) => (
              <div
                key={tool.title}
                className="rounded-2xl border border-border p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <tool.icon className="size-6 text-violet-700" />
                <h2 className="mt-3 text-base font-semibold">{tool.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{tool.text}</p>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "lists" ? (
          <div className="space-y-6">
            <form
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
              onSubmit={makeList}
            >
              <Input
                value={listName}
                placeholder="Tên danh sách mới"
                className="h-10 rounded-full sm:max-w-sm"
                onChange={(event) => setListName(event.target.value)}
              />
              <Button
                type="submit"
                className="h-10 rounded-full bg-violet-700 text-white hover:bg-violet-800"
              >
                <Plus className="size-4" />
                Tạo danh sách
              </Button>
            </form>
            {lists.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có danh sách. Tạo một danh sách để nhóm khóa học theo mục tiêu.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    className="rounded-2xl border border-border p-5 transition hover:-translate-y-0.5 hover:border-violet-300"
                  >
                    <h2 className="text-base font-semibold">{list.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {list.courseIds.length} khóa học
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {tab !== "lists" && tab !== "tools" ? (
          <>
            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <FilterSelect
                  label="Danh mục"
                  value={category}
                  onChange={setCategory}
                  options={[
                    { value: "all", label: "Tất cả danh mục" },
                    ...categories.map((name) => ({ value: name, label: name })),
                  ]}
                />
                <FilterSelect
                  label="Tiến độ"
                  value={progressFilter}
                  onChange={setProgressFilter}
                  options={[
                    { value: "all", label: "Mọi tiến độ" },
                    { value: "not-started", label: "Chưa bắt đầu" },
                    { value: "in-progress", label: "Đang học" },
                    { value: "done", label: "Đã hoàn thành" },
                  ]}
                />
                <FilterSelect
                  label="Giảng viên"
                  value={instructor}
                  onChange={setInstructor}
                  options={[
                    { value: "all", label: "Tất cả giảng viên" },
                    ...instructors.map((name) => ({ value: name, label: name })),
                  ]}
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <form
                  className="relative w-full sm:w-72"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    value={query}
                    placeholder="Tìm kiếm khóa học của tôi"
                    className="h-10 rounded-full pr-3 pl-10"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </form>
                <FilterSelect
                  label="Sắp xếp"
                  value={sort}
                  onChange={setSort}
                  options={[
                    { value: "recent", label: "Đã truy cập gần đây" },
                    { value: "enrolled", label: "Mới mua" },
                    { value: "title", label: "Theo tên A-Z" },
                  ]}
                />
              </div>
            </div>

            <p className="mt-5 text-sm text-muted-foreground" style={{
              fontSize: '16px',
              fontFamily: 'Roboto',
              fontWeight: '400',
              fontStyle: 'normal',
              lineHeight: 1.7,
              letterSpacing: '0.01em'
            }}>
              {loading && items.length === 0
                ? "Đang tải khóa học..."
                : `${visible.length} khóa học`}
            </p>

            {error ? (
              <p className="mt-8 text-sm text-destructive">{error}</p>
            ) : loading && items.length === 0 ? (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-border"
                  >
                    <div className="aspect-[16/9] animate-pulse bg-muted" />
                    <div className="space-y-2 p-4">
                      <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-dashed border-border px-4 py-12 text-center">
                {tab === "certs" ? (
                  <Award className="mx-auto size-10 text-muted-foreground" />
                ) : tab === "archived" ? (
                  <Archive className="mx-auto size-10 text-muted-foreground" />
                ) : (
                  <BookOpen className="mx-auto size-10 text-muted-foreground" />
                )}
                <p className="mt-3 font-medium">
                  {tab === "wishlist"
                    ? "Danh sách mong ước đang trống"
                    : tab === "certs"
                      ? "Chưa có chứng chỉ"
                      : tab === "archived"
                        ? "Chưa lưu trữ khóa học nào"
                        : "Bạn chưa có khóa học nào"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tab === "all"
                    ? "Mua khóa học để bắt đầu lộ trình học tập."
                    : "Hãy khám phá thêm khóa học trên LearnHub."}
                </p>
                <a
                  href="/khoa-hoc"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "mt-5 bg-violet-700 text-white hover:bg-violet-800",
                  )}
                >
                  Khám phá khóa học
                </a>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {visible.map((item) => (
                  <LearningCard
                    key={item.enrollmentId || item.courseId}
                    item={item}
                    lists={lists}
                    archived={tab === "archived"}
                    onArchive={archiveItem}
                    onAddList={addItemToList}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}

        {tab === "archived" && visible.length > 0 ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Dùng menu trên thẻ để khôi phục khóa học đã lưu trữ.
          </p>
        ) : null}
      </section>
    </div>
  );
};

function FilterSelect({ label, value, options, onChange }) {
  const selected = options.find((option) => option.value === value) || options[0];
  const type = {
    fontSize: "13px",
    fontFamily: "Roboto",
    fontWeight: "400",
    fontStyle: "normal",
    lineHeight: 1.5,
    letterSpacing: "0.01em",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        style={{ borderRadius: "5px" }}
        className="inline-flex h-10 max-w-full items-center gap-2 border border-border bg-background pr-3 pl-3 text-sm outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-violet-700/30"
      >
        <span className="shrink-0 text-muted-foreground" style={type}>
          {label}
        </span>
        <span className="max-w-[11rem] truncate font-medium" style={type}>
          {selected?.label}
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44 p-1">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <DropdownMenuItem
              key={option.value}
              style={type}
              className={cn(
                "h-9 cursor-pointer rounded-md px-2.5 transition-colors duration-150",
                "hover:bg-violet-50 hover:text-violet-700",
                "dark:hover:bg-violet-950/50 dark:hover:text-violet-300",
                active && "bg-violet-50 font-medium text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
              )}
              onClick={() => onChange(option.value)}
            >
              <span className="flex-1 truncate">{option.label}</span>
              {active ? <Check className="size-3.5 text-violet-700 dark:text-violet-300" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LearningPage;
