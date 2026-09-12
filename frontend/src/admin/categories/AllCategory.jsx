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
  name: "",
  status: true,
};

function categorySrc(url) {
  if (!url) {
    return "";
  }
  return url;
}

function slugFromName(name) {
  const slug = String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "danh-muc";
}

const AllCategory = () => {
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
      const data = await authGet("/api/admin/categories");
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
      name: item.name || "",
      status: item.status !== false,
    });
    setFile(null);
    setPreview(categorySrc(item.images));
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
    const name = form.name.trim();
    if (!name) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }
    if (!editing && !file) {
      toast.error("Vui lòng tải ảnh danh mục lên");
      return;
    }
    const payload = new FormData();
    payload.append("name", name);
    payload.append("status", String(form.status));
    if (file) {
      payload.append("image", file);
    }
    setSaving(true);
    try {
      if (editing) {
        await authForm(`/api/admin/categories/${editing.id}`, payload, "PUT");
        toast.success("Đã cập nhật danh mục");
      } else {
        await authForm("/api/admin/categories", payload, "POST");
        toast.success("Đã thêm danh mục");
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
      await authDelete(`/api/admin/categories/${editing.id}`);
      toast.success("Đã xóa danh mục");
      setDeleteOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const countLabel = useMemo(() => `${items.length} danh mục`, [items.length]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Danh mục</h1>
          <p className="mt-1 text-sm text-muted-foreground">{countLabel}</p>
        </div>
        <Button type="button" onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Thêm danh mục
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
          <p className="font-medium">Chưa có danh mục</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Nhập tên và tải ảnh để tạo danh mục đầu tiên
          </p>
          <Button type="button" className="mt-4" onClick={openCreate}>
            <Plus className="size-4" />
            Thêm danh mục
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="relative aspect-[16/9] bg-muted">
                {item.images ? (
                  <img
                    src={categorySrc(item.images)}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                ) : null}
                <Badge
                  variant={item.status ? "default" : "secondary"}
                  className="absolute top-3 left-3"
                >
                  {item.status ? "Đang hiện" : "Đã ẩn"}
                </Badge>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <h2 className="line-clamp-1 text-base font-semibold">
                    {item.name}
                  </h2>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {item.slug}
                  </p>
                </div>
                <div className="flex gap-2">
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
            <DialogTitle>
              {editing ? "Sửa danh mục" : "Thêm danh mục"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Cập nhật tên và ảnh danh mục"
                : "Nhập tên và tải ảnh để tạo danh mục mới"}
            </DialogDescription>
          </DialogHeader>
          <form noValidate onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Tên danh mục</Label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                value={form.name.trim() ? slugFromName(form.name) : ""}
                readOnly
              />
            </div>
            <label className="grid cursor-pointer gap-2">
              <span className="text-sm font-medium">Ảnh danh mục</span>
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
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <Label htmlFor="category-status">Hiển thị</Label>
              <Switch
                id="category-status"
                checked={form.status}
                onCheckedChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value === true }))
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
                {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo danh mục"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa danh mục</DialogTitle>
            <DialogDescription>
              Xóa “{editing?.name}”? Thao tác này không hoàn tác được.
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

export { AllCategory };
export default AllCategory;
