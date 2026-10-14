import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  Check,
  Clock3,
  CreditCard,
  Lock,
  Receipt,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { authGet, getAuthUser } from "@/lib/auth";
import { listPurchases } from "@/lib/checkout";
import { cn } from "@/lib/utils";
import bankLogo from "@/assets/images/png-clipart-bank-transfer-logo-wire-transfer-electronic-funds-transfer-bank-payment-computer-icons-bank-text-rectangle.png";

const TITLE = {
  fontFamily: "'Roboto', sans-serif",
  letterSpacing: "0.01em",
  lineHeight: 1.4,
};

const METHOD_KEY = "learnhub_pay_method";

const METHODS = [
  {
    id: "BANK_TRANSFER",
    name: "Chuyển khoản ngân hàng",
    hint: "VietQR hoặc chuyển khoản nội địa. Khóa học mở ngay sau khi giao dịch thành công.",
    available: true,
    logo: bankLogo,
  },
  {
    id: "CARD",
    name: "Thẻ tín dụng / ghi nợ",
    hint: "Visa, Mastercard sẽ được bổ sung trong thời gian tới.",
    available: false,
    icon: CreditCard,
  },
  {
    id: "WALLET",
    name: "Ví điện tử",
    hint: "Thanh toán ví đang được chuẩn bị, chưa áp dụng trên đơn hàng.",
    available: false,
    icon: Smartphone,
  },
];

function loginHref() {
  return `/dang-nhap?next=${encodeURIComponent("/phuong-thuc-thanh-toan")}`;
}

function registerHref() {
  return `/dang-ky?next=${encodeURIComponent("/phuong-thuc-thanh-toan")}`;
}

function storageKey(user) {
  return `${METHOD_KEY}:${user?.id || "guest"}`;
}

function readPreferred(user) {
  try {
    const value = localStorage.getItem(storageKey(user));
    return METHODS.some((item) => item.id === value && item.available)
      ? value
      : "BANK_TRANSFER";
  } catch {
    return "BANK_TRANSFER";
  }
}

function providerLabel(provider) {
  const value = String(provider || "").toUpperCase();
  if (value === "BANK_TRANSFER") {
    return "Chuyển khoản ngân hàng";
  }
  return "Thanh toán khóa học";
}

function formatWhen(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const PaymentMethodsPage = () => {
  const [user] = useState(() => getAuthUser());
  const [preferred, setPreferred] = useState(() => readPreferred(getAuthUser()));
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(getAuthUser()));

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    Promise.all([
      authGet("/api/auth/profile").catch(() => null),
      listPurchases().catch(() => []),
    ]).then(([nextProfile, rows]) => {
      if (cancelled) {
        return;
      }
      setProfile(nextProfile);
      setOrders(Array.isArray(rows) ? rows : []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const lastPaid = useMemo(
    () => orders.find((row) => String(row.status || "").toUpperCase() === "PAID") || null,
    [orders],
  );

  const choose = (id) => {
    const method = METHODS.find((item) => item.id === id);
    if (!method?.available) {
      toast.message("Phương thức này chưa khả dụng");
      return;
    }
    setPreferred(id);
    localStorage.setItem(storageKey(user), id);
    toast.success("Đã đặt làm phương thức mặc định");
  };

  if (!user) {
    return (
      <section className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-6 sm:py-14">
        <h1
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ ...TITLE, fontSize: "24px", fontWeight: 700 }}
        >
          Phương thức thanh toán
        </h1>
        <div className="mt-8 rounded-2xl border border-border px-4 py-12 text-center sm:px-8">
          <Wallet className="mx-auto size-10 text-violet-700" />
          <p className="mt-4 text-base font-medium">Đăng nhập để quản lý thanh toán</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Phương thức mặc định và thông tin thanh toán được lưu theo tài khoản của bạn.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={loginHref()}
              className={cn(buttonVariants({ variant: "outline" }), "h-10 w-full sm:w-40")}
            >
              Đăng nhập
            </a>
            <a
              href={registerHref()}
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-10 w-full bg-violet-700 text-white hover:bg-violet-800 sm:w-40",
              )}
            >
              Đăng ký
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="w-full">
      <section className="bg-zinc-950 text-white">
        <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-10">
          <p className="text-sm text-white/60">Tài khoản</p>
          <h1
            className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ ...TITLE, fontSize: "32px", fontWeight: 700 }}
          >
            Phương thức thanh toán
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
            Chọn cách thanh toán mặc định khi mua khóa học. LearnHub xác nhận giao dịch và mở quyền học ngay sau khi nhận tiền.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="h-64 animate-pulse rounded-2xl bg-muted" />
            <div className="h-64 animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
            <div className="space-y-4">
              <h2
                className="text-lg font-semibold"
                style={{ ...TITLE, fontSize: "20px", fontWeight: 600 }}
              >
                Phương thức khả dụng
              </h2>
              <ul className="space-y-3">
                {METHODS.map((method) => {
                  const active = preferred === method.id;
                  const Icon = method.icon;
                  return (
                    <li key={method.id}>
                      <button
                        type="button"
                        onClick={() => choose(method.id)}
                        className={cn(
                          "flex w-full items-start gap-3 border px-4 py-4 text-left transition sm:items-center sm:px-5",
                          method.available
                            ? active
                              ? "border-violet-700 bg-violet-700/10"
                              : "border-border hover:border-foreground/40"
                            : "cursor-not-allowed border-border/70 opacity-70",
                        )}
                        style={{ borderRadius: "12px" }}
                      >
                        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                          {method.logo ? (
                            <img src={method.logo} alt="" className="size-full object-contain p-1.5" />
                          ) : (
                            <Icon className="size-6 text-violet-700" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span
                              className="text-sm font-semibold sm:text-base"
                              style={{ ...TITLE, fontWeight: 600 }}
                            >
                              {method.name}
                            </span>
                            {method.available ? (
                              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                                Đang dùng
                              </span>
                            ) : (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                Sắp ra mắt
                              </span>
                            )}
                            {active && method.available ? (
                              <span className="rounded-full bg-violet-700 px-2 py-0.5 text-[11px] font-medium text-white">
                                Mặc định
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-1 block text-sm text-muted-foreground">
                            {method.hint}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border sm:mt-0",
                            active && method.available
                              ? "border-violet-700 bg-violet-700 text-white"
                              : "border-muted-foreground/40",
                          )}
                        >
                          {active && method.available ? <Check className="size-3" /> : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="rounded-2xl border border-border px-4 py-5 sm:px-5">
                <h3
                  className="text-base font-semibold"
                  style={{ ...TITLE, fontSize: "18px", fontWeight: 600 }}
                >
                  Cách thanh toán khi mua khóa
                </h3>
                <ol className="mt-4 space-y-3">
                  {[
                    {
                      icon: Wallet,
                      title: "Chọn khóa và vào thanh toán",
                      text: "Hệ thống dùng phương thức mặc định là chuyển khoản ngân hàng.",
                    },
                    {
                      icon: Building2,
                      title: "Quét VietQR hoặc chuyển khoản",
                      text: "Nội dung chuyển khoản gắn với mã đơn. Không cần tải biên lai.",
                    },
                    {
                      icon: BadgeCheck,
                      title: "Mở khóa học tự động",
                      text: "Khi nhận được tiền, đơn được xác nhận và khóa học vào mục Học tập.",
                    },
                  ].map((step, index) => (
                    <li key={step.title} className="flex gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-700/15 text-violet-700">
                        <step.icon className="size-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-medium">
                          {index + 1}. {step.title}
                        </span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">
                          {step.text}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border px-4 py-5 sm:px-5">
                <p className="text-sm font-medium text-muted-foreground">Thông tin thanh toán</p>
                <dl className="mt-3 space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Họ tên trên đơn</dt>
                    <dd className="mt-0.5 font-medium">
                      {profile?.fullName || user.fullName || "Học viên LearnHub"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Email nhận hóa đơn</dt>
                    <dd className="mt-0.5 font-medium break-all">
                      {profile?.email || user.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Số điện thoại</dt>
                    <dd className="mt-0.5 font-medium">
                      {profile?.phone && profile.phone !== "Chưa cập nhật"
                        ? profile.phone
                        : "Chưa cập nhật"}
                    </dd>
                  </div>
                </dl>
                <a
                  href="/cai-dat-tai-khoan"
                  className="mt-4 inline-flex text-sm font-medium text-violet-700 hover:underline dark:text-violet-300"
                >
                  Cập nhật hồ sơ
                </a>
              </div>

              <div className="rounded-2xl border border-border px-4 py-5 sm:px-5">
                <p className="text-sm font-medium text-muted-foreground">Giao dịch gần nhất</p>
                {lastPaid ? (
                  <div className="mt-3">
                    <p className="font-medium" style={{ ...TITLE, fontWeight: 600 }}>
                      {providerLabel(lastPaid.provider)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Đơn {lastPaid.orderCode}
                      {formatWhen(lastPaid.paidAt) ? ` · ${formatWhen(lastPaid.paidAt)}` : ""}
                    </p>
                    <a
                      href="/lich-su-mua"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 hover:underline dark:text-violet-300"
                    >
                      <Receipt className="size-4" />
                      Xem lịch sử mua
                    </a>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Bạn chưa có đơn đã thanh toán. Khi mua khóa, phương thức mặc định sẽ được dùng.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-border px-4 py-5 sm:px-5">
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2.5">
                    <Lock className="mt-0.5 size-4 shrink-0 text-violet-700" />
                    <span>Thanh toán mã hóa, thông tin đơn chỉ gắn với tài khoản của bạn.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-violet-700" />
                    <span>Đảm bảo hoàn tiền trong 30 ngày nếu khóa học không phù hợp.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Clock3 className="mt-0.5 size-4 shrink-0 text-violet-700" />
                    <span>Khóa học được mở tự động, không cần gửi ảnh chuyển khoản.</span>
                  </li>
                </ul>
                <a
                  href="/gio-hang"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "mt-5 h-10 w-full bg-violet-700 text-white hover:bg-violet-800",
                  )}
                >
                  Đến giỏ hàng
                </a>
              </div>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
};

export default PaymentMethodsPage;
