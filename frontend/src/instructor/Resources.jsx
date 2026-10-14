import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  CircleHelp,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authGet, authPost } from "@/lib/auth";

const TABS = [
  { id: "guide", label: "Hướng dẫn", icon: BookOpen },
  { id: "quality", label: "Tiêu chuẩn", icon: ShieldCheck },
  { id: "support", label: "Hỗ trợ", icon: LifeBuoy },
];

const TOPICS = [
  { id: "COURSE", label: "Khóa học" },
  { id: "VIDEO", label: "Ghi hình / video" },
  { id: "PAYOUT", label: "Doanh thu" },
  { id: "ACCOUNT", label: "Tài khoản" },
  { id: "OTHER", label: "Khác" },
];

const STATUS = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Lưu trữ",
};

const TICKET_STATUS = {
  OPEN: "Đang mở",
  CLOSED: "Đã đóng",
};

const SELECT_CLASS =
  "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground scheme-light dark:bg-card dark:text-card-foreground dark:scheme-dark";
const OPTION_CLASS = "bg-background text-foreground dark:bg-card dark:text-card-foreground";

function topicLabel(topic) {
  return TOPICS.find((item) => item.id === topic)?.label || topic;
}

function formatWhen(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function applySnapshot(data, setGuides, setStandards, setCourses, setTickets) {
  setGuides(Array.isArray(data?.guides) ? data.guides : []);
  setStandards(Array.isArray(data?.standards) ? data.standards : []);
  setCourses(Array.isArray(data?.courses) ? data.courses : []);
  setTickets(Array.isArray(data?.tickets) ? data.tickets : []);
}

const Resources = () => {
  const [tab, setTab] = useState("guide");
  const [guides, setGuides] = useState([]);
  const [standards, setStandards] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [openKey, setOpenKey] = useState("");
  const [form, setForm] = useState({ topic: "COURSE", title: "", body: "" });

  const guideDone = guides.filter((item) => item.checked).length;
  const standardDone = standards.filter((item) => item.checked).length;
  const openTickets = tickets.filter((item) => item.status === "OPEN").length;
  const avgScore = useMemo(() => {
    if (!courses.length) {
      return 0;
    }
    return Math.round(courses.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / courses.length);
  }, [courses]);

  useEffect(() => {
    let cancelled = false;
    authGet("/api/instructor/resources")
      .then((data) => {
        if (cancelled) {
          return;
        }
        applySnapshot(data, setGuides, setStandards, setCourses, setTickets);
        const list = Array.isArray(data?.guides) ? data.guides : [];
        const firstOpen = list.find((item) => !item.checked) || list[0];
        if (firstOpen?.key) {
          setOpenKey(firstOpen.key);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(error.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = async (item) => {
    setBusy(`p-${item.key}`);
    try {
      const data = await authPost("/api/instructor/resources/progress", {
        key: item.key,
        checked: !item.checked,
      });
      applySnapshot(data, setGuides, setStandards, setCourses, setTickets);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy("");
    }
  };

  const submitTicket = async () => {
    setBusy("ticket");
    try {
      const data = await authPost("/api/instructor/resources/tickets", {
        topic: form.topic,
        title: form.title.trim(),
        body: form.body.trim(),
      });
      applySnapshot(data, setGuides, setStandards, setCourses, setTickets);
      setForm({ topic: form.topic, title: "", body: "" });
      toast.success("Đã gửi yêu cầu hỗ trợ");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy("");
    }
  };

  const closeTicket = async (item) => {
    setBusy(`c-${item.id}`);
    try {
      const data = await authPost(`/api/instructor/resources/tickets/${item.id}/close`, {});
      applySnapshot(data, setGuides, setStandards, setCourses, setTickets);
      toast.success("Đã đóng yêu cầu");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tài nguyên</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        Hướng dẫn dựng khóa học, tiêu chuẩn chất lượng và hỗ trợ giảng viên. Tiến độ được lưu theo tài khoản.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lộ trình</p>
          <p className="mt-1 text-2xl font-semibold">
            {guideDone}/{guides.length || 6}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">bước hướng dẫn đã xong</p>
        </article>
        <article className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Chất lượng</p>
          <p className="mt-1 text-2xl font-semibold">{courses.length ? `${avgScore}%` : "—"}</p>
          <p className="mt-1 text-sm text-muted-foreground">điểm hoàn thiện trung bình</p>
        </article>
        <article className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Hỗ trợ</p>
          <p className="mt-1 text-2xl font-semibold">{openTickets}</p>
          <p className="mt-1 text-sm text-muted-foreground">yêu cầu đang mở</p>
        </article>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-8 grid gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-xl border border-border bg-muted/40" />
          ))}
        </div>
      ) : null}

      {!loading && tab === "guide" ? (
        <section className="mt-8 space-y-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-violet-500"
              style={{
                width: `${guides.length ? Math.round((guideDone / guides.length) * 100) : 0}%`,
              }}
            />
          </div>
          {guides.map((item, index) => {
            const open = openKey === item.key;
            return (
              <article
                key={item.key}
                className={`overflow-hidden rounded-xl border bg-card ${
                  item.checked ? "border-emerald-500/40" : "border-border"
                }`}
              >
                <button
                  type="button"
                  className="flex w-full items-start gap-3 p-4 text-left sm:p-5"
                  onClick={() => setOpenKey(open ? "" : item.key)}
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold">{item.title}</span>
                      {item.checked ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          Đã xong
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">{item.summary}</span>
                  </span>
                </button>
                {open ? (
                  <div className="space-y-4 border-t border-border px-4 py-4 sm:px-5">
                    <p className="text-sm leading-relaxed text-foreground/90">{item.body}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={item.checked ? "outline" : "default"}
                        disabled={busy === `p-${item.key}`}
                        onClick={() => toggle(item)}
                      >
                        {item.checked ? "Bỏ đánh dấu" : "Đánh dấu đã xong"}
                      </Button>
                      {item.href ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            window.location.href = item.href;
                          }}
                        >
                          {item.hrefLabel || "Đi tới"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      ) : null}

      {!loading && tab === "quality" ? (
        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <div className="mb-3 flex items-end justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Đánh dấu tiêu chuẩn bạn đã áp dụng khi dựng bài giảng.
              </p>
              <p className="shrink-0 text-sm font-medium">
                {standardDone}/{standards.length}
              </p>
            </div>
            <div className="space-y-2">
              {standards.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  disabled={busy === `p-${item.key}`}
                  onClick={() => toggle(item)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                    item.checked
                      ? "border-emerald-500/40 bg-emerald-500/8"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border ${
                      item.checked
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-input bg-background"
                    }`}
                  >
                    {item.checked ? <Check className="size-3.5" /> : null}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{item.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {item.summary}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm text-muted-foreground">
              Điểm hoàn thiện lấy trực tiếp từ khóa học của bạn.
            </p>
            {courses.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Chưa có khóa học để chấm điểm.</p>
                <a
                  href="/giang-day/quan-tri"
                  className="mt-3 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
                >
                  Tạo khóa học
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <article key={course.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex gap-3">
                      <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {course.images ? (
                          <img src={course.images} alt="" className="size-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h2 className="text-sm font-semibold leading-snug">{course.title}</h2>
                          <span className="text-sm font-semibold tabular-nums">{course.score}%</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {STATUS[course.status] || course.status}
                        </p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${
                              course.score >= 80 ? "bg-emerald-500" : "bg-primary"
                            }`}
                            style={{ width: `${course.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {course.gaps?.length ? (
                      <ul className="mt-3 space-y-1">
                        {course.gaps.map((gap) => (
                          <li key={gap} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Circle className="size-3.5 shrink-0" />
                            Thiếu {gap.toLowerCase()}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-4" />
                        Đủ mục chất lượng để xuất bản
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href="/giang-day/quan-tri/cong-cu"
                        className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-xs font-medium hover:bg-muted"
                      >
                        Mở công cụ xuất bản
                      </a>
                      <a
                        href={`/giang-day/quan-tri/${course.id}/phan-hoc`}
                        className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-xs font-medium hover:bg-muted"
                      >
                        Chương trình học
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {!loading && tab === "support" ? (
        <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <CircleHelp className="size-5 text-muted-foreground" />
              <h2 className="text-[16px] font-semibold">Gửi yêu cầu hỗ trợ</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="sup-topic">Chủ đề</Label>
                <select
                  id="sup-topic"
                  className={SELECT_CLASS}
                  value={form.topic}
                  onChange={(event) => setForm((prev) => ({ ...prev, topic: event.target.value }))}
                >
                  {TOPICS.map((item) => (
                    <option key={item.id} value={item.id} className={OPTION_CLASS}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sup-title">Tiêu đề</Label>
                <Input
                  id="sup-title"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Ví dụ: Không tải được video bài 3"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sup-body">Mô tả</Label>
                <Textarea
                  id="sup-body"
                  rows={6}
                  className="min-h-32"
                  value={form.body}
                  onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
                  placeholder="Mô tả lỗi, khóa học liên quan và bước bạn đã thử."
                />
              </div>
              <Button type="button" disabled={busy === "ticket"} onClick={submitTicket}>
                Gửi yêu cầu
              </Button>
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-[16px] font-semibold">Yêu cầu của bạn</h2>
            {tickets.length === 0 ? (
              <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
                Chưa có yêu cầu nào. Gửi form bên cạnh khi cần đội ngũ LearnHub hỗ trợ.
              </p>
            ) : (
              <div className="space-y-3">
                {tickets.map((item) => (
                  <article key={item.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {topicLabel(item.topic)} · {formatWhen(item.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.status === "OPEN"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {TICKET_STATUS[item.status] || item.status}
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {item.body}
                    </p>
                    {item.status === "OPEN" ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-3"
                        disabled={busy === `c-${item.id}`}
                        onClick={() => closeTicket(item)}
                      >
                        Đóng yêu cầu
                      </Button>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Resources;
