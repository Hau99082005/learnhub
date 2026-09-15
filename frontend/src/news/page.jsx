import { use, Suspense } from "react";
import { CONTACT } from "./data";
import { Mail, Phone } from "lucide-react";

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

function NewsDetailView({ slug }) {
  const item = use(getBlog(slug));

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-slate-600">Không tìm thấy bài viết.</p>
        <a href="/tin-tuc" className="mt-4 inline-block text-sm font-semibold text-violet-700 hover:underline">
          Quay lại tin tức
        </a>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white">
      <div className="relative h-[240px] overflow-hidden sm:h-[320px] lg:h-[400px]">
        <img
          src={item.imageUrl}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-4 pb-8 sm:px-6">
          <a
            href="/tin-tuc"
            className="mb-4 inline-block text-xs font-semibold uppercase tracking-wide text-white/80 hover:text-white"
          >
            ← Tin tức
          </a>
          <p className="text-xs font-medium text-violet-200">
            {formatDate(item.publishedAt)}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-white sm:text-4xl">
            {item.title}
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {item.excerpt ? (
          <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-700">
            {item.excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function NewsFallback() {
  return (
    <div className="min-h-[40vh] bg-white">
      <div className="h-[220px] animate-pulse bg-slate-200 sm:h-[300px] lg:h-[380px]" />
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

  return (
    <Suspense fallback={<NewsFallback />}>
      {slug ? <NewsDetailView slug={slug} /> : <NewsListView />}
    </Suspense>
  );
};

export default NewsPage;
