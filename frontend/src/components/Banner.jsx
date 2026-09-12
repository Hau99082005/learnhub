import { Suspense, use, useSyncExternalStore } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

let bannersPromise

function getData() {
  if (!bannersPromise) {
    bannersPromise = fetch("/api/banners")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => (Array.isArray(data) ? data : []))
      .catch(() => [])
  }
  return bannersPromise
}

getData()

function BannerDots({ count }) {
  const { api } = useCarousel()
  const selected = useSyncExternalStore(
    (onStoreChange) => {
      if (!api) {
        return () => {}
      }
      api.on("select", onStoreChange)
      api.on("reInit", onStoreChange)
      return () => {
        api.off("select", onStoreChange)
        api.off("reInit", onStoreChange)
      }
    },
    () => api?.selectedScrollSnap() ?? 0,
    () => 0,
  )

  if (count < 2) {
    return null
  }

  return (
    <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center sm:bottom-5">
      <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1.5 backdrop-blur-md">
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Banner ${index + 1}`}
            aria-current={selected === index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              selected === index ? "w-6 bg-white" : "w-1.5 bg-white/45 hover:bg-white/75",
            )}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  )
}

function BannerControls({ count }) {
  const { scrollPrev, scrollNext } = useCarousel()

  if (count < 2) {
    return null
  }

  return (
    <>
      <button
        type="button"
        aria-label="Banner trước"
        className="absolute top-1/2 left-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white shadow-lg backdrop-blur-md transition hover:bg-black/55 sm:left-4 sm:size-11"
        onClick={scrollPrev}
      >
        <ChevronLeft className="size-5 sm:size-6" />
      </button>
      <button
        type="button"
        aria-label="Banner sau"
        className="absolute top-1/2 right-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white shadow-lg backdrop-blur-md transition hover:bg-black/55 sm:right-4 sm:size-11"
        onClick={scrollNext}
      >
        <ChevronRight className="size-5 sm:size-6" />
      </button>
    </>
  )
}

function BannerView() {
  const items = use(getData())

  if (!items.length) {
    return null
  }

  return (
    <section className="w-full">
      <Carousel
        opts={{ loop: items.length > 1, align: "start", duration: 28 }}
        className="w-full"
      >
        <div className="relative w-full overflow-hidden bg-muted">
          <CarouselContent className="ml-0">
            {items.map((item) => (
              <CarouselItem key={item.id} className="pl-0">
                <div className="relative h-[42vw] min-h-[180px] w-full max-h-[280px] sm:min-h-[240px] sm:max-h-[380px] md:max-h-[460px] lg:max-h-[520px] xl:max-h-[580px]">
                  <img
                    src={item.imageUrl}
                    alt="Banner LearnHub"
                    className="size-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <BannerControls count={items.length} />
          <BannerDots count={items.length} />
        </div>
      </Carousel>
    </section>
  )
}

function BannerFallback() {
  return (
    <section className="w-full">
      <div className="h-[42vw] min-h-[180px] w-full max-h-[280px] animate-pulse bg-muted sm:min-h-[240px] sm:max-h-[380px] md:max-h-[460px] lg:max-h-[520px] xl:max-h-[580px]" />
    </section>
  )
}

const Banner = () => (
  <Suspense fallback={<BannerFallback />}>
    <BannerView />
  </Suspense>
)

export default Banner
