import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Play,
  RotateCcw,
  Trophy,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { gradeMeta } from "@/lib/certificate";
import { getAuthUser } from "@/lib/auth";
import { markAccessed, recordStreakVisit } from "@/lib/learning";
import { formatPracticeAt, getPracticeQuiz, listPractice, listPracticeHistory, submitPractice } from "@/lib/practice";
import { cn } from "@/lib/utils";

const FACE = {
  fontFamily: "'Roboto', sans-serif",
  letterSpacing: "0.01em",
  lineHeight: 1.45,
};

function loginHref(next) {
  return `/dang-nhap?next=${encodeURIComponent(next)}`;
}

function registerHref(next) {
  return `/dang-ky?next=${encodeURIComponent(next)}`;
}

function scoreOf(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return 0;
  }
  return Math.min(100, Math.max(0, amount));
}

const PracticePage = ({ slug }) => {
  const [user] = useState(() => getAuthUser());
  if (!user) {
    const next = slug ? `/bai-tap/${slug}` : "/bai-tap";
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 sm:py-14">
        <p className="text-violet-400" style={{ ...FACE, fontSize: "12px", fontWeight: 600 }}>
          Đánh giá năng lực
        </p>
        <h1 className="mt-1" style={{ ...FACE, fontSize: "28px", fontWeight: 600 }}>
          Bài tập
        </h1>
        <p className="mt-2 text-muted-foreground" style={{ ...FACE, fontSize: "15px" }}>
          Đăng nhập để làm quiz theo bài giảng lập trình các khóa bạn đang học.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={loginHref(next)}
            className="inline-flex h-11 items-center bg-violet-700 px-5 text-white transition hover:bg-violet-600"
            style={{ ...FACE, fontSize: "14px", borderRadius: "5px" }}
          >
            Đăng nhập
          </a>
          <a
            href={registerHref(next)}
            className="inline-flex h-11 items-center border border-border px-5 transition hover:bg-muted"
            style={{ ...FACE, fontSize: "14px", borderRadius: "5px" }}
          >
            Đăng ký
          </a>
        </div>
      </section>
    );
  }
  if (slug) {
    return <QuizView slug={slug} />;
  }
  return <PracticeList />;
};

function PracticeList() {
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    Promise.all([listPractice(), listPracticeHistory().catch(() => [])])
      .then(([data, rows]) => {
        if (live) {
          setItems(Array.isArray(data) ? data : []);
          setHistory(Array.isArray(rows) ? rows : []);
        }
      })
      .catch((err) => {
        if (live) {
          setError(err.message || "Không tải được bài tập");
        }
      })
      .finally(() => {
        if (live) {
          setLoading(false);
        }
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-violet-400" style={{ ...FACE, fontSize: "12px", fontWeight: 600 }}>
          Đánh giá năng lực
        </p>
        <h1 className="mt-1" style={{ ...FACE, fontSize: "30px", fontWeight: 600 }}>
          Bài tập
        </h1>
        <p className="mt-2 text-muted-foreground" style={{ ...FACE, fontSize: "15px" }}>
          Quiz trắc nghiệm bám bài giảng lập trình. Làm bài để biết mức nắm kiến thức: Trung bình, Khá, Giỏi hoặc Xuất sắc.
        </p>
      </div>
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="overflow-hidden" style={{ borderRadius: "5px" }}>
              <div className="aspect-video animate-pulse bg-muted/70" />
              <div className="h-28 animate-pulse bg-muted/40" />
            </div>
          ))}
        </div>
      ) : null}
      {error ? (
        <p className="text-rose-400" style={{ ...FACE, fontSize: "14px" }}>
          {error}
        </p>
      ) : null}
      {!loading && !items.length ? (
        <div className="border border-dashed border-border px-6 py-12 text-center" style={{ borderRadius: "5px" }}>
          <ClipboardList className="mx-auto size-9 text-violet-400" />
          <h2 className="mt-3" style={{ ...FACE, fontSize: "18px", fontWeight: 600 }}>
            Chưa có khóa để làm bài
          </h2>
          <p className="mt-1 text-muted-foreground" style={{ ...FACE, fontSize: "14px" }}>
            Ghi danh khóa học rồi quay lại để làm quiz đánh giá năng lực.
          </p>
          <a
            href="/khoa-hoc"
            className="mt-5 inline-flex h-11 items-center bg-violet-700 px-5 text-white transition hover:bg-violet-600"
            style={{ ...FACE, fontSize: "14px", borderRadius: "5px" }}
          >
            Xem khóa học
          </a>
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, order) => {
          const score = scoreOf(item.bestScore);
          const meta = item.grade ? gradeMeta(item.grade, score) : null;
          return (
            <article
              key={item.courseId}
              className="group flex h-full flex-col overflow-hidden border border-border/80 bg-card shadow-[0_16px_40px_-28px_oklch(0_0_0/0.65)] transition duration-300 hover:-translate-y-1.5 hover:border-violet-500/50 hover:shadow-[0_22px_50px_-24px_oklch(0.5_0.2_290/0.45)]"
              style={{
                borderRadius: "5px",
                animation: `quiz-in 420ms ease-out ${order * 70}ms both`,
              }}
            >
              <a
                href={`/khoa-hoc/${item.slug}`}
                className="relative block aspect-video w-full shrink-0 overflow-hidden bg-muted"
              >
                {item.images ? (
                  <img
                    src={item.images}
                    alt={item.title}
                    className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-110"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700 to-slate-900 text-white/80">
                    <BookOpen className="size-10" />
                  </span>
                )}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-70 transition duration-300 group-hover:opacity-100" />
                <span className="quiz-shine pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100" />
                {item.questionCount ? (
                  <span
                    className="absolute top-2.5 left-2.5 bg-black/70 px-2 py-1 text-white backdrop-blur-sm"
                    style={{ ...FACE, fontSize: "11px", fontWeight: 600, borderRadius: "5px" }}
                  >
                    {item.questionCount} câu hỏi
                  </span>
                ) : null}
              </a>
              <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:p-5">
                <h2 className="line-clamp-2" style={{ ...FACE, fontSize: "16px", fontWeight: 600 }}>
                  {item.title}
                </h2>
                <p className="truncate text-muted-foreground" style={{ ...FACE, fontSize: "13px" }}>
                  {item.instructorName}
                </p>
                {item.attemptCount ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn("px-2 py-0.5", meta?.badge)}
                      style={{ ...FACE, fontSize: "11px", fontWeight: 600, borderRadius: "5px" }}
                    >
                      {item.gradeLabel}
                    </span>
                    <span style={{ ...FACE, fontSize: "13px", fontWeight: 600 }}>{Math.round(score)} điểm</span>
                  </div>
                ) : (
                  <p className="text-muted-foreground" style={{ ...FACE, fontSize: "13px" }}>
                    Chưa làm bài
                  </p>
                )}
                <div className="mt-auto flex flex-col gap-2 pt-3 sm:flex-row">
                  {item.ready ? (
                    <a
                      href={`/bai-tap/${item.slug}`}
                      className="inline-flex h-11 flex-1 items-center justify-center bg-violet-700 px-3 text-white transition hover:bg-violet-600"
                      style={{ ...FACE, fontSize: "14px", borderRadius: "5px" }}
                    >
                      {item.attemptCount ? "Làm lại" : "Bắt đầu làm"}
                    </a>
                  ) : (
                    <span className="text-muted-foreground" style={{ ...FACE, fontSize: "13px" }}>
                      Chưa đủ bài giảng
                    </span>
                  )}
                  <a
                    href={`/hoc/${item.slug}`}
                    className="inline-flex h-11 items-center justify-center border border-border px-4 transition hover:bg-muted"
                    style={{ ...FACE, fontSize: "14px", borderRadius: "5px" }}
                  >
                    Học tiếp
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!loading && history.length ? (
        <div className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 style={{ ...FACE, fontSize: "20px", fontWeight: 600 }}>Lịch sử làm bài</h2>
              <p className="mt-1 text-muted-foreground" style={{ ...FACE, fontSize: "14px" }}>
                Kết quả đã lưu vào cơ sở dữ liệu và lịch sử học tập.
              </p>
            </div>
            <a
              href="/hoc-tap?tab=practice"
              className="text-violet-400 transition hover:text-violet-300"
              style={{ ...FACE, fontSize: "13px", fontWeight: 600 }}
            >
              Xem trong Học tập
            </a>
          </div>
          <div className="space-y-3">
            {history.map((row) => (
              <HistoryRow key={row.attemptId} row={row} />
            ))}
          </div>
        </div>
      ) : null}
      <style>{MOTION}</style>
    </section>
  );
}

function HistoryRow({ row }) {
  const score = scoreOf(row.score);
  const meta = row.grade ? gradeMeta(row.grade, score) : null;
  return (
    <article
      className="flex flex-col gap-3 border border-border/80 bg-card p-3 sm:flex-row sm:items-center sm:p-4"
      style={{ borderRadius: "5px" }}
    >
      {row.images ? (
        <img
          src={row.images}
          alt=""
          className="h-16 w-full object-cover sm:h-16 sm:w-28"
          style={{ borderRadius: "5px" }}
        />
      ) : (
        <span
          className="flex h-16 w-full items-center justify-center bg-violet-700/20 text-violet-300 sm:w-28"
          style={{ borderRadius: "5px" }}
        >
          <ClipboardList className="size-6" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2" style={{ ...FACE, fontSize: "15px", fontWeight: 600 }}>
          {row.title}
        </h3>
        <p className="mt-1 text-muted-foreground" style={{ ...FACE, fontSize: "13px" }}>
          {formatPracticeAt(row.submittedAt)}
          {row.total ? ` · Đúng ${row.correctCount}/${row.total} câu` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {meta ? (
          <span className={cn("px-2 py-0.5", meta.badge)} style={{ ...FACE, fontSize: "11px", fontWeight: 600, borderRadius: "5px" }}>
            {row.gradeLabel}
          </span>
        ) : null}
        <span style={{ ...FACE, fontSize: "14px", fontWeight: 600 }}>{Math.round(score)} điểm</span>
        <a
          href={`/bai-tap/${row.slug}`}
          className="inline-flex h-9 items-center bg-violet-700 px-3 text-white transition hover:bg-violet-600"
          style={{ ...FACE, fontSize: "13px", borderRadius: "5px" }}
        >
          Làm lại
        </a>
      </div>
    </article>
  );
}

function QuizView({ slug }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [enter, setEnter] = useState(true);

  useEffect(() => {
    let live = true;
    getPracticeQuiz(slug)
      .then((data) => {
        if (live) {
          setQuiz(data);
        }
      })
      .catch((err) => {
        if (live) {
          setError(err.message || "Không tải được bài tập");
        }
      })
      .finally(() => {
        if (live) {
          setLoading(false);
        }
      });
    return () => {
      live = false;
    };
  }, [slug]);

  useEffect(() => {
    setEnter(false);
    const frame = window.requestAnimationFrame(() => setEnter(true));
    window.scrollTo({ top: 0, behavior: "smooth" });
    return () => window.cancelAnimationFrame(frame);
  }, [index, result]);

  const questions = quiz?.questions || [];
  const current = questions[index];
  const answered = useMemo(
    () => questions.filter((item) => picked[item.id] != null).length,
    [picked, questions],
  );

  const go = (next) => {
    setIndex(Math.min(questions.length - 1, Math.max(0, next)));
  };

  const send = async () => {
    if (sending) {
      return;
    }
    if (answered < questions.length) {
      const missing = questions.findIndex((item) => picked[item.id] == null);
      if (missing >= 0) {
        setIndex(missing);
      }
      toast.error("Hãy trả lời hết câu hỏi trước khi nộp");
      return;
    }
    setSending(true);
    try {
      const data = await submitPractice(
        slug,
        questions.map((item) => ({ questionId: item.id, optionId: picked[item.id] })),
      );
      const courseId = data?.courseId || quiz?.courseId;
      if (courseId) {
        markAccessed(courseId);
      }
      recordStreakVisit();
      setResult(data);
      toast.success("Đã lưu kết quả vào lịch sử học tập");
    } catch (err) {
      toast.error(err.message || "Không nộp được bài");
    } finally {
      setSending(false);
    }
  };

  const retry = () => {
    setResult(null);
    setPicked({});
    setIndex(0);
  };

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-8 w-40 animate-pulse bg-muted" style={{ borderRadius: "5px" }} />
        <div className="mt-6 h-56 animate-pulse bg-muted/70" style={{ borderRadius: "5px" }} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <BackLink />
        <p className="mt-4 text-rose-400" style={{ ...FACE, fontSize: "14px" }}>
          {error}
        </p>
      </section>
    );
  }

  if (result) {
    const score = scoreOf(result.score);
    const meta = gradeMeta(result.grade, score);
    const ring = 2 * Math.PI * 52;
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <BackLink />
        <div
          className="relative mt-5 overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-950/40 via-card to-card p-5 sm:p-8"
          style={{ borderRadius: "5px", animation: "quiz-in 420ms ease-out" }}
        >
          <div className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-violet-600/20 blur-3xl" />
          <p className="text-muted-foreground" style={{ ...FACE, fontSize: "13px" }}>
            Kết quả đánh giá năng lực
          </p>
          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <div className="relative size-32 shrink-0">
              <svg viewBox="0 0 120 120" className="size-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" className="stroke-muted" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  className={cn("transition-[stroke-dashoffset] duration-700", meta.bar.replace("bg-", "stroke-"))}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={ring}
                  strokeDashoffset={ring - (score / 100) * ring}
                  style={{
                    stroke: result.passed ? "#8b5cf6" : "#f43f5e",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span style={{ ...FACE, fontSize: "28px", fontWeight: 700, lineHeight: 1 }}>{Math.round(score)}</span>
                <span className="text-muted-foreground" style={{ ...FACE, fontSize: "11px" }}>
                  điểm
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <span
                className={cn("inline-flex items-center gap-1.5 px-2.5 py-1", meta.badge)}
                style={{ ...FACE, fontSize: "13px", fontWeight: 600, borderRadius: "5px" }}
              >
                <Trophy className="size-3.5" />
                {result.gradeLabel}
              </span>
              <p className="mt-2" style={{ ...FACE, fontSize: "15px", fontWeight: 600 }}>
                Đúng {result.correctCount}/{result.total} câu
              </p>
              <p className="mt-1 text-muted-foreground" style={{ ...FACE, fontSize: "13px" }}>
                Cần {quiz.passScore} điểm để đạt. {result.passed ? "Bạn đã vượt mức đạt." : "Hãy xem lại bài giảng rồi làm lại."}
              </p>
              <p className="mt-2 text-emerald-400" style={{ ...FACE, fontSize: "13px", fontWeight: 600 }}>
                Đã lưu vào lịch sử học tập
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={retry}
              className="inline-flex h-11 items-center justify-center gap-1.5 bg-violet-700 px-4 text-white transition hover:bg-violet-600"
              style={{ ...FACE, fontSize: "14px", borderRadius: "5px" }}
            >
              <RotateCcw className="size-4" />
              Làm lại
            </button>
            <a
              href="/hoc-tap?tab=practice"
              className="inline-flex h-11 items-center justify-center gap-1.5 border border-border px-4 transition hover:bg-muted"
              style={{ ...FACE, fontSize: "14px", borderRadius: "5px" }}
            >
              <ClipboardList className="size-4" />
              Lịch sử học tập
            </a>
            <a
              href={`/hoc/${slug}`}
              className="inline-flex h-11 items-center justify-center gap-1.5 border border-border px-4 transition hover:bg-muted"
              style={{ ...FACE, fontSize: "14px", borderRadius: "5px" }}
            >
              <Play className="size-4" />
              Học lại bài giảng
            </a>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {(result.questions || []).map((item, order) => (
            <div
              key={item.id}
              className="border border-border/80 bg-card/80 p-4"
              style={{
                borderRadius: "5px",
                animation: `quiz-in 360ms ease-out ${order * 50}ms both`,
              }}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center",
                    item.right ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400",
                  )}
                  style={{ borderRadius: "5px" }}
                >
                  {item.right ? <Check className="size-4" /> : <X className="size-4" />}
                </span>
                <p className="min-w-0 break-words" style={{ ...FACE, fontSize: "14px", fontWeight: 600 }}>
                  Câu {order + 1}. {item.question}
                </p>
              </div>
              <ul className="mt-3 space-y-1.5 sm:pl-9">
                {(item.options || []).map((option) => {
                  const chosen = option.id === item.chosenOptionId;
                  return (
                    <li
                      key={option.id}
                      className={cn(
                        "break-words px-3 py-2",
                        option.correct
                          ? "bg-emerald-500/10 text-emerald-300"
                          : chosen
                            ? "bg-rose-500/10 text-rose-300"
                            : "bg-muted/40 text-muted-foreground",
                      )}
                      style={{ ...FACE, fontSize: "13px", borderRadius: "5px" }}
                    >
                      {option.text}
                      {option.correct ? " · Đáp án đúng" : chosen ? " · Bạn chọn" : ""}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <style>{MOTION}</style>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 sm:pb-10 sm:pt-10 lg:px-8">
      <BackLink />
      <div className="mt-4 flex items-start gap-3">
        {quiz.images ? (
          <img
            src={quiz.images}
            alt=""
            className="hidden size-14 shrink-0 object-cover sm:block"
            style={{ borderRadius: "5px" }}
          />
        ) : null}
        <div className="min-w-0">
          <p className="truncate text-violet-400" style={{ ...FACE, fontSize: "12px", fontWeight: 600 }}>
            {quiz.courseTitle}
          </p>
          <h1 className="mt-1 break-words" style={{ ...FACE, fontSize: "22px", fontWeight: 600 }}>
            {quiz.title}
          </h1>
          <p className="mt-1 text-muted-foreground" style={{ ...FACE, fontSize: "13px" }}>
            {String(quiz.description || "").replace("[LH2]", "").trim()}
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p style={{ ...FACE, fontSize: "13px", fontWeight: 600 }}>
          Câu {questions.length ? index + 1 : 0}/{questions.length}
        </p>
        <p className="text-muted-foreground" style={{ ...FACE, fontSize: "12px" }}>
          Đã chọn {answered} · Đạt từ {quiz.passScore} điểm
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden bg-muted" style={{ borderRadius: "5px" }}>
        <div
          className="h-full bg-violet-600 transition-all duration-300"
          style={{ width: `${questions.length ? (answered / questions.length) * 100 : 0}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {questions.map((item, order) => (
          <button
            key={item.id}
            type="button"
            onClick={() => go(order)}
            className={cn(
              "size-7 text-[11px] transition",
              order === index
                ? "bg-violet-700 text-white"
                : picked[item.id] != null
                  ? "bg-violet-700/30 text-violet-200"
                  : "bg-muted text-muted-foreground",
            )}
            style={{ ...FACE, fontWeight: 600, borderRadius: "5px" }}
            aria-label={`Câu ${order + 1}`}
          >
            {order + 1}
          </button>
        ))}
      </div>
      {current ? (
        <div
          className={cn(
            "mt-5 border border-border/80 bg-card p-4 shadow-[0_16px_40px_-28px_oklch(0_0_0/0.7)] transition duration-300 sm:p-6",
            enter ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
          )}
          style={{ borderRadius: "5px" }}
        >
          <p className="break-words" style={{ ...FACE, fontSize: "17px", fontWeight: 600 }}>
            {current.question}
          </p>
          <div className="mt-4 grid gap-2">
            {(current.options || []).map((option, order) => {
              const on = picked[current.id] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setPicked((value) => ({ ...value, [current.id]: option.id }));
                    if (index < questions.length - 1) {
                      window.setTimeout(() => go(index + 1), 220);
                    }
                  }}
                  className={cn(
                    "flex min-h-12 w-full items-start gap-3 border px-3 py-3 text-left transition duration-200",
                    on
                      ? "border-violet-500 bg-violet-700/25 shadow-[0_0_0_1px_rgb(139,92,246)]"
                      : "border-border hover:-translate-y-0.5 hover:border-violet-500/50 hover:bg-muted/40",
                  )}
                  style={{ borderRadius: "5px" }}
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center border text-xs transition",
                      on ? "border-violet-400 bg-violet-700 text-white" : "border-border",
                    )}
                    style={{ borderRadius: "5px", ...FACE, fontWeight: 600 }}
                  >
                    {String.fromCharCode(65 + order)}
                  </span>
                  <span className="min-w-0 flex-1 break-words" style={{ ...FACE, fontSize: "14px" }}>
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-3 backdrop-blur sm:static sm:mt-5 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-1 sm:px-0">
          <button
            type="button"
            disabled={index <= 0}
            onClick={() => go(index - 1)}
            className="inline-flex h-11 items-center gap-1 border border-border px-3 disabled:opacity-40"
            style={{ ...FACE, fontSize: "13px", borderRadius: "5px" }}
          >
            <ChevronLeft className="size-4" />
            Trước
          </button>
          {index < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1 bg-violet-700 px-4 text-white transition hover:bg-violet-600 sm:flex-none"
              style={{ ...FACE, fontSize: "13px", borderRadius: "5px" }}
            >
              Tiếp
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={sending}
              onClick={() => void send()}
              className="inline-flex h-11 flex-1 items-center justify-center bg-violet-700 px-4 text-white transition hover:bg-violet-600 disabled:opacity-50 sm:flex-none"
              style={{ ...FACE, fontSize: "13px", borderRadius: "5px" }}
            >
              {sending ? "Đang chấm..." : "Nộp bài"}
            </button>
          )}
        </div>
      </div>
      <style>{MOTION}</style>
    </section>
  );
}

function BackLink() {
  return (
    <a
      href="/bai-tap"
      className="inline-flex items-center gap-1 text-muted-foreground transition hover:text-foreground"
      style={{ ...FACE, fontSize: "13px" }}
    >
      <ArrowLeft className="size-4" />
      Về bài tập
    </a>
  );
}

const MOTION = `
  @keyframes quiz-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes quiz-shine-move {
    from { transform: translateX(-30%); }
    to { transform: translateX(320%); }
  }
  .group:hover .quiz-shine {
    animation: quiz-shine-move 1.1s ease-in-out;
  }
`;

export default PracticePage;
