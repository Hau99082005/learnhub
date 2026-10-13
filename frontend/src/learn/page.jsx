import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Circle,
  Gauge,
  ListVideo,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Share2,
  SkipBack,
  SkipForward,
  StickyNote,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { authGet, authPut, getAuthUser } from "@/lib/auth";
import { addOwned } from "@/lib/courseAccess";
import {
  getLessonNote,
  getPlayerProgress,
  markAccessed,
  recordStreakVisit,
  saveLessonNote,
  savePlayerProgress,
} from "@/lib/learning";
import { cn } from "@/lib/utils";

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const TABS = [
  { id: "overview", label: "Tổng quan" },
  { id: "notes", label: "Ghi chú" },
  { id: "tools", label: "Công cụ học tập" },
];

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

function flattenLessons(sections) {
  const rows = [];
  (Array.isArray(sections) ? sections : []).forEach((section, sectionIndex) => {
    (section.lessons || []).forEach((lesson, lessonIndex) => {
      rows.push({
        ...lesson,
        sectionId: section.id,
        sectionTitle: section.title,
        sectionIndex,
        lessonIndex,
      });
    });
  });
  return rows;
}

function loginHref(slug) {
  return `/dang-nhap?next=${encodeURIComponent(`/hoc/${slug}`)}`;
}

const CoursePlayerPage = ({ slug }) => {
  const user = getAuthUser();
  const videoRef = useRef(null);
  const wrapRef = useRef(null);
  const hideTimer = useRef(null);
  const lastSavedSec = useRef(-1);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lessonId, setLessonId] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controls, setControls] = useState(true);
  const [sidebar, setSidebar] = useState(() => window.innerWidth >= 1024);
  const [openSections, setOpenSections] = useState([]);
  const [tab, setTab] = useState("overview");
  const [note, setNote] = useState("");
  const [showRate, setShowRate] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const sections = Array.isArray(course?.sections) ? course.sections : [];
  const lessons = useMemo(() => flattenLessons(sections), [sections]);
  const current = lessons.find((item) => item.id === lessonId) || lessons[0] || null;
  const currentIndex = current
    ? lessons.findIndex((item) => item.id === current.id)
    : -1;
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 ? lessons[currentIndex + 1] : null;
  const completedSet = useMemo(() => new Set(completed), [completed]);
  const doneCount = lessons.filter((item) => completedSet.has(item.id)).length;
  const percent = lessons.length
    ? Math.round((doneCount / lessons.length) * 100)
    : 0;

  const persist = useCallback(
    (patch) => {
      if (!course?.courseId) {
        return getPlayerProgress(0);
      }
      return savePlayerProgress(course.courseId, patch);
    },
    [course?.courseId],
  );

  const selectLesson = useCallback(
    (id, autoPlay = true) => {
      const lesson = lessons.find((item) => item.id === id);
      if (!lesson) {
        return;
      }
      setLessonId(lesson.id);
      setOpenSections((prev) =>
        prev.includes(lesson.sectionId) ? prev : [...prev, lesson.sectionId],
      );
      persist({ lastLessonId: lesson.id });
      lastSavedSec.current = -1;
      window.history.replaceState(null, "", `/hoc/${slug}?bai=${lesson.id}`);
      void autoPlay;
    },
    [course?.courseId, lessons, persist, slug],
  );

  useEffect(() => {
    if (!user) {
      window.location.href = loginHref(slug);
      return undefined;
    }
    let cancelled = false;
    authGet(`/api/learning/courses/${encodeURIComponent(slug)}`)
      .then((data) => {
        if (cancelled) {
          return;
        }
        setCourse(data);
        addOwned(data.courseId);
        markAccessed(data.courseId);
        recordStreakVisit();
        const progress = getPlayerProgress(data.courseId);
        setCompleted(progress.completed);
        const flat = flattenLessons(data.sections);
        const wanted = Number(
          new URLSearchParams(window.location.search).get("bai"),
        );
        const start =
          flat.find((item) => item.id === wanted)?.id ||
          progress.lastLessonId ||
          flat[0]?.id ||
          null;
        setLessonId(start);
        const startSection = flat.find((item) => item.id === start)?.sectionId;
        setOpenSections(
          startSection
            ? [startSection]
            : (data.sections || []).slice(0, 1).map((item) => item.id),
        );
        setNote(getLessonNote(data.courseId, start));
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Không mở được bài giảng");
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
  }, [slug, user]);

  useEffect(() => {
    if (course?.courseId && lessonId) {
      setNote(getLessonNote(course.courseId, lessonId));
    }
  }, [course?.courseId, lessonId]);

  useEffect(() => {
    if (!course?.courseId || !lessons.length) {
      return undefined;
    }
    const value = (completed.length / lessons.length) * 100;
    const timer = window.setTimeout(() => {
      authPut(`/api/learning/courses/${encodeURIComponent(slug)}/progress`, {
        percent: value,
      }).catch(() => {});
    }, 600);
    return () => window.clearTimeout(timer);
  }, [completed, course?.courseId, lessons.length, slug]);

  const markDone = (id) => {
    if (!id || completedSet.has(id)) {
      return;
    }
    const next = [...completed, id];
    setCompleted(next);
    persist({ completed: next, lastLessonId: id });
  };

  const toggleDone = (id) => {
    const next = completedSet.has(id)
      ? completed.filter((value) => value !== id)
      : [...completed, id];
    setCompleted(next);
    persist({ completed: next });
  };

  const revealControls = () => {
    setControls(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setControls(false);
      }
    }, 2200);
  };

  const skip = (delta) => {
    const node = videoRef.current;
    if (!node) {
      return;
    }
    node.currentTime = Math.min(
      node.duration || 0,
      Math.max(0, node.currentTime + delta),
    );
  };

  const togglePlay = () => {
    const node = videoRef.current;
    if (!node) {
      return;
    }
    if (node.paused) {
      node.play().catch(() => {});
    } else {
      node.pause();
    }
  };

  const toggleMute = () => {
    const node = videoRef.current;
    if (!node) {
      return;
    }
    node.muted = !node.muted;
    setMuted(node.muted);
  };

  const changeRate = (value) => {
    const node = videoRef.current;
    if (node) {
      node.playbackRate = value;
    }
    setRate(value);
    setShowRate(false);
  };

  const toggleFullscreen = async () => {
    const node = wrapRef.current;
    if (!node) {
      return;
    }
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setFullscreen(false);
      return;
    }
    await node.requestFullscreen();
    setFullscreen(true);
  };

  useEffect(() => {
    const onKey = (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const node = videoRef.current;
      if (event.code === "Space") {
        event.preventDefault();
        if (!node) {
          return;
        }
        if (node.paused) {
          node.play().catch(() => {});
        } else {
          node.pause();
        }
      } else if (event.key === "ArrowRight" && node) {
        node.currentTime = Math.min(node.duration || 0, node.currentTime + 10);
      } else if (event.key === "ArrowLeft" && node) {
        node.currentTime = Math.max(0, node.currentTime - 10);
      } else if (event.key === "f") {
        toggleFullscreen();
      } else if (event.key === "m") {
        toggleMute();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-white/70">
        Đang mở bài giảng...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-4 text-center text-white">
        <p className="text-lg font-medium">{error || "Không tìm thấy khóa học"}</p>
        <a
          href={`/khoa-hoc/${slug}`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-white/20 bg-transparent text-white hover:bg-white/10",
          )}
        >
          Về trang khóa học
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-white/10 px-2 sm:px-4">
        <a
          href="/hoc-tap"
          className="inline-flex size-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Quay lại Học tập"
        >
          <ChevronLeft className="size-5" />
        </a>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{course.title}</p>
          <p className="hidden truncate text-xs text-white/55 sm:block">
            {current?.sectionTitle}
            {current ? ` · ${current.title}` : ""}
          </p>
        </div>
        <button
          type="button"
          className="hidden h-8 items-center gap-1 rounded-full px-2 text-xs text-white/75 transition hover:bg-white/10 sm:inline-flex"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              toast.success("Đã sao chép liên kết bài giảng");
            } catch {
              toast.error("Không thể sao chép liên kết");
            }
          }}
        >
          <Share2 className="size-3.5" />
          Chia sẻ
        </button>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 lg:hidden"
          aria-label={sidebar ? "Đóng nội dung" : "Mở nội dung"}
          onClick={() => setSidebar((value) => !value)}
        >
          {sidebar ? <X className="size-5" /> : <ListVideo className="size-5" />}
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            ref={wrapRef}
            className="relative bg-black"
            onMouseMove={revealControls}
            onClick={revealControls}
          >
            {current?.videoUrl ? (
              <video
                ref={videoRef}
                key={current.id}
                src={current.videoUrl}
                autoPlay
                playsInline
                className="aspect-video max-h-[min(70vh,780px)] w-full bg-black object-contain lg:max-h-[calc(100vh-12rem)]"
                onClick={(event) => {
                  event.stopPropagation();
                  togglePlay();
                }}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={(event) => {
                  const node = event.currentTarget;
                  setCurrentTime(node.currentTime);
                  if (!course.courseId || !current) {
                    return;
                  }
                  const sec = Math.floor(node.currentTime);
                  if (sec !== lastSavedSec.current) {
                    lastSavedSec.current = sec;
                    const positions = {
                      ...getPlayerProgress(course.courseId).positions,
                      [current.id]: sec,
                    };
                    persist({ lastLessonId: current.id, positions });
                  }
                  if (
                    node.duration > 0 &&
                    node.currentTime / node.duration >= 0.9
                  ) {
                    markDone(current.id);
                  }
                }}
                onLoadedMetadata={(event) => {
                  const node = event.currentTarget;
                  setDuration(node.duration || 0);
                  node.playbackRate = rate;
                  node.volume = volume;
                  node.muted = muted;
                  const saved = getPlayerProgress(course.courseId).positions[
                    current.id
                  ];
                  if (Number(saved) > 3) {
                    node.currentTime = Number(saved);
                  }
                }}
                onEnded={() => {
                  markDone(current.id);
                  if (nextLesson) {
                    selectLesson(nextLesson.id);
                  }
                }}
              />
            ) : (
              <div className="flex aspect-video max-h-[min(70vh,780px)] items-center justify-center text-sm text-white/60">
                Bài giảng này chưa có video
              </div>
            )}
            {current?.videoUrl && !playing ? (
              <button
                type="button"
                className="absolute inset-0 z-[5] flex items-center justify-center"
                aria-label="Phát"
                onClick={(event) => {
                  event.stopPropagation();
                  togglePlay();
                }}
              >
                <span className="flex size-16 items-center justify-center rounded-full bg-white text-zinc-950 shadow-2xl transition hover:scale-105">
                  <Play className="ml-0.5 size-7 fill-current" />
                </span>
              </button>
            ) : null}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 transition-opacity duration-300",
                controls ? "opacity-100" : "opacity-0",
              )}
            />
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 z-10 px-3 pb-3 transition-opacity duration-300 sm:px-5 sm:pb-4",
                controls ? "opacity-100" : "opacity-0",
              )}
            >
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={Math.min(currentTime, duration || 0)}
                className="h-1.5 w-full cursor-pointer accent-violet-500"
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (videoRef.current) {
                    videoRef.current.currentTime = value;
                  }
                  setCurrentTime(value);
                }}
              />
              <div className="mt-2 flex items-center gap-1.5 text-white sm:gap-2">
                <button
                  type="button"
                  className="rounded-full p-1.5 transition hover:bg-white/15"
                  aria-label={playing ? "Tạm dừng" : "Phát"}
                  onClick={togglePlay}
                >
                  {playing ? (
                    <Pause className="size-5 fill-current" />
                  ) : (
                    <Play className="size-5 fill-current" />
                  )}
                </button>
                <button
                  type="button"
                  className="rounded-full p-1.5 transition hover:bg-white/15"
                  aria-label="Tua lại 10 giây"
                  onClick={() => skip(-10)}
                >
                  <RotateCcw className="size-4" />
                </button>
                <button
                  type="button"
                  className="rounded-full p-1.5 transition hover:bg-white/15"
                  aria-label="Tua tới 10 giây"
                  onClick={() => skip(10)}
                >
                  <RotateCw className="size-4" />
                </button>
                <button
                  type="button"
                  className="rounded-full p-1.5 transition hover:bg-white/15"
                  aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
                  onClick={toggleMute}
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="size-4" />
                  ) : (
                    <Volume2 className="size-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  className="hidden w-20 accent-violet-500 sm:block"
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setVolume(value);
                    setMuted(value === 0);
                    if (videoRef.current) {
                      videoRef.current.volume = value;
                      videoRef.current.muted = value === 0;
                    }
                  }}
                />
                <span className="ml-1 text-[11px] text-white/80 sm:text-xs">
                  {formatClock(currentTime)} / {formatClock(duration)}
                </span>
                <span className="ml-auto" />
                <div className="relative">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition hover:bg-white/15"
                    onClick={() => setShowRate((value) => !value)}
                  >
                    <Gauge className="size-3.5" />
                    {rate}x
                  </button>
                  {showRate ? (
                    <div className="absolute right-0 bottom-9 z-20 min-w-24 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 py-1 shadow-xl">
                      {RATES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={cn(
                            "flex w-full px-3 py-1.5 text-left text-xs transition hover:bg-violet-600/80",
                            item === rate && "bg-violet-700",
                          )}
                          onClick={() => changeRate(item)}
                        >
                          {item}x
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="hidden rounded-full p-1.5 transition hover:bg-white/15 sm:inline-flex"
                  aria-label="Bài trước"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && selectLesson(prevLesson.id)}
                >
                  <SkipBack className="size-4" />
                </button>
                <button
                  type="button"
                  className="hidden rounded-full p-1.5 transition hover:bg-white/15 sm:inline-flex"
                  aria-label="Bài tiếp"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && selectLesson(nextLesson.id)}
                >
                  <SkipForward className="size-4" />
                </button>
                <button
                  type="button"
                  className="rounded-full p-1.5 transition hover:bg-white/15"
                  aria-label={fullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                  onClick={toggleFullscreen}
                >
                  {fullscreen ? (
                    <Minimize className="size-4" />
                  ) : (
                    <Maximize className="size-4" />
                  )}
                </button>
                <button
                  type="button"
                  className="hidden rounded-full p-1.5 transition hover:bg-white/15 lg:inline-flex"
                  aria-label="Nội dung khóa học"
                  onClick={() => setSidebar((value) => !value)}
                >
                  <ListVideo className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 bg-zinc-950">
            <div className="flex gap-1 overflow-x-auto px-3 sm:px-5">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "relative shrink-0 px-3 py-3 text-sm font-medium transition",
                    tab === item.id ? "text-white" : "text-white/55 hover:text-white",
                  )}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute inset-x-3 bottom-0 h-0.5 bg-white transition",
                      tab === item.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-background px-4 py-5 text-foreground sm:px-6">
            {tab === "overview" ? (
              <div className="max-w-3xl">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {current?.title || course.title}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {course.instructorName}
                  {current?.sectionTitle ? ` · ${current.sectionTitle}` : ""}
                </p>
                {course.subtitle ? (
                  <p className="mt-4 text-sm leading-relaxed">{course.subtitle}</p>
                ) : null}
                {course.description ? (
                  <div
                    className="prose prose-sm mt-4 max-w-none text-muted-foreground dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                ) : null}
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="bg-violet-700 text-white hover:bg-violet-800"
                    onClick={() => current && toggleDone(current.id)}
                  >
                    {current && completedSet.has(current.id)
                      ? "Bỏ hoàn thành"
                      : "Đánh dấu hoàn thành"}
                  </Button>
                  {nextLesson ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => selectLesson(nextLesson.id)}
                    >
                      Bài tiếp theo
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
            {tab === "notes" ? (
              <div className="max-w-3xl">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <StickyNote className="size-4 text-violet-700" />
                  Ghi chú cho bài này
                </div>
                <textarea
                  value={note}
                  rows={8}
                  placeholder="Viết ghi chú của bạn..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-violet-700/30"
                  onChange={(event) => {
                    setNote(event.target.value);
                    if (course.courseId && current) {
                      saveLessonNote(course.courseId, current.id, event.target.value);
                    }
                  }}
                />
              </div>
            ) : null}
            {tab === "tools" ? (
              <div className="grid max-w-3xl gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border p-4">
                  <BookOpen className="size-5 text-violet-700" />
                  <p className="mt-2 font-medium">Phím tắt</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Space phát/dừng · ← → tua 10s · M tắt tiếng · F toàn màn hình
                  </p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <Gauge className="size-5 text-violet-700" />
                  <p className="mt-2 font-medium">Tốc độ phát</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Chọn tốc độ từ 0.5x đến 2x ngay trên thanh điều khiển.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {sidebar ? (
          <aside className="fixed inset-0 z-40 bg-black/50 lg:static lg:z-0 lg:w-[360px] lg:shrink-0 lg:bg-transparent">
            <button
              type="button"
              className="absolute inset-0 lg:hidden"
              aria-label="Đóng nội dung"
              onClick={() => setSidebar(false)}
            />
            <div className="absolute inset-y-0 right-0 flex h-full w-[min(100%,22rem)] flex-col border-l border-white/10 bg-zinc-950 lg:static lg:w-full">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Nội dung khóa học</p>
                  <p className="text-xs text-white/55">
                    {doneCount}/{lessons.length} bài · {percent}%
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                  onClick={() => setSidebar(false)}
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="h-1 bg-white/10">
                <div
                  className="h-full bg-violet-500 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {sections.map((section, index) => {
                  const opened = openSections.includes(section.id);
                  const items = section.lessons || [];
                  const doneInSection = items.filter((item) =>
                    completedSet.has(item.id),
                  ).length;
                  return (
                    <div key={section.id} className="border-b border-white/10">
                      <button
                        type="button"
                        className="flex w-full items-start justify-between gap-2 px-4 py-3 text-left transition hover:bg-white/5"
                        onClick={() =>
                          setOpenSections((prev) =>
                            prev.includes(section.id)
                              ? prev.filter((id) => id !== section.id)
                              : [...prev, section.id],
                          )
                        }
                      >
                        <span>
                          <span className="block text-sm font-medium">
                            Phần {index + 1}: {section.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-white/50">
                            {doneInSection}/{items.length} ·{" "}
                            {formatClock(section.durationSeconds)}
                          </span>
                        </span>
                        <ChevronDown
                          className={cn(
                            "mt-0.5 size-4 shrink-0 text-white/50 transition",
                            opened ? "rotate-0" : "-rotate-90",
                          )}
                        />
                      </button>
                      {opened ? (
                        <ul>
                          {items.map((lesson) => {
                            const active = current?.id === lesson.id;
                            const done = completedSet.has(lesson.id);
                            return (
                              <li key={lesson.id}>
                                <button
                                  type="button"
                                  className={cn(
                                    "flex w-full items-start gap-2 px-4 py-2.5 text-left text-sm transition",
                                    active
                                      ? "bg-violet-700/80 text-white"
                                      : "text-white/80 hover:bg-white/5",
                                  )}
                                  onClick={() => {
                                    selectLesson(lesson.id);
                                    if (window.innerWidth < 1024) {
                                      setSidebar(false);
                                    }
                                  }}
                                >
                                  {done ? (
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                                  ) : (
                                    <Circle className="mt-0.5 size-4 shrink-0 text-white/35" />
                                  )}
                                  <span className="min-w-0 flex-1">
                                    <span className="block leading-snug">
                                      {lesson.title}
                                    </span>
                                    <span
                                      className={cn(
                                        "mt-0.5 block text-xs",
                                        active ? "text-white/70" : "text-white/40",
                                      )}
                                    >
                                      {formatClock(lesson.durationSeconds)}
                                    </span>
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
};

export default CoursePlayerPage;
