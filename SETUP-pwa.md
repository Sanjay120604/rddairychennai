# RD Dairy — PWA (Installable App) Setup

Your site is now an installable app (PWA). These files make it work:

| File | Purpose |
|------|---------|
| `manifest.json` | App name, icon, colors — tells the phone it's installable |
| `sw.js` | Service worker — fast loads + offline shell (never caches orders/login) |
| `icon-192.png` / `icon-512.png` / `icon-180.png` | App icons |
| `icon-512-maskable.png` | Android adaptive icon |

## Setup
1. Upload ALL of these to the **same folder** as `index.html` (alongside auth/profile/admin/stats).
2. The site MUST be served over **HTTPS** (any normal host — Netlify, Vercel, Hostinger, GitHub Pages — gives you this free). PWAs do not install over plain http or file://.
3. Open the site on a phone → after a few seconds the "Install RD Dairy App" banner appears (or use the browser menu → "Add to Home Screen").

## Updating the app later
When you change the site, open `sw.js` and bump the version:
```
const CACHE_VERSION = 'rd-dairy-v1';   // change to v2, v3, ...
```
This forces phones to load the new version instead of a cached old one.

## Getting it on the Google Play Store (later)
A PWA can be wrapped into a Play Store app via a **TWA** (Trusted Web Activity):
1. Go to https://www.pwabuilder.com
2. Enter your live website URL.
3. It checks your manifest/service worker, then generates an Android package (.aab).
4. Create a Google Play Developer account (one-time $25) and upload the .aab.

We can walk through PWABuilder together once your site is live.

## Still pending (do last)
- **Website QR code (#6)** — we'll generate it once you give me the live URL. It'll be quick: one QR for the store link, optionally one for app install.
