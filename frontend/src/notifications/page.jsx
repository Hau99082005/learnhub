import { useEffect, useState } from "react";
import {
  Award,
  Bell,
  CheckCheck,
  ClipboardList,
  Copy,
  Gift,
  Receipt,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { getAuthUser } from "@/lib/auth";
import {
  getInboxItems,
  loadInbox,
  markAllInboxRead,
  markInboxRead,
  onInboxChange,
} from "@/lib/inbox";
import { cn } from "@/lib/utils";

const TITLE = {
  fontFamily: "'Roboto', sans-serif",
  letterSpacing: "0.01em",
  lineHeight: 1.4,
};

function loginHref() {
  return `/dang-nhap?next=${encodeURIComponent("/thong-bao")}`;
}

function registerHref() {
  return `/dang-ky?next=${encodeURIComponent("/thong-bao")}`;
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
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function iconOf(type) {
  if (type === "PAYMENT") {
    return Receipt;
  }
  if (type === "COUPON") {
    return Gift;
  }
  if (type === "CERTIFICATE" || type === "CERTIFICATE_GRADE") {
    return Award;
  }
  if (type === "PRACTICE") {
    return ClipboardList;
  }
  return Bell;
}

const NotificationsPage = () => {
  const [user] = useState(() => getAuthUser());
  const [items, setItems] = useState(() => getInboxItems());
  const [loading, setLoading] = useState(() => Boolean(getAuthUser()));

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return undefined;
    }
    loadInbox()
      .then(setItems)
      .finally(() => setLoading(false));
    return onInboxChange((state) => setItems(state.items || []));
  }, [user]);

  const unread = items.filter((item) => !item.isRead).length;

  if (!user) {
    return (
      <section className="mx-auto w-full max-w-4xl px-3 py-10 sm:px-6 sm:py-14">
        <h1
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ ...TITLE, fontSize: "32px", fontWeight: 600 }}
        >
          Thông báo
        </h1>
        <div className="mt-8 rounded-2xl border border-dashed border-border px-4 py-12 text-center">
          <Bell className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-medium">Đăng nhập để xem thông báo</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href={loginHref()}
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-violet-700 text-white hover:bg-violet-800",
              )}
            >
              Đăng nhập
            </a>
            <a href={registerHref()} className={buttonVariants({ variant: "outline" })}>
              Đăng ký
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-3 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className="text-sm font-medium tracking-wide text-violet-700 uppercase dark:text-violet-300"
            style={{ ...TITLE, fontSize: "14px", fontWeight: 500 }}
          >
            Hộp thư
          </p>
          <h1
            className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ ...TITLE, fontSize: "32px", fontWeight: 600 }}
          >
            Thông báo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? "Đang tải thông báo..."
              : unread
                ? `${unread} thông báo chưa đọc`
                : `${items.length} thông báo`}
          </p>
        </div>
        {unread > 0 ? (
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 gap-1.5",
            )}
            onClick={async () => {
              await markAllInboxRead();
              toast.success("Đã đánh dấu tất cả là đã đọc");
            }}
          >
            <CheckCheck className="size-4" />
            Đánh dấu đã đọc
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border px-4 py-12 text-center">
          <Sparkles className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-medium">Chưa có thông báo</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bạn sẽ nhận thông báo khi thanh toán thành công hoặc có mã giảm giá mới.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => {
            const Icon = iconOf(item.type);
            return (
              <li key={item.id}>
                <article
                  className={cn(
                    "rounded-2xl border px-4 py-4 transition sm:px-5",
                    item.isRead
                      ? "border-border/80 bg-card"
                      : "border-violet-300/60 bg-violet-700/5 dark:border-violet-500/40",
                  )}
                >
                  <div className="flex gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full",
                        item.type === "PAYMENT"
                          ? "bg-emerald-500/15 text-emerald-500"
                          : item.type === "CERTIFICATE" || item.type === "CERTIFICATE_GRADE"
                            ? "bg-amber-400/20 text-amber-600"
                            : "bg-violet-700/15 text-violet-600 dark:text-violet-300",
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2
                          className="text-[15px] font-semibold"
                          style={{ ...TITLE, fontWeight: 600 }}
                        >
                          {item.title}
                        </h2>
                        <span className="text-xs text-muted-foreground">
                          {formatWhen(item.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {item.couponCode ? (
                          <button
                            type="button"
                            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(item.couponCode);
                                toast.success(`Đã sao chép mã ${item.couponCode}`);
                              } catch {
                                toast.error("Không sao chép được mã");
                              }
                            }}
                          >
                            <Copy className="size-3.5" />
                            {item.couponCode}
                          </button>
                        ) : null}
                        <a
                          href={item.href || "/thong-bao"}
                          className="inline-flex h-8 items-center rounded-full bg-violet-700 px-3 text-xs font-medium text-white hover:bg-violet-600"
                          onClick={() => {
                            if (!item.isRead) {
                              void markInboxRead(item.id);
                            }
                          }}
                        >
                          {item.type === "COUPON"
                            ? "Áp dụng mã"
                            : item.type === "PAYMENT"
                              ? "Vào học tập"
                              : item.type === "CERTIFICATE" || item.type === "CERTIFICATE_GRADE"
                                ? "Xem chứng chỉ"
                                : item.type === "PRACTICE"
                                  ? "Xem lịch sử bài tập"
                              : "Xem chi tiết"}
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default NotificationsPage;
