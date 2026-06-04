# RD Dairy — Direct Ordering, Subscriptions, Admin & Analytics

You now have a full system on top of your login. Everything uses **one Google Sheet** as the database.

## Files

| File | What it is |
|------|-----------|
| `index.html` | Your store — now places orders & subscriptions **directly** (no WhatsApp) |
| `auth.html` | Login / Register (already set up) |
| `admin.html` | **Admin dashboard** — see all orders & subscriptions, update statuses |
| `stats.html` | **Analytics** — revenue, top products, payment status charts |
| `Code.gs` | Backend — paste into your Google Sheet's Apps Script |

## Step 1 — Update the backend (Code.gs)

1. Open your Google Sheet → **Extensions → Apps Script**.
2. Delete the old code, paste the **new `Code.gs`** in full.
3. Near the top, set your admin password:
   ```
   var ADMIN_KEY = "rdadmin2026";   // change this to your own
   ```
   (Leave `SALT` exactly as it is — changing it breaks existing passwords.)
4. Save.

## Step 2 — Re-deploy (IMPORTANT)

Because the code changed, you must publish the new version:
1. **Deploy → Manage deployments**.
2. Click the ✏️ pencil on your existing deployment.
3. Under **Version**, choose **New version**.
4. Click **Deploy**.

> Your Web App URL stays the SAME. Good — you don't need to change it anywhere.
> (Only if you ever create a brand-new deployment do you get a new URL.)

## Step 3 — Paste your Web App URL into the pages

Open each of these files and replace `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` with your `/exec` URL:
- `index.html`  → look for `var RD_API_URL =`
- `admin.html`  → look for `var API_URL =`
- `stats.html`  → look for `var API_URL =`

(auth.html already has it.)

## Step 4 — Upload all files to your host

Put `index.html`, `auth.html`, `admin.html`, `stats.html` in the **same folder**.

---

## How it works now

### Ordering (customers)
1. Customer logs in (required — if not, they're sent to the login page).
2. Adds products to cart → clicks **Place Order** or **Pay Online (UPI/QR)**.
3. The QR/UPI screen shows. They pay with any UPI app.
4. They click **Confirm & Place Order** → enter their **delivery address** and **UPI reference number**.
5. The order is saved to the **Orders** tab with status *Payment Submitted*.

> Name & mobile come automatically from their logged-in account — they don't re-type them.

### Subscriptions
The subscription form now saves to the **Subscriptions** tab (auto-filled with the logged-in name/mobile). Status starts as *Pending Confirmation*.

### Admin dashboard (`admin.html`)
- Enter your admin password.
- See every order and subscription: **Name, Mobile, Address, Items/Product, Amount, Payment Ref, Status**.
- Change any status from a dropdown (e.g. *Payment Submitted → Paid → Delivered*). It saves to the sheet instantly.
- Search box filters by name/mobile/product.

### Analytics (`stats.html`)
- Revenue (last 14 days) line chart
- Top products bar chart
- Paid vs pending doughnut
- Headline cards: revenue, orders, users, active subscriptions

---

## About payment status (important to understand)

A static UPI QR can't tell your system whether money actually arrived. So the flow is:
- Customer pays → submits their **UPI reference number** → order logs as **"Payment Submitted"**.
- **You** check your bank/UPI app, confirm the money, then mark the order **"Paid"** in the admin dashboard.

Revenue in analytics counts only orders you've marked **Paid** (or *Received/Confirmed*), so your numbers stay accurate.

> Later, if you want payments confirmed **automatically**, that needs a real payment gateway (Razorpay/Cashfree). We can add that as a future step.

---

## Quick test

1. Log in as a customer, add a product, place an order with a fake reference like `TEST123`.
2. Open `admin.html`, enter your admin password → your order appears under **Orders**.
3. Change its status to **Paid**.
4. Open `stats.html` → revenue and charts update.

## Still to do from your list
- Website QR code (#6)
- Mobile app via PWA → Play Store (#7)
