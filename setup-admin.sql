-- =====================================================================
-- La_Fleuren — Admin Dashboard setup
-- Run this once in Supabase → SQL Editor → New query → Run
-- Safe to re-run: every statement is written to be idempotent.
-- =====================================================================

-- 1) Track real stock numbers on products (in addition to the in_stock flag)
alter table public.products
  add column if not exists stock_quantity integer not null default 0;

-- 1b) Optional short description shown in the storefront's product quick-view
alter table public.products
  add column if not exists description text;

-- Keep in_stock automatically in sync with stock_quantity whenever it changes
create or replace function public.sync_in_stock()
returns trigger as $$
begin
  new.in_stock := new.stock_quantity > 0;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_in_stock on public.products;
create trigger trg_sync_in_stock
  before insert or update of stock_quantity on public.products
  for each row execute function public.sync_in_stock();

-- 2) Make sure orders have a timestamp to sort/report on
alter table public.orders
  add column if not exists created_at timestamptz not null default now();

-- =====================================================================
-- 3) Row Level Security
--    Public storefront keeps read-only / insert-only access.
--    Only signed-in admin accounts (Supabase Auth users) can manage data.
-- =====================================================================
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Storefront: anyone can see in-stock products
drop policy if exists "Public can view in-stock products" on public.products;
create policy "Public can view in-stock products"
  on public.products for select
  to anon
  using (in_stock = true);

-- Admin dashboard: signed-in users can do everything with products
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

-- Storefront checkout: anyone can create an order, but cannot read/edit orders
drop policy if exists "Public can create orders" on public.orders;
create policy "Public can create orders"
  on public.orders for insert
  to anon
  with check (true);

-- Admin dashboard: signed-in users can view and update all orders
drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders"
  on public.orders for all
  to authenticated
  using (true)
  with check (true);

-- =====================================================================
-- 4) Storage bucket for product photos uploaded from the dashboard
--    (skip this block if you'd rather create the bucket from
--    Storage → New bucket → name it "product-images" → Public)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

-- =====================================================================
-- 5) Create your admin login (do this from the dashboard, not SQL):
--    Authentication → Users → Add user
--      - Email: your team email
--      - Password: set one, or send an invite
--      - Auto Confirm User: ON
--    Then sign in with that email/password at admin/index.html
--    There is no public sign-up on the admin page — accounts are only
--    created by you from the Supabase dashboard.
-- =====================================================================
