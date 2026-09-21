import { useEffect, useMemo, useState } from "react";
import { BookOpen, ImagePlus, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { CourseCurriculum } from "@/admin/courses/CourseCurriculum";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { authDelete, authForm, authGet } from "@/lib/auth";
import { uploadCourseVideo } from "@/lib/courseVideo";

const LEVELS = [
  { value: "ALL", label: "Mọi cấp độ" },
  { value: "BEGINNER", label: "Cơ bản" },
  { value: "INTERMEDIATE", label: "Trung cấp" },
  { value: "ADVANCED", label: "Nâng cao" },
];

const STATUSES = [
  { value: "DRAFT", label: "Nháp" },
  { value: "PUBLISHED", label: "Xuất bản" },
  { value: "ARCHIVED", label: "Lưu trữ" },
];

const SELECT_CLASS =
  "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground scheme-light dark:bg-card dark:text-card-foreground dark:scheme-dark";
const OPTION_CLASS = "bg-background text-foreground dark:bg-card dark:text-card-foreground";

const EMPTY = {
  instructorId: "",
  categoryId: "",
  title: "",
  subtitle: "",
  description: "",
  language: "vi",
  level: "ALL",
  status: "DRAFT",
  price: "0",
  compareAtPrice: "",
  currency: "VND",
  isFree: true,
  issuesCertificate: false,
  whatYouWillLearn: "",
  requirements: "",
  previewVideo: "",
  durationSeconds: 0,
};

function linesFromList(items) {
  if (!Array.isArray(items)) {
    return "";
  }
  return items.join("\n");
}

function statusLabel(value) {
  return STATUSES.find((item) => item.value === value)?.label || value;
}

const AllCourse = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [courses, cats, teachers] = await Promise.all([
        authGet("/api/admin/courses"),
        authGet("/api/admin/categories"),
        authGet("/api/admin/courses/instructors"),
      ]);
      setItems(Array.isArray(courses) ? courses : []);
      setCategories(Array.isArray(cats) ? cats : []);
      setInstructors(Array.isArray(teachers) ? teachers : []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!file) {
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...EMPTY,
      instructorId: instructors[0]?.id ? String(instructors[0].id) : "",
    });
    setFile(null);
    setPreview("");
    setVideoFile(null);
    setVideoProgress(0);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      instructorId: item.instructorId ? String(item.instructorId) : "",
      categoryId: item.categoryId ? String(item.categoryId) : "",
      title: item.title || "",
      subtitle: item.subtitle || "",
      description: item.description || "",
      language: item.language || "vi",
      level: item.level || "ALL",
      status: item.status || "DRAFT",
      price:
        item.price != null && Number(item.price) > 0
          ? String(item.price)
          : item.currency && /^\d+([.,]\d+)?$/.test(String(item.currency))
            ? String(item.currency)
            : "0",
      compareAtPrice:
        item.compareAtPrice == null ? "" : String(item.compareAtPrice),
      currency: /^[A-Za-z]{3}$/.test(item.currency || "")
        ? String(item.currency).toUpperCase()
        : "VND",
      isFree:
        item.price != null && Number(item.price) > 0
          ? false
          : item.isFree !== false,
      issuesCertificate: item.issuesCertificate === true,
      whatYouWillLearn: linesFromList(item.whatYouWillLearn),
      requirements: linesFromList(item.requirements),
      previewVideo: item.previewVideo || "",
      durationSeconds: item.durationSeconds || 0,
    });
    setFile(null);
    setPreview(item.images || "");
    setVideoFile(null);
    setVideoProgress(0);
    setFormOpen(true);
  };

  const onPickImage = (event) => {
    const next = event.target.files?.[0];
    if (!next) {
      return;
    }
    if (!next.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }
    setFile(next);
  };

  const onPickVideo = (event) => {
    const next = event.target.files?.[0];
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
    setVideoFile(next);
    const url = URL.createObjectURL(next);
    const player = document.createElement("video");
    player.preload = "metadata";
    player.onloadedmetadata = () => {
      const seconds = Number.isFinite(player.duration)
        ? Math.round(player.duration)
        : 0;
      URL.revokeObjectURL(url);
      if (seconds > 0) {
        setForm((prev) => ({ ...prev, durationSeconds: seconds }));
      }
    };
    player.onerror = () => URL.revokeObjectURL(url);
    player.src = url;
  };

  const uploadVideo = async () => {
    if (!videoFile) {
      toast.error("Vui lòng chọn video demo");
      return;
    }
    setUploadingVideo(true);
    setVideoProgress(1);
    try {
      const ready = await uploadCourseVideo(videoFile, setVideoProgress);
      setForm((prev) => ({
        ...prev,
        previewVideo: ready.previewVideo,
        durationSeconds: ready.durationSeconds || prev.durationSeconds,
      }));
      setVideoFile(null);
      toast.success("Đã tải và nén video demo");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploadingVideo(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!editing && !file) {
      toast.error("Vui lòng tải ảnh khóa học");
      return;
    }
    const title = form.title.trim();
    if (!title) {
      toast.error("Vui lòng nhập tên khóa học");
      return;
    }
    const amount = Number(String(form.price || "0").replace(",", "."));
    const paid = Number.isFinite(amount) && amount > 0;
    setSaving(true);
    let previewVideo = form.previewVideo;
    let durationSeconds = form.durationSeconds || 0;
    try {
      if (videoFile) {
        setUploadingVideo(true);
        setVideoProgress(1);
        const ready = await uploadCourseVideo(videoFile, setVideoProgress);
        previewVideo = ready.previewVideo || previewVideo;
        durationSeconds = ready.durationSeconds || durationSeconds;
        setForm((prev) => ({
          ...prev,
          previewVideo,
          durationSeconds,
          isFree: !paid,
        }));
        setVideoFile(null);
      }
    } catch (error) {
      toast.error(error.message);
      setUploadingVideo(false);
      setSaving(false);
      return;
    }
    const payload = new FormData();
    payload.append("title", title);
    payload.append("subtitle", form.subtitle.trim());
    payload.append("description", form.description.trim());
    payload.append("language", form.language);
    payload.append("level", form.level);
    payload.append("status", form.status);
    payload.append("price", paid ? String(form.price).trim() : "0");
    if (form.compareAtPrice.trim()) {
      payload.append("compareAtPrice", form.compareAtPrice.trim());
    }
    payload.append("currency", /^[A-Za-z]{3}$/.test(form.currency || "") ? form.currency.toUpperCase() : "VND");
    payload.append("isFree", String(!paid));
    payload.append("issuesCertificate", String(form.issuesCertificate));
    payload.append("durationSeconds", String(durationSeconds || 0));
    payload.append("whatYouWillLearn", form.whatYouWillLearn);
    payload.append("requirements", form.requirements);
    if (form.instructorId) {
      payload.append("instructorId", form.instructorId);
    }
    if (form.categoryId) {
      payload.append("categoryId", form.categoryId);
    }
    if (previewVideo) {
      payload.append("previewVideo", previewVideo);
    }
    if (file) {
      payload.append("image", file);
    }
    try {
      if (editing) {
        await authForm(`/api/admin/courses/${editing.id}`, payload, "POST");
        toast.success("Đã cập nhật khóa học");
      } else {
        await authForm("/api/admin/courses", payload, "POST");
        toast.success("Đã tạo khóa học");
      }
      setFormOpen(false);
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploadingVideo(false);
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!editing) {
      return;
    }
    setSaving(true);
    try {
      await authDelete(`/api/admin/courses/${editing.id}`);
      toast.success("Đã xóa khóa học");
      setDeleteOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const countLabel = useMemo(() => `${items.length} khóa học`, [items.length]);
  const path = window.location.pathname;
  const curriculumMatch = path.match(/^\/(?:admin|quan-tri)\/courses\/(\d+)\/phan-hoc$/);
  const curriculumId = curriculumMatch ? Number(curriculumMatch[1]) : null;
  const curriculumCourse = curriculumId
    ? items.find((item) => Number(item.id) === curriculumId)
    : null;

  if (curriculumId) {
    if (loading) {
      return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
    }
    if (!curriculumCourse) {
      return (
        <section className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">Không tìm thấy khóa học</h1>
          <Button type="button" onClick={() => (window.location.href = "/admin/courses")}>
            Về danh sách khóa học
          </Button>
        </section>
      );
    }
    return (
      <CourseCurriculum
        course={curriculumCourse}
        onBack={() => {
          window.location.href = "/admin/courses";
        }}
      />
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Khóa học</h1>
          <p className="mt-1 text-sm text-muted-foreground">{countLabel}</p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="w-full sm:w-auto"
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: "16px",
            fontWeight: "400",
            fontStyle: "normal",
            lineHeight: 1.4,
            letterSpacing: "0.01em",
            border: "none",
            borderRadius: "5px",
          }}
        >
          <Plus className="size-4" />
          Thêm khóa học
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 text-center">
          <ImagePlus className="mb-3 size-12 text-muted-foreground" />
          <p
            className="font-medium"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "16px",
              fontWeight: "400",
              fontStyle: "normal",
              lineHeight: 1.2,
              letterSpacing: "0.01em",
            }}
          >
            Chưa có khóa học
          </p>
          <p
            className="mt-1 text-sm text-muted-foreground"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "16px",
              fontWeight: "400",
              fontStyle: "italic",
              lineHeight: 1.2,
              letterSpacing: "0.01em",
            }}
          >
            Tạo khóa học với ảnh và video demo
          </p>
          <Button
            type="button"
            className="mt-4"
            onClick={openCreate}
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "16px",
              fontWeight: "400",
              fontStyle: "normal",
              lineHeight: 1.2,
              letterSpacing: "0.01em",
              border: "none",
              borderRadius: "5px",
            }}
          >
            <Plus className="size-4" />
            Thêm khóa học
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden border border-border bg-card shadow-sm"
            >
              <div className="relative aspect-[16/9] bg-muted">
                {item.images ? (
                  <img
                    src={item.images}
                    alt={item.title}
                    className="size-full object-cover"
                  />
                ) : null}
                <Badge
                  variant={
                    item.status === "PUBLISHED" ? "default" : "secondary"
                  }
                  className="absolute top-3 left-3"
                >
                  {statusLabel(item.status)}
                </Badge>
              </div>
              <div className="space-y-3 p-4">
                <h2 className="line-clamp-2 text-base font-semibold">
                  {item.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {item.instructorName || "Chưa có giảng viên"}
                  {item.categoryName ? ` · ${item.categoryName}` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="size-4" />
                    Sửa
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => {
                      window.location.href = `/admin/courses/${item.id}/phan-hoc`;
                    }}
                  >
                    <BookOpen className="size-4" />
                    Phần học
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setEditing(item);
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="size-4" />
                    Xóa
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Sửa khóa học" : "Thêm khóa học"}
            </DialogTitle>
            <DialogDescription>
              Ảnh bìa bắt buộc. Video demo tải theo từng mảnh, nén rồi phát bằng
              HTTP range.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-4">
            <label className="grid cursor-pointer gap-2">
              <span className="text-sm font-medium">Ảnh khóa học</span>
              <div className="overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
                {preview ? (
                  <img
                    src={preview}
                    alt=""
                    className="aspect-[16/9] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/9] flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Upload className="size-7" />
                    <span className="text-sm">
                      Chọn ảnh JPG, PNG, WEBP hoặc GIF
                    </span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={onPickImage}
              />
            </label>

            <div className="grid gap-2">
              <Label htmlFor="course-video">Video demo</Label>
              <input
                id="course-video"
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov,.mkv"
                onChange={onPickVideo}
              />
              {videoFile ? (
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {videoFile.name}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingVideo}
                    onClick={uploadVideo}
                  >
                    {uploadingVideo
                      ? `Đang tải ${videoProgress}%`
                      : "Tải và nén video"}
                  </Button>
                </div>
              ) : null}
              {uploadingVideo ? (
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>
              ) : null}
              {form.previewVideo ? (
                <video
                  src={form.previewVideo}
                  controls
                  className="aspect-video w-full rounded-xl bg-black"
                />
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="course-title">Tên khóa học</Label>
              <Input
                id="course-title"
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Nhập tên khóa học"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-subtitle">Phụ đề</Label>
              <Input
                id="course-subtitle"
                value={form.subtitle}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, subtitle: event.target.value }))
                }
                placeholder="Mô tả ngắn"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-description">Mô tả</Label>
              <Textarea
                id="course-description"
                rows={5}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="course-instructor">Giảng viên</Label>
                <select
                  id="course-instructor"
                  className={SELECT_CLASS}
                  value={form.instructorId}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      instructorId: event.target.value,
                    }))
                  }
                >
                  <option value="" className={OPTION_CLASS}>
                    Tài khoản admin hiện tại
                  </option>
                  {instructors.map((item) => (
                    <option key={item.id} value={item.id} className={OPTION_CLASS}>
                      {item.fullName} ({item.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-category">Danh mục</Label>
                <select
                  id="course-category"
                  className={SELECT_CLASS}
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      categoryId: event.target.value,
                    }))
                  }
                >
                  <option value="" className={OPTION_CLASS}>
                    Chưa chọn
                  </option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id} className={OPTION_CLASS}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-level">Cấp độ</Label>
                <select
                  id="course-level"
                  className={SELECT_CLASS}
                  value={form.level}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, level: event.target.value }))
                  }
                >
                  {LEVELS.map((item) => (
                    <option key={item.value} value={item.value} className={OPTION_CLASS}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-status">Trạng thái</Label>
                <select
                  id="course-status"
                  className={SELECT_CLASS}
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, status: event.target.value }))
                  }
                >
                  {STATUSES.map((item) => (
                    <option key={item.value} value={item.value} className={OPTION_CLASS}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-language">Ngôn ngữ</Label>
                <select
                  id="course-language"
                  className={SELECT_CLASS}
                  value={form.language}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      language: event.target.value,
                    }))
                  }
                >
                  <option value="vi" className={OPTION_CLASS}>
                    Tiếng Việt
                  </option>
                  <option value="en" className={OPTION_CLASS}>
                    English
                  </option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-currency">Tiền tệ</Label>
                <select
                  id="course-currency"
                  className={SELECT_CLASS}
                  value={form.currency}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      currency: event.target.value,
                    }))
                  }
                >
                  <option value="VND" className={OPTION_CLASS}>
                    VND
                  </option>
                  <option value="USD" className={OPTION_CLASS}>
                    USD
                  </option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <Label htmlFor="course-free">Miễn phí</Label>
              <Switch
                id="course-free"
                checked={form.isFree}
                onCheckedChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    isFree: value === true,
                    price: value === true ? "0" : prev.price,
                  }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="course-price">Giá</Label>
                <Input
                  id="course-price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) => {
                    const value = event.target.value;
                    const amount = Number(String(value).replace(",", "."));
                    setForm((prev) => ({
                      ...prev,
                      price: value,
                      isFree: !(Number.isFinite(amount) && amount > 0),
                    }));
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-compare">Giá gốc</Label>
                <Input
                  id="course-compare"
                  type="number"
                  min="0"
                  value={form.compareAtPrice}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      compareAtPrice: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <Label htmlFor="course-cert">Cấp chứng chỉ</Label>
              <Switch
                id="course-cert"
                checked={form.issuesCertificate}
                onCheckedChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    issuesCertificate: value === true,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="course-learn">Bạn sẽ học được</Label>
              <Textarea
                id="course-learn"
                rows={4}
                value={form.whatYouWillLearn}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    whatYouWillLearn: event.target.value,
                  }))
                }
                placeholder="Mỗi ý một dòng"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-req">Yêu cầu</Label>
              <Textarea
                id="course-req"
                rows={3}
                value={form.requirements}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    requirements: event.target.value,
                  }))
                }
                placeholder="Mỗi ý một dòng"
              />
            </div>

            <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
              {editing ? (
                <Button
                  type="button"
                  variant="outline"
                  className="sm:mr-auto"
                  onClick={() => {
                    window.location.href = `/admin/courses/${editing.id}/phan-hoc`;
                  }}
                >
                  <BookOpen className="size-4" />
                  Quản lý phần học
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={saving || uploadingVideo}>
                {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo khóa học"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa khóa học</DialogTitle>
            <DialogDescription>
              Xóa “{editing?.title}”? Khóa học sẽ được lưu trữ và ẩn khỏi trang
              công khai.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={saving}
              onClick={onDelete}
            >
              {saving ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export { AllCourse };
export default AllCourse;
