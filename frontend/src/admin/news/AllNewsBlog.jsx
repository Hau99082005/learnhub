import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
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

function todayInput() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function dateInput(value) {
  if (!value) {
    return todayInput();
  }
  if (Array.isArray(value) && value.length >= 3) {
    return `${value[0]}-${String(value[1]).padStart(2, "0")}-${String(value[2]).padStart(2, "0")}`;
  }
  return String(value).slice(0, 10);
}

const EMPTY = {
  title: "",
  excerpt: "",
  isActive: true,
  publishedAt: todayInput(),
};

const AllNewsBlog = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await authGet("/api/admin/newsblogs");
      setItems(Array.isArray(data) ? data : []);
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
    setForm({ ...EMPTY, publishedAt: todayInput() });
    setFile(null);
    setPreview("");
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      excerpt: item.excerpt || "",
      isActive: item.isActive !== false,
      publishedAt: dateInput(item.publishedAt),
    });
    setFile(null);
    setPreview(item.imageUrl || "");
    setFormOpen(true);
  };

  const onPickFile = (event) => {
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

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!editing && !file) {
      toast.error("Vui lòng tải ảnh lên");
      return;
    }
    const title = form.title.trim();
    if (!title) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }
    const excerpt = form.excerpt.trim();
    if (!excerpt) {
      toast.error("Vui lòng nhập nội dung");
      return;
    }
    const payload = new FormData();
    payload.append("title", title);
    payload.append("excerpt", excerpt);
    payload.append("isActive", String(form.isActive));
    payload.append("publishedAt", form.publishedAt || todayInput());
    if (file) {
      payload.append("image", file);
    }
    setSaving(true);
    try {
      if (editing) {
        await authForm(`/api/admin/newsblogs/${editing.id}`, payload, "PUT");
        toast.success("Đã cập nhật bài viết");
      } else {
        await authForm("/api/admin/newsblogs", payload, "POST");
        toast.success("Đã đăng bài viết");
      }
      setFormOpen(false);
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!editing) {
      return;
    }
    setSaving(true);
    try {
      await authDelete(`/api/admin/newsblogs/${editing.id}`);
      toast.success("Đã xóa bài viết");
      setDeleteOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const countLabel = useMemo(() => `${items.length} bài viết`, [items.length]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bài viết tin tức</h1>
          <p className="mt-1 text-sm text-muted-foreground">{countLabel}</p>
        </div>
        <Button type="button" onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Đăng bài viết
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 text-center">
          <ImagePlus className="mb-3 size-10 text-muted-foreground" />
          <p className="font-medium">Chưa có bài viết</p>
          <p className="mt-1 text-sm text-muted-foreground">Đăng bài để cập nhật trang tin tức</p>
          <Button type="button" className="mt-4" onClick={openCreate}>
            <Plus className="size-4" />
            Đăng bài viết
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden border border-border bg-card shadow-sm">
              <div className="relative aspect-[16/9] bg-muted">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="size-full object-cover" />
                ) : null}
                <Badge variant={item.isActive ? "default" : "secondary"} className="absolute top-3 left-3">
                  {item.isActive ? "Đang hiện" : "Đã ẩn"}
                </Badge>
              </div>
              <div className="space-y-3 p-4">
                <h2 className="line-clamp-2 text-base font-semibold">{item.title}</h2>
                <p className="text-sm text-muted-foreground">{dateInput(item.publishedAt)}</p>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => openEdit(item)}>
                    <Pencil className="size-4" />
                    Sửa
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa bài viết" : "Đăng bài viết"}</DialogTitle>
            <DialogDescription>
              {editing ? "Cập nhật nội dung và ảnh bài viết" : "Nhập tiêu đề, ngày đăng và tải ảnh"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-4">
            <label className="grid cursor-pointer gap-2">
              <span className="text-sm font-medium">Ảnh bài viết</span>
              <div className="overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
                {preview ? (
                  <img src={preview} alt="" className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[16/9] flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Upload className="size-7" />
                    <span className="text-sm">Chọn ảnh JPG, PNG, WEBP hoặc GIF</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={onPickFile}
              />
            </label>
            <div className="grid gap-2">
              <Label htmlFor="blog-title">Tiêu đề</Label>
              <Input
                id="blog-title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Nhập tiêu đề bài viết"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="blog-excerpt">Nội dung</Label>
              <Textarea
                id="blog-excerpt"
                value={form.excerpt}
                onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                placeholder="Nhập nội dung bài viết"
                rows={8}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="blog-date">Ngày đăng</Label>
              <Input
                id="blog-date"
                type="date"
                value={form.publishedAt}
                onChange={(event) => setForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <Label htmlFor="blog-active">Hiển thị</Label>
              <Switch
                id="blog-active"
                checked={form.isActive}
                onCheckedChange={(value) => setForm((prev) => ({ ...prev, isActive: value === true }))}
              />
            </div>
            <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Đăng bài"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa bài viết</DialogTitle>
            <DialogDescription>Xóa “{editing?.title}”? Thao tác này không hoàn tác được.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Hủy
            </Button>
            <Button type="button" variant="destructive" disabled={saving} onClick={onDelete}>
              {saving ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export { AllNewsBlog };
export default AllNewsBlog;
