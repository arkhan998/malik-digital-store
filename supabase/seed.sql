-- MALIK Digital Store — seed data. Run AFTER supabase/schema.sql in the SQL editor.
-- Everything here is clearly SAMPLE data. Replace with real content before going live.
-- Safe to re-run: inserts use ON CONFLICT DO NOTHING on unique keys.

-- ============ categories ============
insert into public.categories (name, slug) values
  ('Ebooks', 'ebooks'),
  ('Prompt Packs', 'prompt-packs'),
  ('Services', 'services'),
  ('Templates', 'templates')
on conflict (slug) do nothing;

-- ============ sample products ============
-- cover_url / preview_urls / file_path are NULL on purpose:
-- the admin uploads the real cover/file later in Admin → Products.
insert into public.products
  (title, slug, short_desc, full_desc, whats_included, price, sale_price,
   category_id, tags, cover_url, preview_urls, file_path,
   is_active, is_featured, is_new)
values
  (
    '[SAMPLE] AI Faceless Videos Ebook',
    'sample-ai-faceless-videos-ebook',
    'SAMPLE — a complete beginner guide to creating faceless AI videos and earning from them.',
    'SAMPLE PRODUCT — replace with your real ebook before going live. This demo entry shows how a finished product looks in the store: a step-by-step guide (in Roman Urdu + English) covering niche selection, script writing with AI, voiceovers, video generation, editing in CapCut, and publishing on Facebook, TikTok and YouTube.',
    array[
      'SAMPLE: 10 chapters (Roman Urdu + English)',
      'SAMPLE: 50+ copy-paste AI prompts',
      'SAMPLE: CapCut editing workflow',
      'SAMPLE: posting schedule + monetization checklist'
    ],
    999, 799,
    (select id from public.categories where slug = 'ebooks'),
    array['ai', 'faceless', 'video', 'ebook', 'sample'],
    null, null, null,   -- admin uploads real cover/file in Admin → Products
    true, true, false
  ),
  (
    '[SAMPLE] Master Prompts Pack',
    'sample-master-prompts-pack',
    'SAMPLE — 200+ ready-to-use prompts for videos, images and marketing copy.',
    'SAMPLE PRODUCT — replace with your real prompt pack before going live. A curated collection of tested prompts for AI video scenes, thumbnails, ad copy and social posts, organized by category with usage tips.',
    array[
      'SAMPLE: 200+ categorized prompts',
      'SAMPLE: video + image + copy sections',
      'SAMPLE: usage tips for each category'
    ],
    499, null,
    (select id from public.categories where slug = 'prompt-packs'),
    array['prompts', 'ai', 'marketing', 'sample'],
    null, null, null,   -- admin uploads real cover/file in Admin → Products
    true, false, true
  ),
  (
    '[SAMPLE] AI Promo Video Service',
    'sample-ai-promo-video-service',
    'SAMPLE — done-for-you AI promo video for your business (service, not a download).',
    'SAMPLE PRODUCT — replace with your real service listing before going live. A done-for-you service: the customer orders, shares their business details on WhatsApp, and receives a finished AI promo video within 3 working days. No file download for this item.',
    array[
      'SAMPLE: 30–60 second promo video',
      'SAMPLE: script + voiceover included',
      'SAMPLE: 1 revision round',
      'SAMPLE: delivered via WhatsApp in 3 working days'
    ],
    2500, null,
    (select id from public.categories where slug = 'services'),
    array['service', 'video', 'promo', 'sample'],
    null, null, null,   -- admin uploads real cover in Admin → Products
    true, false, false
  )
on conflict (slug) do nothing;

-- ============ payment methods (placeholders) ============
-- IMPORTANT: replace these placeholder account details with your real ones
-- in Admin → Settings before accepting orders.
insert into public.payment_methods (method, account_title, account_number, instructions, is_active) values
  ('JazzCash', 'YOUR NAME HERE', '0300-0000000',
   'Send the exact total via JazzCash to the number above, then upload the payment screenshot on checkout.', true),
  ('Easypaisa', 'YOUR NAME HERE', '0300-0000000',
   'Send the exact total via Easypaisa to the number above, then upload the payment screenshot on checkout.', true),
  ('Bank Transfer', 'YOUR NAME HERE', '0000-0000000000',
   'Transfer the exact total to the bank account above (IBAN), then upload the payment screenshot on checkout.', true)
on conflict (method) do nothing;

-- ============ sample coupon ============
insert into public.coupons (code, discount_type, discount_value, min_order, is_active)
values ('WELCOME10', 'percent', 10, 0, true)
on conflict (code) do nothing;
