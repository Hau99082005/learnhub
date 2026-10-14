import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import LessonRecorder from "@/components/LessonRecorder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authGet, authPost } from "@/lib/auth";
import { uploadCourseVideo } from "@/lib/courseVideo";

const SELECT_CLASS =
  "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground scheme-light dark:bg-card dark:text-card-foreground dark:scheme-dark";
const OPTION_CLASS = "bg-background text-foreground dark:bg-card dark:text-card-foreground";

function fileTitle(file) {
  if (!file?.name) {
    return "";
  }
  return file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

const CourseRecord = () => {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sectionTitle, setSectionTitle] = useState("");

  const selected = useMemo(
    () => courses.find((item) => String(item.id) === String(courseId)),
    [courses, courseId],
  );

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await authGet("/api/instructor/courses");
      const items = Array.isArray(data) ? data : [];
      setCourses(items);
      if (!courseId && items[0]?.id) {
        setCourseId(String(items[0].id));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async (id) => {
    if (!id) {
      setSections([]);
      setSectionId("");
      return;
    }
    try {
      const data = await authGet(`/api/instructor/courses/${id}/sections`);
      const items = Array.isArray(data) ? data : [];
      setSections(items);
      setSectionId((prev) => {
        if (prev && items.some((item) => String(item.id) === String(prev))) {
          return prev;
        }
        return items[0]?.id ? String(items[0].id) : "";
      });
    } catch (error) {
      toast.error(error.message);
      setSections([]);
      setSectionId("");
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadSections(courseId);
  }, [courseId]);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const addSection = async () => {
    const value = sectionTitle.trim();
    if (!courseId) {
      toast.error("Vui lòng chọn khóa học");
      return;
    }
    if (!value) {
      toast.error("Vui lòng nhập tên phần");
      return;
    }
    setSaving(true);
    try {
      const created = await authPost(`/api/instructor/courses/${courseId}/sections`, {
        title: value,
      });
      setSectionTitle("");
      toast.success("Đã thêm phần");
      await loadSections(courseId);
      if (created?.id) {
        setSectionId(String(created.id));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveLesson = async () => {
    if (!courseId) {
      toast.error("Vui lòng chọn khóa học");
      return;
    }
    if (!sectionId) {
      toast.error("Vui lòng chọn phần học");
      return;
    }
    if (!file) {
      toast.error("Hãy ghi hình hoặc chọn video trước");
      return;
    }
    const name = title.trim() || fileTitle(file) || "Bài giảng ghi hình";
    setSaving(true);
    setProgress(1);
    try {
      const ready = await uploadCourseVideo(
        file,
        setProgress,
        "/api/instructor/courses/videos",
      );
      await authPost(`/api/instructor/courses/${courseId}/sections/${sectionId}/lessons`, {
        title: name,
        videoUrl: ready.previewVideo,
        durationSeconds: ready.durationSeconds || 0,
        isPreview: false,
        isPublished: true,
        originalName: file.name,
        bytes: ready.bytes || file.size,
      });
      toast.success("Đã lưu bài giảng vào khóa học");
      setFile(null);
      setTitle("");
      setProgress(0);
      await loadSections(courseId);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ghi hình khóa học</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        Ghi camera hoặc màn hình, rồi lưu thành bài giảng. Video đi theo cùng luồng tải, nén và phát như khi bạn chọn file.
      </p>

      {loading ? (
        <div className="mt-8 h-40 animate-pulse rounded-xl bg-muted" />
      ) : courses.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Chưa có khóa học. Hãy tạo khóa học trước, rồi quay lại ghi hình.
        </p>
      ) : (
        <div className="mt-8 grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="record-course">Khóa học</Label>
              <select
                id="record-course"
                className={SELECT_CLASS}
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
              >
                {courses.map((item) => (
                  <option key={item.id} value={item.id} className={OPTION_CLASS}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="record-section">Phần học</Label>
              <select
                id="record-section"
                className={SELECT_CLASS}
                value={sectionId}
                onChange={(event) => setSectionId(event.target.value)}
              >
                <option value="" className={OPTION_CLASS}>
                  {sections.length ? "Chọn phần" : "Chưa có phần"}
                </option>
                {sections.map((item) => (
                  <option key={item.id} value={item.id} className={OPTION_CLASS}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="grid min-w-0 flex-1 gap-2">
              <Label htmlFor="record-new-section">Thêm phần mới</Label>
              <Input
                id="record-new-section"
                value={sectionTitle}
                onChange={(event) => setSectionTitle(event.target.value)}
                placeholder="Ví dụ: Bài 1 — Cài đặt môi trường"
                style={{ borderRadius: "5px" }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={addSection}
              style={{ borderRadius: "5px" }}
            >
              Thêm phần
            </Button>
          </div>

          {selected ? (
            <p className="text-sm text-muted-foreground">
              Đang ghi cho: {selected.title}
              {sectionId
                ? ` · ${sections.find((item) => String(item.id) === String(sectionId))?.title || ""}`
                : ""}
            </p>
          ) : null}

          <LessonRecorder disabled={saving} onCapture={setFile} />

          {preview ? (
            <video
              src={preview}
              controls
              playsInline
              className="aspect-video w-full bg-black object-contain"
              style={{ borderRadius: "5px" }}
            />
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="record-title">Tên bài giảng</Label>
            <Input
              id="record-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={file ? fileTitle(file) : "Tên bài sau khi ghi"}
              style={{ borderRadius: "5px" }}
            />
          </div>

          {saving && progress ? (
            <div className="h-2 overflow-hidden bg-muted" style={{ borderRadius: "5px" }}>
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={saving || !file || !sectionId}
              onClick={saveLesson}
              style={{ borderRadius: "5px" }}
            >
              {saving ? `Đang lưu ${progress || 0}%` : "Lưu thành bài giảng"}
            </Button>
            {courseId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  window.location.href = `/giang-day/quan-tri/${courseId}/phan-hoc`;
                }}
                style={{ borderRadius: "5px" }}
              >
                Xem phần học
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseRecord;
