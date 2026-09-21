import { Suspense, use, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Play,
  ShoppingBag,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

let coursesPromise;

function getData() {
  if (!coursesPromise) {
    coursesPromise = fetch("/api/courses")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => (Array.isArray(data) ? data : []))
      .catch(() => []);
  }
  return coursesPromise;
}

getData();

const LEVELS = {
  ALL: "Mọi cấp độ",
  BEGINNER: "Cơ bản",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Cao cấp",
};

function formatMoney(value, currency = "VND") {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Miễn phí";
  }
  if (currency === "USD") {
    return `$${amount.toLocaleString("en-US")}`;
  }
  return `${Math.round(amount).toLocaleString("vi-VN")} ₫`;
}

function formatDuration(seconds) {
  const total = Number(seconds) || 0;
  if (total < 60) {
    return null;
  }
  const hours = total / 3600;
  if (hours >= 1) {
    return `${hours.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} giờ`;
  }
  return `${Math.max(1, Math.round(total / 60))} phút`;
}

function formatCount(value) {
  const amount = Number(value) || 0;
  return amount.toLocaleString("vi-VN");
}

function CourseCard({ item, wished, onWish }) {
  const rating = Number(item.ratingAvg) || 0;
  const ratingCount = Number(item.ratingCount) || 0;
  const enrolled = Number(item.enrolledCount) || 0;
  const isFree = item.isFree === true || Number(item.price) <= 0;
  const compare = Number(item.compareAtPrice);
  const duration = formatDuration(item.durationSeconds);
  const level = LEVELS[item.level] || LEVELS.ALL;
  const bestseller = enrolled >= 50 || ratingCount >= 50;
  const href = `/khoa-hoc/${item.slug}`;

  return (
    <article className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-none border border-border/80 bg-card shadow-[0_8px_24px_-18px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_22px_40px_-24px_rgba(91,33,182,0.45)] dark:hover:border-violet-500/40">
      <a
        href={href}
        className="relative block aspect-[16/9] overflow-hidden bg-muted"
      >
        {item.images ? (
          <img
            src={item.images}
            alt={item.title}
            className="size-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-900 text-white/80">
            <Play className="size-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent opacity-80 transition duration-300 group-hover:opacity-100" />
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {bestseller ? (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-semibold text-slate-950 shadow-sm">
              Bán chạy nhất
            </span>
          ) : null}
          <span
            className="rounded-none bg-white/95 px-2 py-1 text-[11px] font-semibold text-slate-900 shadow-sm backdrop-blur-sm"
            style={{
              border: "none",
              borderRadius: "5px",
              fontFamily: "'Roboto', sans-serif",
              fontSize: "12px",
              fontWeight: "500",
              fontStyle: "normal",
              lineHeight: 1.2,
              letterSpacing: "0.01em",
            }}
          >
            {level}
          </span>
        </div>
        <button
          type="button"
          aria-label={wished ? "Bỏ yêu thích" : "Yêu thích"}
          className="absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm backdrop-blur-sm transition hover:scale-110 hover:text-rose-500"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onWish(item.id);
          }}
        >
          <Heart
            className={cn(
              "size-4 transition",
              wished && "fill-rose-500 text-rose-500",
            )}
          />
        </button>
        {item.previewVideo ? (
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
            <span className="flex size-12 items-center justify-center rounded-full bg-white/95 text-violet-700 shadow-lg">
              <Play className="size-5 fill-current" />
            </span>
          </span>
        ) : null}
      </a>
      <div className="flex flex-1 flex-col gap-2.5 p-3.5 sm:p-4">
        <a href={href} className="block">
          <h3
            className="line-clamp-2 min-h-11 text-[15px] font-semibold tracking-tight text-foreground transition group-hover:text-violet-700 dark:group-hover:text-violet-300"
            style={{
              fontFamily: "'Roboto', sans-serif",
              lineHeight: 1.4,
              letterSpacing: "0.01em",
              fontSize: "16px",
              fontWeight: "500",
              fontStyle: "normal",
            }}
          >
            {item.title}
          </h3>
          <p
            className="mt-1 line-clamp-1 text-sm text-muted-foreground"
            style={{
              fontFamily: "'Roboto', sans-serif",
              lineHeight: 1.4,
              letterSpacing: "0.01em",
              fontSize: "14px",
              fontWeight: "400",
              fontStyle: "normal",
            }}
          >
            {item.instructorName || "Giảng viên LearnHub"}
          </p>
        </a>
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          {rating > 0 ? (
            <>
              <span className="font-semibold text-amber-600">
                {rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-px">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "size-3.5",
                      index < Math.round(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40",
                    )}
                  />
                ))}
              </span>
              <span className="text-muted-foreground">
                ({formatCount(ratingCount)} xếp hạng)
              </span>
            </>
          ) : (
            <span
              className="text-muted-foreground"
              style={{
                fontFamily: "'Roboto', sans-serif",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
                fontSize: "14px",
                fontWeight: "400",
                fontStyle: "normal",
              }}
            >
              Chưa có đánh giá
            </span>
          )}
        </div>
        <p
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"
          style={{
            fontFamily: "'Roboto', sans-serif",
            lineHeight: 1.4,
            letterSpacing: "0.01em",
            fontSize: "13px",
            fontWeight: "400",
            fontStyle: "normal",
          }}
        >
          <span>Khóa học</span>
          {duration ? (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {duration}
              </span>
            </>
          ) : null}
          {item.categoryName ? (
            <>
              <span>·</span>
              <span>{item.categoryName}</span>
            </>
          ) : null}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            <p
              className="text-base font-bold text-violet-700 dark:text-violet-300"
              style={{
                fontFamily: "'Roboto', sans-serif",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
                fontSize: "18px",
                fontWeight: "700",
                fontStyle: "normal",
              }}
            >
              {isFree ? "Miễn phí" : formatMoney(item.price, item.currency)}
            </p>
            {!isFree &&
            Number.isFinite(compare) &&
            compare > Number(item.price) ? (
              <p
                className="text-xs text-muted-foreground line-through"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  lineHeight: 1.6,
                  letterSpacing: "0.01em",
                  fontSize: "14px",
                  fontWeight: "400",
                  fontStyle: "normal",
                }}
              >
                {formatMoney(compare, item.currency)}
              </p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          className="mt-1 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-none bg-violet-700 text-sm font-medium text-white transition hover:bg-violet-600 active:translate-y-px"
          onClick={(event) => {
            event.preventDefault();
            toast.success(`Đã thêm “${item.title}” vào giỏ hàng`);
          }}
          style={{
            fontFamily: "'Roboto', sans-serif",
            lineHeight: 1.4,
            letterSpacing: "0.01em",
            fontSize: "15px",
            fontWeight: "400",
            fontStyle: "normal",
            border: "none",
            borderRadius: "5px",
          }}
        >
          <ShoppingBag className="size-4" />
          Thêm vào giỏ hàng
        </button>
      </div>
    </article>
  );
}

function CourseControls({ count }) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel();

  if (count < 2) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Khóa học trước"
        disabled={!canScrollPrev}
        className="absolute top-[38%] left-0 z-10 hidden size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition hover:scale-105 hover:bg-violet-50 disabled:pointer-events-none disabled:opacity-0 md:flex dark:hover:bg-violet-950/40"
        onClick={scrollPrev}
      >
        <ChevronLeft className="size-6" />
      </button>
      <button
        type="button"
        aria-label="Khóa học sau"
        disabled={!canScrollNext}
        className="absolute top-[38%] right-0 z-10 hidden size-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition hover:scale-105 hover:bg-violet-50 disabled:pointer-events-none disabled:opacity-0 md:flex dark:hover:bg-violet-950/40"
        onClick={scrollNext}
      >
        <ChevronRight className="size-6" />
      </button>
    </>
  );
}

function CourseView() {
  const items = use(getData());
  const [wished, setWished] = useState(() => new Set());

  if (!items.length) {
    return null;
  }

  const toggleWish = (id) => {
    setWished((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section className="relative w-full">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.1),transparent_28%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="mb-5 flex flex-col gap-1 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-sm font-medium tracking-wide text-violet-700 uppercase dark:text-violet-300"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "24px",
                fontStyle: "normal",
                fontWeight: "500",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
              }}
            >
              Lộ trình học tập
            </p>
            <h2
              className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "32px",
                fontStyle: "normal",
                fontWeight: "500",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
              }}
            >
              Lĩnh vực sẽ học tiếp theo
            </h2>
            <p
              className="mt-1 text-sm text-muted-foreground sm:text-base"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "17px",
                fontStyle: "normal",
                fontWeight: "400",
                lineHeight: 1.6,
                letterSpacing: "0.01em",
              }}
            >
              Được đề xuất cho bạn
            </p>
          </div>
          <a
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "17px",
              fontStyle: "normal",
              fontWeight: "400",
              lineHeight: 1.6,
              letterSpacing: "0.01em",
            }}
            href="/khoa-hoc"
            className="text-sm font-medium text-violet-700 underline-offset-4 transition hover:underline dark:text-violet-300"
          >
            Xem tất cả khóa học
          </a>
        </div>
        <Carousel
          opts={{ align: "start", dragFree: true, containScroll: "trimSnaps" }}
          className="w-full"
        >
          <div className="relative">
            <CarouselContent className="-ml-3 sm:-ml-4">
              {items.map((item, index) => (
                <CarouselItem
                  key={item.id}
                  className="min-w-0 basis-[80%] pl-3 sm:basis-[52%] sm:pl-4 md:basis-[44%] lg:basis-[36%] xl:basis-[31%] 2xl:basis-[27%]"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className="h-full animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <CourseCard
                      item={item}
                      wished={wished.has(item.id)}
                      onWish={toggleWish}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CourseControls count={items.length} />
          </div>
        </Carousel>
      </div>
    </section>
  );
}

function CourseFallback() {
  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="min-w-[80%] overflow-hidden rounded-none border border-border sm:min-w-[50%] md:min-w-[42%] lg:min-w-[34%] xl:min-w-[30%]"
            >
              <div className="aspect-[16/9] animate-pulse bg-muted" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-8 w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CourseGridView() {
  const items = use(getData());
  const [wished, setWished] = useState(() => new Set());

  const toggleWish = (id) => {
    setWished((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-10 lg:py-12">
        <h1
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ fontFamily: "'Roboto', sans-serif" }}
        >
          Các khóa học
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {items.length} khóa học đang mở
        </p>
        {items.length === 0 ? (
          <p className="mt-10 text-muted-foreground">
            Chưa có khóa học xuất bản.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <CourseCard
                key={item.id}
                item={item}
                wished={wished.has(item.id)}
                onWish={toggleWish}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const Course = () => (
  <Suspense fallback={<CourseFallback />}>
    <CourseView />
  </Suspense>
);

const CourseGrid = () => (
  <Suspense fallback={<CourseFallback />}>
    <CourseGridView />
  </Suspense>
);

export {
  getData,
  CourseGrid,
  CourseCard,
  formatMoney,
  formatDuration,
  formatCount,
  LEVELS,
};
export default Course;
