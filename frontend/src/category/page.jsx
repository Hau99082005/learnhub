import { Suspense, use } from "react";
import { getData } from "@/components/Category";

function CategoryDetail({ slug }) {
  const items = use(getData());
  const item = items.find((entry) => entry.slug === slug);

  if (!item) {
    return (
      <section className="mx-auto w-full max-w-7xl px-3 py-10 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Không tìm thấy danh mục
        </h1>
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
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {item.name}
            </h1>
          </div>
        </div>
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
