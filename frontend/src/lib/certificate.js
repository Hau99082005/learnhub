export const CERT_PASS = 50;

export const CERT_SCALE = [
  { grade: "XUAT_SAC", label: "Xuất sắc", min: 90, hint: "Xem từ 90% video" },
  { grade: "GIOI", label: "Giỏi", min: 80, hint: "Xem từ 80% video" },
  { grade: "KHA", label: "Khá", min: 65, hint: "Xem từ 65% video" },
  { grade: "TRUNG_BINH", label: "Trung bình", min: 50, hint: "Xem từ 50% video" },
  { grade: "KHONG_DAT", label: "Không đạt", min: 0, hint: "Dưới 50% video" },
];

export function gradeOf(percent) {
  const value = Number(percent);
  if (!Number.isFinite(value) || value < CERT_PASS) {
    return "KHONG_DAT";
  }
  if (value >= 90) {
    return "XUAT_SAC";
  }
  if (value >= 80) {
    return "GIOI";
  }
  if (value >= 65) {
    return "KHA";
  }
  return "TRUNG_BINH";
}

export function gradeMeta(grade, percent) {
  const key = grade || gradeOf(percent);
  const found = CERT_SCALE.find((item) => item.grade === key) || CERT_SCALE[4];
  const tones = {
    XUAT_SAC: {
      badge: "bg-amber-400 text-amber-950",
      chip: "text-amber-700 bg-amber-50 border-amber-200",
      bar: "bg-amber-400",
      glow: "from-amber-300/40 via-yellow-200/20 to-transparent",
      seal: "from-amber-300 via-yellow-400 to-amber-600",
    },
    GIOI: {
      badge: "bg-emerald-500 text-white",
      chip: "text-emerald-700 bg-emerald-50 border-emerald-200",
      bar: "bg-emerald-500",
      glow: "from-emerald-300/35 via-teal-200/15 to-transparent",
      seal: "from-emerald-300 via-teal-400 to-emerald-700",
    },
    KHA: {
      badge: "bg-sky-500 text-white",
      chip: "text-sky-700 bg-sky-50 border-sky-200",
      bar: "bg-sky-500",
      glow: "from-sky-300/35 via-indigo-200/15 to-transparent",
      seal: "from-sky-300 via-blue-400 to-indigo-600",
    },
    TRUNG_BINH: {
      badge: "bg-violet-600 text-white",
      chip: "text-violet-700 bg-violet-50 border-violet-200",
      bar: "bg-violet-600",
      glow: "from-violet-300/30 via-fuchsia-200/10 to-transparent",
      seal: "from-violet-300 via-violet-500 to-indigo-700",
    },
    KHONG_DAT: {
      badge: "bg-rose-500 text-white",
      chip: "text-rose-700 bg-rose-50 border-rose-200",
      bar: "bg-rose-500",
      glow: "from-rose-300/25 to-transparent",
      seal: "from-rose-300 via-rose-400 to-rose-600",
    },
  };
  return {
    ...found,
    ...(tones[found.grade] || tones.KHONG_DAT),
  };
}

export function formatCertDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function courseWatchPercent(lessons, completed, watched) {
  const rows = Array.isArray(lessons) ? lessons : [];
  if (!rows.length) {
    return 0;
  }
  const done = new Set(completed || []);
  let sum = 0;
  for (const lesson of rows) {
    if (done.has(lesson.id)) {
      sum += 100;
      continue;
    }
    const raw = Number(watched?.[lesson.id]);
    sum += Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 0;
  }
  return sum / rows.length;
}
