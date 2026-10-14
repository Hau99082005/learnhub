import { useEffect, useMemo, useState } from "react";
import {
  authGet,
  authPost,
  getAuthUser,
  setPendingToast,
  updateAuthUser,
} from "@/lib/auth";
import {
  INSTRUCTOR_STUDIO,
  answersToPayload,
  clearTeachStart,
  isTeachStartComplete,
  persistTeachStart,
  planItems,
  payloadToAnswers,
  readTeachStartState,
} from "@/lib/teachStart";
import logoLearnHub from "@/assets/icons/Logo LearnHub (1)-Photoroom.png";
import {
  Camera,
  Check,
  Clapperboard,
  Compass,
  Globe,
  Megaphone,
  Mic,
  Monitor,
  MonitorPlay,
  Presentation,
  School,
  Share2,
  Smartphone,
  Upload,
  UserRound,
  Users,
  Video,
  Webcam,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const REGISTER_HREF = "/dang-ky?role=INSTRUCTOR&from=teach";
const EXIT_HREF = "/giang-day";

const questionSteps = (answers) => {
  const teaching = answers["hinh-thuc"] || "";
  const recording = {
    "chua-tung-day": {
      title: "Dựng khóa học đầu tiên",
      text: "Bạn không cần studio. Chúng tôi hướng dẫn quay bằng điện thoại, tách thành bài ngắn và đăng khi sẵn sàng.",
      question: "Bạn quen ghi hình đến mức nào?",
      visual: { main: Smartphone, left: Camera, right: Mic },
      options: [
        { value: "moi-bat-dau", label: "Chưa từng quay", icon: Camera },
        { value: "quay-duoc-vai-clip", label: "Đã thử quay trên điện thoại", icon: Smartphone },
        { value: "da-quay-nhieu", label: "Đã quay được một số clip", icon: Video },
        { value: "da-dang-video", label: "Đã đăng video lên mạng", icon: Share2 },
      ],
    },
    "truc-tiep-chua-chinh-thuc": {
      title: "Đưa buổi dạy lên video",
      text: "Giữ cách bạn đang dạy, chỉ cắt thành bài ngắn. Học viên xem lại được, bạn không phải đứng lớp lại từ đầu.",
      question: "Bạn quen ghi hình đến mức nào?",
      visual: { main: Video, left: Webcam, right: Users },
      options: [
        { value: "moi-bat-dau", label: "Mới bắt đầu", icon: Camera },
        { value: "quay-duoc-vai-clip", label: "Đã quay thử vài buổi", icon: Video },
        { value: "da-quay-nhieu", label: "Đã quay nhiều", icon: Clapperboard },
        { value: "da-dang-video", label: "Đã đăng video lên mạng", icon: Share2 },
      ],
    },
    "truc-tiep-chuyen-mon": {
      title: "Chuyển lớp học thành khóa online",
      text: "Giáo án sẵn có thể tách thành bài video. Học viên học đúng nhịp của bạn, không cần phòng học.",
      question: "Bạn muốn đưa bài giảng lên video thế nào?",
      visual: { main: Clapperboard, left: School, right: Monitor },
      options: [
        { value: "moi-bat-dau", label: "Cần hướng dẫn từ đầu", icon: Camera },
        { value: "quay-duoc-vai-clip", label: "Đã quay thử một số buổi", icon: Video },
        { value: "da-quay-nhieu", label: "Đã có studio / quay thường xuyên", icon: Clapperboard },
        { value: "da-dang-video", label: "Đã có video khóa học sẵn", icon: Upload },
      ],
    },
    "truc-tuyen": {
      title: "Gói lại bài bạn đã dạy online",
      text: "Nếu đã có bài trên Zoom, YouTube hay nền tảng khác, hãy chuẩn hóa thành khóa học bán được trên LearnHub.",
      question: "Bạn đã có bài giảng video chưa?",
      visual: { main: MonitorPlay, left: Webcam, right: Upload },
      options: [
        { value: "moi-bat-dau", label: "Chưa có, sẽ quay mới", icon: Camera },
        { value: "quay-duoc-vai-clip", label: "Có vài bài ngắn", icon: Video },
        { value: "da-quay-nhieu", label: "Đã có chuỗi bài đầy đủ", icon: Clapperboard },
        { value: "da-dang-video", label: "Đã đăng trên nền tảng khác", icon: Upload },
      ],
    },
  }[teaching] || {
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
  };

  const audience = {
    "chua-tung-day": {
      title: "Đưa khóa học đến đúng người",
      text: "Chưa có người theo dõi cũng được. LearnHub đưa khóa học ra danh mục khi bạn xuất bản.",
      question: "Hiện bạn có ai sẽ học thử khóa đầu không?",
      visual: { main: Compass, left: UserRound, right: Globe },
      options: [
        { value: "chua-co", label: "Chưa có", icon: UserRound },
        { value: "nhom-nho", label: "Có vài người quen", icon: Users },
        { value: "cong-dong-lon", label: "Đã có nhóm sẽ theo học", icon: Globe },
      ],
    },
    "truc-tiep-chuyen-mon": {
      title: "Mở lớp cho đúng học viên",
      text: "Học viên cũ có thể vào khóa online. Phần còn lại LearnHub tìm người đang cần đúng kỹ năng của bạn.",
      question: "Bạn đã có học viên hoặc thương hiệu cá nhân chưa?",
      visual: { main: Megaphone, left: School, right: Globe },
      options: [
        { value: "chua-co", label: "Chưa có kênh / lớp online", icon: UserRound },
        { value: "nhom-nho", label: "Có lớp hoặc học viên hiện tại", icon: Users },
        { value: "cong-dong-lon", label: "Có cộng đồng / thương hiệu cá nhân", icon: Globe },
      ],
    },
    "truc-tuyen": {
      title: "Mang học viên sang khóa học",
      text: "Nếu đã có người xem trên nền tảng khác, chúng tôi giúp họ vào đúng khóa trên LearnHub.",
      question: "Bạn đã có người theo dõi từ kênh đang dạy chưa?",
      visual: { main: Share2, left: Users, right: Globe },
      options: [
        { value: "chua-co", label: "Chưa có", icon: UserRound },
        { value: "nhom-nho", label: "Có một nhóm nhỏ", icon: Users },
        { value: "cong-dong-lon", label: "Có cộng đồng khá lớn", icon: Globe },
      ],
    },
  }[teaching] || {
    title: "Đưa khóa học đến đúng người",
    text: "Khi lớp mở, học viên trên LearnHub có thể tìm thấy bạn. Nếu bạn đã có người theo dõi, chúng tôi giúp họ vào đúng khóa học của bạn.",
    question: "Hiện bạn có nhóm người đang theo dõi công việc của mình không?",
    visual: { main: Megaphone, left: Users, right: Globe },
    options: [
      { value: "chua-co", label: "Chưa có", icon: UserRound },
      { value: "nhom-nho", label: "Có một nhóm nhỏ", icon: Users },
      { value: "cong-dong-lon", label: "Có một cộng đồng khá lớn", icon: Globe },
    ],
  };

  return [
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
    { id: "ghi-hinh", ...recording },
    { id: "tiep-can", ...audience },
  ];
};

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
  const saved = readTeachStartState();
  const [step, setStep] = useState(Math.max(saved.step, 0));
  const [answers, setAnswers] = useState(saved.answers);
  const [saving, setSaving] = useState(false);
  const steps = useMemo(() => questionSteps(answers), [answers]);
  const total = steps.length + 1;
  const isPlan = step >= steps.length;
  const current = isPlan ? null : steps[Math.min(step, steps.length - 1)];
  const selected = current ? answers[current.id] || "" : "";
  const progress = ((Math.min(step + 1, total)) / total) * 100;
  const plan = isPlan ? planItems(answers) : [];

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      return;
    }
    authGet("/api/instructor/onboarding")
      .then((data) => {
        const fromDb = payloadToAnswers(data);
        const local = readTeachStartState();
        if (!Object.keys(fromDb).length) {
          const payload = answersToPayload(local.answers);
          if (Object.keys(payload).length) {
            authPost("/api/instructor/onboarding", payload).then((savedRow) => {
              if (savedRow?.completed) {
                updateAuthUser({ role: "INSTRUCTOR" });
              }
            });
          }
          return;
        }
        const localEmpty =
          !local.answers?.["hinh-thuc"] &&
          !local.answers?.["ghi-hinh"] &&
          !local.answers?.["tiep-can"];
        const next = localEmpty ? fromDb : { ...fromDb, ...local.answers };
        const nextStep = localEmpty
          ? next["tiep-can"]
            ? 3
            : next["ghi-hinh"]
              ? 2
              : next["hinh-thuc"]
                ? 1
                : 0
          : Math.max(local.step, 0);
        persistTeachStart(nextStep, next);
        setAnswers(next);
        setStep(nextStep);
      })
      .catch(() => {});
  }, []);

  const saveAnswers = (nextAnswers) => {
    const payload = answersToPayload(nextAnswers);
    if (!getAuthUser() || !Object.keys(payload).length) {
      return;
    }
    authPost("/api/instructor/onboarding", payload)
      .then((data) => {
        if (data?.completed) {
          updateAuthUser({ role: "INSTRUCTOR" });
        }
      })
      .catch(() => {});
  };

  const onSelect = (value) => {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    persistTeachStart(step, next);
    saveAnswers(next);
  };

  const finish = async () => {
    persistTeachStart(step, answers);
    if (getAuthUser()) {
      const payload = answersToPayload(answers);
      if (!isTeachStartComplete(answers)) {
        window.location.href = REGISTER_HREF;
        return;
      }
      setSaving(true);
      try {
        await authPost("/api/instructor/onboarding", payload);
        updateAuthUser({ role: "INSTRUCTOR" });
        clearTeachStart();
        setPendingToast("success", "Đã lưu thông tin giảng dạy");
        window.location.href = INSTRUCTOR_STUDIO;
      } catch {
        setPendingToast("error", "Không lưu được thông tin. Vui lòng đăng nhập lại.");
        window.location.href = "/dang-nhap?from=teach";
      }
      return;
    }
    window.location.href = REGISTER_HREF;
  };

  const goNext = () => {
    if (saving) {
      return;
    }
    if (isPlan) {
      finish();
      return;
    }
    if (!selected) {
      return;
    }
    const nextStep = step + 1;
    setStep(nextStep);
    persistTeachStart(nextStep, answers);
  };

  const goBack = () => {
    if (step === 0) {
      return;
    }
    const nextStep = step - 1;
    setStep(nextStep);
    persistTeachStart(nextStep, answers);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 bg-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <a
            href="/"
            className="flex shrink-0 items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <img
              src={logoLearnHub}
              alt="LearnHub"
              className="h-9 w-9 bg-transparent object-contain sm:h-10 sm:w-10"
            />
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
            Bước {Math.min(step + 1, total)} / {total}
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
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-10 sm:px-6 sm:py-14">
        {isPlan ? (
          <div
            key="plan"
            className="grid w-full items-start gap-10 animate-in fade-in slide-in-from-bottom-3 duration-500 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16"
          >
            <div className="max-w-xl">
              <h1
                className="text-2xl font-semibold tracking-tight text-balance sm:text-4xl"
                style={{ ...headingStyle, fontSize: "32px" }}
              >
                Lộ trình phù hợp với bạn
              </h1>
              <p
                className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base"
                style={{ ...bodyStyle, fontSize: "16px", lineHeight: 1.7 }}
              >
                Dựa trên câu trả lời, đây là cách bắt đầu hiệu quả nhất. Bạn có thể chỉnh khóa học bất cứ lúc nào sau khi vào studio.
              </p>
              <ul className="mt-8 grid gap-3">
                {plan.map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-3 border border-border px-4 py-3"
                    style={{ borderRadius: "5px" }}
                  >
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center bg-foreground text-background">
                      <Check className="size-3.5" strokeWidth={2.4} aria-hidden="true" />
                    </span>
                    <div>
                      <p
                        className="text-sm font-medium sm:text-[15px]"
                        style={{ ...headingStyle, fontSize: "15px", fontWeight: "600" }}
                      >
                        {item.title}
                      </p>
                      <p
                        className="mt-1 text-sm leading-relaxed text-muted-foreground"
                        style={{ ...bodyStyle, fontSize: "14px", lineHeight: 1.6 }}
                      >
                        {item.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <TeachVisual visual={{ main: Presentation, left: Check, right: Globe }} />
            </div>
          </div>
        ) : (
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
        )}
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
            disabled={(!isPlan && !selected) || saving}
            className="h-11 px-6 text-[15px]"
            style={{
              ...bodyStyle,
              fontSize: "16px",
              border: "none",
              borderRadius: "5px",
            }}
          >
            {saving ? "Đang lưu..." : isPlan ? "Bắt đầu tạo khóa học" : "Tiếp tục"}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default TeachStart;
