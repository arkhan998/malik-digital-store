-- MALIK Digital Store — schema. Run in Supabase SQL editor.
-- Then create buckets: covers (public), previews (public), product-files (private), payment-screenshots (private).

-- ============ helper: admin check ============
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ============ tables ============
create table public.categories (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

create table public.products (
  id bigint generated always as identity primary key,
  title text not null,
  slug text not null unique,
  short_desc text not null default '',
  full_desc text not null default '',
  whats_included text[] not null default '{}',
  price int not null check (price >= 0),
  sale_price int check (sale_price is null or sale_price >= 0),
  category_id bigint references public.categories(id) on delete set null,
  tags text[] not null default '{}',
  cover_url text,
  preview_urls text[] not null default '{}',
  file_path text,
  rating numeric not null default 0,
  reviews_count int not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  created_at timestamptz default now()
);

create table public.coupons (
  id bigint generated always as identity primary key,
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','flat')),
  discount_value int not null check (discount_value >= 0),
  min_order int not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table public.orders (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  whatsapp text not null,
  payment_method text not null,
  payment_screenshot_path text,
  subtotal int not null default 0,
  discount int not null default 0,
  total int not null default 0,
  coupon_code text,
  status text not null default 'pending' check (status in ('pending','verified','delivered','rejected')),
  created_at timestamptz default now()
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  price int not null default 0
);

create table public.reviews (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  rating int not null check (rating between 1 and 5),
  text text not null,
  is_approved boolean not null default false,
  created_at timestamptz default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  whatsapp text,
  is_admin boolean not null default false,
  created_at timestamptz default now()
);

create table public.payment_methods (
  id bigint generated always as identity primary key,
  method text not null unique,
  account_title text not null default '',
  account_number text not null default '',
  instructions text not null default '',
  is_active boolean not null default true
);

create table public.newsletter (
  id bigint generated always as identity primary key,
  email text not null unique,
  created_at timestamptz default now()
);

-- ============ RLS ============
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.profiles enable row level security;
alter table public.payment_methods enable row level security;
alter table public.newsletter enable row level security;

-- public reads
create policy "public read categories" on public.categories for select using (true);
create policy "public read active products" on public.products for select using (is_active = true);
create policy "public read approved reviews" on public.reviews for select using (is_approved = true);
create policy "public read active coupons" on public.coupons for select using (is_active = true);
create policy "public read active payment methods" on public.payment_methods for select using (is_active = true);

-- users: own orders/items
create policy "users read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "users read own order items" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid()));
create policy "users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);

-- users: inserts
create policy "anyone insert orders" on public.orders for insert with check (true);
create policy "anyone insert order items" on public.order_items for insert with check (true);
create policy "anyone insert reviews" on public.reviews for insert with check (true);
create policy "anyone insert newsletter" on public.newsletter for insert with check (true);
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- admins: full access
create policy "admin all categories" on public.categories for all using (public.is_admin());
create policy "admin all products" on public.products for all using (public.is_admin());
create policy "admin all coupons" on public.coupons for all using (public.is_admin());
create policy "admin all orders" on public.orders for all using (public.is_admin());
create policy "admin all order_items" on public.order_items for all using (public.is_admin());
create policy "admin all reviews" on public.reviews for all using (public.is_admin());
create policy "admin all profiles" on public.profiles for all using (public.is_admin());
create policy "admin all payment_methods" on public.payment_methods for all using (public.is_admin());
create policy "admin all newsletter" on public.newsletter for all using (public.is_admin());

-- ============ storage policies ============
-- covers + previews: public buckets, public read; only admins write
create policy "public read covers" on storage.objects for select using (bucket_id = 'covers');
create policy "admin write covers" on storage.objects for insert with check (bucket_id = 'covers' and public.is_admin());
create policy "admin update covers" on storage.objects for update using (bucket_id = 'covers' and public.is_admin());
create policy "admin delete covers" on storage.objects for delete using (bucket_id = 'covers' and public.is_admin());
create policy "public read previews" on storage.objects for select using (bucket_id = 'previews');
create policy "admin write previews" on storage.objects for insert with check (bucket_id = 'previews' and public.is_admin());
create policy "admin update previews" on storage.objects for update using (bucket_id = 'previews' and public.is_admin());
create policy "admin delete previews" on storage.objects for delete using (bucket_id = 'previews' and public.is_admin());

-- payment-screenshots: private; anyone may upload during checkout, users read own, admins read all
create policy "anyone upload screenshots" on storage.objects for insert with check (bucket_id = 'payment-screenshots');
create policy "users read own screenshots" on storage.objects for select
  using (bucket_id = 'payment-screenshots' and auth.uid() is not null and
    exists (select 1 from public.orders o where o.user_id = auth.uid() and o.payment_screenshot_path = storage.objects.name));
create policy "admin read screenshots" on storage.objects for select using (bucket_id = 'payment-screenshots' and public.is_admin());

-- product-files: private; readable only when user has a DELIVERED order containing that product; admins bypass
create policy "delivered buyers read product files" on storage.objects for select
  using (bucket_id = 'product-files' and auth.uid() is not null and
    exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      join public.products p on p.id = oi.product_id
      where o.user_id = auth.uid() and o.status = 'delivered'
        and p.file_path = storage.objects.name
    ));
create policy "admin write product files" on storage.objects for insert with check (bucket_id = 'product-files' and public.is_admin());
create policy "admin update product files" on storage.objects for update using (bucket_id = 'product-files' and public.is_admin());
create policy "admin delete product files" on storage.objects for delete using (bucket_id = 'product-files' and public.is_admin());
