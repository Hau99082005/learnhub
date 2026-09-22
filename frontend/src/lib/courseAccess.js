const CART_KEY = "learnhub_cart";
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

function addId(key, course) {
  const id = Number(course?.id ?? course);
  if (!Number.isFinite(id)) {
    return;
  }
  writeIds(key, [...readIds(key), id]);
}

export function addToCart(course) {
  addId(CART_KEY, course);
}

export function isInCart(id) {
  return readIds(CART_KEY).includes(Number(id));
}

export function addOwned(course) {
  addId(OWNED_KEY, course);
}

export function isOwned(id) {
  return readIds(OWNED_KEY).includes(Number(id));
}

export function canAccessCourse(id) {
  return isOwned(id) || isInCart(id);
}
