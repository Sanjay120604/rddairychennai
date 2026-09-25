/* ============================================================
   RD DAIRY SERVICE WORKER
   Pages (HTML): network first, so every visit gets the latest upload.
                 The saved copy is used only when the phone is offline.
   Images, fonts, CSS, JS on rddairy.com: served from cache, refreshed in the background.
   Supabase / API calls and anything that is not a GET: never cached.

   When you change this file, bump CACHE_VERSION (v2 -> v3) so old caches clear.
   ============================================================ */
const CACHE_VERSION = 'rddairy-v2';
const PAGE_CACHE = CACHE_VERSION + '-pages';
const ASSET_CACHE = CACHE_VERSION + '-assets';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PAGE_CACHE)
      .then((cache) => cache.add(new Request('/', { cache: 'reload' })))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase, fonts, CDNs: straight to network

  const isPage = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isPage) {
    // Network first: always try for the newest page
    event.respondWith(
      fetch(new Request(req, { cache: 'no-store' }))
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(PAGE_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match('/'))
        )
    );
    return;
  }

  // Static files: cache, then refresh in the background
  event.respondWith(
    caches.open(ASSET_CACHE).then((cache) =>
      cache.match(req).then((hit) => {
        const fresh = fetch(req)
          .then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || fresh;
      })
    )
  );
});
