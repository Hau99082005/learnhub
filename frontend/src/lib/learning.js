const ARCHIVED_KEY = "learnhub_archived";
const WISHLIST_KEY = "learnhub_wishlist";
const LISTS_KEY = "learnhub_lists";
const ACCESS_KEY = "learnhub_last_access";
const STREAK_KEY = "learnhub_streak";

function readJson(key, fallback) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "null");
    return raw == null ? fallback : raw;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function asIds(value) {
  return (Array.isArray(value) ? value : [])
    .map(Number)
    .filter((id) => Number.isFinite(id));
}

export function getArchivedIds() {
  return asIds(readJson(ARCHIVED_KEY, []));
}

export function setArchived(courseId, archived) {
  const id = Number(courseId);
  const current = new Set(getArchivedIds());
  if (archived) {
    current.add(id);
  } else {
    current.delete(id);
  }
  writeJson(ARCHIVED_KEY, [...current]);
  return [...current];
}

export function getWishlistIds() {
  return asIds(readJson(WISHLIST_KEY, []));
}

export function toggleWishlist(courseId) {
  const id = Number(courseId);
  const current = new Set(getWishlistIds());
  if (current.has(id)) {
    current.delete(id);
  } else {
    current.add(id);
  }
  writeJson(WISHLIST_KEY, [...current]);
  return [...current];
}

export function getLists() {
  const rows = readJson(LISTS_KEY, []);
  return Array.isArray(rows)
    ? rows
        .filter((row) => row && typeof row.name === "string")
        .map((row) => ({
          id: String(row.id),
          name: row.name,
          courseIds: asIds(row.courseIds),
        }))
    : [];
}

export function createList(name) {
  const title = String(name || "").trim();
  if (!title) {
    return getLists();
  }
  const next = [
    ...getLists(),
    {
      id: `${Date.now()}`,
      name: title,
      courseIds: [],
    },
  ];
  writeJson(LISTS_KEY, next);
  return next;
}

export function addToList(listId, courseId) {
  const id = Number(courseId);
  const next = getLists().map((list) => {
    if (list.id !== String(listId)) {
      return list;
    }
    const ids = new Set(list.courseIds);
    ids.add(id);
    return { ...list, courseIds: [...ids] };
  });
  writeJson(LISTS_KEY, next);
  return next;
}

export function removeFromList(listId, courseId) {
  const id = Number(courseId);
  const next = getLists().map((list) =>
    list.id === String(listId)
      ? { ...list, courseIds: list.courseIds.filter((value) => value !== id) }
      : list,
  );
  writeJson(LISTS_KEY, next);
  return next;
}

export function getLastAccessMap() {
  const raw = readJson(ACCESS_KEY, {});
  return raw && typeof raw === "object" ? raw : {};
}

export function markAccessed(courseId) {
  const id = Number(courseId);
  if (!Number.isFinite(id)) {
    return;
  }
  writeJson(ACCESS_KEY, {
    ...getLastAccessMap(),
    [id]: Date.now(),
  });
}

function mondayKey(date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next.toISOString().slice(0, 10);
}

export function recordStreakVisit() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toISOString().slice(0, 10);
  const week = mondayKey(today);
  const current = readJson(STREAK_KEY, { week: "", days: [] });
  const days =
    current.week === week ? asDays(current.days) : [];
  if (!days.includes(todayKey)) {
    days.push(todayKey);
  }
  writeJson(STREAK_KEY, { week, days });
  return days.length;
}

function asDays(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

export function getStreak() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const week = mondayKey(today);
  const current = readJson(STREAK_KEY, { week: "", days: [] });
  const days = current.week === week ? asDays(current.days) : [];
  return {
    count: days.length,
    days,
    weekStart: week,
  };
}
