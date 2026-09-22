import { authGet, authPost } from "@/lib/auth";

export async function createCheckout(provider) {
  return authPost("/api/checkout", { provider });
}

export async function getCheckout(orderCode) {
  return authGet(`/api/checkout/${encodeURIComponent(orderCode)}`);
}

export async function confirmCheckout(orderCode) {
  return authPost(`/api/checkout/${encodeURIComponent(orderCode)}/confirm`);
}
