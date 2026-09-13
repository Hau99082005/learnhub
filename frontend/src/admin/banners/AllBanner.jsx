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
import { authDelete, authForm, authGet } from "@/lib/auth";

const EMPTY = {
  title: "",
  isActive: true,
};

function bannerSrc(url) {
  if (!url) {
    return "";
  }
  return url;
}

function titleFromFile(name) {
  const base =
    String(name || "")
      .replace(/\\/g, "/")
      .split("/")
      .pop() || "";
  const dot = base.lastIndexOf(".");
  return (dot > 0 ? base.slice(0, dot) : base).trim();
}

const AllBanner = () => {
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
      const data = await authGet("/api/admin/banners");
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
    setForm(EMPTY);
    setFile(null);
    setPreview("");
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      isActive: item.isActive !== false,
    });
    setFile(null);
    setPreview(bannerSrc(item.imageUrl));
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
    setForm((prev) => ({ ...prev, title: titleFromFile(next.name) }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!editing && !file) {
      toast.error("Vui lòng tải ảnh banner lên");
      return;
    }
    const title = form.title.trim() || (file ? titleFromFile(file.name) : "");
    if (!title) {
      toast.error("Vui lòng tải ảnh banner lên");
      return;
    }
    const payload = new FormData();
    payload.append("title", title);
    payload.append("isActive", String(form.isActive));
    if (file) {
      payload.append("image", file);
    }
    setSaving(true);
    try {
      if (editing) {
        await authForm(`/api/admin/banners/${editing.id}`, payload, "PUT");
        toast.success("Đã cập nhật banner");
      } else {
        await authForm("/api/admin/banners", payload, "POST");
        toast.success("Đã thêm banner");
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
      await authDelete(`/api/admin/banners/${editing.id}`);
      toast.success("Đã xóa banner");
      setDeleteOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const countLabel = useMemo(() => `${items.length} banner`, [items.length]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "28px",
              fontWeight: "600",
              fontStyle: "normal",
              lineHeight: 1.4,
              letterSpacing: "0.01em",
            }}
          >
            Banners
          </h1>
          <p
            className="mt-1 text-sm text-muted-foreground"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "14px",
              fontWeight: "500",
              fontStyle: "normal",
              lineHeight: 1.4,
              letterSpacing: "0.01em",
            }}
          >
            {countLabel}
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="w-full sm:w-auto"
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: "14px",
            fontWeight: "500",
            fontStyle: "normal",
            lineHeight: 1.4,
            letterSpacing: "0.01em",
            borderRadius: "5px",
          }}
        >
          <Plus className="size-4" />
          Thêm banner
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 text-center">
          <ImagePlus className="mb-3 size-10 text-muted-foreground" />
          <p className="font-medium">Chưa có banner</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tải ảnh lên để tạo banner đầu tiên
          </p>
          <Button type="button" className="mt-4" onClick={openCreate}>
            <Plus className="size-4" />
            Thêm banner
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-none border border-border bg-card shadow-sm"
            >
              <div className="relative aspect-[16/9] bg-muted">
                {item.imageUrl ? (
                  <img
                    src={bannerSrc(item.imageUrl)}
                    alt={item.title}
                    className="size-full object-cover"
                  />
                ) : null}
                <Badge
                  variant={item.isActive ? "default" : "secondary"}
                  className="absolute top-3 left-3"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "12px",
                    fontWeight: "500",
                    fontStyle: "normal",
                    lineHeight: 1.4,
                    letterSpacing: "0.01em",
                    borderRadius: "5px",
                  }}
                >
                  {item.isActive ? "Đang hiện" : "Đã ẩn"}
                </Badge>
              </div>
              <div className="space-y-3 p-4">
                <h2
                  className="line-clamp-1 text-base font-semibold"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "16px",
                    fontWeight: "500",
                    fontStyle: "normal",
                    lineHeight: 1.4,
                    letterSpacing: "0.01em",
                  }}
                >
                  {item.title}
                </h2>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEdit(item)}
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: "14px",
                      fontWeight: "500",
                      fontStyle: "normal",
                      lineHeight: 1.4,
                      letterSpacing: "0.01em",
                      borderRadius: "5px",
                    }}
                  >
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
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: "14px",
                      fontWeight: "500",
                      fontStyle: "normal",
                      lineHeight: 1.4,
                      letterSpacing: "0.01em",
                      borderRadius: "5px",
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
            <DialogTitle>{editing ? "Sửa banner" : "Thêm banner"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Cập nhật ảnh banner"
                : "Tải ảnh lên để tạo banner mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-4">
            <label className="grid cursor-pointer gap-2">
              <span className="text-sm font-medium">Ảnh banner</span>
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
                onChange={onPickFile}
              />
            </label>
            {form.title ? (
              <div className="grid gap-2">
                <Label htmlFor="banner-title">Tên ảnh</Label>
                <Input id="banner-title" value={form.title} readOnly />
              </div>
            ) : null}
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <Label htmlFor="banner-active">Hiển thị</Label>
              <Switch
                id="banner-active"
                checked={form.isActive}
                onCheckedChange={(value) =>
                  setForm((prev) => ({ ...prev, isActive: value === true }))
                }
              />
            </div>
            <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa banner</DialogTitle>
            <DialogDescription>
              Xóa “{editing?.title}”? Thao tác này không hoàn tác được.
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

export { AllBanner };
export default AllBanner;
