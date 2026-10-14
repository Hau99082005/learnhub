import { toast } from "sonner";
import {
  authDelete,
  authGet,
  authPost,
  getAuthToken,
  getAuthUser,
} from "@/lib/auth";

const WISH_EVENT = "learnhub-wishlist";

let items = [];

function emit() {
  window.dispatchEvent(new CustomEvent(WISH_EVENT, { detail: items }));
}

function setItems(rows) {
  items = Array.isArray(rows) ? rows : [];
  emit();
  return items;
}

export function getWishlistItems() {
  return items;
}

export function getWishlistIds() {
  return items.map((row) => Number(row.id)).filter((id) => Number.isFinite(id));
}

export function wishlistCount() {
  return getWishlistIds().length;
}

export function isWished(courseId) {
  return getWishlistIds().includes(Number(courseId));
}

export function onWishlistChange(callback) {
  const handler = (event) => callback(event?.detail ?? items);
  window.addEventListener(WISH_EVENT, handler);
  return () => window.removeEventListener(WISH_EVENT, handler);
}

export async function loadWishlist() {
  if (!getAuthToken() || !getAuthUser()) {
    return setItems([]);
  }
  try {
    const data = await authGet("/api/wishlist");
    return setItems(Array.isArray(data) ? data : []);
  } catch {
    return items;
  }
}

async function addWishlist(id) {
  try {
    return await authPost("/api/wishlist", { courseId: id });
  } catch {
    return await authPost(`/api/wishlist/${id}`, { courseId: id });
  }
}

export async function toggleWishlist(courseId) {
  if (!getAuthUser()) {
    toast.error("Đăng nhập để lưu danh sách mong ước");
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/dang-nhap?next=${encodeURIComponent(next || "/")}`;
    return getWishlistIds();
  }
  const id = Number(courseId);
  if (!Number.isFinite(id)) {
    return getWishlistIds();
  }
  const wished = isWished(id);
  try {
    const data = wished
      ? await authDelete(`/api/wishlist/${id}`)
      : await addWishlist(id);
    if (Array.isArray(data)) {
      setItems(data);
    }
    if (wished === isWished(id) || !Array.isArray(data)) {
      await loadWishlist();
    }
    if (!wished && !isWished(id)) {
      toast.error("Không lưu được vào danh sách mong ước");
      return getWishlistIds();
    }
    toast.success(
      wished ? "Đã xóa khỏi danh sách mong ước" : "Đã thêm vào danh sách mong ước",
    );
  } catch (error) {
    toast.error(error.message || "Không lưu được danh sách mong ước");
  }
  return getWishlistIds();
}
