import { useEffect, useMemo, useState } from "react";
import { Clock3, Pencil, Plus, Search, StickyNote, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { authDelete, authGet, authPost, authPut } from "@/lib/auth";
import { getLessonNote } from "@/lib/learning";
import { cn } from "@/lib/utils";

const FONT = {
  fontFamily: "Roboto, sans-serif",
  fontStyle: "normal",
  letterSpacing: "0.01em",
};

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
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CourseNotes({
  slug,
  courseId,
  lessons,
  current,
  formatClock,
  getCurrentTime,
  onJump,
}) {
  const [now, setNow] = useState(() => Number(getCurrentTime?.()) || 0);
  const [notes, setNotes] = useState([]);
  const [draft, setDraft] = useState("");
  const [stamp, setStamp] = useState(true);
  const [scope, setScope] = useState("lesson");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const lessonMap = useMemo(() => {
    const map = new Map();
    (lessons || []).forEach((lesson) => map.set(lesson.id, lesson));
    return map;
  }, [lessons]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Number(getCurrentTime?.()) || 0);
    }, 400);
    return () => window.clearInterval(timer);
  }, [getCurrentTime]);

  useEffect(() => {
    if (!slug) {
      return undefined;
    }
    let cancelled = false;
    authGet(`/api/learning/courses/${encodeURIComponent(slug)}/notes`)
      .then(async (data) => {
        let rows = Array.isArray(data) ? data : [];
        if (!rows.length && courseId) {
          const imported = [];
          for (const lesson of lessons || []) {
            const text = getLessonNote(courseId, lesson.id).trim();
            if (!text) {
              continue;
            }
            try {
              imported.push(
                await authPost(`/api/learning/courses/${encodeURIComponent(slug)}/notes`, {
                  lessonId: lesson.id,
                  body: text,
                }),
              );
            } catch {
              imported.push(null);
            }
          }
          rows = imported.filter(Boolean);
        }
        if (!cancelled) {
          setNotes(rows);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err.message || "Không tải được ghi chú");
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
  }, [courseId, lessons, slug]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return notes.filter((item) => {
      if (scope === "lesson" && current?.id && item.lessonId !== current.id) {
        return false;
      }
      if (!needle) {
        return true;
      }
      const lesson = lessonMap.get(item.lessonId);
      return [item.body, lesson?.title, lesson?.sectionTitle]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [current?.id, lessonMap, notes, query, scope]);

  const saveDraft = async () => {
    const body = draft.trim();
    if (!body || !current?.id) {
      toast.error("Nhập nội dung ghi chú");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const row = await authPut(
          `/api/learning/courses/${encodeURIComponent(slug)}/notes/${editingId}`,
          {
            lessonId: current.id,
            body,
            timestampSeconds: stamp ? Math.floor(Number(getCurrentTime?.()) || now || 0) : -1,
          },
        );
        setNotes((prev) => prev.map((item) => (item.id === row.id ? row : item)));
        toast.success("Đã cập nhật ghi chú");
      } else {
        const row = await authPost(`/api/learning/courses/${encodeURIComponent(slug)}/notes`, {
          lessonId: current.id,
          body,
          timestampSeconds: stamp ? Math.floor(Number(getCurrentTime?.()) || now || 0) : undefined,
        });
        setNotes((prev) => [row, ...prev]);
        toast.success("Đã lưu ghi chú");
      }
      setDraft("");
      setEditingId(null);
      setStamp(true);
    } catch (err) {
      toast.error(err.message || "Không lưu được ghi chú");
    } finally {
      setSaving(false);
    }
  };

  const removeNote = async (id) => {
    try {
      await authDelete(`/api/learning/courses/${encodeURIComponent(slug)}/notes/${id}`);
      setNotes((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) {
        setDraft("");
        setEditingId(null);
      }
      toast.success("Đã xóa ghi chú");
    } catch (err) {
      toast.error(err.message || "Không xóa được ghi chú");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraft(item.body || "");
    setStamp(item.timestampSeconds != null);
    if (item.lessonId && item.lessonId !== current?.id) {
      onJump?.(item);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl bg-white p-4 text-zinc-950 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StickyNote className="size-4 text-violet-700" />
          <h2 className="text-zinc-950" style={{ ...FONT, fontSize: "18px", fontWeight: 600, lineHeight: 1.4 }}>
            Ghi chú khóa học
          </h2>
        </div>
        <p className="text-zinc-600" style={{ ...FONT, fontSize: "13px", fontWeight: 400, lineHeight: 1.5 }}>
          {notes.length} ghi chú
        </p>
      </div>

      <div className="border border-violet-200 bg-white p-4">
        <p className="text-zinc-700" style={{ ...FONT, fontSize: "13px", fontWeight: 400, lineHeight: 1.5 }}>
          {current?.title ? `Bài hiện tại: ${current.title}` : "Chọn một bài giảng để ghi chú"}
        </p>
        <textarea
          value={draft}
          rows={5}
          placeholder="Viết ghi chú của bạn..."
          style={{ ...FONT, fontSize: "16px", fontWeight: 400, lineHeight: 1.6, color: "#18181b" }}
          className="mt-3 w-full resize-y border border-violet-200 bg-white p-3 text-zinc-950 caret-zinc-950 outline-none placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-violet-700/30"
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-zinc-800" style={{ ...FONT, fontSize: "13px", color: "#18181b" }}>
            <input
              type="checkbox"
              checked={stamp}
              onChange={(event) => setStamp(event.target.checked)}
              className="size-4 accent-violet-700"
            />
            Gắn mốc {formatClock(now)}
          </label>
          <div className="flex gap-2">
            {editingId ? (
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-none"
                onClick={() => {
                  setEditingId(null);
                  setDraft("");
                  setStamp(true);
                }}
              >
                Hủy
              </Button>
            ) : null}
            <Button
              type="button"
              className="h-9 rounded-none bg-violet-700 text-white hover:bg-violet-800"
              disabled={saving || !draft.trim()}
              onClick={saveDraft}
            >
              <Plus className="size-4" />
              {editingId ? "Cập nhật" : "Lưu ghi chú"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          <button
            type="button"
            style={{ ...FONT, fontSize: "13px", fontWeight: 500 }}
            className={cn(
              "h-9 px-3",
              scope === "lesson" ? "bg-violet-700 text-white" : "border border-violet-200 text-violet-700",
            )}
            onClick={() => setScope("lesson")}
          >
            Bài này
          </button>
          <button
            type="button"
            style={{ ...FONT, fontSize: "13px", fontWeight: 500 }}
            className={cn(
              "h-9 px-3",
              scope === "all" ? "bg-violet-700 text-white" : "border border-violet-200 text-violet-700",
            )}
            onClick={() => setScope("all")}
          >
            Cả khóa học
          </button>
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            placeholder="Tìm trong ghi chú"
            style={{ ...FONT, fontSize: "14px", fontWeight: 400, color: "#18181b" }}
            className="h-9 w-full border border-violet-200 bg-white pr-3 pl-10 text-zinc-950 caret-zinc-950 outline-none placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-violet-700/30"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-zinc-700" style={{ ...FONT, fontSize: "14px", color: "#3f3f46" }}>
            Đang tải ghi chú...
          </p>
        ) : visible.length === 0 ? (
          <div className="border border-dashed border-violet-200 bg-white px-4 py-10 text-center">
            <StickyNote className="mx-auto size-8 text-violet-600" />
            <p className="mt-3 text-zinc-950" style={{ ...FONT, fontSize: "16px", fontWeight: 600, color: "#18181b" }}>
              Chưa có ghi chú
            </p>
            <p className="mt-1 text-zinc-600" style={{ ...FONT, fontSize: "14px", color: "#52525b" }}>
              Ghi lại ý quan trọng và gắn mốc thời gian để quay lại đúng đoạn video.
            </p>
          </div>
        ) : (
          visible.map((item) => {
            const lesson = lessonMap.get(item.lessonId);
            return (
              <article key={item.id} className="border border-violet-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-zinc-950" style={{ ...FONT, fontSize: "14px", fontWeight: 600, lineHeight: 1.4, color: "#18181b" }}>
                      {lesson?.title || "Bài giảng"}
                    </p>
                    <p className="mt-0.5 text-zinc-500" style={{ ...FONT, fontSize: "12px" }}>
                      {lesson?.sectionTitle ? `${lesson.sectionTitle} · ` : ""}
                      {formatWhen(item.updatedAt || item.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.timestampSeconds != null ? (
                      <button
                        type="button"
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "h-8 rounded-none border-violet-700 px-2 text-violet-700",
                        )}
                        style={{ ...FONT, fontSize: "12px", fontWeight: 500 }}
                        onClick={() => onJump?.(item)}
                      >
                        <Clock3 className="size-3.5" />
                        {formatClock(item.timestampSeconds)}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="inline-flex size-8 items-center justify-center text-zinc-500 hover:text-violet-700"
                      aria-label="Sửa ghi chú"
                      onClick={() => startEdit(item)}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex size-8 items-center justify-center text-zinc-500 hover:text-rose-600"
                      aria-label="Xóa ghi chú"
                      onClick={() => removeNote(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-zinc-950" style={{ ...FONT, fontSize: "16px", lineHeight: 1.6, color: "#18181b" }}>
                  {item.body}
                </p>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
