import { authGet, authPost } from "@/lib/auth";

export async function previewCoupon(code) {
  return authPost("/api/coupons/preview", { code });
}

export async function listActiveCoupons() {
  const data = await authGet("/api/coupons/active");
  return Array.isArray(data) ? data : [];
}
