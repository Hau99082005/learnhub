import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CreditCard,
  Play,
  Receipt,
  Search,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { formatMoney } from "@/components/Course";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthUser } from "@/lib/auth";
import { listPurchases } from "@/lib/checkout";
import { cn } from "@/lib/utils";

const TITLE = {
  fontFamily: "'Roboto', sans-serif",
  letterSpacing: "0.01em",
  lineHeight: 1.4,
};

function loginHref() {
  return `/dang-nhap?next=${encodeURIComponent("/lich-su-mua")}`;
}

function registerHref() {
  return `/dang-ky?next=${encodeURIComponent("/lich-su-mua")}`;
}

function providerLabel(provider) {
  const value = String(provider || "").toUpperCase();
  if (value === "BANK_TRANSFER") {
    return "Chuyển khoản";
  }
  if (value === "VNPAY") {
    return "VNPay";
  }
  if (value === "MOMO") {
    return "MoMo";
  }
  return provider || "Thanh toán";
}

function formatOrderDate(value) {
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

function OrderCard({ order }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const when = formatOrderDate(order.paidAt || order.createdAt);

  return (
    <article className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_12px_32px_-24px_oklch(0_0_0/0.45)] transition duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_22px_40px_-22px_oklch(0.488_0.243_264/0.45)] dark:hover:border-violet-500/40">
      <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p
            className="text-sm font-semibold tracking-tight"
            style={{ ...TITLE, fontSize: "16px", fontWeight: 600 }}
          >
            Đơn {order.orderCode}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
            {when ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {when}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <CreditCard className="size-3.5" />
              {providerLabel(order.provider)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Wallet className="size-3.5" />
              Đã thanh toán
            </span>
          </div>
        </div>
        <p
          className="shrink-0 text-base font-semibold text-violet-700"
          style={{ ...TITLE, fontSize: "18px", fontWeight: 700 }}
        >
          {formatMoney(order.totalAmount, order.currency)}
        </p>
      </div>
      <ul className="divide-y divide-border/70">
        {items.map((item) => {
          const href = item.slug ? `/hoc/${item.slug}` : "/hoc-tap";
          return (
            <li key={`${order.orderId}-${item.courseId}`} className="px-4 py-3.5 sm:px-5">
              <div className="flex gap-3 sm:gap-4">
                <a
                  href={href}
                  className="relative block size-16 shrink-0 overflow-hidden bg-muted sm:size-20"
                  style={{ borderRadius: "5px" }}
                >
                  {item.images ? (
                    <img
                      src={item.images}
                      alt={item.title}
                      className="size-full object-cover transition duration-500 hover:scale-105"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-900 text-white/80">
                      <Play className="size-5 fill-current" />
                    </span>
                  )}
                </a>
                <div className="min-w-0 flex-1">
                  <a href={href} className="block">
                    <h3
                      className="line-clamp-2 text-[15px] font-semibold tracking-tight transition-colors hover:text-violet-700"
                      style={{ ...TITLE, fontSize: "15px", fontWeight: 600 }}
                    >
                      {item.title}
                    </h3>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {item.instructorName}
                    </p>
                  </a>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {formatMoney(item.unitPrice, order.currency)}
                    </span>
                    <a
                      href={href}
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "h-8 bg-violet-700 px-3 text-xs text-white hover:bg-violet-800 sm:h-9 sm:text-sm",
                      )}
                    >
                      Vào học
                    </a>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

const PurchaseHistoryPage = () => {
  const [user] = useState(() => getAuthUser());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(getAuthUser()));
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    listPurchases()
      .then((data) => {
        if (cancelled) {
          return;
        }
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }
        setError(err.message || "Không tải được lịch sử mua");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return orders;
    }
    return orders.filter((order) => {
      const code = String(order.orderCode || "").toLowerCase();
      const items = Array.isArray(order.items) ? order.items : [];
      return (
        code.includes(term) ||
        items.some((item) => String(item.title || "").toLowerCase().includes(term))
      );
    });
  }, [orders, query]);

  if (!user) {
    return (
      <section className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-6 sm:py-14">
        <h1
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ ...TITLE, fontSize: "24px", fontWeight: 700 }}
        >
          Lịch sử mua
        </h1>
        <div className="mt-8 rounded-2xl border border-border px-4 py-12 text-center sm:px-8">
          <Receipt className="mx-auto size-10 text-violet-700" />
          <p className="mt-4 text-base font-medium">
            Đăng nhập để xem đơn hàng đã mua
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Lịch sử thanh toán được lưu theo tài khoản LearnHub của bạn.
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
            Lịch sử mua
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
            Các đơn hàng đã thanh toán thành công trên LearnHub.
          </p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm mã đơn hoặc tên khóa học"
            className="h-11 pl-10"
            style={{ ...TITLE, fontSize: "14px" }}
          />
        </div>
        {loading ? (
          <div className="mt-6 space-y-4">
            <div className="h-36 animate-pulse rounded-2xl bg-muted" />
            <div className="h-36 animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-border px-4 py-10 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-border px-4 py-12 text-center sm:px-8">
            <ShoppingBag className="mx-auto size-10 text-violet-700" />
            <p className="mt-4 text-base font-medium">
              {orders.length === 0
                ? "Bạn chưa có đơn hàng đã thanh toán"
                : "Không tìm thấy đơn hàng phù hợp"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {orders.length === 0
                ? "Khi bạn mua khóa học, đơn hàng sẽ xuất hiện tại đây."
                : "Thử tìm bằng mã đơn hoặc tên khóa học khác."}
            </p>
            {orders.length === 0 ? (
              <a
                href="/khoa-hoc"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "mt-6 inline-flex h-10 bg-violet-700 text-white hover:bg-violet-800",
                )}
              >
                Khám phá khóa học
              </a>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filtered.map((order) => (
              <OrderCard key={order.orderId || order.orderCode} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PurchaseHistoryPage;
