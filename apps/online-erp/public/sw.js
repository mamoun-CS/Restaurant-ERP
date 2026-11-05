// Service Worker for Sheikh Al Kar POS — v2
// Offline-first application shell caching and offline resilience
//
// Strategy summary:
//   /api/*                → NEVER cached (transactional, authenticated)
//   /_next/static/*       → Cache-first + background revalidate (immutable hashed bundles)
//   /brand/*, *.svg, etc  → Cache-first
//   Google Fonts          → Cache-first (long-lived)
//   Navigation (HTML)     → Network-first → cached page → cached /pos shell → /offline page
//   All other sub-requests→ Network-first with cache fallback

const CACHE_NAME = "sheikh-al-kar-pos-v2";

const PRECACHE_ASSETS = [
  "/pos",
  "/offline",
  "/login",
  "/favicon.ico",
  "/brand/sheikh-al-kar-icon.svg",
  "/brand/sheikh-al-kar-horizontal.svg",
  "/brand/sheikh-al-kar-vertical.svg",
  "/brand/sheikh-al-kar-badge.svg",
];

// ── Install ─────────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("Service worker precache partial warning", err);
      });
    }),
  );
});

// ── Activate ────────────────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }),
      );
    }).then(() => self.clients.claim()),
  );
});

// ── Fetch ───────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Security Rule: NEVER cache authenticated or transactional API routes
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // ── 1. Next.js immutable static bundles (JS, CSS, media) ──────────────
  // These files have content hashes in their filenames so they are safe
  // to serve from cache indefinitely with a background revalidate.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => null);

        // Return cached immediately if available, otherwise wait for network
        return cached || fetchPromise;
      }),
    );
    return;
  }

  // ── 2. Next.js runtime chunks & data (/_next/*) ───────────────────────
  // These include page data JSON and webpack runtime — cache with network fallback
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || new Response("", { status: 503 });
        }),
    );
    return;
  }

  // ── 3. Google Fonts (external, long-lived) ────────────────────────────
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      }),
    );
    return;
  }

  // ── 4. Brand assets and static images ─────────────────────────────────
  if (
    url.pathname.startsWith("/brand/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      }),
    );
    return;
  }

  // ── 5. Navigation requests (HTML pages) ───────────────────────────────
  // Network-first with progressive fallback chain:
  //   1. Try network
  //   2. Fall back to exact URL in cache
  //   3. For POS/invoice paths, fall back to cached /pos shell
  //   4. Fall back to cached /offline page
  //   5. Bare offline text as last resort
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback chain
          const cached = await caches.match(request);
          if (cached) return cached;

          // For POS, invoice, or cash pages — fall back to cached /pos shell
          if (
            url.pathname.startsWith("/pos") ||
            url.pathname.startsWith("/invoice") ||
            url.pathname.startsWith("/cash")
          ) {
            const posShell = await caches.match("/pos");
            if (posShell) return posShell;
          }

          const offlinePage = await caches.match("/offline");
          if (offlinePage) return offlinePage;

          return new Response("Offline — Sheikh Al Kar POS", {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }),
    );
    return;
  }

  // ── 6. All other sub-requests ─────────────────────────────────────────
  // Network-first with cache fallback (covers dynamically loaded chunks, etc.)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && request.method === "GET") {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        return cached || new Response("", { status: 503 });
      }),
  );
});
