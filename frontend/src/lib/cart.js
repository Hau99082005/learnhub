import { toast } from "sonner";
import {
  AuthError,
  authGet,
  authPost,
  getAuthToken,
  getAuthUser,
  onAuthChange,
} from "@/lib/auth";

const CART_EVENT = "learnhub-cart";

const emptyCart = () => ({
  id: null,
  status: "ACTIVE",
  itemCount: 0,
  subtotal: 0,
  currency: "VND",
  items: [],
});

let snapshot = emptyCart();
let loading = null;

function emit() {
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: snapshot }));
}

function setSnapshot(data) {
  const items = Array.isArray(data?.items) ? data.items : [];
  snapshot = {
    id: data?.id ?? null,
    status: data?.status || "ACTIVE",
    itemCount: Number(data?.itemCount ?? items.length) || 0,
    subtotal: Number(data?.subtotal) || 0,
    currency: data?.currency || "VND",
    items,
  };
  emit();
  return snapshot;
}

export function getCart() {
  return snapshot;
}

export function cartCount() {
  return snapshot.itemCount || snapshot.items.length;
}

export function isInCart(id) {
  const courseId = Number(id);
  return snapshot.items.some((item) => Number(item.courseId) === courseId);
}

export function onCartChange(callback) {
  const handler = () => callback(getCart());
  window.addEventListener(CART_EVENT, handler);
  return () => window.removeEventListener(CART_EVENT, handler);
}

export function resetCart() {
  loading = null;
  setSnapshot(emptyCart());
}

export async function loadCart() {
  if (!getAuthUser() || !getAuthToken()) {
    resetCart();
    return snapshot;
  }
  if (loading) {
    return loading;
  }
  loading = authGet("/api/cart")
    .then(setSnapshot)
    .catch((error) => {
      if (error instanceof AuthError) {
        resetCart();
        return snapshot;
      }
      throw error;
    })
    .finally(() => {
      loading = null;
    });
  return loading;
}

export async function addToCart(course) {
  if (!getAuthUser() || !getAuthToken()) {
    const error = new AuthError(
      "Vui lòng đăng nhập hoặc đăng ký để thêm vào giỏ hàng",
    );
    error.code = "UNAUTHENTICATED";
    throw error;
  }
  const courseId = Number(course?.id ?? course);
  const data = await authPost("/api/cart/items", { courseId });
  return setSnapshot(data);
}

export async function removeFromCart(courseId) {
  const token = getAuthToken();
  const response = await fetch(`/api/cart/items/${Number(courseId)}`, {
    method: "DELETE",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AuthError(
      data.message || "Không thể xóa khóa học khỏi giỏ hàng",
    );
  }
  return setSnapshot(data);
}

export async function addCourseToCart(course) {
  if (!getAuthUser() || !getAuthToken()) {
    toast.error("Vui lòng đăng nhập hoặc đăng ký để thêm vào giỏ hàng");
    return false;
  }
  try {
    await addToCart(course);
    toast.success(`Đã thêm “${course.title || "khóa học"}” vào giỏ hàng`);
    return true;
  } catch (error) {
    toast.error(error.message || "Không thể thêm vào giỏ hàng");
    return false;
  }
}

if (typeof window !== "undefined") {
  onAuthChange((user) => {
    if (!user) {
      resetCart();
      return;
    }
    loadCart();
  });
}
