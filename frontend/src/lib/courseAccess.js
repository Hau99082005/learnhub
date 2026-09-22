import { isInCart } from "@/lib/cart";

const OWNED_KEY = "learnhub_owned";

function readIds(key) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(raw)
      ? raw.map(Number).filter((value) => Number.isFinite(value))
      : [];
  } catch {
    return [];
  }
}

function writeIds(key, ids) {
  localStorage.setItem(key, JSON.stringify([...new Set(ids)]));
}

export function addOwned(course) {
  const id = Number(course?.id ?? course);
  if (!Number.isFinite(id)) {
    return;
  }
  writeIds(OWNED_KEY, [...readIds(OWNED_KEY), id]);
}

export function isOwned(id) {
  return readIds(OWNED_KEY).includes(Number(id));
}

export function canAccessCourse(id) {
  return isOwned(id) || isInCart(id);
}

export { isInCart };
