# RD Dairy — Update 3: Subscriptions in cart, COD/Online, Profiles, Mobile

## What changed

**New file:** `profile.html` (user profile page)
**Updated:** `index.html`, `auth.html`, `Code.gs`

### 1. Milk & Pouch → "Add / Subscribe"
Clicking it now adds the item to the cart **tagged as a Subscription** (shown with a SUBSCRIPTION badge). No plan picker. At checkout, subscription items are saved to the **Subscriptions** sheet; normal items go to **Orders** — automatically, in one go.

### 2. Other products → "Order Now"
Now opens a **COD / Pay Online** chooser:
- **Cash on Delivery** → asks for address → places the order immediately (status: *COD - Pending Delivery*).
- **Pay Online** → asks for address → shows your UPI QR → customer pays → enters UPI reference → order saved (status: *Payment Submitted*).

The same chooser appears for the cart's **Place Order** button.

### 3. User Profiles
- After **register**, users land on `profile.html` and must fill Name, Email (optional), and Address before they can shop.
- After **login**, if their profile is incomplete they're sent to `profile.html`; otherwise straight to the store.
- Profile is saved in the **Users** sheet (new Email + Address columns).
- At checkout, the address modal offers **"Use my saved address"** or **"Use a different address"** — so they never have to retype it.
- "My Account" links added to the nav (desktop + mobile).

### 4. Mobile responsive
The new profile page and both checkout modals are fully responsive (the COD/Online choices stack on small screens). The rest of the site already was.

## Setup steps

1. **Backend:** open your Google Sheet → Extensions → Apps Script → paste the new `Code.gs` → Save.
2. **Re-deploy:** Deploy → Manage deployments → ✏️ → Version: **New version** → Deploy. (URL stays the same.)
   - The **Users** sheet will gain **Email** and **Address** columns automatically. Existing users simply have them blank until they fill their profile.
3. **Paste your Web App URL** into `profile.html` (look for `var API_URL`). It's already in the other files if you set them before — but double-check `index.html`'s `RD_API_URL`.
4. **Upload** `index.html`, `auth.html`, `profile.html`, `admin.html`, `stats.html` to the same folder.

## Reminder about the URL placeholders
In every file the real URL goes in **one place only** — the `var ... = "..."` definition line. Never replace the `PASTE_YOUR` text inside the `if (...indexOf('PASTE_YOUR')...)` safety check.

## Test flow
1. Register a new account → you're taken to the profile page → fill address → land on store.
2. Add **A2 Cow Milk** → it appears in cart with a **SUBSCRIPTION** badge.
3. Add **Paneer** → normal item. Click **Place Order** → choose COD → confirm saved address → done.
4. Check the sheet: the milk is a row in **Subscriptions**, the paneer in **Orders**.
5. Open `admin.html` to see both; `stats.html` for the numbers.
