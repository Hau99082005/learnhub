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

const FONT = {
  fontFamily: "Roboto, sans-serif",
  fontStyle: "normal",
  letterSpacing: "0.01em",
};

const TYPE = {
  eyebrow: { ...FONT, fontSize: "12px", fontWeight: 600, lineHeight: 1.4, letterSpacing: "0.08em" },
  title: { ...FONT, fontSize: "32px", fontWeight: 700, lineHeight: 1.25 },
  name: { ...FONT, fontSize: "28px", fontWeight: 700, lineHeight: 1.3 },
  course: { ...FONT, fontSize: "20px", fontWeight: 600, lineHeight: 1.4 },
  body: { ...FONT, fontSize: "16px", fontWeight: 400, lineHeight: 1.6 },
  meta: { ...FONT, fontSize: "12px", fontWeight: 500, lineHeight: 1.4, letterSpacing: "0.06em" },
  value: { ...FONT, fontSize: "14px", fontWeight: 600, lineHeight: 1.5 },
  small: { ...FONT, fontSize: "13px", fontWeight: 400, lineHeight: 1.5 },
  button: { ...FONT, fontSize: "14px", fontWeight: 500, lineHeight: 1.4 },
};

export function CertificateView({ cert, actions = true, compact = false }) {
  const watch = Number(cert?.watchPercent) || 0;
  const meta = gradeMeta(cert?.grade, watch);
  const issued = formatCertDate(cert?.issuedAt);
  const enrolled = formatCertDate(cert?.enrolledAt);

  return (
    <div
      className={cn(
        "cert-sheet relative overflow-hidden rounded-none border-2 border-violet-700 bg-white text-zinc-900",
        compact ? "p-4 sm:p-5" : "p-5 sm:p-8 md:p-10",
      )}
    >
      <style>{`
        @keyframes cert-shine {
          0% { transform: translateX(-140%) rotate(12deg); }
          100% { transform: translateX(220%) rotate(12deg); }
        }
        @media print {
          body { background: #fff !important; }
          header, footer, .cert-actions { display: none !important; }
          .cert-sheet { box-shadow: none !important; border-color: #6d28d9 !important; }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(109,40,217,0.08),transparent_46%)]" />
        <div
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-violet-100/40 to-transparent"
          style={{ animation: "cert-shine 5.5s ease-in-out infinite" }}
        />
      </div>
      <div className="relative rounded-none border border-violet-200 p-1">
        <div className="rounded-none border border-violet-100 bg-white px-4 py-6 sm:px-8 sm:py-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img src={logoLearnHub} alt="LearnHub" className="h-10 w-auto sm:h-12" />
              <div>
                <p className="text-violet-700 uppercase" style={TYPE.eyebrow}>
                  LearnHub
                </p>
                <p className="text-zinc-500" style={TYPE.small}>
                  Nền tảng học tập trực tuyến
                </p>
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-none px-3 py-1",
                meta.badge,
              )}
              style={TYPE.meta}
            >
              <Medal className="size-3.5" />
              {meta.label}
            </span>
          </div>

          <div className="mt-6 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 text-violet-700">
              <span className="h-px w-8 bg-violet-700/50 sm:w-14" />
              <Sparkles className="size-4" />
              <span className="h-px w-8 bg-violet-700/50 sm:w-14" />
            </div>
            <p className="mt-3 text-violet-700 uppercase" style={TYPE.eyebrow}>
              Chứng chỉ hoàn thành
            </p>
            <h1
              className="mt-2 text-zinc-950"
              style={{
                ...TYPE.title,
                fontSize: compact ? "24px" : "32px",
              }}
            >
              Certificate of Completion
            </h1>
            <p className="mt-4 text-zinc-500" style={TYPE.body}>
              Chứng nhận học viên
            </p>
            <p
              className="mt-1 text-zinc-950"
              style={{
                ...TYPE.name,
                fontSize: compact ? "22px" : "28px",
              }}
            >
              {cert?.learnerName || "Học viên LearnHub"}
            </p>
            <p className="mt-4 max-w-2xl text-zinc-600" style={TYPE.body}>
              đã hoàn thành khóa học
            </p>
            <p
              className="mt-1 max-w-3xl text-zinc-950"
              style={{
                ...TYPE.course,
                fontSize: compact ? "16px" : "20px",
              }}
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
            <div className="mt-6 flex flex-col items-center justify-between gap-5 border-t border-violet-100 pt-6 sm:flex-row">
              <div className="flex items-center gap-3 text-left">
                <div className="relative flex size-16 items-center justify-center rounded-none bg-violet-700 text-white">
                  <Award className="size-8" />
                </div>
                <div>
                  <p className="text-violet-700 uppercase" style={TYPE.meta}>
                    Con dấu điện tử
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-zinc-700" style={TYPE.value}>
                    <Hash className="size-3.5" />
                    {cert?.code}
                  </p>
                  {enrolled ? (
                    <p className="mt-0.5 text-zinc-500" style={TYPE.small}>
                      Ghi danh: {enrolled}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="text-right">
                <p className="text-zinc-950" style={TYPE.value}>
                  LearnHub Academy
                </p>
                <p className="text-zinc-500" style={TYPE.small}>
                  Xác thực bằng mã chứng chỉ duy nhất
                </p>
                <p className="mt-2 inline-flex items-center gap-1 text-violet-700" style={TYPE.small}>
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
                style={TYPE.button}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "h-10 rounded-none bg-violet-700 text-white hover:bg-violet-800",
                )}
                onClick={() => window.print()}
              >
                <Printer className="size-4" />
                In chứng chỉ
              </button>
              <button
                type="button"
                style={TYPE.button}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-10 rounded-none border-violet-700 bg-white text-violet-700 hover:bg-violet-50",
                )}
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
    <div className="rounded-none border border-violet-100 bg-violet-50/60 px-3 py-3 text-left">
      <p className="inline-flex items-center gap-1.5 text-violet-700 uppercase" style={TYPE.meta}>
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-1 truncate text-zinc-950" style={TYPE.value}>
        {value}
      </p>
    </div>
  );
}

export function CertificateCard({ item }) {
  const watch = Number(item.progressPercent ?? item.watchPercent) || 0;
  const meta = gradeMeta(item.grade, watch);
  const href = item.certificateCode ? `/chung-chi/${item.certificateCode}` : `/hoc/${item.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-none border border-violet-200 bg-white transition duration-300 hover:border-violet-700">
      <a href={href} className="relative block overflow-hidden">
        <div className="aspect-[16/10] bg-violet-950">
          {item.images ? (
            <img
              src={item.images}
              alt={item.title}
              className="size-full object-cover opacity-40 mix-blend-luminosity transition duration-500 group-hover:scale-105"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-violet-950 via-violet-950/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
            <span
              className={cn("inline-flex items-center gap-1.5 rounded-none px-2.5 py-1", meta.badge)}
              style={TYPE.meta}
            >
              <Award className="size-3.5" />
              {item.gradeLabel || meta.label}
            </span>
            <span className="text-white" style={TYPE.small}>
              {Math.round(watch)}% xem
            </span>
          </div>
        </div>
      </a>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <a href={href} className="min-w-0">
          <h3 className="line-clamp-2 text-zinc-950 transition-colors group-hover:text-violet-700" style={TYPE.value}>
            {item.title || item.courseTitle}
          </h3>
          <p className="mt-1 truncate text-zinc-500" style={TYPE.small}>
            {item.instructorName}
          </p>
        </a>
        <p className="inline-flex items-center gap-1 text-violet-700" style={TYPE.small}>
          <Hash className="size-3.5" />
          {item.certificateCode}
        </p>
        <a
          href={href}
          style={TYPE.button}
          className={cn(
            buttonVariants({ variant: "default" }),
            "mt-auto h-9 rounded-none bg-violet-700 text-white hover:bg-violet-800",
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
    <article className="flex h-full flex-col rounded-none border border-violet-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-violet-700 uppercase" style={TYPE.meta}>
            Đang theo dõi chứng chỉ
          </p>
          <h3 className="mt-1 line-clamp-2 text-zinc-950" style={TYPE.value}>
            {item.title}
          </h3>
          <p className="mt-1 truncate text-zinc-500" style={TYPE.small}>
            {item.instructorName}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-none border px-2.5 py-1", meta.chip)} style={TYPE.meta}>
          {item.gradeLabel || meta.label}
        </span>
      </div>
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-zinc-500" style={TYPE.small}>
          <span>{Math.round(watch)}% video đã xem</span>
          <span>Cần 50%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-none bg-violet-100">
          <div className="h-full rounded-none bg-violet-700 transition-all" style={{ width: `${Math.min(100, watch)}%` }} />
        </div>
        <p className="mt-2 text-zinc-500" style={TYPE.small}>
          {remain > 0
            ? `Còn ${Math.ceil(remain)}% nữa để nhận chứng chỉ Trung bình.`
            : "Đã đủ điều kiện nhận chứng chỉ."}
        </p>
      </div>
      <a
        href={`/hoc/${item.slug}`}
        style={TYPE.button}
        className={cn(
          buttonVariants({ variant: "default" }),
          "mt-4 h-9 rounded-none bg-violet-700 text-white hover:bg-violet-800",
        )}
      >
        Tiếp tục xem bài giảng
      </a>
    </article>
  );
}
