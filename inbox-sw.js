// RD Dairy inbox alerts (file name: inbox-sw.js, upload next to inbox.html)
// Registered only for inbox.html, so the website's own sw.js keeps working untouched
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "RD Dairy inbox", {
    body: d.body || "New customer message",
    icon: "inbox-icon-192.png",
    badge: "inbox-icon-192.png",
    tag: d.tag || undefined,
    renotify: true,
    data: { url: new URL("inbox.html", self.registration.scope).href },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || new URL("inbox.html", self.registration.scope).href;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.indexOf("inbox.html") !== -1) { await w.focus(); w.postMessage("refresh"); return; }
    }
    await self.clients.openWindow(target);
  })());
});
