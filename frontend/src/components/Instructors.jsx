import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  GraduationCap,
  Rocket,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const START_HREF = "/dang-ky?role=INSTRUCTOR";

const REASONS = [
  {
    icon: BookOpen,
    title: "Dạy đúng nhịp sống của bạn",
    text: "Không phòng học, không giờ cố định. Bạn dựng bài khi sẵn sàng — khóa học ở lại trên LearnHub và làm việc cả khi bạn đang nghỉ.",
  },
  {
    icon: Users,
    title: "Gặp người đang tìm đúng bạn",
    text: "Học viên tới vì muốn tiến bộ, không phải vì lướt cho vui. Bạn dạy sâu, họ ở lại, và tên bạn lớn dần theo từng buổi hoàn thành.",
  },
  {
    icon: Wallet,
    title: "Chuyên môn thành thu nhập thật",
    text: "Một lần quay, nhiều lần được trả. Doanh thu rõ ràng, bản quyền bài giảng thuộc về bạn — không phí ẩn, không vòng vo.",
  },
];

const STATS = [
  { value: "0đ", label: "phí mở lớp học" },
  { value: "100%", label: "bạn giữ bản quyền" },
  { value: "24/7", label: "khóa học luôn mở" },
  { value: "1:1", label: "kèm lúc ra mắt" },
];

const STEPS = [
  {
    id: "ke-hoach",
    label: "Phác thảo hành trình",
    icon: Compass,
    title: "Viết một con đường, đừng viết một cuốn sách",
    text: "Học viên bắt đầu từ đâu? Sau buổi cuối họ làm được gì? Chỉ cần trả lời hai câu đó. LearnHub giúp bạn tách thành bài ngắn, dễ quay, dễ bán — mỗi bài một việc, không giáo trình nặng đầu.",
    points: [
      "Chọn một kỹ năng cụ thể, không ôm cả ngành",
      "Chia thành 6–12 bài, mỗi bài dưới 15 phút",
      "Kết mỗi bài bằng một việc họ làm được ngay",
    ],
  },
  {
    id: "quay",
    label: "Quay như đang kể",
    icon: Video,
    title: "Nói với một người, đừng nói với một hội trường",
    text: "Điện thoại tốt và ánh sáng cửa sổ đủ cho buổi đầu. Nói chậm, có ví dụ, như đang ngồi đối diện ai đó thật. Chúng tôi gửi checklist trước khi bạn bấm ghi — để lần đầu đã xem được.",
    points: [
      "Quay ngang, mặt nhìn ống kính, giọng gần mic",
      "Một ý một clip, cắt chỗ lan man",
      "Xem lại như học viên: chỗ nào rối thì quay lại",
    ],
  },
  {
    id: "ra-mat",
    label: "Mở lớp và lan tỏa",
    icon: Rocket,
    title: "Ra mắt khi bài đã đủ tốt, không phải khi đã hoàn hảo",
    text: "Đặt giá thật, viết mô tả như đang giới thiệu với một người bạn. Học viên đầu tiên là tín hiệu, không phải bài kiểm tra. Chúng tôi chỉnh trang khóa học cùng bạn trước khi lớp mở cửa.",
    points: [
      "Giá mở lớp vừa tầm, tăng khi có đánh giá",
      "Ảnh bìa rõ mặt hoặc rõ kết quả học",
      "Chia sẻ cho 10 người tin bạn trước khi chạy ads",
    ],
  },
];

const Instructors = () => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <article className="w-full">
      <section className="relative overflow-hidden">
        <div className="mx-auto grid min-h-[72vh] w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div className="max-w-xl">
            <p
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "14px",
                fontWeight: "400",
                fontStyle: "normal",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
              }}
              className="mb-4 inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase"
            >
              <GraduationCap className="size-5" strokeWidth={1.75} />
              Dành cho người sẵn sàng dạy
            </p>
            <h1
              className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "48px",
                fontWeight: "600",
                fontStyle: "normal",
                lineHeight: 1.2,
                letterSpacing: "0.01em",
              }}
            >
              Dạy điều bạn giỏi.
              <span className="mt-1 block text-balance">
                Được trả công xứng đáng.
              </span>
            </h1>
            <p
              className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "18px",
                fontWeight: "400",
                fontStyle: "italic",
                lineHeight: 1.7,
                letterSpacing: "0.01em",
              }}
            >
              Bạn đã giỏi một việc. LearnHub đưa việc đó đến người đang tìm đúng
              người thầy — rõ ràng, tử tế, và để lại dấu ấn.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                render={<a href={START_HREF} />}
                className="h-12 rounded-full px-6 text-[15px]"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "17px",
                  fontWeight: "400",
                  fontStyle: "normal",
                  lineHeight: 1.7,
                  letterSpacing: "0.01em",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Bắt đầu giảng dạy
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                render={<a href="#cach-bat-dau" />}
                className="h-12 rounded-full px-6 text-[15px]"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "17px",
                  fontWeight: "400",
                  fontStyle: "normal",
                  lineHeight: 1.7,
                  letterSpacing: "0.01em",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Xem cách bắt đầu
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 hidden rounded-full bg-foreground/5 blur-3xl lg:block" />
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1600&q=80"
              alt="Giảng viên LearnHub"
              className="relative aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5] lg:max-h-[620px]"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <h2
            className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "48px",
              fontWeight: "700",
              fontStyle: "normal",
              lineHeight: 1.2,
              letterSpacing: "0.01em",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Có đủ lý do để bắt đầu. <br />
            Và không cần chờ hoàn hảo.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {REASONS.map((item) => (
              <div
                key={item.title}
                className="flex flex-col border border-border bg-card p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-8"
              >
                <item.icon
                  className="size-8 text-foreground"
                  strokeWidth={1.5}
                />
                <h3
                  className="mt-5 text-lg font-semibold tracking-tight"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "20px",
                    fontWeight: "600",
                    fontStyle: "normal",
                    lineHeight: 1.4,
                    letterSpacing: "0.01em",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "17px",
                    fontWeight: "400",
                    fontStyle: "normal",
                    lineHeight: 1.4,
                    letterSpacing: "0.01em",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-4">
          {STATS.map((item) => (
            <div key={item.label} className="text-center md:text-left">
              <p
                className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "48px",
                  fontWeight: "700",
                  fontStyle: "normal",
                  lineHeight: 1.4,
                  letterSpacing: "0.01em",
                  textAlign: "center",
                }}
              >
                {item.value}
              </p>
              <p
                className="mt-1 text-sm text-muted-foreground"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "18px",
                  fontWeight: "400",
                  fontStyle: "normal",
                  lineHeight: 1.4,
                  letterSpacing: "0.01em",
                  textAlign: "center",
                }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="cach-bat-dau" className="scroll-mt-20">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <h2
            className="text-center text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "48px",
              fontWeight: "700",
              fontStyle: "normal",
              lineHeight: 1.2,
              letterSpacing: "0.01em",
            }}
          >
            Ba bước để bắt đầu.
            <span className="mt-1 block">
              Từ kế hoạch đến khóa học đầu tiên.
            </span>
          </h2>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-0">
            {STEPS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStep(index)}
                className={`border-b-2 px-4 py-3 text-left text-sm font-medium transition sm:px-6 ${
                  step === index
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "16px",
                  fontWeight: "400",
                  fontStyle: "normal",
                  lineHeight: 1.2,
                  letterSpacing: "0.01em",
                }}
              >
                <span className="mr-2 text-xs tracking-wider">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <current.icon
                className="size-10 text-foreground"
                strokeWidth={1.4}
              />
              <h3
                className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "24px",
                  fontWeight: "600",
                  fontStyle: "normal",
                  lineHeight: 1.2,
                  letterSpacing: "0.01em",
                }}
              >
                {current.title}
              </h3>
              <p
                className="mt-4 text-[15px] leading-relaxed text-muted-foreground"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "20px",
                  fontWeight: "400",
                  fontStyle: "normal",
                  lineHeight: 1.5,
                  letterSpacing: "0.01em",
                }}
              >
                {current.text}
              </p>
              <ul className="mt-6 space-y-3">
                {current.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-sm text-foreground sm:text-[15px]"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: "16px",
                      fontWeight: "400",
                      fontStyle: "normal",
                      lineHeight: 1.2,
                      letterSpacing: "0.01em",
                    }}
                  >
                    <Check
                      className="mt-0.5 size-5 shrink-0"
                      strokeWidth={1.75}
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-muted">
              <img
                src={
                  step === 0
                    ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"
                    : step === 1
                      ? "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&q=80"
                      : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80"
                }
                alt={current.label}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/50">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <h2
            className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "48px",
              fontWeight: "700",
              fontStyle: "normal",
              lineHeight: 1.4,
              letterSpacing: "0.01em",
            }}
          >
            Hôm nay là lúc hợp lý nhất để bắt đầu.
          </h2>
          <p
            className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "17px",
              fontWeight: "400",
              fontStyle: "normal",
              lineHeight: 1.7,
              letterSpacing: "0.01em",
            }}
          >
            Một khóa học. Một quyết định. Phần còn lại mình làm cùng — trước khi
            bạn nghĩ mình chưa sẵn sàng.
          </p>
          <Button
            render={<a href={START_HREF} />}
            className="mt-8 h-12 rounded-full px-8 text-[15px]"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "17px",
              fontWeight: "400",
              fontStyle: "normal",
              lineHeight: 1.7,
              letterSpacing: "0.01em",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Bắt đầu giảng dạy
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </article>
  );
};

export { Instructors };
export default Instructors;
