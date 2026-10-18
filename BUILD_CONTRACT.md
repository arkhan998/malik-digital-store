# MALIK Digital Store — BUILD CONTRACT (authoritative)

Every worker MUST follow these contracts verbatim. Do not rename files, exports, routes, tables, or columns.

## Tech
React 18 + Vite + Tailwind CSS v3 + Supabase (auth, Postgres, storage) + react-router-dom.
Dark neon look: bg `#0b0b12`, cards `#15151d`, gradient `#ff7a1a → #ff2e88 → #8b5cf6 → #00b4ff`.
Mobile-first. No fake data (only clearly-labeled SAMPLE products). All images: `loading="lazy"`. Accessible `:focus-visible` states.

## src/lib (exact exports)
- `src/lib/supabase.js` → exports `supabase` (createClient from `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`).
- `src/lib/format.js` → exports `pkr(n)` → `"Rs. 1,500"` (PKR, thousands separators).
- `src/lib/cart.jsx` → `CartProvider`, `useCart()` → `{items, addItem(product), removeItem(id), setQty(id,qty), clear(), subtotal, count}`; localStorage persistence; item = `{id, title, price, sale_price, cover_url, slug}`. `subtotal` uses `sale_price ?? price`.
- `src/lib/toast.jsx` → `ToastProvider`, `useToast()` → `toast(msg, type='info'|'success'|'error')`.
- `src/lib/auth.jsx` → `AuthProvider`, `useAuth()` → `{user, profile, isAdmin, loading, signUp(email,password,whatsapp), signIn(email,password), signOut()}`. `isAdmin` = `!!profile?.is_admin`.

## Routes (react-router-dom)
- `/` Home, `/shop`, `/product/:slug`, `/cart`, `/checkout`, `/order-success/:id`, `/track`, `/account`, `/login`, `/about`, `/contact`, `/refund-policy`, `/terms`, `/privacy`, `*` NotFound.
- Admin (guarded by `isAdmin`, redirect to `/login` if not): `/admin` Dashboard, `/admin/products`, `/admin/orders`, `/admin/coupons`, `/admin/customers`, `/admin/reviews`, `/admin/settings`.

## Components (src/components/)
Navbar, Ticker, Footer, ProductCard, Skeleton (exports `ProductCardSkeleton`), WhatsAppFloat, Breadcrumbs, Reveal (scroll-reveal wrapper), TrustStrip, SectionHead, EmptyState, Badge.

## Database (supabase/schema.sql — coordinator owns this file)
Tables: categories, products, coupons, orders, order_items, reviews, profiles, payment_methods, newsletter — with columns/constraints exactly as in the parent task. Buckets: `covers` (public), `previews` (public), `product-files` (private), `payment-screenshots` (private).
RLS: public read active products/categories/approved reviews/active coupons (by code)/active payment_methods; users read own orders+items; users insert orders+items+reviews+newsletter; public read covers/previews; `product-files` readable only when user has a `delivered` order containing that product (EXISTS subquery); admins bypass via `is_admin()` SECURITY DEFINER function on profiles.

## Download flow
Account → "My Downloads" lists delivered order items → `supabase.storage.from('product-files').createSignedUrl(file_path, 3600)` → open signed URL (1h). Also "Send on WhatsApp" (wa.me link with order id).

## Checkout
Guest allowed (email + whatsapp required). Choose payment method → show account details from `payment_methods` → upload screenshot to `payment-screenshots` → create order (status `pending`) + items → redirect `/order-success/:id`. Coupon validated in cart (code, min_order, expiry).

## File placement
- Worker A: package.json, vite.config.js, tailwind.config.js, postcss.config.js, index.html, src/main.jsx, src/index.css, src/App.jsx, all src/lib/*, all src/components/*.
- Worker B: all src/pages/* (Home, Shop, Product, Cart, Checkout, OrderSuccess, TrackOrder, Account, Login, About, Contact, RefundPolicy, Terms, Privacy, NotFound).
- Worker C: supabase/seed.sql, src/admin/* (Dashboard, Products, Orders, Coupons, Customers, Reviews, Settings + AdminLayout), README.md.

## Rules
- Follow contracts verbatim. If a contract is ambiguous, pick the simplest consistent choice and note it in your report.
- No fake data. Sample products labeled "SAMPLE" clearly.
- All user-visible text: English. Currency: PKR via `pkr()`.
- Mobile-first Tailwind classes. `loading="lazy"` on `<img>`. `focus-visible:` states on interactive elements.
- Do NOT run `npm install` or `npm run build` — the coordinator integrates.
- Report back: files created + any deviations from this contract.
