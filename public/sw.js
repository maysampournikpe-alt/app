/*
 * Rumbo service worker — makes the app installable and work offline.
 *
 * How it works:
 *  - On install, it saves ("precaches") the main pages plus the JavaScript and
 *    CSS files those pages need.
 *  - Pages: try the internet first; if there's no internet, use the saved copy;
 *    if there's no saved copy, show the /offline page.
 *  - Files that never change (/_next/static, fonts, icons): use the saved copy first.
 *  - AI and other /api calls always need the internet (never cached here).
 *
 * All the student's data (saved opportunities, plans...) lives in browser
 * storage, so once a page is cached it works fully offline.
 */
const VERSION = "rumbo-v3";
const PAGE_CACHE = `${VERSION}-pages`;
const STATIC_CACHE = `${VERSION}-static`;

const PRECACHE_PAGES = [
  "/",
  "/offline",
  "/coach",
  "/plan",
  "/people",
  "/me",
  "/me/saved",
  "/plan/calendar",
  "/plan/schedule",
  "/coach/flashcards",
  "/help",
  "/privacy",
];
const PRECACHE_FILES = ["/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGE_CACHE);
      const statics = await caches.open(STATIC_CACHE);
      await statics.addAll(PRECACHE_FILES).catch(() => {});
      const assetUrls = new Set();
      for (const url of PRECACHE_PAGES) {
        try {
          const res = await fetch(url, { credentials: "same-origin" });
          if (!res.ok) continue;
          const html = await res.clone().text();
          await pages.put(url, res);
          // Also save the JS/CSS files this page needs.
          for (const m of html.matchAll(/\/_next\/static\/[^"'\\\s)]+/g)) assetUrls.add(m[0]);
        } catch {
          /* offline during install — skip */
        }
      }
      await Promise.all(
        [...assetUrls].map((u) =>
          statics.match(u).then((hit) => hit || fetch(u).then((r) => (r.ok ? statics.put(u, r) : null)).catch(() => null)),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

function isStaticAsset(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/fonts/") || url.pathname.startsWith("/icons/");
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // map tiles etc. go straight to the network
  if (url.pathname.startsWith("/api/")) return; // AI and server data always need internet

  // Static files: cache first
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  // Full page loads: network first, then saved copy, then the offline page.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGE_CACHE);
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(url.pathname, res.clone());
          return res;
        } catch {
          return (
            (await cache.match(url.pathname)) ||
            (await cache.match("/offline")) ||
            new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
          );
        }
      })(),
    );
    return;
  }

  // Everything else (page data for in-app navigation): network first, fall back to cache.
  event.respondWith(
    (async () => {
      const cache = await caches.open(PAGE_CACHE);
      try {
        const res = await fetch(req);
        if (res.ok && url.searchParams.has("_rsc")) cache.put(req, res.clone());
        return res;
      } catch {
        const hit = await cache.match(req);
        if (hit) return hit;
        throw new Error("offline");
      }
    })(),
  );
});

// Tapping a reminder notification opens the app.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.href) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) {
          c.navigate(target);
          return c.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
