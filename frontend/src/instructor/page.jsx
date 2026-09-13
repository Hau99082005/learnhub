import { useEffect, useState } from "react";
import { MonitorPlay, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authGet, authPost, getAuthUser, setPendingToast } from "@/lib/auth";
import { isInstructor, isAdmin } from "@/lib/roles";
import InstructorLayout from "@/instructor/layout";

const STATUS = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã xuất bản",
};

const InstructorPage = () => {
  const [tab, setTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      window.location.href = "/dang-nhap?from=teach";
      return;
    }
    if (!isInstructor(user) && !isAdmin(user)) {
      window.location.href = "/giang-day/bat-dau";
      return;
    }
    authGet("/api/instructor/studio")
      .then((data) => {
        setCourses(data.courses || []);
      })
      .catch((err) => {
        if (String(err.message || "").includes("Phiên")) {
          setPendingToast("error", "Phiên đăng nhập hết hạn");
          window.location.href = "/dang-nhap?from=teach";
          return;
        }
        setPendingToast("error", err.message || "Không tải được studio");
        window.location.href = "/giang-day";
      })
      .finally(() => setLoading(false));
  }, []);

  const onCreate = async (event) => {
    event.preventDefault();
    const value = title.trim();
    if (!value) {
      setError("Vui lòng nhập tên khóa học");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const course = await authPost("/api/instructor/courses", { title: value });
      setCourses((prev) => [course, ...prev]);
      setTitle("");
      setOpenForm(false);
    } catch (err) {
      setError(err.message || "Không tạo được khóa học");
    } finally {
      setCreating(false);
    }
  };

  const section = typeof window === "undefined" ? "/giang-day/quan-tri" : window.location.pathname;
  const placeholders = {
    "/giang-day/quan-tri/giao-tiep": {
      title: "Giao tiếp",
      text: "Tin nhắn và hỏi đáp từ học viên sẽ hiện ở đây khi khóa học bắt đầu chạy.",
    },
    "/giang-day/quan-tri/hieu-suat": {
      title: "Hiệu suất",
      text: "Lượt xem, đăng ký và đánh giá khóa học sẽ được tổng hợp tại đây.",
    },
    "/giang-day/quan-tri/cong-cu": {
      title: "Công cụ",
      text: "Checklist ghi hình, mẫu mô tả và công cụ xuất bản sẽ lần lượt được mở.",
    },
    "/giang-day/quan-tri/tai-nguyen": {
      title: "Tài nguyên",
      text: "Hướng dẫn dựng khóa học, tiêu chuẩn chất lượng và hỗ trợ giảng viên.",
    },
  };
  const placeholder = placeholders[section];

  if (placeholder) {
    return (
      <InstructorLayout>
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{placeholder.title}</h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {placeholder.text}
          </p>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Khóa học</h1>
        <div className="mt-6 flex gap-6 border-b border-border">
          <button
            type="button"
            onClick={() => setTab("courses")}
            className={`border-b-2 pb-3 text-sm font-medium transition ${
              tab === "courses"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Khóa học
          </button>
          <button
            type="button"
            onClick={() => setTab("bundle")}
            className={`border-b-2 pb-3 text-sm font-medium transition ${
              tab === "bundle"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Gói khóa học
          </button>
        </div>

        {tab === "bundle" ? (
          <p className="mt-10 text-sm text-muted-foreground">
            Gói khóa học sẽ mở khi bạn đã có từ hai khóa trở lên.
          </p>
        ) : loading ? (
          <div className="mt-8 h-28 animate-pulse bg-muted" />
        ) : (
          <>
            <div className="mt-8 flex flex-col gap-4 border border-border bg-card px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-muted-foreground sm:text-[15px]">
                {courses.length === 0
                  ? "Bắt đầu tạo khóa học"
                  : `${courses.length} khóa học trong studio của bạn`}
              </p>
              {openForm ? null : (
                <Button
                  type="button"
                  onClick={() => setOpenForm(true)}
                  className="h-11 px-5"
                  style={{ borderRadius: "5px" }}
                >
                  Tạo khóa học của bạn
                  <Plus className="size-4" />
                </Button>
              )}
            </div>

            {openForm ? (
              <form
                onSubmit={onCreate}
                className="mt-4 grid gap-3 border border-border bg-card p-5 sm:p-6"
              >
                <label className="text-sm font-medium" htmlFor="course-title">
                  Tên khóa học
                </label>
                <Input
                  id="course-title"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setError("");
                  }}
                  placeholder="Ví dụ: Excel cho người đi làm"
                  autoFocus
                />
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={creating} style={{ borderRadius: "5px" }}>
                    {creating ? "Đang tạo..." : "Tạo khóa học"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpenForm(false);
                      setError("");
                    }}
                    style={{ borderRadius: "5px" }}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            ) : null}

            {courses.length === 0 ? (
              <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
                <div className="flex justify-center">
                  <div className="flex size-40 items-center justify-center bg-muted/60 sm:size-48">
                    <MonitorPlay className="size-16 text-foreground" strokeWidth={1.25} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Tạo khóa học thu hút
                  </h2>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                    Từ câu trả lời của bạn, hãy chọn một kỹ năng cụ thể. Học viên tìm người giúp họ
                    làm được việc — không phải giáo trình dài.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="mt-6 divide-y divide-border border border-border">
                {courses.map((course) => (
                  <li
                    key={course.id}
                    className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {STATUS[course.status] || course.status}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </InstructorLayout>
  );
};

export default InstructorPage;
