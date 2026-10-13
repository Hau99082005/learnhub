import { Suspense, use, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Link2,
  Mail,
  Newspaper,
  Phone,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CONTACT } from "./data";

const FACE = {
  fontFamily: "'Roboto', sans-serif",
  letterSpacing: "0.01em",
};

function formatDate(value) {
  if (!value) {
    return "";
  }
  if (Array.isArray(value)) {
    const [y, m, d] = value;
    if (!y || !m || !d) {
      return "";
    }
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function readingMinutes(text) {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

function parseContent(text) {
  const raw = String(text || "").replace(/\r\n/g, "\n").trim();
  if (!raw) {
    return { paragraphs: [], steps: [] };
  }
  const chunks = raw
    .split(/\n+/)
    .flatMap((block) => block.split(/(?=\d+\.\s)/))
    .map((part) => part.trim())
    .filter(Boolean);
  const paragraphs = [];
  const steps = [];
  for (const chunk of chunks) {
    const step = chunk.match(/^(\d+)\.\s+([\s\S]+)$/);
    if (step) {
      steps.push(step[2].trim());
    } else {
      paragraphs.push(chunk);
    }
  }
  return { paragraphs, steps };
}

async function copyArticleLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết");
    return true;
  } catch {
    toast.error("Không sao chép được liên kết");
    return false;
  }
}

async function shareArticle(title) {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, url: window.location.href });
      return;
    } catch {
      return;
    }
  }
  await copyArticleLink();
}

let newsPromise;
function getNews() {
  if (!newsPromise) {
    newsPromise = fetch("/api/news")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => (Array.isArray(data) ? data : []))
      .catch(() => []);
  }
  return newsPromise;
}

let blogsPromise;
function getBlogs() {
  if (!blogsPromise) {
    blogsPromise = fetch("/api/newsblogs")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => (Array.isArray(data) ? data : []))
      .catch(() => []);
  }
  return blogsPromise;
}

const blogPromises = new Map();
function getBlog(slug) {
  if (!blogPromises.has(slug)) {
    blogPromises.set(
      slug,
      fetch(`/api/newsblogs/${encodeURIComponent(slug)}`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    );
  }
  return blogPromises.get(slug);
}

getNews();
getBlogs();

const HERO_IMAGE = "/assets/images/news.png";

function ArticleCard({ item, featured = false }) {
  return (
    <article
      className={[
        "group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80",
        featured ? "shadow-md" : "",
      ].join(" ")}
    >
      <a href={`/tin-tuc/${encodeURIComponent(item.slug)}`} className="block w-full text-left">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm">
            {formatDate(item.publishedAt)}
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <h3
            className={[
              "font-bold leading-snug text-slate-900 transition group-hover:text-violet-700",
              featured ? "text-lg sm:text-xl" : "text-[15px] sm:text-base",
            ].join(" ")}
          >
            {item.title}
          </h3>
          {item.excerpt ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
              {item.excerpt}
            </p>
          ) : null}
        </div>
      </a>
    </article>
  );
}

function NewsListView() {
  const news = use(getNews());
  const blogs = use(getBlogs());
  const featured = news.slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative isolate overflow-hidden">
        <div className="relative min-h-[220px] sm:min-h-[300px] lg:min-h-[380px]">
          <img
            src={HERO_IMAGE}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/55" />
          <div className="relative mx-auto flex min-h-[220px] max-w-6xl flex-col justify-center px-4 py-14 sm:min-h-[300px] sm:px-6 lg:min-h-[380px] lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
              LearnHub
            </p>
            <h1 className="mt-2 max-w-xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Tin tức
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
              Cập nhật kiến thức, xu hướng học tập và câu chuyện từ cộng đồng
              LearnHub.
            </p>
          </div>
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="relative z-10 mx-auto -mt-9 max-w-6xl px-4 sm:-mt-12 sm:px-6 md:-mt-16 lg:-mt-[4.5rem] lg:px-8 xl:-mt-[6.75rem]">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {featured.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-200 sm:aspect-[16/9]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
          <div>
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Bài viết mới
              </h2>
            </div>
            {blogs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                Chưa có bài viết nào.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {blogs.map((item) => (
                  <ArticleCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:pt-12">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                Liên hệ
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <Phone className="size-4 text-violet-600" />
                  {CONTACT.phone}
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="size-4 text-violet-600" />
                  {CONTACT.email}
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function ReadingProgress() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      setValue(max > 0 ? Math.min(100, (root.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-40 h-0.5 bg-border/60">
      <div
        className="h-full bg-violet-700 transition-[width] duration-150 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function NewsDetailView({ slug }) {
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const date = item ? formatDate(item.publishedAt) : "";
  const minutes = item ? readingMinutes(`${item.title} ${item.excerpt}`) : 1;
  const body = useMemo(() => parseContent(item?.excerpt), [item?.excerpt]);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setItem(null);
    setRelated([]);
    fetch(`/api/newsblogs/${encodeURIComponent(slug)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((detail) => {
        if (cancelled) {
          return;
        }
        setItem(detail);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setItem(null);
          setReady(true);
        }
      });
    fetch("/api/newsblogs")
      .then((response) => (response.ok ? response.json() : []))
      .then((blogs) => {
        if (cancelled) {
          return;
        }
        setRelated(
          (Array.isArray(blogs) ? blogs : [])
            .filter((row) => row.slug && row.slug !== slug)
            .slice(0, 3),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (item?.title) {
      document.title = `${item.title} | LearnHub`;
    }
  }, [item?.title]);

  if (!ready) {
    return <NewsFallback />;
  }

  if (!item) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <span className="flex size-14 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          <Newspaper className="size-6" />
        </span>
        <h1
          className="mt-4 text-foreground"
          style={{ ...FACE, fontSize: "24px", fontWeight: 600, lineHeight: 1.4 }}
        >
          Không tìm thấy bài viết
        </h1>
        <p
          className="mt-2 max-w-md text-muted-foreground"
          style={{ ...FACE, fontSize: "15px", fontWeight: 400, lineHeight: 1.6 }}
        >
          Bài viết có thể đã bị ẩn hoặc đường dẫn không còn đúng.
        </p>
        <a
          href="/tin-tuc"
          className={cn(buttonVariants({ variant: "default" }), "mt-6 gap-2")}
        >
          <ArrowLeft className="size-4" />
          Quay lại tin tức
        </a>
      </section>
    );
  }

  return (
    <article className="relative min-h-screen bg-background">
      <ReadingProgress />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.12),transparent_55%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:py-10">
        <nav
          className="mb-5 flex flex-wrap items-center gap-1.5 text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-500"
          style={{ ...FACE, fontSize: "13px", fontWeight: 400, lineHeight: 1.4 }}
        >
          <a href="/" className="transition hover:text-violet-700 dark:hover:text-violet-300">
            Trang chủ
          </a>
          <ChevronRight className="size-3.5 shrink-0" />
          <a href="/tin-tuc" className="transition hover:text-violet-700 dark:hover:text-violet-300">
            Tin tức
          </a>
          <ChevronRight className="size-3.5 shrink-0" />
          <span className="line-clamp-1 text-foreground">{item.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)]">
              <div className="relative aspect-[16/9] overflow-hidden bg-muted sm:aspect-[2/1]">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="size-full object-cover transition duration-700 hover:scale-[1.03]"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-900 text-white/80">
                    <Newspaper className="size-12" />
                  </span>
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                {date ? (
                  <span
                    className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 px-2.5 py-1 text-slate-900 shadow-sm backdrop-blur-sm"
                    style={{
                      borderRadius: "6px",
                      ...FACE,
                      fontSize: "12px",
                      fontWeight: 500,
                      lineHeight: 1.2,
                    }}
                  >
                    <CalendarDays className="size-3.5" />
                    {date}
                  </span>
                ) : null}
              </div>
            </div>

            <p
              className="mt-5 inline-flex items-center gap-1.5 text-violet-700 dark:text-violet-300"
              style={{ ...FACE, fontSize: "13px", fontWeight: 500, lineHeight: 1.4 }}
            >
              <BookOpen className="size-3.5" />
              Bài viết
            </p>
            <h1
              className="mt-2 text-pretty text-foreground"
              style={{
                ...FACE,
                fontSize: "clamp(24px, 4vw, 36px)",
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              {item.title}
            </h1>
            <div
              className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground"
              style={{ ...FACE, fontSize: "14px", fontWeight: 400, lineHeight: 1.4 }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" />
                {minutes} phút đọc
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Newspaper className="size-4" />
                LearnHub
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
                onClick={() => shareArticle(item.title)}
              >
                <Share2 className="size-4" />
                Chia sẻ
              </button>
              <button
                type="button"
                className={cn(buttonVariants({ variant: "ghost" }), "gap-2")}
                onClick={async () => {
                  const ok = await copyArticleLink();
                  if (ok) {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1600);
                  }
                }}
              >
                {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
                {copied ? "Đã sao chép" : "Sao chép liên kết"}
              </button>
            </div>

            <div className="mt-8 space-y-5 border-t border-border/80 pt-8">
              {body.paragraphs.map((paragraph, index) => (
                <p
                  key={`p-${index}`}
                  className="text-pretty text-foreground/90"
                  style={{ ...FACE, fontSize: "16px", fontWeight: 400, lineHeight: 1.75 }}
                >
                  {paragraph}
                </p>
              ))}
              {body.steps.length > 0 ? (
                <ol className="space-y-4">
                  {body.steps.map((step, index) => (
                    <li
                      key={`s-${index}`}
                      className="flex gap-3 rounded-xl border border-border/70 bg-card/80 p-3.5 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.55)] sm:gap-4 sm:p-4"
                    >
                      <span
                        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-700 text-white"
                        style={{ ...FACE, fontSize: "13px", fontWeight: 600 }}
                      >
                        {index + 1}
                      </span>
                      <p
                        className="min-w-0 pt-1 text-pretty text-foreground/90"
                        style={{ ...FACE, fontSize: "16px", fontWeight: 400, lineHeight: 1.7 }}
                      >
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : null}
              {!body.paragraphs.length && !body.steps.length ? (
                <p
                  className="text-muted-foreground"
                  style={{ ...FACE, fontSize: "16px", fontWeight: 400, lineHeight: 1.7 }}
                >
                  Nội dung bài viết sẽ được cập nhật.
                </p>
              ) : null}
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-border/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <a
                href="/tin-tuc"
                className="inline-flex items-center gap-2 text-violet-700 transition hover:gap-2.5 dark:text-violet-300"
                style={{ ...FACE, fontSize: "14px", fontWeight: 500, lineHeight: 1.4 }}
              >
                <ArrowLeft className="size-4" />
                Tất cả bài viết
              </a>
              <button
                type="button"
                className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
                onClick={() => shareArticle(item.title)}
              >
                <Share2 className="size-4" />
                Chia sẻ bài viết
              </button>
            </div>
          </div>

          <aside className="space-y-5 lg:pt-1">
            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5 lg:sticky lg:top-20">
              <h2
                className="text-foreground"
                style={{ ...FACE, fontSize: "16px", fontWeight: 600, lineHeight: 1.4 }}
              >
                Bài viết khác
              </h2>
              {related.length === 0 ? (
                <p
                  className="mt-3 text-muted-foreground"
                  style={{ ...FACE, fontSize: "14px", fontWeight: 400, lineHeight: 1.6 }}
                >
                  Chưa có bài viết khác.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {related.map((row) => (
                    <li key={row.id}>
                      <a
                        href={`/tin-tuc/${encodeURIComponent(row.slug)}`}
                        className="group flex gap-3 rounded-xl border border-transparent p-1.5 transition hover:border-violet-200 hover:bg-violet-50/70 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/10"
                      >
                        <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {row.imageUrl ? (
                            <img
                              src={row.imageUrl}
                              alt=""
                              className="size-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <span className="flex size-full items-center justify-center text-violet-700">
                              <Newspaper className="size-5" />
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className="line-clamp-2 text-foreground transition group-hover:text-violet-700 dark:group-hover:text-violet-300"
                            style={{ ...FACE, fontSize: "14px", fontWeight: 500, lineHeight: 1.4 }}
                          >
                            {row.title}
                          </span>
                          <span
                            className="mt-1 inline-flex items-center gap-1 text-muted-foreground"
                            style={{ ...FACE, fontSize: "12px", fontWeight: 400 }}
                          >
                            Đọc tiếp
                            <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 sm:p-5">
              <h2
                className="text-foreground"
                style={{ ...FACE, fontSize: "16px", fontWeight: 600, lineHeight: 1.4 }}
              >
                Liên hệ
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Phone className="size-4 text-violet-700 dark:text-violet-300" />
                  {CONTACT.phone}
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="size-4 text-violet-700 dark:text-violet-300" />
                  {CONTACT.email}
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

function NewsFallback() {
  return (
    <div className="min-h-[50vh] bg-background">
      <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6">
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-5 aspect-[16/9] animate-pulse rounded-2xl bg-muted sm:aspect-[2/1]" />
        <div className="mt-6 space-y-3">
          <div className="h-8 w-4/5 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

function newsSlugFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts[0] !== "tin-tuc" || !parts[1]) {
    return "";
  }
  return decodeURIComponent(parts[1]);
}

const NewsPage = () => {
  const slug = newsSlugFromPath();
  if (slug) {
    return <NewsDetailView slug={slug} />;
  }
  return (
    <Suspense fallback={<NewsFallback />}>
      <NewsListView />
    </Suspense>
  );
};

export default NewsPage;
