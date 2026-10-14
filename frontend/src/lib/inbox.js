import { authGet, authPost, getAuthToken, getAuthUser } from "@/lib/auth";

const INBOX_EVENT = "learnhub-inbox";

let unread = 0;
let items = [];

function emit() {
  window.dispatchEvent(
    new CustomEvent(INBOX_EVENT, { detail: { unread, items } }),
  );
}

export function inboxUnread() {
  return unread;
}

export function getInboxItems() {
  return items;
}

export function onInboxChange(callback) {
  const handler = () => callback({ unread, items });
  window.addEventListener(INBOX_EVENT, handler);
  return () => window.removeEventListener(INBOX_EVENT, handler);
}

export async function loadInbox() {
  if (!getAuthToken() || !getAuthUser()) {
    unread = 0;
    items = [];
    emit();
    return items;
  }
  try {
    const [rows, count] = await Promise.all([
      authGet("/api/inbox"),
      authGet("/api/inbox/unread"),
    ]);
    items = Array.isArray(rows) ? rows : [];
    unread = Number(count?.unread) || 0;
    emit();
    return items;
  } catch {
    return items;
  }
}

export async function loadInboxCount() {
  if (!getAuthToken() || !getAuthUser()) {
    unread = 0;
    emit();
    return 0;
  }
  try {
    const count = await authGet("/api/inbox/unread");
    unread = Number(count?.unread) || 0;
    emit();
    return unread;
  } catch {
    return unread;
  }
}

export async function markInboxRead(id) {
  const row = await authPost(`/api/inbox/${id}/read`, {});
  items = items.map((item) => (item.id === row.id ? row : item));
  unread = items.filter((item) => !item.isRead).length;
  emit();
  return row;
}

export async function markAllInboxRead() {
  await authPost("/api/inbox/read-all", {});
  items = items.map((item) => ({ ...item, isRead: true }));
  unread = 0;
  emit();
  return items;
}
