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

function CategoryView() {
  const items = use(getData());

  if (!items.length) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="mx-auto flex w-full max-w-7xl justify-center px-3 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="flex w-full flex-wrap items-start justify-center gap-x-5 gap-y-6 sm:gap-x-8 sm:gap-y-8 md:gap-x-10 lg:gap-x-12">
          {items.map((item) => (
            <a
              key={item.id}
              href={`/danh-muc/${item.slug}`}
              className="group flex w-[42%] max-w-[132px] flex-col items-center gap-2.5 outline-none sm:w-36 sm:max-w-none md:w-40 lg:w-44"
            >
              <div
                className="aspect-square w-full overflow-hidden bg-muted ring-1 ring-border/50 transition duration-300 group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-ring"
                style={{ borderRadius: "50%" }}
              >
                {item.images ? (
                  <img
                    src={item.images}
                    alt={item.name}
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                    style={{ borderRadius: "50%" }}
                  />
                ) : null}
              </div>
              <p
                className="line-clamp-2 text-center text-sm font-medium text-foreground sm:text-[15px]"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "16px",
                  fontWeight: "500",
                  fontStyle: "normal",
                  lineHeight: 1.4,
                  letterSpacing: "0.01em",
                }}
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
      <div className="mx-auto flex w-full max-w-7xl justify-center px-3 py-8 sm:px-6 sm:py-10">
        <div className="flex w-full flex-wrap justify-center gap-x-5 gap-y-6 sm:gap-x-8 md:gap-x-10">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex w-[42%] max-w-[132px] flex-col items-center gap-2.5 sm:w-36 sm:max-w-none md:w-40 lg:w-44"
            >
              <div
                className="aspect-square w-full animate-pulse bg-muted"
                style={{ borderRadius: "50%" }}
              />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
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
