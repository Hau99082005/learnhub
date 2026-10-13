import { Suspense, use, useEffect, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

let bannersPromise;

function getData() {
  if (!bannersPromise) {
    bannersPromise = fetch("/api/banners")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => (Array.isArray(data) ? data : []))
      .catch(() => []);
  }
  return bannersPromise;
}

getData();

function BannerAutoplay({ enabled }) {
  const { api } = useCarousel();

  useEffect(() => {
    if (!api || !enabled) {
      return undefined;
    }
    const root = api.rootNode()?.closest(".group");
    let paused = false;
    const id = window.setInterval(() => {
      if (!paused) {
        api.scrollNext();
      }
    }, 5600);
    const enter = () => {
      paused = true;
    };
    const leave = () => {
      paused = false;
    };
    root?.addEventListener("mouseenter", enter);
    root?.addEventListener("mouseleave", leave);
    return () => {
      window.clearInterval(id);
      root?.removeEventListener("mouseenter", enter);
      root?.removeEventListener("mouseleave", leave);
    };
  }, [api, enabled]);

  return null;
}

function BannerDots({ count }) {
  const { api } = useCarousel();
  const selected = useSyncExternalStore(
    (onStoreChange) => {
      if (!api) {
        return () => {};
      }
      api.on("select", onStoreChange);
      api.on("reInit", onStoreChange);
      return () => {
        api.off("select", onStoreChange);
        api.off("reInit", onStoreChange);
      };
    },
    () => api?.selectedScrollSnap() ?? 0,
    () => 0,
  );

  if (count < 2) {
    return null;
  }

  return (
    <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center sm:bottom-5">
      <div className="flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1.5 backdrop-blur-md">
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Banner ${index + 1}`}
            aria-current={selected === index ? true : undefined}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              selected === index
                ? "w-6 bg-white"
                : "w-1.5 bg-white/45 hover:bg-white/75",
            )}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}

function BannerControls({ count }) {
  const { scrollPrev, scrollNext } = useCarousel();

  if (count < 2) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Banner trước"
        className="absolute top-1/2 left-2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white shadow-md backdrop-blur-md transition hover:bg-black/50 sm:left-3 sm:flex sm:size-10 md:opacity-0 md:group-hover:opacity-100"
        onClick={scrollPrev}
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Banner sau"
        className="absolute top-1/2 right-2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white shadow-md backdrop-blur-md transition hover:bg-black/50 sm:right-3 sm:flex sm:size-10 md:opacity-0 md:group-hover:opacity-100"
        onClick={scrollNext}
      >
        <ChevronRight className="size-5" />
      </button>
    </>
  );
}

function BannerView() {
  const items = use(getData());

  if (!items.length) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-7xl px-3 pt-3 sm:px-6 sm:pt-4">
        <Carousel
          opts={{ loop: items.length > 1, align: "start", duration: 32 }}
          className="w-full"
        >
          <div className="group relative w-full overflow-hidden rounded-xl bg-muted shadow-[0_18px_40px_-28px_oklch(0_0_0/0.55)] sm:rounded-2xl">
            <CarouselContent className="ml-0">
              {items.map((item) => (
                <CarouselItem key={item.id} className="pl-0">
                  <div className="relative h-[58vw] min-h-[220px] w-full max-h-[280px] overflow-hidden sm:h-[42vw] sm:min-h-[280px] sm:max-h-[380px] md:max-h-[430px] lg:max-h-[460px]">
                    <img
                      src={item.imageUrl}
                      alt={item.title || "Banner LearnHub"}
                      className="lh-ken size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent sm:bg-gradient-to-r sm:from-black/50 sm:via-black/15 sm:to-transparent" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <BannerAutoplay enabled={items.length > 1} />
            <BannerControls count={items.length} />
            <BannerDots count={items.length} />
          </div>
        </Carousel>
      </div>
    </section>
  );
}

function BannerFallback() {
  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-7xl px-3 pt-3 sm:px-6 sm:pt-4">
        <div className="h-[58vw] min-h-[220px] w-full max-h-[280px] animate-pulse rounded-xl bg-muted sm:h-[42vw] sm:min-h-[280px] sm:max-h-[380px] sm:rounded-2xl md:max-h-[430px] lg:max-h-[460px]" />
      </div>
    </section>
  );
}

const Banner = () => (
  <Suspense fallback={<BannerFallback />}>
    <BannerView />
  </Suspense>
);

export default Banner;
