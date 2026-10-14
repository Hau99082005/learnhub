import { Suspense, use, useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { getData } from "@/components/Category";
import { CourseCard } from "@/components/Course";
import { buttonVariants } from "@/components/ui/button";
import {
  getWishlistIds,
  loadWishlist,
  onWishlistChange,
  toggleWishlist,
} from "@/lib/wishlist";
import { cn } from "@/lib/utils";

const TITLE = {
  fontFamily: "'Roboto', sans-serif",
  letterSpacing: "0.01em",
  lineHeight: 1.4,
};

function inCategory(course, category) {
  if (!course || !category) {
    return false;
  }
  if (Number(course.categoryId) === Number(category.id)) {
    return true;
  }
  const name = String(course.categoryName || "").trim().toLowerCase();
  return name !== "" && name === String(category.name || "").trim().toLowerCase();
}

function CategoryDetail({ slug }) {
  const items = use(getData());
  const item = items.find((entry) => entry.slug === slug);
  const [courses, setCourses] = useState([]);
  const [ready, setReady] = useState(false);
  const [wished, setWished] = useState(() => new Set(getWishlistIds()));

  useEffect(() => {
    loadWishlist().then((rows) =>
      setWished(new Set(rows.map((row) => Number(row.id)))),
    );
    return onWishlistChange((rows) =>
      setWished(new Set((rows || []).map((row) => Number(row.id)))),
    );
  }, []);

  useEffect(() => {
    if (!item) {
      setCourses([]);
      setReady(true);
      return undefined;
    }
    let cancelled = false;
    setReady(false);
    const path = `/api/courses?category=${encodeURIComponent(item.slug)}`;
    fetch(path)
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (cancelled) {
          return;
        }
        const rows = Array.isArray(data) ? data : [];
        const matched = rows.filter((course) => inCategory(course, item));
        setCourses(matched.length || !rows.length ? matched : rows);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setCourses([]);
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [item]);

  if (!item) {
    return (
      <section className="mx-auto w-full max-w-7xl px-3 py-10 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Không tìm thấy danh mục
        </h1>
        <a
          href="/khoa-hoc"
          className="mt-4 inline-flex text-sm font-medium text-violet-700 hover:underline"
        >
          Xem tất cả khóa học
        </a>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="relative h-[36vw] min-h-[180px] w-full max-h-[320px] bg-muted sm:min-h-[220px] sm:max-h-[380px] md:max-h-[420px]">
        {item.images ? (
          <img
            src={item.images}
            alt={item.name}
            className="size-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 py-5 sm:px-6 sm:py-7">
          <div className="mx-auto w-full max-w-7xl">
            <p className="text-sm text-white/80">Danh mục</p>
            <h1
              className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl"
              style={{ ...TITLE, fontWeight: 600 }}
            >
              {item.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-10">
        <p className="text-sm text-muted-foreground sm:text-base">
          {!ready
            ? "Đang tải khóa học..."
            : `${courses.length} khóa học trong danh mục này`}
        </p>
        {!ready ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden border border-border">
                <div className="aspect-[16/9] animate-pulse bg-muted" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border px-4 py-12 text-center">
            <BookOpen className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-3 font-medium">Chưa có khóa học trong danh mục này</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hãy khám phá các khóa học khác trên LearnHub.
            </p>
            <a
              href="/khoa-hoc"
              className={cn(
                buttonVariants({ variant: "default" }),
                "mt-5 bg-violet-700 text-white hover:bg-violet-800",
              )}
            >
              Xem tất cả khóa học
            </a>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                item={course}
                wished={wished.has(Number(course.id))}
                onWish={toggleWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const CategoryPage = ({ slug }) => (
  <Suspense
    fallback={
      <div className="h-[36vw] min-h-[180px] w-full max-h-[320px] animate-pulse bg-muted sm:min-h-[220px] sm:max-h-[380px] md:max-h-[420px]" />
    }
  >
    <CategoryDetail slug={slug} />
  </Suspense>
);

export default CategoryPage;
