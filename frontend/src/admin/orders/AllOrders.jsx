import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CircleCheck,
  CircleX,
  Clock,
  BookOpen,
  GraduationCap,
  Receipt,
  RotateCcw,
  Search,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { formatMoney } from "@/components/Course";
import { Input } from "@/components/ui/input";
import { authGet } from "@/lib/auth";
import { roleLabel } from "@/lib/roles";
import { cn } from "@/lib/utils";

const FACE = {
  fontFamily: "'Roboto', sans-serif",
  letterSpacing: "0.01em",
  lineHeight: 1.4,
};

const STATUS_FILTERS = [
  { key: "ALL", label: "Tất cả", icon: ShoppingBag },
  { key: "PAID", label: "Đã thanh toán", icon: CircleCheck },
  { key: "PENDING", label: "Chờ thanh toán", icon: Clock },
  { key: "CANCELLED", label: "Đã hủy", icon: Ban },
  { key: "FAILED", label: "Thất bại", icon: CircleX },
  { key: "REFUNDED", label: "Hoàn tiền", icon: RotateCcw },
];

const GROUP_ICONS = {
  ALL: Users,
  USER: GraduationCap,
  INSTRUCTOR: BookOpen,
};

function statusOf(order) {
  return String(order?.status || "").toUpperCase();
}

function statusMeta(status) {
  const value = String(status || "").toUpperCase();
  if (value === "PAID") {
    return {
      label: "Đã thanh toán",
      className: "bg-emerald-500/15 text-emerald-400",
    };
  }
  if (value === "PENDING") {
    return {
      label: "Chờ thanh toán",
      className: "bg-amber-500/15 text-amber-400",
    };
  }
  if (value === "CANCELLED" || value === "CANCELED") {
    return { label: "Đã hủy", className: "bg-zinc-500/20 text-zinc-300" };
  }
  if (value === "FAILED") {
    return { label: "Thất bại", className: "bg-rose-500/15 text-rose-400" };
  }
  if (value === "REFUNDED") {
    return { label: "Hoàn tiền", className: "bg-sky-500/15 text-sky-400" };
  }
  return { label: status || "Khác", className: "bg-muted text-muted-foreground" };
}

function formatWhen(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCount(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value) || 0);
}

function emptyGroup() {
  return {
    key: "ALL",
    label: "Tất cả người dùng",
    total: 0,
    paid: 0,
    pending: 0,
    cancelled: 0,
    failed: 0,
    refunded: 0,
    buyers: 0,
  };
}

function StatCard({ icon: Icon, label, value, hint, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 border border-border bg-card p-4 text-left transition hover:border-violet-500/40",
        active && "border-violet-500 bg-violet-500/10",
      )}
      style={{ borderRadius: "5px" }}
    >
      <span
        className={cn(
          "inline-flex size-10 shrink-0 items-center justify-center bg-muted text-foreground",
          active && "bg-violet-600 text-white",
        )}
        style={{ borderRadius: "5px" }}
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span
          className="block text-xs text-muted-foreground"
          style={{ ...FACE, fontSize: "13px", fontWeight: 400 }}
        >
          {label}
        </span>
        <span
          className="mt-1 block text-xl font-semibold tracking-tight"
          style={{ ...FACE, fontSize: "22px", fontWeight: 600 }}
        >
          {value}
        </span>
        {hint ? (
          <span
            className="mt-1 block text-xs text-muted-foreground"
            style={{ ...FACE, fontSize: "12px", fontWeight: 400 }}
          >
            {hint}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function GroupCard({ group, active, onClick }) {
  const Icon = GROUP_ICONS[group.key] || Users;
  const rows = [
    { label: "Đã thanh toán", value: group.paid, icon: CircleCheck, className: "text-emerald-400" },
    { label: "Chờ thanh toán", value: group.pending, icon: Clock, className: "text-amber-400" },
    { label: "Đã hủy", value: group.cancelled, icon: Ban, className: "text-zinc-300" },
    { label: "Thất bại", value: group.failed, icon: CircleX, className: "text-rose-400" },
    { label: "Hoàn tiền", value: group.refunded, icon: RotateCcw, className: "text-sky-400" },
  ];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col border border-border bg-card p-4 text-left transition hover:border-violet-500/40",
        active && "border-violet-500 bg-violet-500/10",
      )}
      style={{ borderRadius: "5px" }}
    >
      <span className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex size-10 items-center justify-center bg-muted",
            active && "bg-violet-600 text-white",
          )}
          style={{ borderRadius: "5px" }}
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span
            className="block font-medium"
            style={{ ...FACE, fontSize: "16px", fontWeight: 600 }}
          >
            {group.label}
          </span>
          <span
            className="block text-xs text-muted-foreground"
            style={{ ...FACE, fontSize: "13px", fontWeight: 400 }}
          >
            {formatCount(group.buyers)} người mua · {formatCount(group.total)} đơn
          </span>
        </span>
      </span>
      <span className="mt-4 grid gap-2">
        {rows.map((row) => {
          const RowIcon = row.icon;
          return (
            <span
              key={row.label}
              className="flex items-center justify-between text-sm"
              style={{ ...FACE, fontSize: "13px", fontWeight: 400 }}
            >
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <RowIcon className={cn("size-3.5", row.className)} />
                {row.label}
              </span>
              <span className="font-medium text-foreground">{formatCount(row.value)}</span>
            </span>
          );
        })}
      </span>
    </button>
  );
}

export function AllOrders() {
  const [groups, setGroups] = useState([]);
  const [orders, setOrders] = useState([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [role, setRole] = useState("ALL");

  useEffect(() => {
    let cancelled = false;
    authGet("/api/admin/orders")
      .then((data) => {
        if (cancelled) {
          return;
        }
        setGroups(Array.isArray(data?.groups) ? data.groups : []);
        setOrders(Array.isArray(data?.orders) ? data.orders : []);
        setPaidAmount(Number(data?.paidAmount) || 0);
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(error.message || "Không tải được đơn hàng");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allGroup = groups.find((item) => item.key === "ALL") || emptyGroup();
  const audience = groups.length ? groups : [emptyGroup()];

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      const orderStatus = statusOf(order);
      if (status !== "ALL") {
        if (status === "CANCELLED") {
          if (orderStatus !== "CANCELLED" && orderStatus !== "CANCELED") {
            return false;
          }
        } else if (orderStatus !== status) {
          return false;
        }
      }
      if (role !== "ALL" && String(order.userRole || "").toUpperCase() !== role) {
        return false;
      }
      if (!needle) {
        return true;
      }
      const hay = [
        order.orderCode,
        order.userName,
        order.userEmail,
        ...(Array.isArray(order.courses) ? order.courses : []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [orders, query, status, role]);

  const statusCards = [
    { key: "ALL", label: "Tổng đơn", value: allGroup.total, icon: ShoppingBag },
    { key: "PAID", label: "Đã thanh toán", value: allGroup.paid, icon: CircleCheck },
    { key: "PENDING", label: "Chờ thanh toán", value: allGroup.pending, icon: Clock },
    { key: "CANCELLED", label: "Đã hủy", value: allGroup.cancelled, icon: Ban },
    { key: "FAILED", label: "Thất bại", value: allGroup.failed, icon: CircleX },
    { key: "REFUNDED", label: "Hoàn tiền", value: allGroup.refunded, icon: RotateCcw },
  ];

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ ...FACE, fontSize: "28px", fontWeight: 600 }}
          >
            Đơn hàng
          </h1>
          <p
            className="mt-1 text-sm text-muted-foreground"
            style={{ ...FACE, fontSize: "14px", fontWeight: 500 }}
          >
            {formatCount(allGroup.total)} đơn · {formatCount(allGroup.buyers)} người dùng
          </p>
        </div>
        <div
          className="inline-flex items-center gap-2 border border-border bg-card px-3 py-2"
          style={{ borderRadius: "5px" }}
        >
          <Wallet className="size-4 text-violet-400" />
          <span style={{ ...FACE, fontSize: "13px", fontWeight: 400 }} className="text-muted-foreground">
            Doanh thu đã thanh toán
          </span>
          <span style={{ ...FACE, fontSize: "16px", fontWeight: 600 }}>
            {formatMoney(paidAmount, "VND")}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse bg-muted" style={{ borderRadius: "5px" }} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {statusCards.map((card) => (
              <StatCard
                key={card.key}
                icon={card.icon}
                label={card.label}
                value={formatCount(card.value)}
                active={status === card.key}
                onClick={() => setStatus(card.key)}
              />
            ))}
          </div>

          <div>
            <h2
              className="mb-3 font-semibold"
              style={{ ...FACE, fontSize: "16px", fontWeight: 600 }}
            >
              Theo người dùng và học viên
            </h2>
            <div className="grid gap-3 lg:grid-cols-3">
              {audience.map((group) => (
                <GroupCard
                  key={group.key}
                  group={group}
                  active={role === group.key}
                  onClick={() => setRole(group.key)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((item) => {
                const Icon = item.icon;
                const active = status === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStatus(item.key)}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 border px-3 text-sm transition",
                      active
                        ? "border-violet-500 bg-violet-600 text-white"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                    style={{ ...FACE, fontSize: "13px", fontWeight: 500, borderRadius: "5px" }}
                  >
                    <Icon className="size-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="relative w-full lg:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm mã đơn, học viên, khóa học"
                className="h-9 pl-9"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div
              className="flex min-h-56 flex-col items-center justify-center border border-dashed border-border bg-card px-6 text-center"
              style={{ borderRadius: "5px" }}
            >
              <Receipt className="mb-3 size-10 text-muted-foreground" />
              <p className="font-medium" style={{ ...FACE, fontSize: "16px", fontWeight: 500 }}>
                Không có đơn hàng phù hợp
              </p>
              <p className="mt-1 text-sm text-muted-foreground" style={{ ...FACE, fontSize: "14px" }}>
                Thử đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border bg-card" style={{ borderRadius: "5px" }}>
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    {["Mã đơn", "Người mua", "Khóa học", "Số tiền", "Trạng thái", "Thời gian"].map(
                      (head) => (
                        <th
                          key={head}
                          className="px-4 py-3 font-medium"
                          style={{ ...FACE, fontSize: "13px", fontWeight: 500 }}
                        >
                          {head}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => {
                    const meta = statusMeta(order.status);
                    const courses = Array.isArray(order.courses) ? order.courses : [];
                    return (
                      <tr key={order.id || order.orderCode} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 align-top">
                          <p className="font-medium" style={{ ...FACE, fontSize: "14px", fontWeight: 500 }}>
                            {order.orderCode}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground" style={{ ...FACE, fontSize: "12px" }}>
                            {order.provider === "BANK_TRANSFER" ? "Chuyển khoản" : order.provider || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="font-medium" style={{ ...FACE, fontSize: "14px", fontWeight: 500 }}>
                            {order.userName || "Người dùng"}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground" style={{ ...FACE, fontSize: "12px" }}>
                            {order.userEmail}
                          </p>
                          <span
                            className="mt-1 inline-flex bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                            style={{ borderRadius: "5px" }}
                          >
                            {roleLabel(order.userRole)}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="line-clamp-2" style={{ ...FACE, fontSize: "13px", fontWeight: 400 }}>
                            {courses.join(", ") || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          <p style={{ ...FACE, fontSize: "14px", fontWeight: 600 }}>
                            {formatMoney(order.totalAmount, order.currency)}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span
                            className={cn("inline-flex px-2 py-1 text-xs font-medium", meta.className)}
                            style={{ borderRadius: "5px" }}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap text-muted-foreground">
                          <p style={{ ...FACE, fontSize: "13px", fontWeight: 400 }}>
                            {formatWhen(order.paidAt || order.createdAt)}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
