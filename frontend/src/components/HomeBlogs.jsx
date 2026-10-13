import { Suspense, use } from "react";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";

let blogsPromise;

function getBlogs() {
  if (!blogsPromise) {
    blogsPromise = fetch("/api/newsblogs")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => (Array.isArray(data) ? data : []))
      .catch(() => []);
  }
  return blogsPromise;
}

getBlogs();

const type = {
  kicker: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: "24px",
    fontStyle: "normal",
    fontWeight: "500",
    lineHeight: 1.4,
    letterSpacing: "0.01em",
  },
  title: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: "32px",
    fontStyle: "normal",
    fontWeight: "500",
    lineHeight: 1.4,
    letterSpacing: "0.01em",
  },
  subtitle: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: "17px",
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 1.6,
    letterSpacing: "0.01em",
  },
  cardTitle: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: "500",
    lineHeight: 1.4,
    letterSpacing: "0.01em",
  },
  body: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 1.6,
    letterSpacing: "0.01em",
  },
};

function formatDate(value) {
  if (!value) {
    return "";
  }
  if (Array.isArray(value)) {
    const [year, month, day] = value;
    if (!year || !month || !day) {
      return "";
    }
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("vi-VN");
}

function BlogCard({ item }) {
  const href = `/tin-tuc/${encodeURIComponent(item.slug)}`;
  const date = formatDate(item.publishedAt);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden border border-border/80 bg-card shadow-[0_8px_24px_-18px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_22px_40px_-24px_rgba(91,33,182,0.45)] dark:hover:border-violet-500/40">
      <a href={href} className="relative block aspect-[16/9] overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="size-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <span className="flex size-full items-center justify-center bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-900 text-white/80">
            <Newspaper className="size-10" />
          </span>
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent opacity-80 transition duration-300 group-hover:opacity-100" />
        {date ? (
          <span
            className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 bg-white/95 px-2 py-1 text-slate-900 shadow-sm backdrop-blur-sm"
            style={{
              borderRadius: "5px",
              fontFamily: "'Roboto', sans-serif",
              fontSize: "12px",
              fontWeight: "500",
              lineHeight: 1.2,
              letterSpacing: "0.01em",
            }}
          >
            <Calendar className="size-3" />
            {date}
          </span>
        ) : null}
      </a>
      <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
        <a href={href} className="block">
          <h3
            className="line-clamp-2 min-h-11 text-foreground transition group-hover:text-violet-700 dark:group-hover:text-violet-300"
            style={type.cardTitle}
          >
            {item.title}
          </h3>
          {item.excerpt ? (
            <p
              className="mt-1 line-clamp-2 text-muted-foreground"
              style={type.body}
            >
              {item.excerpt}
            </p>
          ) : null}
        </a>
        <a
          href={href}
          className="mt-auto inline-flex items-center gap-1 pt-1 text-violet-700 transition group-hover:gap-1.5 dark:text-violet-300"
          style={type.body}
        >
          Đọc tiếp
          <ArrowRight className="size-3.5" />
        </a>
      </div>
    </article>
  );
}

function HomeBlogsView() {
  const items = use(getBlogs()).slice(0, 6);

  if (!items.length) {
    return null;
  }

  return (
    <section className="relative w-full">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.1),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_28%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="mb-5 flex flex-col gap-1 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-violet-700 uppercase dark:text-violet-300"
              style={type.kicker}
            >
              Bài viết
            </p>
            <h2
              className="mt-1 tracking-tight text-foreground"
              style={type.title}
            >
              Kiến thức và tin tức
            </h2>
            <p className="mt-1 text-muted-foreground" style={type.subtitle}>
              Cập nhật mới nhất dành cho bạn
            </p>
          </div>
          <a
            href="/tin-tuc"
            className="font-medium text-violet-700 underline-offset-4 transition hover:underline dark:text-violet-300"
            style={type.subtitle}
          >
            Xem tất cả bài viết
          </a>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="h-full animate-in fade-in slide-in-from-bottom-3 duration-500"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <BlogCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeBlogsFallback() {
  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="overflow-hidden border border-border">
              <div className="aspect-[16/9] animate-pulse bg-muted" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const HomeBlogs = () => (
  <Suspense fallback={<HomeBlogsFallback />}>
    <HomeBlogsView />
  </Suspense>
);

export default HomeBlogs;
