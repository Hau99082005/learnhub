import { Suspense, use } from "react";

let categoriesPromise;

function getData() {
  if (!categoriesPromise) {
    categoriesPromise = fetch("/api/categories")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => (Array.isArray(data) ? data : []))
      .catch(() => []);
  }
  return categoriesPromise;
}

getData();

const type = {
  kicker: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: "12px",
    fontStyle: "normal",
    fontWeight: "500",
    lineHeight: 1.4,
    letterSpacing: "0.08em",
  },
  title: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: "20px",
    fontStyle: "normal",
    fontWeight: "500",
    lineHeight: 1.4,
    letterSpacing: "0.01em",
  },
  link: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: "13px",
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 1.4,
    letterSpacing: "0.01em",
  },
  name: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: "13px",
    fontStyle: "normal",
    fontWeight: "500",
    lineHeight: 1.4,
    letterSpacing: "0.01em",
  },
};

function CategoryView() {
  const items = use(getData());

  if (!items.length) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-violet-700 uppercase dark:text-violet-300" style={type.kicker}>
              Khám phá
            </p>
            <h2 className="mt-1 tracking-tight text-foreground" style={type.title}>
              Danh mục hàng đầu
            </h2>
          </div>
          <a
            href="/khoa-hoc"
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            style={type.link}
          >
            Xem khóa học
          </a>
        </div>
        <div className="grid max-w-[36rem] grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3.5">
          {items.map((item) => (
            <a
              key={item.id}
              href={`/danh-muc/${item.slug}`}
              className="group min-w-0 outline-none"
            >
              <div
                className="aspect-square overflow-hidden bg-muted ring-1 ring-border/70 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_24px_-16px_oklch(0_0_0/0.4)] group-focus-visible:ring-2 group-focus-visible:ring-ring"
                style={{ borderRadius: "50%" }}
              >
                {item.images ? (
                  <img
                    src={item.images}
                    alt={item.name}
                    className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-xs font-medium text-muted-foreground">
                    {item.name}
                  </span>
                )}
              </div>
              <p
                className="mt-2 line-clamp-2 text-foreground transition-colors group-hover:text-violet-700 dark:group-hover:text-violet-300"
                style={type.name}
              >
                {item.name}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryFallback() {
  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
        <div className="mb-4 h-6 w-40 animate-pulse rounded-md bg-muted" />
        <div className="grid max-w-[36rem] grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <div className="aspect-square animate-pulse bg-muted" style={{ borderRadius: "50%" }} />
              <div className="mt-2 h-3.5 w-16 animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const Category = () => (
  <Suspense fallback={<CategoryFallback />}>
    <CategoryView />
  </Suspense>
);

export { getData };
export default Category;
