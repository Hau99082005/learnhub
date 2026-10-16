import { useEffect, useRef, useState } from "react";
import {
  Award,
  BookOpen,
  Bot,
  CircleHelp,
  ClipboardList,
  GraduationCap,
  RotateCcw,
  Send,
  Wallet,
  X,
} from "lucide-react";
import { formatMoney } from "@/components/Course";
import { askLearnHubAi } from "@/lib/aiChat";
import { cn } from "@/lib/utils";

const FACE = {
  fontFamily: "'Roboto', sans-serif",
  letterSpacing: "0.01em",
  lineHeight: 1.4,
};

const GREETING = {
  role: "assistant",
  content:
    "Xin chào, mình là trợ lý LearnHub. Chọn một tab bên dưới hoặc hỏi mình về khóa học, học tập, thanh toán và chứng chỉ nhé.",
};

const TABS = [
  {
    id: "goi-y",
    label: "Gợi ý",
    icon: Bot,
    hints: [
      "Khóa học nào phù hợp người mới?",
      "Thanh toán như thế nào?",
      "Khóa tôi đang học",
      "Làm sao nhận chứng chỉ?",
    ],
  },
  {
    id: "khoa-hoc",
    label: "Khóa học",
    icon: GraduationCap,
    hints: [
      "Khóa học nào phù hợp người mới?",
      "Khóa học đang mở hiện tại",
      "Có khóa miễn phí không?",
      "Gợi ý khóa lập trình backend",
    ],
  },
  {
    id: "hoc-tap",
    label: "Học tập",
    icon: BookOpen,
    hints: ["Khóa tôi đang học", "Tiến độ học của tôi", "Vào trang học tập thế nào?"],
  },
  {
    id: "bai-tap",
    label: "Bài tập",
    icon: ClipboardList,
    hints: ["Bài tập đánh giá năng lực ở đâu?", "Quiz khóa đang học làm thế nào?", "Điểm bài tập tính ra sao?"],
  },
  {
    id: "thanh-toan",
    label: "Thanh toán",
    icon: Wallet,
    hints: [
      "Thanh toán như thế nào?",
      "Đơn hàng của tôi",
      "Có chuyển khoản ngân hàng không?",
      "Mua ngay thì vào đâu?",
    ],
  },
  {
    id: "chung-chi",
    label: "Chứng chỉ",
    icon: Award,
    hints: ["Làm sao nhận chứng chỉ?", "Chứng chỉ của tôi ở đâu?", "Điểm chứng chỉ tính thế nào?"],
  },
  {
    id: "ho-tro",
    label: "Hỗ trợ",
    icon: CircleHelp,
    hints: ["LearnHub dùng để làm gì?", "Cách đăng nhập tài khoản", "Giảng viên liên hệ thế nào?"],
  },
];

const STORAGE_KEY = "learnhub_ai_chat";

function courseCover(images) {
  if (!images) {
    return "";
  }
  const raw = String(images).trim();
  if (raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw);
      const first = Array.isArray(parsed) ? parsed[0] : "";
      if (typeof first === "string") {
        return first;
      }
      return first?.url || "";
    } catch {
      return raw;
    }
  }
  return raw.split(",")[0].trim();
}

function loadMessages() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const rows = raw ? JSON.parse(raw) : null;
    if (Array.isArray(rows) && rows.length) {
      return rows.filter((row) => row?.role && row?.content);
    }
  } catch {
    return [GREETING];
  }
  return [GREETING];
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function BotMark({ className, size = "size-4" }) {
  return <Bot className={cn(size, className)} strokeWidth={1.75} />;
}

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [entered, setEntered] = useState(false);
  const [tab, setTab] = useState(TABS[0].id);
  const listRef = useRef(null);
  const fieldRef = useRef(null);
  const waveRef = useRef(0);

  const activeTab = TABS.find((item) => item.id === tab) || TABS[0];

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, sending, open, tab]);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return undefined;
    }
    const frame = window.requestAnimationFrame(() => setEntered(true));
    const timer = window.setTimeout(() => fieldRef.current?.focus(), 180);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [open]);

  const revealReply = async (wave, base, reply, courses) => {
    const text = reply || "";
    setMessages([...base, { role: "assistant", content: "", courses: [] }]);
    const step = Math.max(2, Math.ceil(text.length / 70));
    for (let index = step; index < text.length; index += step) {
      if (wave !== waveRef.current) {
        return;
      }
      setMessages([...base, { role: "assistant", content: text.slice(0, index), courses: [] }]);
      await wait(12);
    }
    if (wave !== waveRef.current) {
      return;
    }
    setMessages([...base, { role: "assistant", content: text, courses }]);
  };

  const send = async (preset) => {
    const text = (preset || input).trim();
    if (!text || sending) {
      return;
    }
    const next = [...messages, { role: "user", content: text }];
    const wave = waveRef.current + 1;
    waveRef.current = wave;
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const data = await askLearnHubAi(next.map((row) => ({ role: row.role, content: row.content })));
      if (wave !== waveRef.current) {
        return;
      }
      const reply = String(data?.reply || "").trim();
      const courses = Array.isArray(data?.courses) ? data.courses.filter((item) => item?.slug) : [];
      await revealReply(
        wave,
        next,
        reply || "Mình chưa tìm thấy dữ liệu phù hợp. Bạn hỏi lại về khóa học, đơn hàng hoặc chứng chỉ nhé.",
        courses,
      );
    } catch (error) {
      if (wave !== waveRef.current) {
        return;
      }
      setMessages([
        ...next,
        {
          role: "assistant",
          content: error.message || "Không gửi được câu hỏi. Vui lòng thử lại.",
        },
      ]);
    } finally {
      if (wave === waveRef.current) {
        setSending(false);
      }
    }
  };

  const resetChat = () => {
    waveRef.current += 1;
    setSending(false);
    setMessages([GREETING]);
    sessionStorage.removeItem(STORAGE_KEY);
    setTab(TABS[0].id);
  };

  return (
    <div className="pointer-events-none fixed right-4 bottom-5 z-50 flex flex-col items-end sm:right-6 sm:bottom-6">
      {open ? (
        <div
          className={cn(
            "pointer-events-auto mb-3 flex h-[min(74vh,580px)] w-[min(calc(100vw-1.5rem),430px)] flex-col overflow-hidden border border-border/80 bg-card shadow-[0_18px_40px_-24px_oklch(0_0_0/0.7)] transition duration-300 ease-out",
            entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
          style={{ borderRadius: "5px" }}
        >
          <div className="flex items-center gap-2.5 border-b border-border bg-muted/40 px-3 py-2.5">
            <span
              className="relative inline-flex size-9 items-center justify-center bg-violet-700 text-white"
              style={{ borderRadius: "5px" }}
            >
              <BotMark />
              <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-emerald-400" />
            </span>
            <div className="min-w-0 flex-1">
              <p style={{ ...FACE, fontSize: "14px", fontWeight: 600 }}>LearnHub AI</p>
              <p className="text-muted-foreground" style={{ ...FACE, fontSize: "12px", fontWeight: 400 }}>
                Trợ lý robot theo dữ liệu khóa học
              </p>
            </div>
            <button
              type="button"
              onClick={resetChat}
              className="inline-flex size-8 items-center justify-center text-muted-foreground transition hover:bg-muted hover:text-foreground"
              style={{ borderRadius: "5px" }}
              aria-label="Làm mới hội thoại"
            >
              <RotateCcw className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-8 items-center justify-center text-muted-foreground transition hover:bg-muted hover:text-foreground"
              style={{ borderRadius: "5px" }}
              aria-label="Đóng trợ lý"
            >
              <X className="size-4" />
            </button>
          </div>
          <div
            className="flex shrink-0 gap-1 overflow-x-auto border-b border-border px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map((item) => {
              const Icon = item.icon;
              const on = item.id === tab;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 px-2.5 py-1.5 text-xs transition",
                    on
                      ? "bg-violet-700 text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  style={{ ...FACE, fontSize: "12px", fontWeight: on ? 600 : 400, borderRadius: "5px" }}
                >
                  <Icon className="size-3.5" strokeWidth={1.75} />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((row, index) => (
              <div
                key={`${row.role}-${index}`}
                className={cn(
                  "flex animate-[ai-in_240ms_ease-out]",
                  row.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {row.role === "assistant" ? (
                  <span
                    className="mt-1 mr-2 inline-flex size-7 shrink-0 items-center justify-center bg-violet-700/15 text-violet-400"
                    style={{ borderRadius: "5px" }}
                  >
                    <BotMark size="size-3.5" />
                  </span>
                ) : null}
                <div className={cn("max-w-[86%] space-y-2", row.role === "user" ? "flex justify-end" : "")}>
                  {row.content ? (
                    <p
                      className={cn(
                        "px-3 py-2 text-sm whitespace-pre-wrap",
                        row.role === "user"
                          ? "bg-violet-700 text-white"
                          : "border border-border/70 bg-muted/70 text-foreground",
                      )}
                      style={{ ...FACE, fontSize: "13px", fontWeight: 400, borderRadius: "5px" }}
                    >
                      {row.content}
                      {sending && index === messages.length - 1 && row.role === "assistant" ? (
                        <span className="ml-0.5 inline-block h-3 w-[2px] animate-pulse bg-violet-400 align-middle" />
                      ) : null}
                    </p>
                  ) : null}
                  {row.role === "assistant" && Array.isArray(row.courses) && row.courses.length ? (
                    <div className="space-y-2">
                      {row.courses.map((course, order) => {
                        const cover = courseCover(course.images);
                        const href = `/khoa-hoc/${course.slug}`;
                        const free = course.free === true || Number(course.price) <= 0;
                        return (
                          <a
                            key={course.slug}
                            href={href}
                            className="flex min-w-0 gap-2.5 overflow-hidden border border-border/80 bg-background transition hover:border-violet-500/50 hover:bg-muted/40"
                            style={{
                              borderRadius: "5px",
                              animation: `ai-in 280ms ease-out ${order * 70}ms both`,
                            }}
                          >
                            <span className="relative block h-[72px] w-[108px] shrink-0 overflow-hidden bg-muted">
                              {cover ? (
                                <img src={cover} alt={course.title} className="size-full object-cover" />
                              ) : (
                                <span className="flex size-full items-center justify-center bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-900 text-white/80">
                                  <BookOpen className="size-6" strokeWidth={1.75} />
                                </span>
                              )}
                            </span>
                            <span className="min-w-0 flex-1 overflow-hidden py-1.5 pr-2.5">
                              <span
                                className="line-clamp-2 block text-foreground"
                                style={{ ...FACE, fontSize: "13px", fontWeight: 600 }}
                              >
                                {course.title}
                              </span>
                              {course.instructor ? (
                                <span
                                  className="mt-0.5 block truncate text-muted-foreground"
                                  style={{ ...FACE, fontSize: "11px", fontWeight: 400 }}
                                >
                                  {course.instructor}
                                </span>
                              ) : null}
                              <span
                                className="mt-1 block truncate text-violet-400"
                                style={{ ...FACE, fontSize: "12px", fontWeight: 600 }}
                              >
                                {free ? "Miễn phí" : formatMoney(course.price, course.currency || "VND")}
                              </span>
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {sending && messages[messages.length - 1]?.role === "user" ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="inline-flex size-7 items-center justify-center bg-violet-700/15 text-violet-400"
                  style={{ borderRadius: "5px" }}
                >
                  <BotMark size="size-3.5" />
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs" style={{ ...FACE, fontSize: "12px" }}>
                  Đang soạn
                  <span className="size-1 animate-pulse rounded-full bg-foreground/50" />
                  <span className="size-1 animate-pulse rounded-full bg-foreground/50 [animation-delay:140ms]" />
                  <span className="size-1 animate-pulse rounded-full bg-foreground/50 [animation-delay:280ms]" />
                </span>
              </div>
            ) : null}
            {!sending ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeTab.hints.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => void send(item)}
                    className="border border-border bg-background/80 px-2.5 py-1 text-xs text-muted-foreground transition hover:border-violet-500/40 hover:text-foreground"
                    style={{ ...FACE, fontSize: "12px", borderRadius: "5px" }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <form
            className="flex items-end gap-2 border-t border-border bg-muted/20 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <textarea
              ref={fieldRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              rows={1}
              placeholder={`Hỏi về ${activeTab.label.toLowerCase()}...`}
              className="max-h-24 min-h-11 flex-1 resize-none border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-violet-500"
              style={{ ...FACE, fontSize: "13px", borderRadius: "5px" }}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="inline-flex size-11 shrink-0 items-center justify-center bg-violet-700 text-white transition hover:bg-violet-600 disabled:opacity-45"
              style={{ borderRadius: "5px" }}
              aria-label="Gửi"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "pointer-events-auto relative flex size-12 items-center justify-center text-white shadow-md transition duration-300 hover:scale-105",
          open ? "bg-zinc-800 hover:bg-zinc-700" : "bg-violet-700 hover:bg-violet-600",
        )}
        style={{ borderRadius: "5px" }}
        aria-label={open ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
      >
        {!open ? (
          <span
            className="absolute inset-0 animate-[ai-soft_2.8s_ease-in-out_infinite] border border-violet-400/30"
            style={{ borderRadius: "5px" }}
          />
        ) : null}
        {open ? <X className="size-5" /> : <BotMark size="size-6" />}
      </button>
      <style>{`
        @keyframes ai-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ai-soft {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.16); }
        }
      `}</style>
    </div>
  );
}
