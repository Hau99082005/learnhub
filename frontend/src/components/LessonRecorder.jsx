import { useEffect, useRef, useState } from "react";
import { Circle, Monitor, Square, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function pickMime() {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9",
    "video/webm",
  ];
  if (typeof MediaRecorder === "undefined") {
    return "";
  }
  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "video/webm";
}

function formatClock(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function stopStream(stream) {
  if (!stream) {
    return;
  }
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      return;
    }
  });
}

const LessonRecorder = ({ disabled, onCapture }) => {
  const liveRef = useRef(null);
  const playbackRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const extrasRef = useRef([]);
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);
  const finishRef = useRef(() => {});
  const [mode, setMode] = useState("camera");
  const [phase, setPhase] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const release = () => {
    clearTimer();
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try {
        recorderRef.current.stop();
      } catch {
        return;
      }
    }
    recorderRef.current = null;
    extrasRef.current.forEach(stopStream);
    extrasRef.current = [];
    if (liveRef.current) {
      liveRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      release();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const openStream = async (nextMode) => {
    extrasRef.current.forEach(stopStream);
    extrasRef.current = [];
    if (nextMode === "screen") {
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });
      extrasRef.current.push(display);
      let mic = null;
      try {
        mic = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        extrasRef.current.push(mic);
      } catch {
        mic = null;
      }
      const mixed = new MediaStream(display.getVideoTracks());
      const audioTracks = mic?.getAudioTracks()?.length
        ? mic.getAudioTracks()
        : display.getAudioTracks();
      audioTracks.forEach((track) => mixed.addTrack(track));
      display.getVideoTracks()[0]?.addEventListener("ended", () => {
        finishRef.current();
      });
      return mixed;
    }
    const camera = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
    });
    extrasRef.current.push(camera);
    return camera;
  };

  const prepare = async (nextMode) => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Trình duyệt không hỗ trợ ghi hình");
      return;
    }
    try {
      const stream = await openStream(nextMode);
      if (liveRef.current) {
        liveRef.current.srcObject = stream;
        await liveRef.current.play().catch(() => {});
      }
      setMode(nextMode);
      setPhase("ready");
      setSeconds(0);
    } catch (error) {
      toast.error(
        error?.name === "NotAllowedError"
          ? "Bạn cần cho phép camera hoặc màn hình để ghi hình"
          : "Không mở được thiết bị ghi hình",
      );
    }
  };

  const start = () => {
    const stream = liveRef.current?.srcObject;
    if (!stream) {
      toast.error("Chưa có nguồn ghi hình");
      return;
    }
    const mime = pickMime();
    if (!mime) {
      toast.error("Trình duyệt không hỗ trợ ghi hình");
      return;
    }
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2_500_000 });
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mime.split(";")[0] });
      chunksRef.current = [];
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPhase("review");
      extrasRef.current.forEach(stopStream);
      extrasRef.current = [];
      if (liveRef.current) {
        liveRef.current.srcObject = null;
      }
    };
    recorderRef.current = recorder;
    recorder.start(1000);
    startedAtRef.current = Date.now();
    setPhase("recording");
    setSeconds(0);
    clearTimer();
    timerRef.current = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);
  };

  const finish = () => {
    clearTimer();
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    recorderRef.current = null;
  };
  finishRef.current = finish;

  const discard = () => {
    release();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setPhase("idle");
    setSeconds(0);
  };

  const useClip = () => {
    if (!previewUrl) {
      return;
    }
    fetch(previewUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const type = blob.type || "video/webm";
        const ext = type.includes("mp4") ? "mp4" : "webm";
        const file = new File([blob], `ghi-hinh-${Date.now()}.${ext}`, {
          type,
          lastModified: Date.now(),
        });
        onCapture?.(file);
        discard();
      })
      .catch(() => {
        toast.error("Không lấy được video vừa ghi");
      });
  };

  return (
    <div className="grid gap-3 border border-border bg-muted/40 p-3" style={{ borderRadius: "5px" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Ghi hình bài giảng</p>
        {phase === "recording" ? (
          <span className="text-sm font-medium text-red-500">{formatClock(seconds)}</span>
        ) : null}
      </div>
      {phase === "idle" ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => prepare("camera")}
            style={{ borderRadius: "5px" }}
          >
            <Video className="size-4" />
            Camera và micro
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => prepare("screen")}
            style={{ borderRadius: "5px" }}
          >
            <Monitor className="size-4" />
            Màn hình và micro
          </Button>
        </div>
      ) : null}
      <video
        ref={liveRef}
        muted
        autoPlay
        playsInline
        className={
          phase === "ready" || phase === "recording"
            ? "aspect-video w-full bg-black object-contain"
            : "hidden"
        }
        style={{ borderRadius: "5px" }}
      />
      {phase === "review" && previewUrl ? (
        <video
          src={previewUrl}
          controls
          playsInline
          className="aspect-video w-full bg-black object-contain"
          style={{ borderRadius: "5px" }}
        />
      ) : null}
      {phase === "ready" ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={disabled} onClick={start} style={{ borderRadius: "5px" }}>
            <Circle className="size-4 fill-red-500 text-red-500" />
            Bắt đầu ghi
          </Button>
          <Button type="button" variant="outline" onClick={discard} style={{ borderRadius: "5px" }}>
            Hủy
          </Button>
        </div>
      ) : null}
      {phase === "recording" ? (
        <Button type="button" variant="destructive" onClick={finish} style={{ borderRadius: "5px" }}>
          <Square className="size-4 fill-current" />
          Dừng ghi
        </Button>
      ) : null}
      {phase === "review" ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={disabled} onClick={useClip} style={{ borderRadius: "5px" }}>
            Dùng video này
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => prepare(mode)}
            style={{ borderRadius: "5px" }}
          >
            Ghi lại
          </Button>
          <Button type="button" variant="outline" onClick={discard} style={{ borderRadius: "5px" }}>
            Hủy
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default LessonRecorder;
