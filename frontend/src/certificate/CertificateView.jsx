import {
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Hash,
  Medal,
  Printer,
  Share2,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import logoLearnHub from "@/assets/icons/Logo LearnHub (1)-Photoroom.png";
import { buttonVariants } from "@/components/ui/button";
import { CERT_PASS, formatCertDate, gradeMeta } from "@/lib/certificate";
import { cn } from "@/lib/utils";

export function CertificateView({ cert, actions = true, compact = false }) {
  const watch = Number(cert?.watchPercent) || 0;
  const meta = gradeMeta(cert?.grade, watch);
  const issued = formatCertDate(cert?.issuedAt);
  const enrolled = formatCertDate(cert?.enrolledAt);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-amber-300/70 bg-[#f7f1e3] text-[#1b2430] shadow-[0_30px_80px_-36px_rgba(28,25,10,0.55)]",
        compact ? "p-4 sm:p-5" : "p-5 sm:p-8 md:p-10",
      )}
    >
      <style>{`
        @keyframes cert-shine {
          0% { transform: translateX(-140%) rotate(12deg); }
          100% { transform: translateX(220%) rotate(12deg); }
        }
        @keyframes cert-pulse {
          0%, 100% { opacity: .45; transform: scale(1); }
          50% { opacity: .85; transform: scale(1.06); }
        }
        @media print {
          body { background: #fff !important; }
          header, footer, .cert-actions { display: none !important; }
          .cert-sheet { box-shadow: none !important; }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className={cn("absolute -top-16 left-1/2 size-72 -translate-x-1/2 rounded-full bg-gradient-to-b blur-3xl", meta.glow)} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_42%)]" />
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent"
          style={{ animation: "cert-shine 5.5s ease-in-out infinite" }}
        />
      </div>
      <div className="relative rounded-[18px] border-[3px] border-[#c9a227] p-1">
        <div className="rounded-[14px] border border-[#e6d39a] bg-[linear-gradient(180deg,#fffdf7_0%,#f4ead0_100%)] px-4 py-6 sm:px-8 sm:py-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img src={logoLearnHub} alt="LearnHub" className="h-10 w-auto sm:h-12" />
              <div>
                <p className="text-[11px] font-semibold tracking-[0.22em] text-[#8a6d1d] uppercase">
                  LearnHub
                </p>
                <p className="text-xs text-[#5c6570]">Nền tảng học tập trực tuyến</p>
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm",
                meta.badge,
              )}
            >
              <Medal className="size-3.5" />
              {meta.label}
            </span>
          </div>

          <div className="mt-6 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 text-[#c9a227]">
              <span className="h-px w-8 bg-[#c9a227]/70 sm:w-14" />
              <Sparkles className="size-4" />
              <span className="h-px w-8 bg-[#c9a227]/70 sm:w-14" />
            </div>
            <p className="mt-3 text-[11px] font-semibold tracking-[0.32em] text-[#8a6d1d] uppercase sm:text-xs">
              Chứng chỉ hoàn thành
            </p>
            <h1
              className={cn(
                "mt-2 font-semibold tracking-tight text-[#142033]",
                compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-4xl",
              )}
            >
              Certificate of Completion
            </h1>
            <p className="mt-4 text-xs tracking-wide text-[#5c6570] sm:text-sm">
              Chứng nhận học viên
            </p>
            <p
              className={cn(
                "mt-1 font-semibold tracking-wide text-[#0f172a]",
                compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-4xl",
              )}
            >
              {cert?.learnerName || "Học viên LearnHub"}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#3f4754]">
              đã hoàn thành khóa học
            </p>
            <p
              className={cn(
                "mt-1 max-w-3xl font-semibold text-[#142033]",
                compact ? "text-base sm:text-lg" : "text-lg sm:text-2xl",
              )}
            >
              {cert?.courseTitle}
            </p>
          </div>

          <div className={cn("mt-6 grid gap-3", compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4")}>
            <InfoTile icon={GraduationCap} label="Xếp loại" value={meta.label} />
            <InfoTile icon={BadgeCheck} label="Tỷ lệ xem video" value={`${Math.round(watch)}%`} />
            <InfoTile icon={UserRound} label="Giảng viên" value={cert?.instructorName || "LearnHub"} />
            <InfoTile icon={CalendarDays} label="Ngày cấp" value={issued || "—"} />
          </div>

          {!compact ? (
            <div className="mt-6 flex flex-col items-center justify-between gap-5 border-t border-[#e6d39a] pt-6 sm:flex-row">
              <div className="flex items-center gap-3 text-left">
                <div
                  className={cn(
                    "relative flex size-16 items-center justify-center rounded-full bg-gradient-to-br text-[#3b2a08] shadow-[0_10px_24px_-10px_rgba(180,130,20,0.7)]",
                    meta.seal,
                  )}
                  style={{ animation: "cert-pulse 3.6s ease-in-out infinite" }}
                >
                  <Award className="size-8" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-[#8a6d1d] uppercase">
                    Con dấu điện tử
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-[#3f4754]">
                    <Hash className="size-3.5" />
                    {cert?.code}
                  </p>
                  {enrolled ? (
                    <p className="mt-0.5 text-xs text-[#6b7280]">Ghi danh: {enrolled}</p>
                  ) : null}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#142033]">LearnHub Academy</p>
                <p className="text-xs text-[#6b7280]">Xác thực bằng mã chứng chỉ duy nhất</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-[#8a6d1d]">
                  <BookOpen className="size-3.5" />
                  learnhub.vn
                </p>
              </div>
            </div>
          ) : null}

          {actions ? (
            <div className="cert-actions mt-6 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className={cn(buttonVariants({ variant: "default" }), "h-10 bg-[#142033] text-white hover:bg-[#0b1220]")}
                onClick={() => window.print()}
              >
                <Printer className="size-4" />
                In chứng chỉ
              </button>
              <button
                type="button"
                className={cn(buttonVariants({ variant: "outline" }), "h-10 border-[#c9a227]/70 bg-white/70")}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast.success("Đã sao chép liên kết chứng chỉ");
                  } catch {
                    toast.error("Không thể sao chép liên kết");
                  }
                }}
              >
                <Share2 className="size-4" />
                Sao chép liên kết
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[#e6d39a] bg-white/70 px-3 py-3 text-left shadow-sm">
      <p className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-[#8a6d1d] uppercase">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-[#142033]">{value}</p>
    </div>
  );
}

export function CertificateCard({ item }) {
  const watch = Number(item.progressPercent ?? item.watchPercent) || 0;
  const meta = gradeMeta(item.grade, watch);
  const href = item.certificateCode ? `/chung-chi/${item.certificateCode}` : `/hoc/${item.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-amber-200/80 bg-[linear-gradient(180deg,#fffdf8_0%,#f7f1e3_100%)] shadow-[0_18px_40px_-28px_rgba(28,25,10,0.55)] transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_24px_48px_-22px_rgba(180,130,20,0.45)]">
      <a href={href} className="relative block overflow-hidden">
        <div className="aspect-[16/10] bg-[radial-gradient(circle_at_top,#f3e2aa,transparent_55%),linear-gradient(160deg,#1b2437,#2c1d4a)]">
          {item.images ? (
            <img
              src={item.images}
              alt={item.title}
              className="size-full object-cover opacity-40 mix-blend-luminosity transition duration-500 group-hover:scale-105"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b2437] via-[#1b2437]/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", meta.badge)}>
              <Award className="size-3.5" />
              {item.gradeLabel || meta.label}
            </span>
            <span className="text-xs font-medium text-white/85">{Math.round(watch)}% xem</span>
          </div>
        </div>
      </a>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <a href={href} className="min-w-0">
          <h3 className="line-clamp-2 text-[15px] font-semibold tracking-tight text-[#142033] transition-colors group-hover:text-[#8a6d1d]">
            {item.title || item.courseTitle}
          </h3>
          <p className="mt-1 truncate text-sm text-[#5c6570]">{item.instructorName}</p>
        </a>
        <p className="inline-flex items-center gap-1 text-xs text-[#8a6d1d]">
          <Hash className="size-3.5" />
          {item.certificateCode}
        </p>
        <a
          href={href}
          className={cn(
            buttonVariants({ variant: "default" }),
            "mt-auto h-9 bg-[#142033] text-white hover:bg-[#0b1220]",
          )}
        >
          <Medal className="size-4" />
          Xem bằng cấp
        </a>
      </div>
    </article>
  );
}

export function CertificateTrackCard({ item }) {
  const watch = Number(item.progressPercent) || 0;
  const meta = gradeMeta(item.grade, watch);
  const remain = Math.max(0, CERT_PASS - watch);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Đang theo dõi chứng chỉ
          </p>
          <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold">{item.title}</h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">{item.instructorName}</p>
        </div>
        <span className={cn("shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold", meta.chip)}>
          {item.gradeLabel || meta.label}
        </span>
      </div>
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>{Math.round(watch)}% video đã xem</span>
          <span>Cần 50%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full transition-all", meta.bar)} style={{ width: `${Math.min(100, watch)}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {remain > 0
            ? `Còn ${Math.ceil(remain)}% nữa để nhận chứng chỉ Trung bình.`
            : "Đã đủ điều kiện nhận chứng chỉ."}
        </p>
      </div>
      <a
        href={`/hoc/${item.slug}`}
        className={cn(buttonVariants({ variant: "default" }), "mt-4 h-9 bg-violet-700 text-white hover:bg-violet-800")}
      >
        Tiếp tục xem bài giảng
      </a>
    </article>
  );
}
