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

const STATS = [
  {
    label: "Users",
    value: "26K",
    change: "-12.4%",
    up: false,
    className: "bg-violet-500",
    data: [
      { x: 1, y: 18 },
      { x: 2, y: 22 },
      { x: 3, y: 16 },
      { x: 4, y: 24 },
      { x: 5, y: 20 },
      { x: 6, y: 26 },
    ],
  },
  {
    label: "Income",
    value: "$6,200",
    change: "40.9%",
    up: true,
    className: "bg-sky-500",
    data: [
      { x: 1, y: 12 },
      { x: 2, y: 14 },
      { x: 3, y: 18 },
      { x: 4, y: 16 },
      { x: 5, y: 21 },
      { x: 6, y: 28 },
    ],
  },
  {
    label: "Conversion Rate",
    value: "2.49%",
    change: "84.7%",
    up: true,
    className: "bg-amber-400",
    data: [
      { x: 1, y: 8 },
      { x: 2, y: 10 },
      { x: 3, y: 9 },
      { x: 4, y: 14 },
      { x: 5, y: 18 },
      { x: 6, y: 22 },
    ],
  },
  {
    label: "Sessions",
    value: "44K",
    change: "-23.6%",
    up: false,
    className: "bg-rose-500",
    data: [
      { x: 1, y: 20 },
      { x: 2, y: 26 },
      { x: 3, y: 18 },
      { x: 4, y: 24 },
      { x: 5, y: 16 },
      { x: 6, y: 14 },
    ],
  },
];

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
      ) : (
        <DashboardView />
      )}
    </AdminLayout>
  );
};

function DashboardView() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STATS.map((item) => (
          <StatCard key={item.label} item={item} />
        ))}
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
