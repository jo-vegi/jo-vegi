/* Jo-Vegi service worker — offline shell + cache-first assets */
const CACHE = "jovegi-v2";
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/products.js",
  "./js/i18n.js",
  "./js/app.js",
  "./img/logo-badge.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // navigations: network first, fall back to cached shell (offline support)
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((r) => { caches.open(CACHE).then((c) => c.put("./index.html", r.clone())); return r; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // assets: cache first, then network (and remember it)
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((r) => {
          if (r.ok) caches.open(CACHE).then((c) => c.put(req, r.clone()));
          return r;
        })
    )
  );
});
