import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  Pencil,
  Play,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { authDelete, authGet, authPost, authPut } from "@/lib/auth";
import { uploadCourseVideo } from "@/lib/courseVideo";
import { cn } from "@/lib/utils";

function formatLength(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0 && minutes > 0) {
    return `${hours} giờ ${minutes} phút`;
  }
  if (hours > 0) {
    return `${hours} giờ`;
  }
  if (minutes > 0) {
    return `${minutes} phút`;
  }
  if (total > 0) {
    return `${total} giây`;
  }
  return "0 phút";
}

function formatClock(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function fileTitle(file) {
  if (!file?.name) {
    return "";
  }
  return file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function CourseCurriculum({ course, onBack }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDescription, setSectionDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [openIds, setOpenIds] = useState([]);
  const [lessonTitle, setLessonTitle] = useState({});
  const [lessonPreview, setLessonPreview] = useState({});
  const [lessonFile, setLessonFile] = useState({});
  const [lessonReady, setLessonReady] = useState({});
  const [progress, setProgress] = useState({});
  const [uploading, setUploading] = useState({});
  const [playingId, setPlayingId] = useState(null);

  const courseId = course?.id;
  const path = courseId ? `/api/admin/courses/${courseId}/sections` : "";

  const load = async () => {
    if (!courseId) {
      return;
    }
    setLoading(true);
    try {
      const data = await authGet(path);
      const items = Array.isArray(data) ? data : [];
      setSections(items);
      setOpenIds((prev) =>
        prev.length ? prev.filter((id) => items.some((item) => item.id === id)) : items.map((item) => item.id),
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!courseId) {
      return;
    }
    setSectionTitle("");
    setSectionDescription("");
    setEditingId(null);
    setLessonTitle({});
    setLessonPreview({});
    setLessonFile({});
    setLessonReady({});
    setProgress({});
    setUploading({});
    setPlayingId(null);
    load();
  }, [courseId]);

  const toggle = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  const addSection = async (event) => {
    event.preventDefault();
    const title = sectionTitle.trim();
    if (!title) {
      toast.error("Vui lòng nhập tên phần");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await authPut(`${path}/${editingId}`, {
          title,
          description: sectionDescription.trim(),
        });
        toast.success("Đã cập nhật phần");
      } else {
        const created = await authPost(path, {
          title,
          description: sectionDescription.trim(),
        });
        setOpenIds((prev) => [...prev, created.id]);
        toast.success("Đã thêm phần");
      }
      setSectionTitle("");
      setSectionDescription("");
      setEditingId(null);
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeSection = async (section) => {
    if (!window.confirm(`Xóa phần “${section.title}” và toàn bộ bài giảng?`)) {
      return;
    }
    setSaving(true);
    try {
      await authDelete(`${path}/${section.id}`);
      toast.success("Đã xóa phần");
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const moveSection = async (section, direction) => {
    setSaving(true);
    try {
      const data = await authPost(
        `${path}/${section.id}/move?direction=${direction}`,
        {},
      );
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const onPickLessonFile = (sectionId, event) => {
    const next = event.target.files?.[0];
    event.target.value = "";
    if (!next) {
      return;
    }
    if (
      !next.type.startsWith("video/") &&
      !/\.(mp4|webm|mov|mkv|avi)$/i.test(next.name)
    ) {
      toast.error("Vui lòng chọn file video");
      return;
    }
    setLessonFile((prev) => ({ ...prev, [sectionId]: next }));
    setLessonReady((prev) => ({ ...prev, [sectionId]: null }));
    setProgress((prev) => ({ ...prev, [sectionId]: 0 }));
    setLessonTitle((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] || fileTitle(next),
    }));
    const url = URL.createObjectURL(next);
    const player = document.createElement("video");
    player.preload = "metadata";
    player.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
    };
    player.onerror = () => URL.revokeObjectURL(url);
    player.src = url;
  };

  const uploadLessonVideo = async (sectionId) => {
    const file = lessonFile[sectionId];
    if (!file) {
      toast.error("Vui lòng chọn video bài giảng");
      return;
    }
    setUploading((prev) => ({ ...prev, [sectionId]: true }));
    setProgress((prev) => ({ ...prev, [sectionId]: 1 }));
    try {
      const ready = await uploadCourseVideo(file, (value) => {
        setProgress((prev) => ({ ...prev, [sectionId]: value }));
      });
      setLessonReady((prev) => ({
        ...prev,
        [sectionId]: {
          previewVideo: ready.previewVideo,
          durationSeconds: ready.durationSeconds || 0,
          bytes: ready.bytes || file.size,
          originalName: file.name,
        },
      }));
      setLessonFile((prev) => ({ ...prev, [sectionId]: null }));
      toast.success("Đã tải và nén video bài giảng");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading((prev) => ({ ...prev, [sectionId]: false }));
    }
  };

  const addLesson = async (section) => {
    const title = (lessonTitle[section.id] || "").trim();
    const ready = lessonReady[section.id];
    if (!title) {
      toast.error("Vui lòng nhập tên bài giảng");
      return;
    }
    if (!ready?.previewVideo) {
      toast.error("Vui lòng tải và nén video bài giảng");
      return;
    }
    setSaving(true);
    try {
      await authPost(`${path}/${section.id}/lessons`, {
        title,
        videoUrl: ready.previewVideo,
        durationSeconds: ready.durationSeconds || 0,
        isPreview: Boolean(lessonPreview[section.id]),
        isPublished: true,
        originalName: ready.originalName,
        bytes: ready.bytes,
      });
      setLessonTitle((prev) => ({ ...prev, [section.id]: "" }));
      setLessonFile((prev) => ({ ...prev, [section.id]: null }));
      setLessonReady((prev) => ({ ...prev, [section.id]: null }));
      setLessonPreview((prev) => ({ ...prev, [section.id]: false }));
      setProgress((prev) => ({ ...prev, [section.id]: 0 }));
      toast.success("Đã thêm bài giảng");
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const replaceLessonVideo = async (section, lesson, event) => {
    const next = event.target.files?.[0];
    event.target.value = "";
    if (!next) {
      return;
    }
    if (
      !next.type.startsWith("video/") &&
      !/\.(mp4|webm|mov|mkv|avi)$/i.test(next.name)
    ) {
      toast.error("Vui lòng chọn file video");
      return;
    }
    const key = `lesson-${lesson.id}`;
    setUploading((prev) => ({ ...prev, [key]: true }));
    setProgress((prev) => ({ ...prev, [key]: 1 }));
    try {
      const ready = await uploadCourseVideo(next, (value) => {
        setProgress((prev) => ({ ...prev, [key]: value }));
      });
      await authPut(`${path}/${section.id}/lessons/${lesson.id}`, {
        videoUrl: ready.previewVideo,
        durationSeconds: ready.durationSeconds || 0,
        originalName: next.name,
        bytes: ready.bytes || next.size,
      });
      toast.success("Đã tải và nén video bài giảng");
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
      setProgress((prev) => ({ ...prev, [key]: 0 }));
    }
  };

  const removeLesson = async (section, lesson) => {
    if (!window.confirm(`Xóa bài giảng “${lesson.title}”?`)) {
      return;
    }
    setSaving(true);
    try {
      await authDelete(`${path}/${section.id}/lessons/${lesson.id}`);
      toast.success("Đã xóa bài giảng");
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const moveLesson = async (section, lesson, direction) => {
    setSaving(true);
    try {
      const data = await authPost(
        `${path}/${section.id}/lessons/${lesson.id}/move?direction=${direction}`,
        {},
      );
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePreview = async (section, lesson) => {
    setSaving(true);
    try {
      await authPut(`${path}/${section.id}/lessons/${lesson.id}`, {
        isPreview: !lesson.isPreview,
      });
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const lessonTotal = sections.reduce(
    (sum, section) => sum + (section.lessonCount || section.lessons?.length || 0),
    0,
  );
  const durationTotal = sections.reduce(
    (sum, section) => sum + (Number(section.durationSeconds) || 0),
    0,
  );

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            onClick={onBack}
          >
            <ChevronLeft className="size-4" />
            Khóa học
          </button>
          <h1 className="text-2xl font-semibold tracking-tight">Phần học</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {course?.title || ""}
            {sections.length
              ? ` · ${sections.length} phần · ${lessonTotal} bài giảng · ${formatLength(durationTotal)}`
              : " · Thêm phần, rồi tải video vào từng phần (tự sắp xếp)"}
          </p>
        </div>
      </div>

      <form onSubmit={addSection} className="grid gap-3 rounded-xl border border-border bg-card p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="grid gap-2">
            <Label htmlFor="section-title">
              {editingId ? "Sửa phần" : "Thêm phần mới"}
            </Label>
            <Input
              id="section-title"
              value={sectionTitle}
              onChange={(event) => setSectionTitle(event.target.value)}
              placeholder="Ví dụ: Cơ bản về Spring Data JPA"
              maxLength={255}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              <Plus className="size-4" />
              {editingId ? "Lưu phần" : "Thêm phần"}
            </Button>
          </div>
        </div>
        <Input
          value={sectionDescription}
          onChange={(event) => setSectionDescription(event.target.value)}
          placeholder="Mô tả ngắn (không bắt buộc)"
          maxLength={1000}
        />
        {editingId ? (
          <button
            type="button"
            className="justify-self-start text-sm text-muted-foreground underline"
            onClick={() => {
              setEditingId(null);
              setSectionTitle("");
              setSectionDescription("");
            }}
          >
            Hủy sửa
          </button>
        ) : null}
      </form>

      {loading ? (
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      ) : sections.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Chưa có phần nào. Nhập tên phần phía trên rồi bấm Thêm phần.
        </p>
      ) : (
        <div className="overflow-hidden border border-border bg-card">
          {sections.map((section, index) => {
            const opened = openIds.includes(section.id);
            const lessons = Array.isArray(section.lessons) ? section.lessons : [];
            const count = section.lessonCount || lessons.length;
            return (
              <div key={section.id} className="border-b border-border last:border-b-0">
                <div className="flex flex-col gap-2 bg-muted/40 px-3 py-3 sm:flex-row sm:items-center sm:px-4">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-start gap-2 text-left"
                    onClick={() => toggle(section.id)}
                  >
                    <ChevronDown
                      className={cn(
                        "mt-0.5 size-4 shrink-0 transition",
                        opened ? "rotate-0" : "-rotate-90",
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold">{section.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground sm:hidden">
                        {count} bài giảng · {formatLength(section.durationSeconds)}
                      </span>
                    </span>
                  </button>
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                    <span className="hidden text-sm text-muted-foreground sm:inline">
                      {count} bài giảng · {formatLength(section.durationSeconds)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={saving || index === 0}
                        onClick={() => moveSection(section, "up")}
                        aria-label="Lên"
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={saving || index === sections.length - 1}
                        onClick={() => moveSection(section, "down")}
                        aria-label="Xuống"
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingId(section.id);
                          setSectionTitle(section.title || "");
                          setSectionDescription(section.description || "");
                        }}
                        aria-label="Sửa phần"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={saving}
                        onClick={() => removeSection(section)}
                        aria-label="Xóa phần"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {opened ? (
                  <div className="px-3 pb-4 sm:px-4">
                    {lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="border-b border-border py-2 last:border-b-0"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <button
                            type="button"
                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                            onClick={() => {
                              if (!lesson.videoUrl) {
                                toast.error("Bài giảng chưa có video");
                                return;
                              }
                              setPlayingId((value) =>
                                value === lesson.id ? null : lesson.id,
                              );
                            }}
                          >
                            <Play className="size-4 shrink-0 text-muted-foreground" />
                            <span className="min-w-0">
                              <span className="block truncate text-sm">
                                {lesson.title}
                              </span>
                              {lesson.isPreview ? (
                                <span className="text-xs text-violet-600">
                                  Xem trước
                                </span>
                              ) : null}
                            </span>
                          </button>
                          <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
                            <span className="text-xs text-muted-foreground sm:text-sm">
                              {formatClock(lesson.durationSeconds)}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={saving}
                              onClick={() => togglePreview(section, lesson)}
                              style={{ borderRadius: "5px" }}
                            >
                              {lesson.isPreview ? "Bỏ xem trước" : "Cho xem trước"}
                            </Button>
                            <label
                              className="inline-flex h-8 cursor-pointer items-center gap-1.5 border border-border px-2.5 text-sm"
                              style={{ borderRadius: "5px" }}
                            >
                              <Upload className="size-3.5" />
                              {uploading[`lesson-${lesson.id}`]
                                ? `Đang tải ${progress[`lesson-${lesson.id}`] || 0}%`
                                : "Đổi video"}
                              <input
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov,.mkv"
                                className="sr-only"
                                disabled={saving || uploading[`lesson-${lesson.id}`]}
                                onChange={(event) =>
                                  replaceLessonVideo(section, lesson, event)
                                }
                              />
                            </label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={saving || lessonIndex === 0}
                              onClick={() => moveLesson(section, lesson, "up")}
                              aria-label="Lên"
                            >
                              <ArrowUp className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={saving || lessonIndex === lessons.length - 1}
                              onClick={() => moveLesson(section, lesson, "down")}
                              aria-label="Xuống"
                            >
                              <ArrowDown className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={saving}
                              onClick={() => removeLesson(section, lesson)}
                              aria-label="Xóa bài"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                        {progress[`lesson-${lesson.id}`] ? (
                          <div className="mt-2 h-1.5 overflow-hidden bg-muted" style={{ borderRadius: "5px" }}>
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${progress[`lesson-${lesson.id}`]}%`,
                              }}
                            />
                          </div>
                        ) : null}
                        {playingId === lesson.id && lesson.videoUrl ? (
                          <video
                            src={lesson.videoUrl}
                            controls
                            autoPlay
                            playsInline
                            preload="metadata"
                            className="mt-2 aspect-video w-full max-w-[13rem] bg-black object-contain sm:max-w-[16rem]"
                            style={{ borderRadius: "5px" }}
                          />
                        ) : null}
                      </div>
                    ))}
                    <div
                      className="mt-3 grid gap-3 border border-dashed border-border p-3"
                      style={{ borderRadius: "5px" }}
                    >
                      <Input
                        value={lessonTitle[section.id] || ""}
                        onChange={(event) =>
                          setLessonTitle((prev) => ({
                            ...prev,
                            [section.id]: event.target.value,
                          }))
                        }
                        placeholder="Tên bài giảng"
                        style={{ borderRadius: "5px" }}
                      />
                      <div className="grid gap-2">
                        <Label htmlFor={`lesson-video-${section.id}`}>
                          Video bài giảng
                        </Label>
                        <label
                          htmlFor={`lesson-video-${section.id}`}
                          className="flex cursor-pointer flex-col gap-3 border border-dashed border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:p-4"
                          style={{ borderRadius: "5px" }}
                        >
                          <span
                            className="flex size-12 shrink-0 items-center justify-center border border-border bg-background"
                            style={{ borderRadius: "5px" }}
                          >
                            <Upload className="size-6" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium">
                              {lessonFile[section.id] ||
                              lessonReady[section.id]?.previewVideo
                                ? "Đổi file video"
                                : "Tải video bài giảng"}
                            </span>
                            <span className="mt-1 block truncate text-xs text-muted-foreground sm:text-sm">
                              {lessonFile[section.id]?.name ||
                                (lessonReady[section.id]?.previewVideo
                                  ? "Đã nén video"
                                  : "MP4, WEBM, MOV, MKV")}
                            </span>
                          </span>
                          <input
                            id={`lesson-video-${section.id}`}
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov,.mkv"
                            className="sr-only"
                            onChange={(event) =>
                              onPickLessonFile(section.id, event)
                            }
                          />
                        </label>
                        {lessonFile[section.id] ? (
                          <p className="truncate text-xs text-muted-foreground sm:text-sm">
                            {lessonFile[section.id].name}
                          </p>
                        ) : null}
                        {lessonFile[section.id] ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={uploading[section.id]}
                              onClick={() => uploadLessonVideo(section.id)}
                              style={{ borderRadius: "5px" }}
                            >
                              {uploading[section.id]
                                ? `Đang tải ${progress[section.id] || 0}%`
                                : "Tải và nén video"}
                            </Button>
                          </div>
                        ) : null}
                        {uploading[section.id] ? (
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${progress[section.id] || 0}%` }}
                            />
                          </div>
                        ) : null}
                        {lessonReady[section.id]?.previewVideo ? (
                          <video
                            src={lessonReady[section.id].previewVideo}
                            controls
                            playsInline
                            className="aspect-video w-full max-w-[13rem] bg-black object-contain sm:max-w-[16rem]"
                            style={{ borderRadius: "5px" }}
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <label className="inline-flex items-center gap-2 text-sm">
                          <Switch
                            checked={Boolean(lessonPreview[section.id])}
                            onCheckedChange={(value) =>
                              setLessonPreview((prev) => ({
                                ...prev,
                                [section.id]: value,
                              }))
                            }
                          />
                          Xem trước miễn phí
                        </label>
                        <Button
                          type="button"
                          disabled={saving || uploading[section.id]}
                          className="sm:ml-auto"
                          onClick={() => addLesson(section)}
                          style={{ borderRadius: "5px" }}
                        >
                          Thêm bài giảng
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export { CourseCurriculum };
export default CourseCurriculum;
