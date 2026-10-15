import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Bell,
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
  mergeWatchRange,
  recordStreakVisit,
  saveLessonNote,
  savePlayerProgress,
  watchCoveragePercent,
} from "@/lib/learning";
import { CERT_PASS, courseWatchPercent, gradeMeta } from "@/lib/certificate";
import {
  getInboxItems,
  inboxUnread,
  loadInbox,
  loadInboxCount,
  markInboxRead,
  onInboxChange,
} from "@/lib/inbox";
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
  const userId = getAuthUser()?.id || null;
  const videoRef = useRef(null);
  const wrapRef = useRef(null);
  const hideTimer = useRef(null);
  const lastSavedSec = useRef(-1);
  const progressRef = useRef(null);
  const clockRef = useRef(null);
  const durationRef = useRef(0);
  const controlsRef = useRef(true);
  const completedRef = useRef([]);
  const currentIdRef = useRef(null);
  const watchedRef = useRef({});
  const rangesRef = useRef({});
  const lastPlayheadRef = useRef(null);
  const seekingRef = useRef(false);
  const seekWarnedRef = useRef(new Set());
  const seekTimerRef = useRef(0);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lessonId, setLessonId] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [duration, setDuration] = useState(0);
  const [controls, setControls] = useState(true);
  const [sidebar, setSidebar] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true,
  );
  const [openSections, setOpenSections] = useState([]);
  const [tab, setTab] = useState("overview");
  const [note, setNote] = useState("");
  const [showRate, setShowRate] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [watched, setWatched] = useState({});
  const [watchTick, setWatchTick] = useState(0);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [unread, setUnread] = useState(() => inboxUnread());
  const [inboxItems, setInboxItems] = useState(() => getInboxItems());
  const inboxRef = useRef(null);

  completedRef.current = completed;

  const sections = Array.isArray(course?.sections) ? course.sections : [];
  const lessons = useMemo(() => flattenLessons(sections), [sections]);
  const current = lessons.find((item) => item.id === lessonId) || lessons[0] || null;
  currentIdRef.current = current?.id || null;
  const currentIndex = current
    ? lessons.findIndex((item) => item.id === current.id)
    : -1;
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 ? lessons[currentIndex + 1] : null;
  const completedSet = useMemo(() => new Set(completed), [completed]);
  const doneCount = lessons.filter((item) => completedSet.has(item.id)).length;
  const percent = Math.round(
    courseWatchPercent(lessons, completed, watched, rangesRef.current),
  );
  const certMeta = gradeMeta(course?.grade, percent);

  const persist = useCallback(
    (patch) => {
      if (!course?.courseId) {
        return getPlayerProgress(0);
      }
      return savePlayerProgress(course.courseId, {
        watchedRanges: rangesRef.current,
        ...patch,
      });
    },
    [course?.courseId],
  );

  const noteSeekSkip = useCallback((id, from, to) => {
    if (from == null || to <= from + 2.2 || !id || seekWarnedRef.current.has(id)) {
      return;
    }
    seekWarnedRef.current.add(id);
    toast.message("Phần tua nhanh không được tính vào tiến độ chứng chỉ");
  }, []);

  const armSeek = useCallback(() => {
    seekingRef.current = true;
    window.clearTimeout(seekTimerRef.current);
    seekTimerRef.current = window.setTimeout(() => {
      seekingRef.current = false;
    }, 280);
  }, []);

  const creditWatch = useCallback((node, id) => {
    if (!node || !id || !(node.duration > 0)) {
      return Number(watchedRef.current[id]) || 0;
    }
    const now = node.currentTime;
    const last = lastPlayheadRef.current;
    if (seekingRef.current) {
      return Number(watchedRef.current[id]) || 0;
    }
    if (last == null) {
      lastPlayheadRef.current = now;
      return Number(watchedRef.current[id]) || 0;
    }
    const rate = Number(node.playbackRate) || 1;
    const maxJump = Math.max(2.8, rate * 1.8);
    if (now > last + maxJump) {
      noteSeekSkip(id, last, now);
      lastPlayheadRef.current = now;
      return Number(watchedRef.current[id]) || 0;
    }
    if (now > last) {
      rangesRef.current = {
        ...rangesRef.current,
        [id]: mergeWatchRange(rangesRef.current[id], last, now),
      };
      watchedRef.current = {
        ...watchedRef.current,
        [id]: watchCoveragePercent(rangesRef.current[id], node.duration),
      };
    }
    lastPlayheadRef.current = now;
    return Number(watchedRef.current[id]) || 0;
  }, [noteSeekSkip]);

  const selectLesson = useCallback(
    (id) => {
      const lesson = lessons.find((item) => item.id === id);
      if (!lesson || lesson.id === currentIdRef.current) {
        return;
      }
      setLessonId(lesson.id);
      setOpenSections((prev) =>
        prev.includes(lesson.sectionId) ? prev : [...prev, lesson.sectionId],
      );
      persist({ lastLessonId: lesson.id });
      lastSavedSec.current = -1;
      lastPlayheadRef.current = null;
      seekingRef.current = false;
      window.history.replaceState(null, "", `/hoc/${slug}?bai=${lesson.id}`);
    },
    [lessons, persist, slug],
  );

  useEffect(() => {
    if (!userId) {
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
        completedRef.current = progress.completed;
        watchedRef.current = progress.watched || {};
        rangesRef.current = progress.watchedRanges || {};
        setCompleted(progress.completed);
        setWatched(watchedRef.current);
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
  }, [slug, userId]);

  useEffect(() => {
    if (course?.courseId && lessonId) {
      setNote(getLessonNote(course.courseId, lessonId));
    }
  }, [course?.courseId, lessonId]);

  useEffect(() => {
    if (!course?.courseId || !lessons.length) {
      return undefined;
    }
    const value = courseWatchPercent(
      lessons,
      completed,
      watchedRef.current,
      rangesRef.current,
    );
    const timer = window.setTimeout(() => {
      authPut(`/api/learning/courses/${encodeURIComponent(slug)}/progress`, {
        percent: value,
      })
        .then((data) => {
          setCourse((prev) =>
            prev
              ? {
                  ...prev,
                  progressPercent: data.progressPercent,
                  certificateCode: data.certificateCode,
                  grade: data.grade,
                  gradeLabel: data.gradeLabel,
                  issuesCertificate: data.issuesCertificate,
                }
              : prev,
          );
          if (data.certificateCode && !course.certificateCode) {
            toast.success(`Đã cấp chứng chỉ xếp loại ${data.gradeLabel}`, {
              action: {
                label: "Xem bằng",
                onClick: () => {
                  window.location.href = `/chung-chi/${data.certificateCode}`;
                },
              },
            });
            window.setTimeout(() => loadInbox(), 700);
          } else if (
            data.certificateCode &&
            data.grade &&
            course.grade &&
            data.grade !== course.grade
          ) {
            toast.success(`Chứng chỉ đã lên hạng ${data.gradeLabel}`, {
              action: {
                label: "Xem bằng",
                onClick: () => {
                  window.location.href = `/chung-chi/${data.certificateCode}`;
                },
              },
            });
            window.setTimeout(() => loadInbox(), 700);
          }
        })
        .catch(() => {});
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [completed, course?.certificateCode, course?.courseId, course?.grade, lessons, slug, watchTick]);

  useEffect(() => {
    loadInbox().then((rows) => {
      setInboxItems(Array.isArray(rows) ? rows : getInboxItems());
      setUnread(inboxUnread());
    });
    const stop = onInboxChange((state) => {
      setUnread(state.unread || 0);
      setInboxItems(state.items || []);
    });
    const poll = window.setInterval(() => {
      loadInboxCount().then(setUnread);
    }, 15000);
    return () => {
      stop();
      window.clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (!inboxOpen) {
      return undefined;
    }
    const onClick = (event) => {
      if (inboxRef.current && !inboxRef.current.contains(event.target)) {
        setInboxOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [inboxOpen]);

  const markDone = useCallback(
    (id) => {
      if (!id || completedRef.current.includes(id)) {
        return;
      }
      const next = [...completedRef.current, id];
      completedRef.current = next;
      setCompleted(next);
      persist({
        completed: next,
        lastLessonId: id,
        watched: watchedRef.current,
        watchedRanges: rangesRef.current,
      });
    },
    [persist],
  );

  const toggleDone = (id) => {
    const next = completedSet.has(id)
      ? completed.filter((value) => value !== id)
      : [...completed, id];
    completedRef.current = next;
    setCompleted(next);
    persist({
      completed: next,
      watched: watchedRef.current,
      watchedRanges: rangesRef.current,
    });
  };

  const revealControls = () => {
    if (!controlsRef.current) {
      controlsRef.current = true;
      setControls(true);
    }
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        controlsRef.current = false;
        setControls(false);
      }
    }, 2200);
  };

  const skip = (delta) => {
    const node = videoRef.current;
    if (!node) {
      return;
    }
    armSeek();
    const from = lastPlayheadRef.current ?? node.currentTime;
    node.currentTime = Math.min(
      node.duration || 0,
      Math.max(0, node.currentTime + delta),
    );
    if (delta > 0) {
      noteSeekSkip(currentIdRef.current, from, node.currentTime);
    }
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
        armSeek();
        const from = lastPlayheadRef.current ?? node.currentTime;
        node.currentTime = Math.min(node.duration || 0, node.currentTime + 10);
        noteSeekSkip(currentIdRef.current, from, node.currentTime);
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

  const paintTime = (time) => {
    if (progressRef.current) {
      progressRef.current.value = String(time);
    }
    if (clockRef.current) {
      clockRef.current.textContent = `${formatClock(time)} / ${formatClock(durationRef.current)}`;
    }
  };

  if (!userId) {
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
        {course.certificateCode ? (
          <a
            href={`/chung-chi/${course.certificateCode}`}
            className="hidden h-8 items-center gap-1 rounded-none bg-violet-700 px-2.5 text-xs font-semibold text-white transition hover:bg-violet-800 sm:inline-flex"
          >
            <Award className="size-3.5" />
            Chứng chỉ
          </a>
        ) : null}
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs text-white/75 transition hover:bg-white/10"
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
          <span className="hidden sm:inline">Chia sẻ</span>
        </button>
        <div className="relative" ref={inboxRef}>
          <button
            type="button"
            className="relative inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs text-white/75 transition hover:bg-white/10"
            aria-label="Thông báo"
            aria-expanded={inboxOpen}
            onClick={() => {
              setInboxOpen((value) => !value);
              if (!inboxOpen) {
                loadInbox();
              }
            }}
          >
            <Bell className="size-3.5" />
            <span className="hidden sm:inline">Thông báo</span>
            {unread > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-semibold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </button>
          {inboxOpen ? (
            <div className="absolute top-10 right-0 z-50 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
                <p className="text-sm font-semibold">Thông báo</p>
                <a
                  href="/thong-bao"
                  className="text-xs text-violet-300 hover:text-violet-200"
                >
                  Xem tất cả
                </a>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {inboxItems.length === 0 ? (
                  <p className="px-3 py-8 text-center text-sm text-white/55">
                    Chưa có thông báo
                  </p>
                ) : (
                  inboxItems.slice(0, 6).map((item) => (
                    <a
                      key={item.id}
                      href={item.href || "/thong-bao"}
                      className={cn(
                        "block border-b border-white/5 px-3 py-2.5 transition hover:bg-white/5",
                        item.isRead ? "opacity-70" : "bg-white/5",
                      )}
                      onClick={() => {
                        if (!item.isRead) {
                          void markInboxRead(item.id);
                        }
                      }}
                    >
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-white/55">{item.body}</p>
                    </a>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 md:hidden"
          aria-label={sidebar ? "Đóng nội dung" : "Mở nội dung"}
          onClick={() => setSidebar((value) => !value)}
        >
          {sidebar ? <X className="size-5" /> : <ListVideo className="size-5" />}
        </button>
      </header>
      {course.issuesCertificate ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-white/5 px-3 py-2 text-xs sm:px-4">
          <p className="inline-flex items-center gap-1.5 text-white/80">
            <Award className="size-3.5 text-violet-300" />
            {course.certificateCode
              ? `Đã cấp chứng chỉ · ${course.gradeLabel || certMeta.label} · ${percent}% xem video`
              : percent >= CERT_PASS
                ? `Đủ điều kiện nhận chứng chỉ · ${certMeta.label}`
                : `Xem từ ${CERT_PASS}% video để nhận chứng chỉ · Hiện tại ${percent}% · ${certMeta.label}`}
          </p>
          {course.certificateCode ? (
            <a href={`/chung-chi/${course.certificateCode}`} className="font-medium text-violet-300 hover:text-violet-200">
              Xem bằng cấp
            </a>
          ) : (
            <span className="text-white/50">Tua nhanh không tính · 50% TB · 65% Khá · 80% Giỏi · 90% Xuất sắc</span>
          )}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            ref={wrapRef}
            className="relative bg-black"
            onMouseMove={revealControls}
          >
            {current?.videoUrl ? (
              <video
                ref={videoRef}
                key={current.id}
                src={current.videoUrl}
                autoPlay
                playsInline
                className="aspect-video max-h-[min(70vh,780px)] w-full bg-black object-contain md:max-h-[calc(100vh-12rem)]"
                onClick={togglePlay}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onSeeking={() => {
                  armSeek();
                }}
                onSeeked={(event) => {
                  const node = event.currentTarget;
                  const id = currentIdRef.current;
                  const from = lastPlayheadRef.current;
                  const to = node.currentTime;
                  noteSeekSkip(id, from, to);
                  lastPlayheadRef.current = to;
                  seekingRef.current = false;
                }}
                onTimeUpdate={(event) => {
                  const node = event.currentTarget;
                  paintTime(node.currentTime);
                  const courseId = course.courseId;
                  const id = currentIdRef.current;
                  if (!courseId || !id) {
                    return;
                  }
                  const coverage = creditWatch(node, id);
                  const sec = Math.floor(node.currentTime);
                  if (sec - lastSavedSec.current >= 5 || lastSavedSec.current < 0) {
                    lastSavedSec.current = sec;
                    const positions = {
                      ...getPlayerProgress(courseId).positions,
                      [id]: sec,
                    };
                    persist({
                      lastLessonId: id,
                      positions,
                      watched: watchedRef.current,
                      watchedRanges: rangesRef.current,
                    });
                    setWatched({ ...watchedRef.current });
                    setWatchTick((value) => value + 1);
                  }
                  if (coverage >= 90) {
                    markDone(id);
                  }
                }}
                onLoadedMetadata={(event) => {
                  const node = event.currentTarget;
                  durationRef.current = node.duration || 0;
                  setDuration(durationRef.current);
                  node.playbackRate = rate;
                  node.volume = volume;
                  node.muted = muted;
                  const saved = getPlayerProgress(course.courseId).positions[current.id];
                  if (Number(saved) > 3) {
                    node.currentTime = Number(saved);
                  }
                  lastPlayheadRef.current = node.currentTime;
                  seekingRef.current = false;
                  paintTime(node.currentTime);
                  if (progressRef.current) {
                    progressRef.current.max = String(durationRef.current);
                  }
                }}
                onEnded={(event) => {
                  const node = event.currentTarget;
                  const coverage = creditWatch(node, current.id);
                  if (coverage >= 90) {
                    markDone(current.id);
                  }
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
                onClick={togglePlay}
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
                controls ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <input
                ref={progressRef}
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                defaultValue={0}
                className="h-1.5 w-full cursor-pointer accent-violet-500"
                onChange={(event) => {
                  const value = Number(event.target.value);
                  armSeek();
                  const from = lastPlayheadRef.current;
                  if (videoRef.current) {
                    videoRef.current.currentTime = value;
                  }
                  noteSeekSkip(currentIdRef.current, from, value);
                  paintTime(value);
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
                <span
                  ref={clockRef}
                  className="ml-1 text-[11px] text-white/80 sm:text-xs"
                >
                  {formatClock(0)} / {formatClock(duration)}
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
                  className="hidden rounded-full p-1.5 transition hover:bg-white/15 md:inline-flex"
                  aria-label="Nội dung khóa học"
                  onClick={() => setSidebar((value) => !value)}
                >
                  <ListVideo className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative z-10 border-b border-white/10 bg-zinc-950">
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

          <div className="relative z-10 flex-1 bg-background px-4 py-5 text-foreground sm:px-6">
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
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {course.description}
                  </p>
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
                    Space phát/dừng · ← → tua 10s (tua tới không tính tiến độ) · M tắt tiếng · F toàn màn hình
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
          <>
            <button
              type="button"
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              aria-label="Đóng nội dung"
              onClick={() => setSidebar(false)}
            />
            <aside className="fixed inset-y-0 right-0 z-40 flex h-full w-[min(100%,22rem)] flex-col border-l border-white/10 bg-zinc-950 md:static md:z-0 md:h-auto md:w-[320px] md:shrink-0 lg:w-[360px]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Nội dung khóa học</p>
                  <p className="text-xs text-white/55">
                    {doneCount}/{lessons.length} bài · {percent}% xem video
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white md:hidden"
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
                                    if (window.innerWidth < 768) {
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
            </aside>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default CoursePlayerPage;
