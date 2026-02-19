-- =============================================================================
-- In-Stocker — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSION
-- ---------------------------------------------------------------------------

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- TABLE: profiles
-- Extends Supabase's built-in auth.users (1-to-1).
-- Stores shop-level metadata per user.
-- ---------------------------------------------------------------------------

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  shop_name     text        not null,
  owner_name    text        not null,
  currency      text        not null default '฿',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is
  'One profile per authenticated user. Extends auth.users with shop metadata.';

-- ---------------------------------------------------------------------------
-- TABLE: products
-- Belongs to a user (shop owner). Tracks stock levels.
-- ---------------------------------------------------------------------------

create table public.products (
  id                   uuid        primary key default uuid_generate_v4(),
  user_id              uuid        not null references public.profiles (id) on delete cascade,
  name                 text        not null,
  sku                  text        not null,
  description          text,
  category             text,
  price                numeric(12, 2) not null check (price >= 0),
  quantity             int         not null default 0 check (quantity >= 0),
  low_stock_threshold  int         not null default 5 check (low_stock_threshold >= 0),
  image_url            text,
  is_active            boolean     not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  -- SKU must be unique per shop (user), not globally
  unique (user_id, sku)
);

comment on table public.products is
  'Products owned by a shop. quantity is the live stock level.';

comment on column public.products.low_stock_threshold is
  'Alert is triggered when quantity <= this value.';

-- ---------------------------------------------------------------------------
-- TABLE: sales
-- A single sales transaction header.
-- ---------------------------------------------------------------------------

create table public.sales (
  id            uuid          primary key default uuid_generate_v4(),
  user_id       uuid          not null references public.profiles (id) on delete cascade,
  total_amount  numeric(12, 2) not null check (total_amount >= 0),
  note          text,
  created_at    timestamptz   not null default now()
);

comment on table public.sales is
  'One row per completed sale transaction.';

-- ---------------------------------------------------------------------------
-- TABLE: sale_items
-- Line items belonging to a sale. Snapshot of price at time of sale.
-- ---------------------------------------------------------------------------

create table public.sale_items (
  id            uuid          primary key default uuid_generate_v4(),
  sale_id       uuid          not null references public.sales (id) on delete cascade,
  product_id    uuid          not null references public.products (id) on delete restrict,
  product_name  text          not null,  -- snapshot: preserves name if product is renamed
  quantity      int           not null check (quantity > 0),
  unit_price    numeric(12, 2) not null check (unit_price >= 0),
  subtotal      numeric(12, 2) generated always as (quantity * unit_price) stored,
  created_at    timestamptz   not null default now()
);

comment on table public.sale_items is
  'Line items for each sale. unit_price is snapshotted at sale time.';

-- ---------------------------------------------------------------------------
-- FUNCTION + TRIGGER: auto-update updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- FUNCTION + TRIGGER: deduct stock automatically when a sale_item is inserted
-- ---------------------------------------------------------------------------

create or replace function public.deduct_stock_on_sale()
returns trigger language plpgsql as $$
begin
  update public.products
  set    quantity = quantity - new.quantity
  where  id = new.product_id;

  -- Guard: prevent negative stock
  if (select quantity from public.products where id = new.product_id) < 0 then
    raise exception 'Insufficient stock for product %', new.product_id;
  end if;

  return new;
end;
$$;

create trigger trg_deduct_stock
  after insert on public.sale_items
  for each row execute function public.deduct_stock_on_sale();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- Each user can only see and modify their own data.
-- ---------------------------------------------------------------------------

alter table public.profiles  enable row level security;
alter table public.products  enable row level security;
alter table public.sales     enable row level security;
alter table public.sale_items enable row level security;

-- profiles
create policy "Users manage own profile"
  on public.profiles for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- products
create policy "Users manage own products"
  on public.products for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- sales
create policy "Users manage own sales"
  on public.sales for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- sale_items (access via parent sale ownership)
create policy "Users manage own sale items"
  on public.sale_items for all
  using (
    exists (
      select 1 from public.sales s
      where s.id = sale_items.sale_id
        and s.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- INDEXES (performance)
-- ---------------------------------------------------------------------------

create index idx_products_user_id       on public.products  (user_id);
create index idx_products_low_stock     on public.products  (user_id, quantity, low_stock_threshold);
create index idx_sales_user_id          on public.sales     (user_id);
create index idx_sales_created_at       on public.sales     (user_id, created_at desc);
create index idx_sale_items_sale_id     on public.sale_items (sale_id);
create index idx_sale_items_product_id  on public.sale_items (product_id);

-- ---------------------------------------------------------------------------
-- AUTO-CREATE PROFILE on new user signup
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, shop_name, owner_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'shop_name', 'My Shop'),
    coalesce(new.raw_user_meta_data->>'owner_name', 'Owner')
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
