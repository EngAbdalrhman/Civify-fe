const CACHE_NAME = "civify-cache-v1";
const STATIC_ASSETS = [
  "/civify-logo-simple.png",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests (like POST to /monitoring or API routes)
  if (event.request.method !== "GET") {
    return;
  }

  // Handle next.js data requests
  if (event.request.url.includes("/_next/data/")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request)),
    );
    return;
  }

  // Handle static assets (cache-first)
  if (event.request.url.match(/\.(png|jpg|jpeg|svg|gif|ico|css|js)$/)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((fetchResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          })
        );
      }),
    );
    return;
  }

  // Handle other requests (network-first)
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
