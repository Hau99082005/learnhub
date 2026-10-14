import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Star } from "lucide-react";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { authGet } from "@/lib/auth";

const STAT_STYLES = {
  students: "bg-violet-500",
  revenue: "bg-sky-500",
  rating: "bg-amber-400",
  courses: "bg-rose-500",
};

const STATUS = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Lưu trữ",
};

function formatCount(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value) || 0);
}

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function toChart(series) {
  return (Array.isArray(series) ? series : []).map((point, index) => ({
    x: index + 1,
    y: Number(point) || 0,
  }));
}

function cardValue(item, rating) {
  if (item.key === "revenue") {
    return formatMoney(item.value);
  }
  if (item.key === "rating") {
    return Number(rating || 0).toFixed(1);
  }
  return formatCount(item.value);
}

function StatCard({ item, rating }) {
  const Trend = item.up ? ArrowUpRight : ArrowDownRight;
  return (
    <article className={`rounded-xl p-4 text-white shadow-sm ${item.className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="truncate text-2xl font-semibold tracking-tight"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontWeight: "600",
              lineHeight: 1.4,
              fontSize: item.key === "revenue" ? "18px" : "22px",
              letterSpacing: "0.01em",
            }}
          >
            {cardValue(item, rating)}
          </p>
          <p
            className="mt-1 flex items-center gap-1 text-sm text-white/90"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "14px",
            }}
          >
            <span>({item.change}</span>
            <Trend className="size-3.5" />
            <span>)</span>
          </p>
          <p
            className="mt-3 text-sm font-medium text-white/95"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "14px",
            }}
          >
            {item.label}
          </p>
        </div>
      </div>
      <div className="mt-4 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={item.data}>
            <Line
              type="monotone"
              dataKey="y"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth={2}
              dot={{ r: 3, fill: "#fff", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

const Performance = () => {
  const [cards, setCards] = useState([]);
  const [trend, setTrend] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rating, setRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [range, setRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authGet("/api/instructor/performance")
      .then((data) => {
        if (cancelled) {
          return;
        }
        setCards(
          (Array.isArray(data?.cards) ? data.cards : []).map((row) => ({
            key: row.key,
            label: row.label,
            value: Number(row.value) || 0,
            change: row.change || "0.0%",
            up: Boolean(row.up),
            className: STAT_STYLES[row.key] || "bg-violet-500",
            data: toChart(row.series),
          })),
        );
        setTrend(
          (Array.isArray(data?.trend) ? data.trend : []).map((row) => ({
            month: row.month,
            students: Number(row.students) || 0,
            revenue: Number(row.revenue) || 0,
          })),
        );
        setCourses(Array.isArray(data?.courses) ? data.courses : []);
        setRating(Number(data?.rating) || 0);
        setRatingCount(Number(data?.ratingCount) || 0);
        setRange({ from: data?.from || "", to: data?.to || "" });
      })
      .catch(() => {
        if (!cancelled) {
          setCards([]);
          setTrend([]);
          setCourses([]);
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

  const peakStudents = Math.max(1, ...trend.map((row) => row.students));
  const peakRevenue = Math.max(1, ...trend.map((row) => row.revenue));
  const period =
    range.from && range.to ? `${range.from} → ${range.to}` : "Đang tải số liệu";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Hiệu suất</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        Học viên, doanh thu và đánh giá từ khóa học của bạn. Số liệu lấy trực tiếp từ đơn đã thanh toán và lượt đăng ký.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading && cards.length === 0
          ? ["Học viên", "Doanh thu", "Đánh giá", "Khóa học"].map((label, index) => (
              <article
                key={label}
                className={`rounded-xl p-4 text-white shadow-sm ${Object.values(STAT_STYLES)[index]}`}
              >
                <p className="text-2xl font-semibold">—</p>
                <p className="mt-3 text-sm font-medium text-white/95">{label}</p>
              </article>
            ))
          : cards.map((item) => (
              <StatCard key={item.key} item={item} rating={rating} />
            ))}
      </div>

      <section className="mt-5 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Hoạt động theo tháng</h2>
            <p className="text-sm text-muted-foreground">7 tháng gần nhất</p>
          </div>
          <p className="text-sm text-muted-foreground">{period}</p>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-violet-500" />
            Học viên mới
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-sky-500" />
            Doanh thu
          </span>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="perfStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="perfRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tick={{ fill: "currentColor", fontSize: 12 }}
                domain={[0, Math.max(4, Math.ceil(peakStudents * 1.2))]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 12 }}
                domain={[0, Math.max(4, Math.ceil(peakRevenue * 1.2))]}
                tickFormatter={(value) => formatCount(value)}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === "Doanh thu" ? formatMoney(value) : formatCount(value),
                  name,
                ]}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="students"
                name="Học viên mới"
                stroke="#8b5cf6"
                fill="url(#perfStudents)"
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#0ea5e9"
                fill="url(#perfRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Theo khóa học</h2>
            <p className="text-sm text-muted-foreground">
              {ratingCount > 0
                ? `Trung bình ${Number(rating).toFixed(1)} sao · ${formatCount(ratingCount)} đánh giá`
                : "Chưa có đánh giá"}
            </p>
          </div>
        </div>
        {courses.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Chưa có khóa học. Tạo khóa học rồi số liệu sẽ hiện ở đây.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Khóa học</th>
                  <th className="py-2 pr-3 font-medium">Học viên</th>
                  <th className="py-2 pr-3 font-medium">Đánh giá</th>
                  <th className="py-2 pr-3 font-medium">Tiến độ TB</th>
                  <th className="py-2 font-medium">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        {item.images ? (
                          <img
                            src={item.images}
                            alt=""
                            className="size-12 shrink-0 object-cover"
                            style={{ borderRadius: "5px" }}
                          />
                        ) : (
                          <span
                            className="flex size-12 shrink-0 items-center justify-center bg-muted text-muted-foreground"
                            style={{ borderRadius: "5px" }}
                          >
                            <Star className="size-4" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {STATUS[item.status] || item.status}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3">{formatCount(item.students)}</td>
                    <td className="py-3 pr-3">
                      {Number(item.ratingCount) > 0
                        ? `${Number(item.rating || 0).toFixed(1)} (${formatCount(item.ratingCount)})`
                        : "—"}
                    </td>
                    <td className="py-3 pr-3">{Number(item.progress || 0).toFixed(0)}%</td>
                    <td className="py-3">{formatMoney(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Performance;
