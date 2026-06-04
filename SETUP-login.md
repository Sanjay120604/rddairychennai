# RD Dairy — Login / Register Setup Guide

You have two files:

- **auth.html** — the login/register page (goes on your website)
- **Code.gs** — the backend code (goes inside a Google Sheet)

Follow these steps once. It takes about 10 minutes.

---

## Step 1 — Create the Google Sheet (your database)

1. Go to https://sheets.google.com and create a **new blank spreadsheet**.
2. Rename it to something like **"RD Dairy Data"**.
3. You don't need to add any columns — the script creates them automatically.

## Step 2 — Add the backend code

1. In that spreadsheet, click **Extensions → Apps Script**.
2. Delete whatever code is shown in the editor.
3. Open **Code.gs** (the file I gave you), copy everything, and paste it in.
4. **Important:** find this line near the top and change the secret to your own long random text:
   ```
   var SALT = "rd-dairy-CHANGE-this-to-a-long-random-secret-9f8a7b6c5d";
   ```
   Just mash some random letters/numbers. Keep it private. (If you ever change this later, old passwords stop working — so set it once and leave it.)
5. Click the **Save** icon (💾).

## Step 3 — Deploy it as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear ⚙️ next to "Select type" → choose **Web app**.
3. Set:
   - **Description:** RD Dairy backend
   - **Execute as:** *Me*
   - **Who has access:** *Anyone*  ← this is required so your website can reach it
4. Click **Deploy**.
5. Google will ask you to **authorize** — approve it (it's your own script). If it warns "Google hasn't verified this app", click **Advanced → Go to (project) → Allow**. This is normal for your own scripts.
6. Copy the **Web app URL** it gives you. It looks like:
   ```
   https://script.google.com/macros/s/AKfy............/exec
   ```

## Step 4 — Connect the website to the backend

1. Open **auth.html** in a text editor.
2. Find this line (near the bottom, in the `<script>`):
   ```js
   const API_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
3. Replace the placeholder with the URL you copied:
   ```js
   const API_URL = "https://script.google.com/macros/s/AKfy............/exec";
   ```
4. Save the file.

## Step 5 — Test it

1. Open **auth.html** in your browser.
2. Click **Register**, create an account.
3. Check your Google Sheet — a **"Users"** tab appears with your entry. The password column shows a long scrambled hash, **not** your real password. ✅
4. Log out, then log back in with the same mobile + password.
5. Try registering again with the **same mobile number** — you should see **"User already exists."** ✅

---

## How "stay logged in" works

Once a user logs in, their session is saved in the browser (localStorage). They stay logged in — even after closing the tab — until they click **Log out**. No re-login needed.

## Linking it from your main site

On your `index.html`, point your "Login" / "Account" button to this page:
```html
<a href="auth.html">Login</a>
```

## Security notes (important)

- Passwords are **salted + SHA-256 hashed** before storage — you (and anyone who sees the sheet) cannot read users' real passwords. Good.
- This is solid for a small business store. If the app grows large, a dedicated database + a password system with rate-limiting is the next upgrade — but you do **not** need that yet.
- Keep the spreadsheet itself private (don't share the sheet link publicly).

---

## What's next (from your list)

This covers **#1 (login/register)**. Still to do, whenever you're ready:
- Direct ordering + subscription (replacing WhatsApp), writing orders into the same Google Sheet
- Admin dashboard (view users, orders, addresses, payment status, products)
- Website QR code
- Packaging as a mobile app (PWA → Play Store via TWA)

Just tell me which one you want next and I'll build on this same Google Sheet backend.
