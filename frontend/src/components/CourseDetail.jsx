import { Suspense, use, useState } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Globe,
  Heart,
  Monitor,
  Play,
  ShoppingBag,
  Smartphone,
  Star,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  formatCount,
  formatDuration,
  formatMoney,
  getData,
  LEVELS,
} from "@/components/Course";
import { cn } from "@/lib/utils";

const LANG = { vi: "Tiếng Việt", en: "English" };

function formatDate(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString("vi-VN", {
    month: "numeric",
    year: "numeric",
  });
}

function discountOf(price, compare) {
  const current = Number(price);
  const original = Number(compare);
  if (
    !Number.isFinite(current) ||
    !Number.isFinite(original) ||
    original <= current
  ) {
    return 0;
  }
  return Math.round((1 - current / original) * 100);
}

function PreviewPlayer({ item }) {
  const [playing, setPlaying] = useState(false);
  const hasVideo = Boolean(item.previewVideo);

  if (playing && hasVideo) {
    return (
      <video
        id="course-preview-video"
        src={item.previewVideo}
        poster={item.images || undefined}
        controls
        autoPlay
        playsInline
        preload="metadata"
        className="aspect-video w-full bg-black object-contain"
      />
    );
  }

  return (
    <button
      id="course-preview-video"
      type="button"
      className="group relative block aspect-video w-full overflow-hidden bg-muted"
      onClick={() => {
        if (hasVideo) {
          setPlaying(true);
          return;
        }
        toast.error("Khóa học chưa có video demo");
      }}
    >
      {item.images ? (
        <img
          src={item.images}
          alt={item.title}
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-slate-900 text-white">
          <Play className="size-10 fill-current" />
        </div>
      )}
      <span className="absolute inset-0 bg-black/35 transition group-hover:bg-black/45" />
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
        <span className="flex size-14 items-center justify-center rounded-full bg-white text-slate-950 shadow-lg transition group-hover:scale-105">
          <Play className="size-6 fill-current" />
        </span>
        <span className="text-sm font-semibold">
          {hasVideo ? "Xem trước khóa học này" : "Chưa có video demo"}
        </span>
      </span>
    </button>
  );
}

function PurchaseCard({ item }) {
  const isFree = item.isFree === true || Number(item.price) <= 0;
  const compare = Number(item.compareAtPrice);
  const showCompare =
    !isFree && Number.isFinite(compare) && compare > Number(item.price);
  const off = discountOf(item.price, item.compareAtPrice);
  const duration = formatDuration(item.durationSeconds);

  return (
    <div className="overflow-hidden border border-border bg-background text-foreground shadow-[0_12px_40px_-16px_rgba(0,0,0,0.45)]">
      <PreviewPlayer item={item} />
      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-2">
          <p
            className="text-2xl font-bold tracking-tight text-violet-700"
            style={{
              fontSize: "24px",
              fontStyle: "normal",
              fontWeight: "700",
              lineHeight: 1.4,
              letterSpacing: "0.01em",
            }}
          >
            {isFree ? "Miễn phí" : formatMoney(item.price, item.currency)}
          </p>
          {showCompare ? (
            <>
              <p
                className="text-sm text-muted-foreground line-through"
                style={{
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: "700",
                  lineHeight: 1.8,
                  letterSpacing: "0.01em",
                }}
              >
                {formatMoney(compare, item.currency)}
              </p>
              {off > 0 ? (
                <p
                  className="text-sm font-medium text-foreground w-20 h-6"
                  style={{
                    background: "#EF4444",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "400",
                    fontStyle: "normal",
                    lineHeight: 1.4,
                    letterSpacing: "0.01em",
                    textAlign: "center",
                    alignContent: "center",
                    justifyContent: "center",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  Giảm {off}%
                </p>
              ) : null}
            </>
          ) : null}
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-full items-center justify-center gap-1.5 bg-violet-700 text-sm font-semibold text-white transition hover:bg-violet-600"
          onClick={() => toast.success(`Đã thêm “${item.title}” vào giỏ hàng`)}
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: "14px",
            fontWeight: "400",
            fontStyle: "normal",
            lineHeight: 1.4,
            letterSpacing: "0.01em",
            border: "none",
            borderRadius: "5px",
          }}
        >
          <ShoppingBag className="size-4" />
          Thêm vào giỏ hàng
        </button>
        <button
          type="button"
          className="inline-flex h-11 w-full items-center justify-center border border-foreground/20 bg-background text-sm font-semibold transition hover:bg-muted"
          onClick={() => toast.success("Đăng ký khóa học thành công")}
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: "14px",
            fontWeight: "400",
            fontStyle: "normal",
            lineHeight: 1.4,
            letterSpacing: "0.01em",
            border: "1px solid white",
            borderRadius: "5px",
          }}
        >
          {isFree ? "Đăng ký miễn phí" : "Mua ngay"}
        </button>
        <p
          className="text-center text-xs text-muted-foreground"
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: "12px",
            fontWeight: "400",
            fontStyle: "normal",
            lineHeight: 1.4,
            letterSpacing: "0.01em",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Đảm bảo hoàn tiền trong 30 ngày
        </p>
        <div className="space-y-2 pt-1">
          <p
            className="text-sm font-semibold"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "16px",
              fontWeight: "500",
              fontStyle: "normal",
              lineHeight: 1.4,
              letterSpacing: "0.01em",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Khóa học này bao gồm:
          </p>
          <ul
            className="space-y-2 text-sm text-foreground/90"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "14px",
              fontWeight: "400",
              fontStyle: "normal",
              lineHeight: 1.4,
              letterSpacing: "0.01em",
              border: "none",
              borderRadius: "5px",
            }}
          >
            {duration ? (
              <li className="flex items-center gap-2">
                <Clock className="size-4 shrink-0" />
                {duration} video theo yêu cầu
              </li>
            ) : null}
            <li className="flex items-center gap-2">
              <Monitor className="size-4 shrink-0" />
              Truy cập trên máy tính và TV
            </li>
            <li className="flex items-center gap-2">
              <Smartphone className="size-4 shrink-0" />
              Truy cập trên thiết bị di động
            </li>
            {item.issuesCertificate ? (
              <li className="flex items-center gap-2">
                <Award className="size-4 shrink-0" />
                Chứng chỉ hoàn thành
              </li>
            ) : null}
            <li className="flex items-center gap-2">
              <BookOpen className="size-4 shrink-0" />
              Quyền truy cập đầy đủ trọn đời
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CourseDetailView({ slug }) {
  const items = use(getData());
  const item = items.find((entry) => entry.slug === slug);
  const [expanded, setExpanded] = useState(false);
  const [wished, setWished] = useState(false);

  if (!item) {
    return (
      <section className="mx-auto w-full max-w-7xl px-3 py-10 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Không tìm thấy khóa học
        </h1>
      </section>
    );
  }

  const rating = Number(item.ratingAvg) || 0;
  const ratingCount = Number(item.ratingCount) || 0;
  const enrolled = Number(item.enrolledCount) || 0;
  const learn = Array.isArray(item.whatYouWillLearn)
    ? item.whatYouWillLearn.filter(Boolean)
    : [];
  const requirements = Array.isArray(item.requirements)
    ? item.requirements.filter(Boolean)
    : [];
  const related = items.filter((entry) => entry.id !== item.id).slice(0, 6);
  const updated = formatDate(item.updatedAt || item.publishedAt);
  const description = item.description || "";
  const longText = description.length > 420;
  const shownText =
    expanded || !longText
      ? description
      : `${description.slice(0, 420).trim()}…`;
  const bestseller = enrolled >= 50 || ratingCount >= 50;

  return (
    <section className="w-full bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[minmax(0,1fr)_21.5rem] lg:gap-10">
        <div className="relative order-1 min-w-0 text-white">
          <div className="absolute inset-0 left-1/2 w-screen -translate-x-1/2 bg-[#1c1d1f]" />
          <div className="relative px-3 py-6 sm:px-6 sm:py-8 lg:py-10">
            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-violet-300">
              <a
                href="/khoa-hoc"
                className="hover:underline"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "15px",
                  fontWeight: "400",
                  fontStyle: "normal",
                  lineHeight: 1.3,
                  letterSpacing: "0.01em",
                }}
              >
                Khóa học
              </a>
              {item.categoryName ? (
                <>
                  <span className="text-white/40">/</span>
                  <span
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: "15px",
                      fontWeight: "400",
                      fontStyle: "normal",
                      lineHeight: 1.3,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {item.categoryName}
                  </span>
                </>
              ) : null}
            </nav>
            <h1
              className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
              style={{
                fontFamily: "'Roboto', sans-serif",
                lineHeight: 1.3,
                fontSize: "50px",
                fontWeight: "600",
                fontStyle: "normal",
                letterSpacing: "0.01em",
              }}
            >
              {item.title}
            </h1>
            {item.subtitle ? (
              <p
                className="mt-3 text-base text-white/80 sm:text-lg"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  lineHeight: 1.4,
                  fontSize: "20px",
                  fontWeight: "400",
                  fontStyle: "normal",
                  letterSpacing: "0.01em",
                }}
              >
                {item.subtitle}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
              {bestseller ? (
                <span className="bg-amber-400 px-1.5 py-0.5 text-xs font-semibold text-slate-950">
                  Bán chạy nhất
                </span>
              ) : null}
              <span
                className="bg-violet-700 px-2 py-1 text-xs font-semibold"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  lineHeight: 1.3,
                  fontSize: "14px",
                  fontWeight: "400",
                  fontStyle: "normal",
                  letterSpacing: "0.01em",
                  border: "none",
                  borderRadius: "3px",
                }}
              >
                {LEVELS[item.level] || LEVELS.ALL}
              </span>
              {rating > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <span className="font-bold text-amber-400">
                    {rating.toFixed(1)}
                  </span>
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-violet-300 underline-offset-2">
                    ({formatCount(ratingCount)} xếp hạng)
                  </span>
                </span>
              ) : (
                <span
                  className="text-white/70"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    lineHeight: 1.3,
                    fontSize: "14px",
                    fontWeight: "400",
                    fontStyle: "normal",
                    letterSpacing: "0.01em",
                  }}
                >
                  Chưa có đánh giá
                </span>
              )}
              {enrolled > 0 ? (
                <span className="text-white/80">
                  {formatCount(enrolled)} học viên
                </span>
              ) : null}
            </div>
            <p
              className="mt-3 text-sm text-white/85"
              style={{
                fontFamily: "'Roboto', sans-serif",
                lineHeight: 1.6,
                fontSize: "14px",
                fontWeight: "400",
                fontStyle: "normal",
                letterSpacing: "0.01em",
              }}
            >
              Được tạo bởi{" "}
              <span className="font-medium text-violet-300">
                {item.instructorName || "Giảng viên LearnHub"}
              </span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
              {updated ? (
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    lineHeight: 1.6,
                    fontSize: "14px",
                    fontWeight: "400",
                    fontStyle: "normal",
                    letterSpacing: "0.01em",
                  }}
                >
                  <Calendar className="size-4" />
                  Lần cập nhật gần nhất {updated}
                </span>
              ) : null}
              <span
                className="inline-flex items-center gap-1.5"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  lineHeight: 1.6,
                  fontSize: "14px",
                  fontWeight: "400",
                  fontStyle: "normal",
                  letterSpacing: "0.01em",
                }}
              >
                <Globe className="size-4" />
                {LANG[item.language] || item.language || "Tiếng Việt"}
              </span>
            </div>
          </div>
        </div>

        <aside className="order-2 px-3 pb-6 sm:px-6 lg:sticky lg:top-24 lg:row-span-2 lg:self-start lg:px-0 lg:pt-10 lg:pb-10">
          <PurchaseCard item={item} />
          <button
            type="button"
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 border border-border text-sm transition hover:bg-muted"
            onClick={() => setWished((value) => !value)}
            style={{
              fontSize: "16px",
              fontWeight: "400",
              fontStyle: "normal",
              lineHeight: 1.4,
              letterSpacing: "0.01em",
              borderRadius: "5px",
            }}
          >
            <Heart
              className={cn("size-4", wished && "fill-rose-500 text-rose-500")}
            />
            {wished ? "Đã yêu thích" : "Thêm vào yêu thích"}
          </button>
        </aside>

        <div className="order-3 min-w-0 space-y-8 px-3 py-8 sm:px-6 lg:px-6">
          {learn.length > 0 ? (
            <section className="border border-border p-4 sm:p-6">
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                Nội dung bài học
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
                {learn.map((line) => (
                  <li key={line} className="flex gap-2 text-sm leading-6">
                    <Check className="mt-0.5 size-4 shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2
              className="text-xl font-bold tracking-tight sm:text-2xl"
              style={{
                fontFamily: "'Roboto', sans-serif",
                lineHeight: 1.2,
                fontSize: "28px",
                fontWeight: "600",
                fontStyle: "normal",
                letterSpacing: "0.01em",
              }}
            >
              Khóa học này bao gồm:
            </h2>
            <ul
              className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2"
              style={{
                fontFamily: "'Roboto', sans-serif",
                lineHeight: 1.6,
                fontSize: "14px",
                fontWeight: "400",
                fontStyle: "normal",
                letterSpacing: "0.01em",
              }}
            >
              <li className="flex items-center gap-2">
                <Clock className="size-4" />
                {formatDuration(item.durationSeconds) || "Video theo yêu cầu"}
              </li>
              <li className="flex items-center gap-2">
                <Monitor className="size-4" />
                Truy cập trên thiết bị di động và TV
              </li>
              <li className="flex items-center gap-2">
                <BookOpen className="size-4" />
                Quyền truy cập đầy đủ trọn đời
              </li>
              {item.issuesCertificate ? (
                <li className="flex items-center gap-2">
                  <Award className="size-4" />
                  Chứng chỉ hoàn thành
                </li>
              ) : null}
            </ul>
          </section>

          {item.previewVideo ? (
            <section className="border border-border">
              <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
                <div>
                  <h2
                    className="text-xl font-bold tracking-tight"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      lineHeight: 1.6,
                      fontSize: "18px",
                      fontWeight: "600",
                      fontStyle: "normal",
                      letterSpacing: "0.01em",
                    }}
                  >
                    Nội dung khóa học
                  </h2>
                  <p
                    className="mt-1 text-sm text-muted-foreground"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      lineHeight: 1.6,
                      fontSize: "14px",
                      fontWeight: "400",
                      fontStyle: "normal",
                      letterSpacing: "0.01em",
                    }}
                  >
                    1 phần · Video demo ·{" "}
                    {formatDuration(item.durationSeconds) || "Xem trước"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-muted/60 sm:px-5"
                onClick={() => {
                  const node = document.getElementById("course-preview-video");
                  node?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                <span
                  className="inline-flex items-center gap-2"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    lineHeight: 1.6,
                    fontSize: "14px",
                    fontWeight: "400",
                    fontStyle: "normal",
                    letterSpacing: "0.01em",
                  }}
                >
                  <Play className="size-4" />
                  Video giới thiệu khóa học
                </span>
                <span
                  className="text-muted-foreground"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    lineHeight: 1.6,
                    fontSize: "14px",
                    fontWeight: "400",
                    fontStyle: "normal",
                    letterSpacing: "0.01em",
                  }}
                >
                  {formatDuration(item.durationSeconds) || ""}
                </span>
              </button>
            </section>
          ) : null}

          {requirements.length > 0 ? (
            <section>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                Yêu cầu
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6">
                {requirements.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {description ? (
            <section>
              <h2
                className="text-xl font-bold tracking-tight sm:text-2xl"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  lineHeight: 1.2,
                  fontSize: "28px",
                  fontWeight: "600",
                  fontStyle: "normal",
                  letterSpacing: "0.01em",
                }}
              >
                Mô tả
              </h2>
              <p
                className="mt-3 whitespace-pre-line text-sm leading-7 text-foreground/90"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  lineHeight: 1.6,
                  fontSize: "16px",
                  fontWeight: "400",
                  fontStyle: "normal",
                  letterSpacing: "0.01em",
                }}
              >
                {shownText}
              </p>
              {longText ? (
                <button
                  type="button"
                  className="mt-2 text-sm font-semibold text-violet-700 hover:underline dark:text-violet-300"
                  onClick={() => setExpanded((value) => !value)}
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    lineHeight: 1.2,
                    fontSize: "16px",
                    fontWeight: "400",
                    fontStyle: "normal",
                    letterSpacing: "0.01em",
                  }}
                >
                  {expanded ? "Thu gọn" : "Hiện thêm"}
                </button>
              ) : null}
            </section>
          ) : null}

          <section>
            <h2
              className="text-xl font-bold tracking-tight sm:text-2xl"
              style={{
                fontFamily: "'Roboto', sans-serif",
                lineHeight: 1.2,
                fontSize: "28px",
                fontWeight: "600",
                fontStyle: "normal",
                letterSpacing: "0.01em",
              }}
            >
              Giảng viên
            </h2>
            <div className="mt-4 flex items-start gap-4">
              <div
                className="flex size-16 shrink-0 items-center justify-center bg-violet-700 text-lg font-semibold text-white"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  lineHeight: 1.2,
                  fontSize: "24px",
                  fontWeight: "700",
                  fontStyle: "normal",
                  letterSpacing: "0.01em",
                  border: "none",
                  borderRadius: "50%",
                }}
              >
                {(item.instructorName || "LH").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p
                  className="font-semibold text-violet-700 dark:text-violet-300"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    lineHeight: 1.2,
                    fontSize: "18px",
                    fontWeight: "600",
                    fontStyle: "normal",
                    letterSpacing: "0.01em",
                  }}
                >
                  {item.instructorName || "Giảng viên LearnHub"}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span
                    className="inline-flex items-center gap-1"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      lineHeight: 1.2,
                      fontSize: "14px",
                      fontWeight: "400",
                      fontStyle: "normal",
                      letterSpacing: "0.01em",
                    }}
                  >
                    <Star className="size-3.5" />
                    {rating > 0
                      ? `${rating.toFixed(1)} xếp hạng`
                      : "Giảng viên LearnHub"}
                  </span>
                  <span
                    className="inline-flex items-center gap-1"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      lineHeight: 1.2,
                      fontSize: "14px",
                      fontWeight: "400",
                      fontStyle: "normal",
                      letterSpacing: "0.01em",
                    }}
                  >
                    <Users className="size-3.5" />
                    {formatCount(enrolled)} học viên
                  </span>
                </p>
              </div>
            </div>
          </section>

          {related.length > 0 ? (
            <section>
              <h2
                className="text-xl font-bold tracking-tight sm:text-2xl"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  lineHeight: 1.2,
                  fontSize: "28px",
                  fontWeight: "600",
                  fontStyle: "normal",
                  letterSpacing: "0.01em",
                }}
              >
                Học viên cũng mua
              </h2>
              <div className="mt-4 divide-y divide-border border border-border">
                {related.map((entry) => {
                  const free =
                    entry.isFree === true || Number(entry.price) <= 0;
                  const otherRating = Number(entry.ratingAvg) || 0;
                  return (
                    <a
                      key={entry.id}
                      href={`/khoa-hoc/${entry.slug}`}
                      className="flex items-center gap-3 p-3 transition hover:bg-muted/50"
                    >
                      {entry.images ? (
                        <img
                          src={entry.images}
                          alt=""
                          className="size-16 shrink-0 object-cover sm:size-20"
                        />
                      ) : (
                        <div className="size-16 shrink-0 bg-muted sm:size-20" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className="line-clamp-2 text-sm font-semibold"
                          style={{
                            fontFamily: "'Roboto', sans-serif",
                            lineHeight: 1.4,
                            fontSize: "17px",
                            fontWeight: "600",
                            fontStyle: "normal",
                            letterSpacing: "0.01em",
                          }}
                        >
                          {entry.title}
                        </p>
                        <p
                          className="mt-0.5 text-xs text-muted-foreground"
                          style={{
                            fontFamily: "'Roboto', sans-serif",
                            lineHeight: 1.6,
                            fontSize: "14px",
                            fontWeight: "400",
                            fontStyle: "normal",
                            letterSpacing: "0.01em",
                          }}
                        >
                          {entry.instructorName}
                          {otherRating > 0
                            ? ` · ${otherRating.toFixed(1)} ★`
                            : ""}
                          {formatDuration(entry.durationSeconds)
                            ? ` · ${formatDuration(entry.durationSeconds)}`
                            : ""}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold hover:text-violet-700">
                        {free
                          ? "Miễn phí"
                          : formatMoney(entry.price, entry.currency)}
                      </p>
                    </a>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function CourseDetailFallback() {
  return (
    <section className="w-full">
      <div className="h-64 animate-pulse bg-[#1c1d1f] sm:h-80" />
    </section>
  );
}

const CourseDetail = ({ slug }) => (
  <Suspense fallback={<CourseDetailFallback />}>
    <CourseDetailView slug={slug} />
  </Suspense>
);

export { CourseDetail };
export default CourseDetail;
