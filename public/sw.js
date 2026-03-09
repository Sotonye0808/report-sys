/**
 * public/sw.js
 * Service Worker for Harvesters Reporting System PWA.
 *
 * Strategies:
 *  - Static assets (JS, CSS, fonts, images): cache-first
 *  - HTML navigation requests: network-first, fall back to /offline
 *  - API calls: network-only (data freshness is critical)
 */

const CACHE_NAME = "hrs-cache-v1";

/** Precache list — populated at build time or kept minimal for dev */
const PRECACHE_URLS = ["/offline"];

/* ── Install ────────────────────────────────────────────────────────────────── */
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

/* ── Activate ───────────────────────────────────────────────────────────────── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

/* ── Fetch ──────────────────────────────────────────────────────────────────── */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // API routes — always network (data must be fresh)
  if (url.pathname.startsWith("/api/")) return;

  // Navigation requests — network-first, fall back to /offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses for offline access
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/offline"))),
    );
    return;
  }

  // Static assets — cache-first
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/logo/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          }),
      ),
    );
    return;
  }
});

/* ── Push Notifications ─────────────────────────────────────────────────────── */
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Harvesters Reporting", body: event.data.text() };
  }

  const options = {
    body: payload.body || "",
    icon: "/logo/icon-192.svg",
    badge: "/logo/icon-192.svg",
    tag: payload.tag || "hrs-notification",
    data: payload.data || {},
    actions: payload.actions || [],
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

/* ── Notification Click ─────────────────────────────────────────────────────── */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus existing window if matching URL
      for (const client of clients) {
        if (new URL(client.url).pathname === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(targetUrl);
    }),
  );
});
