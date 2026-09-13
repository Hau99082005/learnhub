import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  GraduationCap,
  Lightbulb,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const VALUES = [
  {
    icon: Compass,
    title: "Rõ ràng từ đầu",
    text: "Mỗi khóa học có mục tiêu, lộ trình và kết quả đo được. Học viên biết mình sẽ làm được gì trước khi bấm đăng ký.",
  },
  {
    icon: Shield,
    title: "Tử tế với cả hai phía",
    text: "Giảng viên giữ bản quyền. Học viên giữ quyền học đúng những gì đã mua. Không phí ẩn, không vòng vo.",
  },
  {
    icon: Star,
    title: "Tiến bộ nhìn thấy được",
    text: "Bài ngắn, việc cụ thể, tiến độ hiện ra từng buổi. Học để dùng được — không phải để tích cho đủ.",
  },
];

const STATS = [
  { value: "0đ", label: "phí mở lớp học" },
  { value: "100%", label: "bản quyền thuộc giảng viên" },
  { value: "2", label: "vai trò trên cùng nền tảng" },
  { value: "24/7", label: "khóa học luôn sẵn sàng" },
];

const PROMISES = [
  "Nội dung tiếng Việt, viết cho người Việt đang đi làm và đang dạy.",
  "Giảng viên tự quyết giá, lịch xuất bản và cách kể chuyện.",
  "Học viên học theo nhịp của mình — trên điện thoại hay máy tính.",
  "Hỗ trợ khi mở lớp lần đầu: từ mô tả khóa học đến buổi ra mắt.",
];

const AUDIENCE = [
  {
    icon: BookOpen,
    title: "Người học",
    text: "Chọn đúng kỹ năng, học với người đã làm việc đó, và hoàn thành từng bài bằng một việc cụ thể.",
    href: "/khoa-hoc",
    action: "Xem khóa học",
  },
  {
    icon: GraduationCap,
    title: "Người dạy",
    text: "Đưa chuyên môn lên lớp một lần, giữ bản quyền, và gặp học viên đang tìm đúng điều bạn giỏi.",
    href: "/giang-day",
    action: "Bắt đầu giảng dạy",
  },
];

const headingStyle = {
  fontFamily: "'Roboto', sans-serif",
  fontWeight: "700",
  fontStyle: "normal",
  lineHeight: 1.2,
  letterSpacing: "0.01em",
};

const bodyStyle = {
  fontFamily: "'Roboto', sans-serif",
  fontWeight: "400",
  fontStyle: "normal",
  letterSpacing: "0.01em",
};

const About = () => {
  return (
    <article className="w-full">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,oklch(0.145_0_0/0.06),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(1_0_0/0.08),transparent_60%)]" />
        <div className="mx-auto grid min-h-[68vh] w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p
              className="mb-4 inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "14px",
                fontWeight: "400",
                fontStyle: "normal",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
              }}
            >
              <GraduationCap className="size-6" strokeWidth={1.75} />
              Về LearnHub
            </p>
            <h1
              className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
              style={{ ...headingStyle, fontSize: "48px", fontWeight: "600" }}
            >
              Nơi chuyên môn gặp người đang tìm đúng người thầy.
            </h1>
            <p
              className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={{
                ...bodyStyle,
                fontSize: "18px",
                fontStyle: "italic",
                lineHeight: 1.7,
              }}
            >
              LearnHub kết nối giảng viên và học viên trên cùng một nền tảng —
              học có lộ trình, dạy có chỗ đứng, mọi thứ viết bằng tiếng Việt.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                render={<a href="/khoa-hoc" />}
                className="h-12 rounded-full px-6 text-[15px]"
                style={{
                  ...bodyStyle,
                  fontSize: "17px",
                  lineHeight: 1.7,
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Khám phá khóa học
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                render={<a href="/giang-day" />}
                className="h-12 rounded-full px-6 text-[15px]"
                style={{
                  ...bodyStyle,
                  fontSize: "17px",
                  lineHeight: 1.7,
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Dạy trên LearnHub
              </Button>
            </div>
          </div>
          <div className="relative animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both [animation-delay:120ms]">
            <div className="absolute -inset-6 hidden rounded-full bg-foreground/5 blur-3xl lg:block" />
            <div className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
                alt="Học viên và giảng viên trên LearnHub"
                className="relative aspect-[4/5] w-full object-cover transition duration-700 ease-out hover:scale-[1.03] sm:aspect-[5/4] lg:aspect-[4/5] lg:max-h-[620px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 overflow-hidden lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80"
              alt="Đội ngũ LearnHub"
              className="aspect-[4/3] w-full object-cover transition duration-700 ease-out hover:scale-[1.03]"
            />
          </div>
          <div className="order-1 max-w-lg lg:order-2">
            <p
              className="mb-3 inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase"
              style={{ ...bodyStyle, fontSize: "14px", lineHeight: 1.4 }}
            >
              <Lightbulb className="size-4" strokeWidth={1.75} />
              Sứ mệnh
            </p>
            <h2
              className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
              style={{ ...headingStyle, fontSize: "40px" }}
            >
              Học không cần phức tạp hơn việc cần làm.
            </h2>
            <p
              className="mt-4 text-[15px] leading-relaxed text-muted-foreground"
              style={{ ...bodyStyle, fontSize: "17px", lineHeight: 1.7 }}
            >
              Chúng tôi xây LearnHub vì thấy quá nhiều khóa học dài mà thiếu
              việc làm được, và quá nhiều người giỏi không có chỗ để dạy tử tế.
              Nền tảng này để hai phía gặp nhau — ngắn, rõ, và đáng tin.
            </p>
            <ul className="mt-6 space-y-3">
              {PROMISES.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm text-foreground sm:text-[15px]"
                  style={{ ...bodyStyle, fontSize: "15px", lineHeight: 1.6 }}
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0"
                    strokeWidth={1.75}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <h2
            className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            style={{ ...headingStyle, fontSize: "40px" }}
          >
            Cách chúng tôi làm việc.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((item, index) => (
              <div
                key={item.title}
                className="flex flex-col border border-border bg-card p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-8"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <item.icon
                  className="size-8 text-foreground"
                  strokeWidth={1.5}
                />
                <p
                  className="mt-5 text-xs tracking-[0.16em] text-muted-foreground uppercase"
                  style={{ ...bodyStyle, fontSize: "12px" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3
                  className="mt-2 text-lg font-semibold tracking-tight"
                  style={{
                    ...headingStyle,
                    fontSize: "20px",
                    fontWeight: "600",
                    lineHeight: 1.4,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
                  style={{ ...bodyStyle, fontSize: "17px", lineHeight: 1.5 }}
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
            <div key={item.label} className="text-center">
              <p
                className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
                style={{ ...headingStyle, fontSize: "48px" }}
              >
                {item.value}
              </p>
              <p
                className="mt-1 text-sm text-muted-foreground"
                style={{ ...bodyStyle, fontSize: "16px", lineHeight: 1.4 }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p
              className="mb-3 inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase"
              style={{ ...bodyStyle, fontSize: "14px", lineHeight: 1.4 }}
            >
              <Users className="size-4" strokeWidth={1.75} />
              Hai phía, một nền tảng
            </p>
            <h2
              className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
              style={{ ...headingStyle, fontSize: "40px" }}
            >
              LearnHub được dựng cho người học và người dạy.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {AUDIENCE.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="group flex flex-col border border-border bg-card p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-8"
              >
                <item.icon
                  className="size-8 text-foreground"
                  strokeWidth={1.5}
                />
                <h3
                  className="mt-5 text-2xl font-semibold tracking-tight"
                  style={{
                    ...headingStyle,
                    fontSize: "28px",
                    fontWeight: "600",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-3 text-[15px] leading-relaxed text-muted-foreground"
                  style={{ ...bodyStyle, fontSize: "17px", lineHeight: 1.7 }}
                >
                  {item.text}
                </p>
                <span
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium"
                  style={{ ...bodyStyle, fontSize: "15px", fontWeight: "500" }}
                >
                  {item.action}
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/50">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <h2
            className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
            style={{ ...headingStyle, fontSize: "48px" }}
          >
            Học hoặc dạy — chọn một hướng và bắt đầu.
          </h2>
          <p
            className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground"
            style={{ ...bodyStyle, fontSize: "17px", lineHeight: 1.7 }}
          >
            LearnHub không đòi bạn sẵn sàng hoàn hảo. Chỉ cần một kỹ năng đáng
            học, hoặc một việc bạn muốn làm được hơn.
          </p>
          <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Button
              render={<a href="/dang-ky" />}
              className="h-12 w-full rounded-full px-8 text-[15px] sm:w-auto"
              style={{
                ...bodyStyle,
                fontSize: "17px",
                lineHeight: 1.7,
                border: "none",
                borderRadius: "5px",
              }}
            >
              Tạo tài khoản
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              render={<a href="/giang-day" />}
              className="h-12 w-full rounded-full px-8 text-[15px] sm:w-auto"
              style={{
                ...bodyStyle,
                fontSize: "17px",
                lineHeight: 1.7,
                border: "none",
                borderRadius: "5px",
              }}
            >
              Tìm hiểu giảng dạy
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
};

export default About;
