# MALIK Digital Store

A dark-neon digital products store (ebooks, prompt packs, services) built with **React 18 + Vite + Tailwind CSS v3 + Supabase**, deployed on **Vercel**. Customers pay via JazzCash / Easypaisa / bank transfer, upload a payment screenshot, and download their files after the admin approves the order.

---

## 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **New project** → pick a name (e.g. `malik-digital-store`), set a database password, choose the closest region.
3. Wait for the project to finish provisioning.

## 2. Run the database schema

1. In your Supabase project, open **SQL Editor** (left sidebar).
2. Open a **New query**, paste the entire contents of `supabase/schema.sql` from this repo, and click **Run**.
3. This creates all tables (`categories`, `products`, `coupons`, `orders`, `order_items`, `reviews`, `profiles`, `payment_methods`, `newsletter`), the `is_admin()` helper, all RLS policies, and the storage policies.

## 3. Create the 4 storage buckets

Go to **Storage** (left sidebar) → **New bucket**, and create these with the **exact** names:

| Bucket name           | Public? | Purpose                                  |
|-----------------------|---------|------------------------------------------|
| `covers`              | ✅ Yes   | Product cover images                     |
| `previews`            | ✅ Yes   | Public preview images/videos             |
| `product-files`       | ❌ No    | Paid download files (private)            |
| `payment-screenshots` | ❌ No    | Customer payment screenshots (private)   |

Names and public/private settings must match exactly, or uploads and downloads will fail.

## 4. Run the seed data

1. Open **SQL Editor** → **New query**.
2. Paste the contents of `supabase/seed.sql` and click **Run**.
3. This inserts 4 categories, 3 clearly-labeled `[SAMPLE]` products, placeholder payment methods, and a `WELCOME10` (10% off) coupon. Re-running is safe (`ON CONFLICT DO NOTHING`).

## 5. Make yourself an admin

Sign up once in the app (or just know the email you'll sign up with), then run this in the **SQL Editor** — replacing the email:

```sql
update public.profiles
set is_admin = true
where email = 'you@example.com';
```

Only admins can open `/admin/*`.

## 6. Local development

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

(Find both under **Project Settings → API** in Supabase.)

```bash
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`). Admin panel: `/admin`.

## 7. Deploy on Vercel

1. **Create the GitHub repo yourself** — do not use automation for this step. Create a new repository on github.com, then push this project to it:
   ```bash
   git init
   git add .
   git commit -m "MALIK Digital Store"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import your repo.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. Every push to `main` redeploys automatically.

---

## Adding real products

1. Open `/admin` → **Products** → **+ New product**.
2. Fill in title, prices, description, category, tags.
3. **Cover image:** click **Upload cover** (goes to the public `covers` bucket; the URL is saved automatically) — or paste an image URL.
4. **Download file:** click **Upload file** (goes to the private `product-files` bucket; the path is saved automatically).
5. Toggle **Active** so it appears in the store; use **Featured** for the homepage and **New** for the new badge.
6. Delete the `[SAMPLE]` products once your real ones are live.

## Where payment account numbers go

**Admin → Settings.** Replace the placeholder `YOUR NAME HERE / 0300-0000000` rows with your real JazzCash / Easypaisa / bank account title and number, plus the instructions customers see at checkout. Only methods toggled **Active** appear at checkout.

## How the download flow works

1. Customer checks out as guest (email + WhatsApp), picks a payment method, sees your account details, and uploads their payment screenshot (stored privately in `payment-screenshots`).
2. Order is created with status **pending**. You review the screenshot in **Admin → Orders** (click a row to expand it) and click **Approve** → status becomes **verified**.
3. After you fulfill the order, click **Deliver** → status becomes **delivered**.
4. The customer (in **Account → My Downloads**) now sees the item. Clicking download calls `supabase.storage.from('product-files').createSignedUrl(file_path, 3600)` — a **1-hour signed URL** that works even though the bucket is private. RLS only allows this for users with a `delivered` order containing that product.
5. Services (no file) are delivered manually — e.g. via the **Send on WhatsApp** link with the order id.

## Project structure

```
supabase/
  schema.sql   # tables, RLS, storage policies (run first)
  seed.sql     # sample categories/products/coupons/payment placeholders (run second)
src/
  lib/         # supabase client, pkr(), cart, toast, auth (isAdmin)
  components/  # Navbar, ProductCard, Badge, etc.
  pages/       # Home, Shop, Product, Cart, Checkout, Account, …
  admin/       # AdminLayout + Dashboard, Products, Orders, Coupons,
               #   Customers, Reviews, Settings (guarded by isAdmin)
```

## Notes

- Currency is PKR everywhere via `pkr()`.
- Tables scroll horizontally on mobile; the admin sidebar becomes a top scroll nav.
- Sample data is always labeled `[SAMPLE]` — never ship it as real content.
- If an upload fails, check that the bucket exists with the exact name and that your profile has `is_admin = true` (storage write policies require it).
