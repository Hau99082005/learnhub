import { useEffect, useState } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDuration, formatMoney } from "@/components/Course";
import { getAuthUser } from "@/lib/auth";
import {
  cartCount,
  getCart,
  loadCart,
  onCartChange,
  removeFromCart,
} from "@/lib/cart";
import { cn } from "@/lib/utils";

function loginHref() {
  return `/dang-nhap?next=${encodeURIComponent("/gio-hang")}`;
}

function registerHref() {
  return `/dang-ky?next=${encodeURIComponent("/gio-hang")}`;
}

const CartPage = () => {
  const [user] = useState(() => getAuthUser());
  const [cart, setCart] = useState(getCart);
  const [ready, setReady] = useState(!user);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    const stop = onCartChange(setCart);
    if (!user) {
      return stop;
    }
    loadCart()
      .then(setCart)
      .finally(() => setReady(true));
    return stop;
  }, [user]);

  const items = Array.isArray(cart.items) ? cart.items : [];
  const count = cartCount();

  const removeItem = async (item) => {
    setRemoving(item.courseId);
    try {
      const next = await removeFromCart(item.courseId);
      setCart(next);
      toast.success(`Đã xóa “${item.title}” khỏi giỏ hàng`);
    } catch (error) {
      toast.error(error.message || "Không thể xóa khóa học");
    } finally {
      setRemoving(null);
    }
  };

  if (!user) {
    return (
      <section className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-6 sm:py-14">
        <h1
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{
            fontFamily: "'Roboto', sans-serif",
            letterSpacing: "0.01em",
          }}
        >
          Giỏ hàng
        </h1>
        <div className="mt-6 border border-border px-4 py-10 text-center sm:px-8">
          <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 text-base font-medium">
            Vui lòng đăng nhập hoặc đăng ký để xem giỏ hàng
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bạn cần có tài khoản LearnHub trước khi thêm khóa học.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={loginHref()}
              className="inline-flex h-11 w-full items-center justify-center bg-violet-700 text-sm font-medium text-white transition hover:bg-violet-600 sm:w-40"
              style={{ borderRadius: "5px" }}
            >
              Đăng nhập
            </a>
            <a
              href={registerHref()}
              className="inline-flex h-11 w-full items-center justify-center border border-border text-sm font-medium transition hover:bg-muted sm:w-40"
              style={{ borderRadius: "5px" }}
            >
              Đăng ký
            </a>
          </div>
        </div>
      </section>
    );
  }

  if (!ready) {
    return (
      <section className="mx-auto w-full max-w-6xl px-3 py-10 sm:px-6">
        <div className="h-8 w-40 animate-pulse bg-muted" />
        <div className="mt-6 h-40 animate-pulse bg-muted" />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-6 sm:py-12">
      <h1
        className="text-2xl font-bold tracking-tight sm:text-3xl"
        style={{
          fontFamily: "'Roboto', sans-serif",
          letterSpacing: "0.01em",
          fontSize: "32px",
          fontStyle: "normal",
          lineHeight: 1.4,
        }}
      >
        Giỏ hàng
        {count > 0 ? (
          <span
            className="ml-2 text-lg font-medium text-muted-foreground sm:text-xl"
            style={{
              fontFamily: "'Roboto', sans-serif",
              letterSpacing: "0.01em",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: "400",
              lineHeight: 1.6,
            }}
          >
            ({count} khóa học)
          </span>
        ) : null}
      </h1>

      {items.length === 0 ? (
        <div className="mt-8 border border-border px-4 py-12 text-center sm:px-8">
          <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 text-base font-medium">
            Giỏ hàng của bạn đang trống
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Duyệt khóa học và thêm những nội dung bạn muốn học.
          </p>
          <a
            href="/khoa-hoc"
            className="mt-6 inline-flex h-11 items-center justify-center bg-violet-700 px-6 text-sm font-medium text-white transition hover:bg-violet-600"
            style={{ borderRadius: "5px" }}
          >
            Khám phá khóa học
          </a>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <ul className="divide-y divide-border border border-border">
            {items.map((item) => {
              const href = `/khoa-hoc/${item.slug}`;
              const busy = removing === item.courseId;
              return (
                <li
                  key={item.id || item.courseId}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start"
                >
                  <a
                    href={href}
                    className="block aspect-video w-full shrink-0 overflow-hidden bg-muted sm:aspect-[16/9] sm:w-44"
                  >
                    {item.images ? (
                      <img
                        src={item.images}
                        alt={item.title}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-muted-foreground">
                        <ShoppingBag className="size-8" />
                      </span>
                    )}
                  </a>
                  <div className="min-w-0 flex-1">
                    <a
                      href={href}
                      className="block text-base font-semibold leading-snug hover:text-violet-700"
                      style={{
                        fontFamily: "'Roboto', sans-serif",
                        letterSpacing: "0.01em",
                        fontSize: "18px",
                        fontStyle: "normal",
                        fontWeight: "500",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.title}
                    </a>
                    <p
                      className="mt-1 text-sm text-muted-foreground"
                      style={{
                        fontFamily: "'Roboto', sans-serif",
                        letterSpacing: "0.01em",
                        fontSize: "16px",
                        fontStyle: "normal",
                        fontWeight: "400",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.instructorName || "Giảng viên LearnHub"}
                      {formatDuration(item.durationSeconds)
                        ? ` · ${formatDuration(item.durationSeconds)}`
                        : ""}
                    </p>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => removeItem(item)}
                      style={{
                        fontFamily: "'Roboto', sans-serif",
                        letterSpacing: "0.01em",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: "400",
                        lineHeight: 1.6,
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-destructive disabled:opacity-60"
                    >
                      <Trash2 className="size-4" />
                      {busy ? "Đang xóa..." : "Xóa"}
                    </button>
                  </div>
                  <p
                    className={cn(
                      "shrink-0 text-base font-semibold text-violet-700 sm:text-right",
                    )}
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      letterSpacing: "0.01em",
                      fontSize: "20px",
                      fontStyle: "normal",
                      fontWeight: "700",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.isFree || Number(item.unitPrice) <= 0
                      ? "Miễn phí"
                      : formatMoney(item.unitPrice, item.currency)}
                  </p>
                </li>
              );
            })}
          </ul>

          <aside className="border border-border p-4 sm:p-5 lg:sticky lg:top-24">
            <p
              className="text-sm text-muted-foreground"
              style={{
                fontFamily: "'Roboto', sans-serif",
                letterSpacing: "0.01em",
                fontSize: "16px",
                fontStyle: "normal",
                fontWeight: "400",
                lineHeight: 1.6,
              }}
            >
              Tổng cộng:
            </p>
            <p
              className="mt-1 text-2xl font-bold hover:text-violet-700"
              style={{
                fontFamily: "'Roboto', sans-serif",
                letterSpacing: "0.01em",
                fontSize: "28px",
                fontStyle: "normal",
                fontWeight: "700",
                lineHeight: 1.6,
              }}
            >
              {formatMoney(cart.subtotal, cart.currency)}
            </p>
            <a
              href="/thanh-toan"
              className="mt-4 inline-flex h-11 w-full items-center justify-center bg-violet-700 text-sm font-medium text-white transition hover:bg-violet-600"
              style={{
                fontFamily: "'Roboto', sans-serif",
                letterSpacing: "0.01em",
                fontSize: "18px",
                fontStyle: "normal",
                fontWeight: "500",
                lineHeight: 1.6,
                border: "none",
                borderRadius: "5px",
              }}
            >
              Thanh toán
            </a>
            <p
              className="mt-3 text-center text-xs text-muted-foreground"
              style={{
                fontFamily: "'Roboto', sans-serif",
                letterSpacing: "0.01em",
                fontSize: "14px",
                fontStyle: "italic",
                fontWeight: "400",
                lineHeight: 1.6,
              }}
            >
              Đảm bảo hoàn tiền trong 30 ngày
            </p>
          </aside>
        </div>
      )}
    </section>
  );
};

export default CartPage;
