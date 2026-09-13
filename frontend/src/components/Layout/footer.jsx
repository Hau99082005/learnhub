import { GraduationCap, ArrowUpRight } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faYoutube,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EXPLORE = [
  { href: "/khoa-hoc", label: "Các khóa học" },
  { href: "/tai-lieu", label: "Tài liệu" },
  { href: "/thu-vien", label: "Thư viện" },
  { href: "/bai-viet", label: "Bài viết" },
];

const COMPANY = [
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/giang-day", label: "Giảng dạy" },
  { href: "/lien-he", label: "Liên hệ" },
];

const SUPPORT = [
  { href: "/ho-tro", label: "Trung tâm hỗ trợ" },
  { href: "/faq", label: "Câu hỏi thường gặp" },
  { href: "/dieu-khoan", label: "Điều khoản sử dụng" },
  { href: "/bao-mat", label: "Chính sách bảo mật" },
];

const SOCIAL = [
  { href: "https://facebook.com", label: "Facebook", icon: faFacebookF },
  { href: "https://youtube.com", label: "YouTube", icon: faYoutube },
  { href: "https://linkedin.com", label: "LinkedIn", icon: faLinkedinIn },
];

const FooterLink = ({ href, label }) => (
  <li>
    <a
      href={href}
      className="group inline-flex items-center text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
    >
      <span className="relative">
        {label}
        <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-foreground transition-transform duration-300 ease-out group-hover:scale-x-100" />
      </span>
    </a>
  </li>
);

const Footer = () => {
  const year = new Date().getFullYear();

  const onSubscribe = (event) => {
    event.preventDefault();
  };

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="md:col-span-2 lg:col-span-5">
            <a
              href="/"
              className="group inline-flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <span
                style={{
                  border: "1px solid none",
                  borderRadius: "8px",
                }}
                className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background transition-transform duration-300 group-hover:scale-[1.04]"
              >
                <GraduationCap className="size-6" strokeWidth={1.75} />
              </span>
              <span
                className="text-[16px] font-semibold tracking-tight text-foreground"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: "600",
                  fontStyle: "normal",
                  lineHeight: 1.4,
                  letterSpacing: "0.01em",
                }}
              >
                LearnHub
              </span>
            </a>
            <p
              className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "16px",
                fontWeight: "400",
                fontStyle: "italic",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
              }}
            >
              Nền tảng học trực tuyến giúp bạn nắm vững kỹ năng mới qua khóa
              học, tài liệu và thư viện được chọn lọc.
            </p>
            <form
              onSubmit={onSubscribe}
              className="mt-6 flex max-w-sm flex-col gap-2 sm:flex-row"
              style={{
                borderRadius: "5px",
              }}
            >
              <label htmlFor="footer-email" className="sr-only">
                Email
              </label>
              <Input
                id="footer-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="Nhập email của bạn"
                className="h-9 sm:flex-1"
              />
              <Button
                type="submit"
                size="sm"
                className="h-9 shrink-0 px-3"
                style={{
                  fontFamily: "Roboto",
                  fontSize: "14px",
                  borderRadius: "5px",
                  lineHeight: 1.3,
                  letterSpacing: "0.01em",
                }}
              >
                Đăng ký
                <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
              </Button>
            </form>
            <div
              className="mt-6 flex items-center gap-2"
              style={{
                fontFamily: "Roboto",
                fontSize: "16px",
                borderRadius: "5px",
                lineHeight: 1.3,
                letterSpacing: "0.01em",
              }}
            >
              {SOCIAL.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-muted hover:text-foreground"
                >
                  <FontAwesomeIcon icon={icon} className="size-3.5" />
                </a>
              ))}
            </div>
          </div>

          <nav className="lg:col-span-2 lg:col-start-7" aria-label="Khám phá">
            <h2
              className="text-[13px] font-semibold tracking-tight text-foreground"
              style={{
                fontFamily: "Roboto",
                fontSize: "16px",
                fontWeight: "600",
                fontStyle: "normal",
                lineHeight: 1.2,
                letterSpacing: "0.01em",
              }}
            >
              Khám phá
            </h2>
            <ul
              className="mt-4 flex flex-col gap-3"
              style={{
                fontFamily: "Roboto",
                fontSize: "14px",
                fontWeight: "400",
                fontStyle: "normal",
                lineHeight: 1.2,
                letterSpacing: "0.01em",
              }}
            >
              {EXPLORE.map((item) => (
                <FooterLink key={item.href} {...item} />
              ))}
            </ul>
          </nav>

          <nav className="lg:col-span-2" aria-label="Về chúng tôi">
            <h2
              className="text-[13px] font-semibold tracking-tight text-foreground"
              style={{
                fontFamily: "Roboto",
                fontSize: "16px",
                fontWeight: "600",
                fontStyle: "normal",
                lineHeight: 1.2,
                letterSpacing: "0.01em",
              }}
            >
              Về chúng tôi
            </h2>
            <ul
              className="mt-4 flex flex-col gap-3"
              style={{
                fontFamily: "Roboto",
                fontSize: "14px",
                fontWeight: "400",
                fontStyle: "normal",
                lineHeight: 1.2,
                letterSpacing: "0.01em",
              }}
            >
              {COMPANY.map((item) => (
                <FooterLink key={item.href} {...item} />
              ))}
            </ul>
          </nav>

          <nav className="lg:col-span-2" aria-label="Hỗ trợ">
            <h2
              className="text-[13px] font-semibold tracking-tight text-foreground"
              style={{
                fontFamily: "Roboto",
                fontSize: "16px",
                fontWeight: "600",
                fontStyle: "normal",
                lineHeight: 1.2,
                letterSpacing: "0.01em",
              }}
            >
              Hỗ trợ
            </h2>
            <ul
              className="mt-4 flex flex-col gap-3"
              style={{
                fontFamily: "Roboto",
                fontSize: "14px",
                fontWeight: "400",
                fontStyle: "normal",
                lineHeight: 1.2,
                letterSpacing: "0.01em",
              }}
            >
              {SUPPORT.map((item) => (
                <FooterLink key={item.href} {...item} />
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p
            className="text-xs text-muted-foreground"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "14px",
              fontWeight: "400",
              fontStyle: "normal",
              lineHeight: 1.3,
              letterSpacing: "0.01em",
            }}
          >
            © {year} LearnHub. Đã đăng ký bản quyền.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "14px",
                fontWeight: "400",
                fontStyle: "normal",
                lineHeight: 1.3,
                letterSpacing: "0.01em",
              }}
              href="/dieu-khoan"
              className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Điều khoản
            </a>
            <a
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "14px",
                fontWeight: "400",
                fontStyle: "normal",
                lineHeight: 1.3,
                letterSpacing: "0.01em",
              }}
              href="/bao-mat"
              className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Bảo mật
            </a>
            <a
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "14px",
                fontWeight: "400",
                fontStyle: "normal",
                lineHeight: 1.3,
                letterSpacing: "0.01em",
              }}
              href="/sitemap"
              className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Sơ đồ trang
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
