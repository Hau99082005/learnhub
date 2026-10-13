import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Download,
  Ellipsis,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { authGet, getAuthUser, setPendingToast } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import AdminLayout from "@/admin/layout";
import { AllBanner } from "@/admin/banners/AllBanner";
import { AllCategory } from "@/admin/categories/AllCategory";
import { AllNews } from "@/admin/news/AllNews";
import { AllNewsBlog } from "@/admin/news/AllNewsBlog";
import { AllCourse } from "@/admin/courses/AllCourse";

const STAT_STYLES = {
  users: "bg-violet-500",
  orders: "bg-sky-500",
  courses: "bg-amber-400",
  payments: "bg-rose-500",
};

function formatCount(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value) || 0);
}

function toChart(series) {
  return (Array.isArray(series) ? series : []).map((point, index) => ({
    x: index + 1,
    y: Number(point) || 0,
  }));
}

const TRAFFIC = [
  { month: "January", current: 170, previous: 90 },
  { month: "February", current: 145, previous: 70 },
  { month: "March", current: 155, previous: 95 },
  { month: "April", current: 168, previous: 120 },
  { month: "May", current: 175, previous: 110 },
  { month: "June", current: 162, previous: 80 },
  { month: "July", current: 150, previous: 105 },
];

function StatCard({ item }) {
  const Trend = item.up ? ArrowUpRight : ArrowDownRight;
  return (
    <article
      className={`rounded-xl p-4 text-white shadow-sm ${item.className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-2xl font-semibold tracking-tight"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontWeight: "600",
              fontStyle: "normal",
              lineHeight: 1.4,
              fontSize: "22px",
              letterSpacing: "0.01em",
            }}
          >
            {item.value}
          </p>
          <p
            className="mt-1 flex items-center gap-1 text-sm text-white/90"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontWeight: "400",
              fontStyle: "normal",
              lineHeight: 1.4,
              fontSize: "14px",
              letterSpacing: "0.01em",
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
              fontWeight: "500",
              fontStyle: "normal",
              lineHeight: 1.4,
              fontSize: "14px",
              letterSpacing: "0.01em",
            }}
          >
            {item.label}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-white hover:bg-white/15 hover:text-white"
          aria-label={item.label}
        >
          <Ellipsis className="size-4" />
        </Button>
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

const Page = () => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    if (!isAdmin(getAuthUser())) {
      setPendingToast("error", "Bạn không có quyền truy cập trang quản trị");
      window.location.href = "/";
      return;
    }

    authGet("/api/admin/dashboard")
      .then((data) => {
        if (!isAdmin(data)) {
          throw new Error("Bạn không có quyền truy cập trang quản trị");
        }
        setAdmin(data);
      })
      .catch((error) => {
        setPendingToast(
          "error",
          error.message || "Bạn không có quyền truy cập trang quản trị",
        );
        window.location.href = "/";
      });
  }, []);

  if (!admin) {
    return <main className="flex-1" />;
  }

  const path = window.location.pathname;
  const isBanners = path === "/admin/banners" || path === "/quan-tri/banners";
  const isCategories = path === "/admin/categories" || path === "/quan-tri/categories";
  const isNews = path === "/admin/news" || path === "/quan-tri/news";
  const isNewsBlogs = path === "/admin/newsblogs" || path === "/quan-tri/newsblogs";
  const isCourses =
    path === "/admin/courses" ||
    path === "/quan-tri/courses" ||
    /^\/(?:admin|quan-tri)\/courses\/\d+\/phan-hoc$/.test(path);

  return (
    <AdminLayout user={admin}>
      {isBanners ? (
        <AllBanner />
      ) : isCategories ? (
        <AllCategory />
      ) : isNews ? (
        <AllNews />
      ) : isNewsBlogs ? (
        <AllNewsBlog />
      ) : isCourses ? (
        <AllCourse />
      ) : (
        <DashboardView />
      )}
    </AdminLayout>
  );
};

function DashboardView() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    let cancelled = false;
    authGet("/api/admin/stats")
      .then((data) => {
        if (cancelled) {
          return;
        }
        const rows = Array.isArray(data?.cards) ? data.cards : [];
        setCards(
          rows.map((row) => ({
            key: row.key,
            label: row.label,
            value: formatCount(row.value),
            change: row.change || "0.0%",
            up: Boolean(row.up),
            className: STAT_STYLES[row.key] || "bg-violet-500",
            data: toChart(row.series),
          })),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setCards([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.length === 0
          ? ["Users", "Orders", "Courses", "Payments"].map((label, index) => (
              <article
                key={label}
                className={`rounded-xl p-4 text-white shadow-sm ${
                  Object.values(STAT_STYLES)[index]
                }`}
              >
                <p
                  className="text-2xl font-semibold tracking-tight"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: "600",
                    fontStyle: "normal",
                    lineHeight: 1.4,
                    fontSize: "22px",
                    letterSpacing: "0.01em",
                  }}
                >
                  —
                </p>
                <p className="mt-3 text-sm font-medium text-white/95">{label}</p>
              </article>
            ))
          : cards.map((item) => <StatCard key={item.key} item={item} />)}
      </div>
      <section className="mt-5 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              className="text-lg font-semibold tracking-tight"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontWeight: "700",
                fontStyle: "normal",
                lineHeight: 1.4,
                fontSize: "24px",
                letterSpacing: "0.01em",
              }}
            >
              Traffic
            </h2>
            <p
              className="text-sm text-muted-foreground"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontWeight: "400",
                fontStyle: "normal",
                lineHeight: 1.4,
                fontSize: "16px",
                letterSpacing: "0.01em",
              }}
            >
              October — April 2026
            </p>
          </div>
          <div
            className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontWeight: "500",
              fontStyle: "normal",
              lineHeight: 1.4,
              fontSize: "14px",
              letterSpacing: "0.01em",
            }}
          >
            <span>10/1/2025</span>
            <span>→</span>
            <span>4/30/2026</span>
            <Button type="button" variant="ghost" size="icon" aria-label="Lịch">
              <Calendar className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Tải xuống"
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TRAFFIC}>
              <defs>
                <linearGradient id="trafficCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="trafficPrevious"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 12 }}
                domain={[0, 250]}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="previous"
                stroke="#38bdf8"
                strokeWidth={2}
                fill="url(#trafficPrevious)"
              />
              <Area
                type="monotone"
                dataKey="current"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#trafficCurrent)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}

export default Page;
