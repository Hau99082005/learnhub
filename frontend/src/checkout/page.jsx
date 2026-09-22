import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatMoney } from "@/components/Course";
import { getAuthUser } from "@/lib/auth";
import { confirmCheckout, createCheckout, getCheckout } from "@/lib/checkout";
import { addOwnedMany } from "@/lib/courseAccess";
import { getCart, loadCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import vnpayLogo from "@/assets/images/Icon-VNPAY-QR.webp";
import momoLogo from "@/assets/images/MoMo_Logo_App.svg.webp";
import bankLogo from "@/assets/images/png-clipart-bank-transfer-logo-wire-transfer-electronic-funds-transfer-bank-payment-computer-icons-bank-text-rectangle.png";

const METHODS = [
  {
    id: "VNPAY",
    name: "VNPay",
    hint: "ATM, QR, thẻ nội địa và quốc tế",
    logo: vnpayLogo,
  },
  {
    id: "MOMO",
    name: "MoMo",
    hint: "Thanh toán nhanh bằng ví MoMo",
    logo: momoLogo,
  },
  {
    id: "BANK_TRANSFER",
    name: "Chuyển khoản ngân hàng",
    hint: "Chuyển khoản đúng nội dung đơn hàng",
    logo: bankLogo,
  },
];

function orderCodeFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[0] === "thanh-toan" && parts[1]
    ? decodeURIComponent(parts[1])
    : "";
}

function loginHref() {
  const next = window.location.pathname + window.location.search;
  return `/dang-nhap?next=${encodeURIComponent(next || "/thanh-toan")}`;
}

function registerHref() {
  const next = window.location.pathname + window.location.search;
  return `/dang-ky?next=${encodeURIComponent(next || "/thanh-toan")}`;
}

async function copyValue(value) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success("Đã sao chép");
  } catch {
    toast.error("Không thể sao chép");
  }
}

const fieldStyle = {
  fontFamily: "'Roboto', sans-serif",
  letterSpacing: "0.01em",
};

function AuthGate() {
  return (
    <section className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-6 sm:py-14">
      <h1
        className="text-2xl font-bold tracking-tight sm:text-3xl"
        style={{
          ...fieldStyle,
          fontSize: "40px",
          lineHeight: 1.4,
          fontWeight: "700",
          letterSpacing: "0.01em",
        }}
      >
        Thanh toán
      </h1>
      <div className="mt-6 border border-border px-4 py-10 text-center sm:px-8">
        <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-4 text-base font-medium">
          Vui lòng đăng nhập hoặc đăng ký để thanh toán
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

function Summary({ items, total, currency }) {
  return (
    <aside className="border border-border p-4 sm:p-5 lg:sticky lg:top-24">
      <p
        className="text-sm font-medium"
        style={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: "18px",
          fontStyle: "normal",
          fontWeight: "700",
          lineHeight: 1.4,
          letterSpacing: "0.01em",
        }}
      >
        Đơn hàng
      </p>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.courseId || item.slug} className="flex gap-3">
            <div className="size-14 shrink-0 overflow-hidden bg-muted sm:size-16">
              {item.images ? (
                <img
                  src={item.images}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center text-muted-foreground">
                  <ShoppingBag className="size-5" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="line-clamp-2 text-sm font-medium leading-snug"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "13px",
                  fontWeight: "500",
                  fontStyle: "normal",
                  lineHeight: 1.5,
                  letterSpacing: "0.01em",
                }}
              >
                {item.title}
              </p>
              <p
                className="mt-1 text-sm font-semibold text-violet-400 hover:text-violet-800"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "13px",
                  fontWeight: "700",
                  fontStyle: "normal",
                  lineHeight: 1.5,
                  letterSpacing: "0.01em",
                }}
              >
                {Number(item.unitPrice) <= 0
                  ? "Miễn phí"
                  : formatMoney(item.unitPrice, currency)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-border pt-4">
        <p
          className="text-sm text-muted-foreground"
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: "16px",
            fontWeight: "400",
            fontStyle: "normal",
            lineHeight: 1.4,
            letterSpacing: "0.01em",
          }}
        >
          Tổng cộng
        </p>
        <p
          className="mt-1 text-2xl font-bold hover:text-violet-700"
          style={{
            ...fieldStyle,
            fontSize: "32px",
            fontWeight: 700,
            lineHeight: 1.4,
          }}
        >
          {formatMoney(total, currency)}
        </p>
      </div>
    </aside>
  );
}

function MethodPicker({ selected, onSelect }) {
  return (
    <div className="space-y-3">
      {METHODS.map((method) => {
        const active = selected === method.id;
        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={cn(
              "flex w-full items-center gap-3 border px-4 py-3 text-left transition",
              active
                ? "border-violet-700 bg-violet-700/10"
                : "border-border hover:border-foreground/40",
            )}
            style={{ borderRadius: "5px" }}
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden sm:h-11 sm:w-11",
                method.id === "MOMO" ? "bg-transparent" : "bg-white",
              )}
              style={{ borderRadius: method.id === "MOMO" ? "10px" : "5px" }}
            >
              <img
                src={method.logo}
                alt=""
                className="size-full object-contain"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{method.name}</span>
              <span className="block text-xs text-muted-foreground sm:text-sm">
                {method.hint}
              </span>
            </span>
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border",
                active
                  ? "border-violet-700 bg-violet-700 text-white"
                  : "border-muted-foreground/40",
              )}
            >
              {active ? <Check className="size-3" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PayGuide({ order }) {
  if (order.status === "PAID") {
    return (
      <div className="border border-emerald-600/40 bg-emerald-600/10 px-4 py-5">
        <p className="text-base font-semibold text-emerald-500">
          Thanh toán thành công
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Bạn đã sở hữu khóa học trong đơn {order.orderCode}.
        </p>
        <a
          href="/khoa-hoc"
          className="mt-4 inline-flex h-11 items-center justify-center bg-violet-700 px-5 text-sm font-medium text-white transition hover:bg-violet-600"
          style={{ borderRadius: "5px" }}
        >
          Vào học ngay
        </a>
      </div>
    );
  }
  if (order.provider === "BANK_TRANSFER" && order.bankTransfer) {
    const rows = [
      ["Ngân hàng", order.bankTransfer.bankName],
      ["Chủ tài khoản", order.bankTransfer.accountName],
      ["Số tài khoản", order.bankTransfer.accountNumber],
      ["Nội dung CK", order.bankTransfer.transferContent],
      ["Số tiền", formatMoney(order.totalAmount, order.currency)],
    ];
    return (
      <div className="space-y-3 border border-border p-4 sm:p-5">
        <p className="font-semibold">Chuyển khoản ngân hàng</p>
        <p className="text-sm text-muted-foreground">
          Vui lòng chuyển đúng số tiền và nội dung để hệ thống ghi nhận đơn
          hàng.
        </p>
        <dl className="space-y-2">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 border border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderRadius: "5px" }}
            >
              <dt className="text-xs text-muted-foreground sm:text-sm">
                {label}
              </dt>
              <dd className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="text-sm font-semibold">{value}</span>
                <button
                  type="button"
                  className="text-xs font-medium text-violet-700 hover:underline"
                  onClick={() => copyValue(String(value))}
                >
                  Sao chép
                </button>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }
  const momo = order.provider === "MOMO";
  return (
    <div className="space-y-3 border border-border p-4 sm:p-5">
      <p className="font-semibold">
        {momo ? "Thanh toán MoMo" : "Thanh toán VNPay"}
      </p>
      <p className="text-sm text-muted-foreground">
        {momo
          ? "Mở ứng dụng MoMo, chọn thanh toán và nhập mã đơn hàng bên dưới."
          : "Mở ứng dụng ngân hàng hoặc VNPay, chọn thanh toán QR / nhập mã đơn hàng."}
      </p>
      <div
        className={cn(
          "flex aspect-square w-full max-w-[16rem] flex-col items-center justify-center gap-2 text-white",
          momo ? "bg-[#D82D8B]" : "bg-[#0055AA]",
        )}
        style={{ borderRadius: "5px" }}
      >
        <span className="text-xs uppercase tracking-wide opacity-80">
          Mã đơn
        </span>
        <span className="px-3 text-center text-lg font-bold">
          {order.orderCode}
        </span>
        <span className="text-sm font-semibold">
          {formatMoney(order.totalAmount, order.currency)}
        </span>
      </div>
    </div>
  );
}

function CheckoutStart() {
  const [cart, setCart] = useState(getCart);
  const [ready, setReady] = useState(false);
  const [provider, setProvider] = useState("VNPAY");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCart()
      .then(setCart)
      .finally(() => setReady(true));
  }, []);

  const items = Array.isArray(cart.items) ? cart.items : [];

  const submit = async () => {
    setSubmitting(true);
    try {
      const order = await createCheckout(provider);
      await loadCart();
      window.location.href = `/thanh-toan/${encodeURIComponent(order.orderCode)}`;
    } catch (error) {
      toast.error(error.message || "Không thể tạo đơn thanh toán");
      setSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <section className="mx-auto w-full max-w-6xl px-3 py-10 sm:px-6">
        <div className="h-8 w-48 animate-pulse bg-muted" />
        <div className="mt-6 h-40 animate-pulse bg-muted" />
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-6 sm:py-14">
        <h1
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={fieldStyle}
        >
          Thanh toán
        </h1>
        <div className="mt-6 border border-border px-4 py-12 text-center">
          <p className="font-medium">
            Giỏ hàng trống, chưa có gì để thanh toán
          </p>
          <a
            href="/gio-hang"
            className="mt-6 inline-flex h-11 items-center justify-center bg-violet-700 px-6 text-sm font-medium text-white"
            style={{ borderRadius: "5px" }}
          >
            Về giỏ hàng
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-6 sm:py-12">
      <h1
        className="text-2xl font-bold tracking-tight sm:text-3xl"
        style={{
          ...fieldStyle,
          fontSize: "36px",
          lineHeight: 1.4,
          fontStyle: "normal",
          fontWeight: "700",
          letterSpacing: "0.01em",
        }}
      >
        Thanh toán
      </h1>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="border border-border p-4 sm:p-5">
          <h2
            className="text-base font-semibold sm:text-lg"
            style={{
              ...fieldStyle,
              fontSize: "24px",
              lineHeight: 1.4,
              fontStyle: "normal",
              fontWeight: "700",
              letterSpacing: "0.01em",
            }}
          >
            Chọn phương thức thanh toán
          </h2>
          <p
            className="mt-1 text-sm text-muted-foreground"
            style={{
              ...fieldStyle,
              fontSize: "16px",
              lineHeight: 1.4,
              fontStyle: "italic",
              fontWeight: "400",
              letterSpacing: "0.01em",
            }}
          >
            VNPay, MoMo hoặc chuyển khoản ngân hàng.
          </p>
          <div className="mt-4">
            <MethodPicker selected={provider} onSelect={setProvider} />
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="mt-5 inline-flex h-11 w-full items-center justify-center bg-violet-700 text-sm font-medium text-white transition hover:bg-violet-600 disabled:opacity-70 sm:w-auto sm:px-8"
            style={{
              border: "none",
              borderRadius: "5px",
              fontSize: "18px",
              fontWeight: "500",
              fontStyle: "normal",
              lineHeight: 1.4,
              letterSpacing: "0.01em",
            }}
          >
            {submitting ? "Đang tạo đơn..." : "Tiếp tục thanh toán"}
          </button>
          <p
            className="mt-3 text-center text-xs text-muted-foreground italic sm:text-left"
            style={{
              ...fieldStyle,
              fontSize: "14px",
              lineHeight: 1.4,
              fontStyle: "italic",
              fontWeight: "400",
              letterSpacing: "0.01em",
            }}
          >
            Đảm bảo hoàn tiền trong 30 ngày
          </p>
        </div>
        <Summary items={items} total={cart.subtotal} currency={cart.currency} />
      </div>
    </section>
  );
}

function CheckoutOrder({ orderCode }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    getCheckout(orderCode)
      .then(setOrder)
      .catch((err) => setError(err.message || "Không tìm thấy đơn hàng"));
  }, [orderCode]);

  const confirm = async () => {
    setConfirming(true);
    try {
      const next = await confirmCheckout(orderCode);
      addOwnedMany((next.items || []).map((item) => item.courseId));
      await loadCart();
      setOrder(next);
      toast.success("Thanh toán thành công");
    } catch (err) {
      toast.error(err.message || "Không thể xác nhận thanh toán");
    } finally {
      setConfirming(false);
    }
  };

  if (error) {
    return (
      <section className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-6">
        <h1 className="text-2xl font-bold">Thanh toán</h1>
        <p className="mt-4 text-sm text-destructive">{error}</p>
        <a
          href="/gio-hang"
          className="mt-4 inline-block text-sm text-violet-700 hover:underline"
        >
          Quay lại giỏ hàng
        </a>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="mx-auto w-full max-w-6xl px-3 py-10 sm:px-6">
        <div className="h-8 w-48 animate-pulse bg-muted" />
        <div className="mt-6 h-40 animate-pulse bg-muted" />
      </section>
    );
  }

  const paid = order.status === "PAID";

  return (
    <section className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-6 sm:py-12">
      <p className="text-sm text-muted-foreground">Mã đơn {order.orderCode}</p>
      <h1
        className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ ...fieldStyle, fontSize: "32px", lineHeight: 1.4 }}
      >
        {paid ? "Thanh toán thành công" : "Hoàn tất thanh toán"}
      </h1>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="space-y-4">
          <PayGuide order={order} />
          {!paid ? (
            <button
              type="button"
              disabled={confirming}
              onClick={confirm}
              className="inline-flex h-11 w-full items-center justify-center bg-violet-700 text-sm font-medium text-white transition hover:bg-violet-600 disabled:opacity-70 sm:w-auto sm:px-8"
              style={{ border: "none", borderRadius: "5px" }}
            >
              {confirming ? "Đang xác nhận..." : "Tôi đã thanh toán"}
            </button>
          ) : null}
        </div>
        <Summary
          items={order.items || []}
          total={order.totalAmount}
          currency={order.currency}
        />
      </div>
    </section>
  );
}

const CheckoutPage = () => {
  const user = getAuthUser();
  const orderCode = orderCodeFromPath();
  if (!user) {
    return <AuthGate />;
  }
  if (orderCode) {
    return <CheckoutOrder orderCode={orderCode} />;
  }
  return <CheckoutStart />;
};

export default CheckoutPage;
