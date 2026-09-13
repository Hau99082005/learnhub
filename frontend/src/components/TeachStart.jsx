import { useState } from "react";
import {
  Camera,
  Clapperboard,
  Compass,
  Globe,
  GraduationCap,
  Megaphone,
  Mic,
  Monitor,
  MonitorPlay,
  Presentation,
  School,
  Share2,
  UserRound,
  Users,
  Video,
  Webcam,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const REGISTER_HREF = "/dang-ky?role=INSTRUCTOR";
const EXIT_HREF = "/giang-day";
const STORAGE_KEY = "learnhub.teachStart";

const STEPS = [
  {
    id: "hinh-thuc",
    title: "",
    text: "Khóa học trên LearnHub là bài giảng video, để người học nắm một kỹ năng cụ thể và dùng được ngay. Dù bạn đã đứng lớp hay mới bắt đầu, nền tảng này giúp bạn đưa chuyên môn đến đúng người đang tìm.",
    question: "Trước đây bạn từng dạy theo hình thức nào?",
    visual: { main: Presentation, left: Monitor, right: Users },
    options: [
      {
        value: "truc-tiep-chua-chinh-thuc",
        label: "Trực tiếp, chưa chính thức",
        icon: Users,
      },
      {
        value: "truc-tiep-chuyen-mon",
        label: "Trực tiếp, đã làm nghề",
        icon: School,
      },
      { value: "truc-tuyen", label: "Trực tuyến", icon: MonitorPlay },
      { value: "chua-tung-day", label: "Chưa từng dạy", icon: Compass },
    ],
  },
  {
    id: "ghi-hinh",
    title: "Dựng khóa học đầu tiên",
    text: "Chúng tôi hướng dẫn bạn ghi hình tại nhà. Dù mới cầm điện thoại hay đã quen máy quay, mỗi bước đều có checklist cụ thể.",
    question: "Bạn quen ghi hình đến mức nào?",
    visual: { main: Video, left: Webcam, right: Mic },
    options: [
      { value: "moi-bat-dau", label: "Mới bắt đầu", icon: Camera },
      { value: "quay-duoc-vai-clip", label: "Quay được vài clip", icon: Video },
      { value: "da-quay-nhieu", label: "Đã quay nhiều", icon: Clapperboard },
      { value: "da-dang-video", label: "Đã đăng video lên mạng", icon: Share2 },
    ],
  },
  {
    id: "tiep-can",
    title: "Đưa khóa học đến đúng người",
    text: "Khi lớp mở, học viên trên LearnHub có thể tìm thấy bạn. Nếu bạn đã có người theo dõi, chúng tôi giúp họ vào đúng khóa học của bạn.",
    question: "Hiện bạn có nhóm người đang theo dõi công việc của mình không?",
    visual: { main: Megaphone, left: Users, right: Globe },
    options: [
      { value: "chua-co", label: "Chưa có", icon: UserRound },
      { value: "nhom-nho", label: "Có một nhóm nhỏ", icon: Users },
      {
        value: "cong-dong-lon",
        label: "Có một cộng đồng khá lớn",
        icon: Globe,
      },
    ],
  },
];

const headingStyle = {
  fontFamily: "'Roboto', sans-serif",
  fontWeight: "700",
  fontStyle: "normal",
  lineHeight: 1.25,
  letterSpacing: "0.01em",
};

const bodyStyle = {
  fontFamily: "'Roboto', sans-serif",
  fontWeight: "400",
  fontStyle: "normal",
  letterSpacing: "0.01em",
};

const readSaved = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { step: 0, answers: {} };
    }
    const parsed = JSON.parse(raw);
    return {
      step: Number.isInteger(parsed.step) ? parsed.step : 0,
      answers:
        parsed.answers && typeof parsed.answers === "object"
          ? parsed.answers
          : {},
    };
  } catch {
    return { step: 0, answers: {} };
  }
};

const TeachVisual = ({ visual }) => {
  const Main = visual.main;
  const Left = visual.left;
  const Right = visual.right;

  return (
    <div className="relative flex aspect-square w-full max-w-[220px] items-center justify-center bg-muted/60 sm:max-w-[280px] lg:max-w-[360px]">
      <Left
        className="absolute top-[18%] left-[16%] size-9 text-muted-foreground sm:size-11"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <Main
        className="size-20 text-foreground sm:size-24 lg:size-28"
        strokeWidth={1.4}
        aria-hidden="true"
      />
      <Right
        className="absolute right-[16%] bottom-[18%] size-9 text-muted-foreground sm:size-11"
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </div>
  );
};

const TeachStart = () => {
  const saved = readSaved();
  const [step, setStep] = useState(
    Math.min(Math.max(saved.step, 0), STEPS.length - 1),
  );
  const [answers, setAnswers] = useState(saved.answers);
  const current = STEPS[step];
  const selected = answers[current.id] || "";
  const progress = ((step + 1) / STEPS.length) * 100;

  const persist = (nextStep, nextAnswers) => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ step: nextStep, answers: nextAnswers }),
    );
  };

  const onSelect = (value) => {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    persist(step, next);
  };

  const goNext = () => {
    if (!selected) {
      return;
    }
    if (step >= STEPS.length - 1) {
      persist(0, answers);
      window.location.href = REGISTER_HREF;
      return;
    }
    const nextStep = step + 1;
    setStep(nextStep);
    persist(nextStep, answers);
  };

  const goBack = () => {
    if (step === 0) {
      return;
    }
    const nextStep = step - 1;
    setStep(nextStep);
    persist(nextStep, answers);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 bg-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <a
            href="/"
            className="flex shrink-0 items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <span className="flex size-9 items-center justify-center bg-foreground text-background sm:size-10">
              <GraduationCap className="size-5 sm:size-6" strokeWidth={1.75} />
            </span>
            <span
              className="text-[15px] font-semibold tracking-tight text-foreground sm:text-[16px]"
              style={{ ...headingStyle, fontWeight: "600", fontSize: "16px" }}
            >
              LearnHub
            </span>
          </a>
          <p
            className="text-xs text-muted-foreground sm:text-sm"
            style={{ ...bodyStyle, fontSize: "14px" }}
          >
            Bước {step + 1} / {STEPS.length}
          </p>
          <a
            href={EXIT_HREF}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            style={{ ...bodyStyle, fontSize: "14px" }}
          >
            Thoát
          </a>
        </div>
        <div className="h-1 w-full bg-muted">
          <div
            className="h-full bg-foreground transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-10 sm:px-6 sm:py-14">
        <div
          key={current.id}
          className="grid w-full items-center gap-10 animate-in fade-in slide-in-from-bottom-3 duration-500 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16"
        >
          <div className="max-w-xl">
            {current.title ? (
              <h1
                className="text-2xl font-semibold tracking-tight text-balance sm:text-4xl"
                style={{ ...headingStyle, fontSize: "32px" }}
              >
                {current.title}
              </h1>
            ) : null}
            <p
              className={`max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base ${
                current.title ? "mt-3" : ""
              }`}
              style={{ ...bodyStyle, fontSize: "16px", lineHeight: 1.7 }}
            >
              {current.text}
            </p>
            <p
              className="mt-8 text-sm font-medium sm:text-[15px]"
              style={{ ...headingStyle, fontSize: "16px", fontWeight: "600" }}
            >
              {current.question}
            </p>
            <RadioGroup
              value={selected}
              onValueChange={onSelect}
              className="mt-4 grid gap-2.5"
            >
              {current.options.map((option) => (
                <label
                  key={option.value}
                  className="flex min-h-12 cursor-pointer items-center gap-3 border border-border px-4 py-3 text-sm transition duration-200 hover:border-foreground/40 has-aria-checked:border-foreground"
                  style={{
                    ...bodyStyle,
                    fontSize: "15px",
                    borderRadius: "5px",
                  }}
                >
                  <RadioGroupItem value={option.value} />
                  <option.icon
                    className="size-4 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  {option.label}
                </label>
              ))}
            </RadioGroup>
          </div>
          <div className="flex items-center justify-center">
            <TeachVisual visual={current.visual} />
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 border-t border-border bg-background">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-6">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              className="h-11 px-6 text-[15px]"
              style={{
                ...bodyStyle,
                fontSize: "16px",
                borderRadius: "5px",
              }}
            >
              Trước
            </Button>
          ) : (
            <span />
          )}
          <Button
            type="button"
            onClick={goNext}
            disabled={!selected}
            className="h-11 px-6 text-[15px]"
            style={{
              ...bodyStyle,
              fontSize: "16px",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Tiếp tục
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default TeachStart;
