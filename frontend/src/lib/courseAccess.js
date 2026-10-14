import { authGet, getAuthUser } from "@/lib/auth";
import { isInCart } from "@/lib/cart";

const OWNED_PREFIX = "learnhub_owned:";
const LEGACY_KEY = "learnhub_owned";
const OWNED_EVENT = "learnhub-owned";

function currentUserId() {
  const id = Number(getAuthUser()?.id);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function storageKey() {
  const id = currentUserId();
  return id ? `${OWNED_PREFIX}${id}` : null;
}

function emitOwned() {
  window.dispatchEvent(new Event(OWNED_EVENT));
}

function readIds() {
  const key = storageKey();
  if (!key) {
    return [];
  }
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(raw)
      ? raw.map(Number).filter((value) => Number.isFinite(value))
      : [];
  } catch {
    return [];
  }
}

function writeIds(ids) {
  const key = storageKey();
  if (!key) {
    emitOwned();
    return;
  }
  localStorage.setItem(key, JSON.stringify([...new Set(ids)]));
  emitOwned();
}

try {
  localStorage.removeItem(LEGACY_KEY);
} catch {}

export function addOwned(course) {
  const id = Number(course?.id ?? course);
  if (!Number.isFinite(id) || !currentUserId()) {
    return;
  }
  writeIds([...readIds(), id]);
}

export function addOwnedMany(ids) {
  if (!currentUserId()) {
    return;
  }
  const next = (Array.isArray(ids) ? ids : [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  writeIds([...readIds(), ...next]);
}

export function replaceOwned(ids) {
  if (!currentUserId()) {
    emitOwned();
    return;
  }
  const next = (Array.isArray(ids) ? ids : [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  writeIds(next);
}

export function isOwned(id) {
  if (!currentUserId()) {
    return false;
  }
  return readIds().includes(Number(id));
}

export function canAccessCourse(id) {
  return isOwned(id);
}

export function onOwnedChange(callback) {
  const handler = () => callback();
  window.addEventListener(OWNED_EVENT, handler);
  return () => window.removeEventListener(OWNED_EVENT, handler);
}

export async function hydrateOwned() {
  if (!currentUserId()) {
    emitOwned();
    return;
  }
  try {
    const data = await authGet("/api/learning");
    replaceOwned(
      (Array.isArray(data) ? data : []).map((row) => row.courseId),
    );
  } catch {
    emitOwned();
  }
}

export { isInCart };
