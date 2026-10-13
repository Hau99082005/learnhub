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
      <div className="mx-auto w-full max-w-7xl px-3 py-9 sm:px-6 sm:py-12">
        <div className="mb-5 flex items-end justify-between gap-3 sm:mb-7">
          <div>
            <p className="text-xs font-medium tracking-wide text-violet-700 uppercase">
              Khám phá
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Danh mục hàng đầu
            </h2>
          </div>
          <a
            href="/khoa-hoc"
            className="shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Xem khóa học
          </a>
        </div>
        <div className="lh-hide-scroll flex gap-4 overflow-x-auto pb-1 snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible md:grid-cols-4">
          {items.map((item) => (
            <a
              key={item.id}
              href={`/danh-muc/${item.slug}`}
              className="group w-[42%] min-w-[9.75rem] shrink-0 snap-start outline-none sm:w-auto sm:min-w-0"
            >
              <div className="aspect-square overflow-hidden rounded-2xl bg-muted ring-1 ring-border/60 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_32px_-20px_oklch(0_0_0/0.45)] group-focus-visible:ring-2 group-focus-visible:ring-ring">
                {item.images ? (
                  <img
                    src={item.images}
                    alt={item.name}
                    className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-sm font-medium text-muted-foreground">
                    {item.name}
                  </span>
                )}
              </div>
              <p className="mt-2.5 line-clamp-2 text-sm font-medium tracking-tight text-foreground transition-colors group-hover:text-violet-700 sm:text-[15px]">
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
      <div className="mx-auto w-full max-w-7xl px-3 py-9 sm:px-6 sm:py-12">
        <div className="mb-6 h-7 w-48 animate-pulse rounded bg-muted" />
        <div className="flex gap-4 sm:grid sm:grid-cols-4 sm:gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-[42%] min-w-[9.75rem] sm:w-auto sm:min-w-0">
              <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
              <div className="mt-2.5 h-4 w-24 animate-pulse rounded bg-muted" />
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
