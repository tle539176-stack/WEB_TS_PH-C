-- ============================================================
-- Migration 001: Initial Schema — Web Bac Si CMS
-- Source of truth: docs/00-ke-hoach-thuc-thi-thong-nhat.md
-- Run via: Supabase Dashboard > SQL Editor > Run All
-- ============================================================

-- ============================================================
-- Extensions
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- Enum Types
-- ============================================================

create type content_status as enum ('draft', 'in_review', 'published', 'archived');

-- ============================================================
-- Helper: auto-update updated_at
-- ============================================================

create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- Helper: is_admin() — check Supabase app_metadata role
-- ============================================================

create or replace function is_admin()
returns boolean language sql stable security definer as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ============================================================
-- Helper: check max 5 images per product/book
-- ============================================================

create or replace function check_max_images()
returns trigger language plpgsql as $$
declare
  img_count integer;
begin
  if TG_TABLE_NAME = 'product_images' then
    select count(*) into img_count
    from product_images where product_id = new.product_id;
    if img_count >= 5 then
      raise exception 'Maximum 5 images per product';
    end if;
  elsif TG_TABLE_NAME = 'book_images' then
    select count(*) into img_count
    from book_images where book_id = new.book_id;
    if img_count >= 5 then
      raise exception 'Maximum 5 images per book';
    end if;
  end if;
  return new;
end;
$$;

-- ============================================================
-- Table: categories
-- ============================================================

create table categories (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  slug        text        not null unique,
  description text,
  type        text        not null default 'note', -- 'note' | 'product' | 'book'
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger categories_updated_at
  before update on categories
  for each row execute function handle_updated_at();

-- ============================================================
-- Table: products
-- ============================================================

create table products (
  id                uuid           primary key default gen_random_uuid(),
  name              text           not null,
  slug              text           not null unique,
  category_id       uuid           references categories(id) on delete set null,
  brand             text,
  price             numeric(12, 2),
  tag               text,
  short_description text,
  description       text,
  usage             text,
  warnings          text,
  status            content_status not null default 'draft',
  seo_title         text,
  seo_description   text,
  created_at        timestamptz    not null default now(),
  updated_at        timestamptz    not null default now(),
  published_at      timestamptz
);

create index products_status_idx      on products(status);
create index products_category_id_idx on products(category_id);

create trigger products_updated_at
  before update on products
  for each row execute function handle_updated_at();

-- ============================================================
-- Table: product_images (max 5 per product)
-- ============================================================

create table product_images (
  id           uuid        primary key default gen_random_uuid(),
  product_id   uuid        not null references products(id) on delete cascade,
  url          text        not null,
  storage_path text,
  alt          text        not null default '',
  sort_order   integer     not null default 0,
  is_primary   boolean     not null default false,
  width        integer,
  height       integer,
  mime_type    text,
  created_at   timestamptz not null default now()
);

create index product_images_product_id_idx on product_images(product_id);

-- Enforce max 5 images per product
create trigger product_images_max_5
  before insert on product_images
  for each row execute function check_max_images();

-- Enforce only one primary image per product
create unique index product_images_one_primary_idx
  on product_images(product_id) where is_primary = true;

-- ============================================================
-- Table: books
-- ============================================================

create table books (
  id              uuid           primary key default gen_random_uuid(),
  title           text           not null,
  slug            text           not null unique,
  subtitle        text,
  author          text,
  publisher       text,
  year            text,
  price           numeric(12, 2),
  description     text,
  content         text,
  pages           integer,
  rating          numeric(2, 1),
  is_new          boolean        not null default false,
  status          content_status not null default 'draft',
  seo_title       text,
  seo_description text,
  created_at      timestamptz    not null default now(),
  updated_at      timestamptz    not null default now(),
  published_at    timestamptz
);

create index books_status_idx on books(status);

create trigger books_updated_at
  before update on books
  for each row execute function handle_updated_at();

-- ============================================================
-- Table: book_images (max 5 per book)
-- ============================================================

create table book_images (
  id           uuid        primary key default gen_random_uuid(),
  book_id      uuid        not null references books(id) on delete cascade,
  url          text        not null,
  storage_path text,
  alt          text        not null default '',
  sort_order   integer     not null default 0,
  is_primary   boolean     not null default false,
  width        integer,
  height       integer,
  mime_type    text,
  created_at   timestamptz not null default now()
);

create index book_images_book_id_idx on book_images(book_id);

-- Enforce max 5 images per book
create trigger book_images_max_5
  before insert on book_images
  for each row execute function check_max_images();

-- Enforce only one primary image per book
create unique index book_images_one_primary_idx
  on book_images(book_id) where is_primary = true;

-- ============================================================
-- Table: notes / articles
-- ============================================================

create table notes (
  id              uuid           primary key default gen_random_uuid(),
  title           text           not null,
  slug            text           not null unique,
  excerpt         text,
  content         text,
  category_id     uuid           references categories(id) on delete set null,
  cover_image_url text,
  read_time       text,
  status          content_status not null default 'draft',
  reviewed_by     text,
  reviewed_at     timestamptz,
  next_review_at  timestamptz,
  sources         jsonb          not null default '[]',
  seo_title       text,
  seo_description text,
  created_at      timestamptz    not null default now(),
  updated_at      timestamptz    not null default now(),
  published_at    timestamptz
);

create index notes_status_idx      on notes(status);
create index notes_category_id_idx on notes(category_id);

create trigger notes_updated_at
  before update on notes
  for each row execute function handle_updated_at();

-- ============================================================
-- Table: settings (key-value store)
-- ============================================================

create table settings (
  key        text        primary key,
  value      jsonb       not null default '{}',
  updated_at timestamptz not null default now()
);

insert into settings (key, value) values
  ('home',    '{"heroImage": "", "heroTitle": "", "heroSubtitle": ""}'),
  ('contact', '{"email": "", "phone": "", "address": ""}'),
  ('social',  '{"facebookUrl": "", "youtubeUrl": "", "instagramUrl": "", "twitterUrl": ""}'),
  ('global',  '{"siteName": "Bác sĩ Wynn Tran", "logoText": "WT", "tagline": "Medical Professional", "footerText": "Sứ mệnh của tôi là mang kiến thức y khoa chính thống, dễ hiểu đến với cộng đồng người Việt trên toàn thế giới.", "seoTitle": "Bác sĩ Wynn Tran", "seoDescription": "Website chia sẻ kiến thức y khoa, sách, ghi chú và sản phẩm khuyên dùng của Bác sĩ Wynn Tran.", "medicalDisclaimer": "Thông tin trên website chỉ nhằm mục đích tham khảo, không thay thế cho tư vấn, chẩn đoán hoặc điều trị y khoa trực tiếp."}')
on conflict (key) do nothing;

-- ============================================================
-- Table: audit_logs
-- ============================================================

create table audit_logs (
  id          uuid        primary key default gen_random_uuid(),
  actor_id    uuid,
  actor_email text,
  action      text        not null,
  entity_type text        not null,
  entity_id   uuid,
  before_data jsonb,
  after_data  jsonb,
  created_at  timestamptz not null default now()
);

create index audit_logs_entity_idx     on audit_logs(entity_type, entity_id);
create index audit_logs_actor_idx      on audit_logs(actor_id);
create index audit_logs_created_at_idx on audit_logs(created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table categories     enable row level security;
alter table products       enable row level security;
alter table product_images enable row level security;
alter table books          enable row level security;
alter table book_images    enable row level security;
alter table notes          enable row level security;
alter table settings       enable row level security;
alter table audit_logs     enable row level security;

-- ============================================================
-- RLS: categories
-- ============================================================

create policy "categories: public read"
  on categories for select to anon, authenticated using (true);

create policy "categories: admin write"
  on categories for all to authenticated
  using (is_admin()) with check (is_admin());

-- ============================================================
-- RLS: products
-- ============================================================

create policy "products: public read published"
  on products for select to anon, authenticated
  using (status = 'published');

create policy "products: admin all"
  on products for all to authenticated
  using (is_admin()) with check (is_admin());

-- ============================================================
-- RLS: product_images
-- ============================================================

create policy "product_images: public read if product published"
  on product_images for select to anon, authenticated
  using (
    exists (
      select 1 from products p
      where p.id = product_images.product_id and p.status = 'published'
    )
  );

create policy "product_images: admin all"
  on product_images for all to authenticated
  using (is_admin()) with check (is_admin());

-- ============================================================
-- RLS: books
-- ============================================================

create policy "books: public read published"
  on books for select to anon, authenticated
  using (status = 'published');

create policy "books: admin all"
  on books for all to authenticated
  using (is_admin()) with check (is_admin());

-- ============================================================
-- RLS: book_images
-- ============================================================

create policy "book_images: public read if book published"
  on book_images for select to anon, authenticated
  using (
    exists (
      select 1 from books b
      where b.id = book_images.book_id and b.status = 'published'
    )
  );

create policy "book_images: admin all"
  on book_images for all to authenticated
  using (is_admin()) with check (is_admin());

-- ============================================================
-- RLS: notes
-- ============================================================

create policy "notes: public read published"
  on notes for select to anon, authenticated
  using (status = 'published');

create policy "notes: admin all"
  on notes for all to authenticated
  using (is_admin()) with check (is_admin());

-- ============================================================
-- RLS: settings (public read, admin write)
-- ============================================================

create policy "settings: public read"
  on settings for select to anon, authenticated using (true);

create policy "settings: admin write"
  on settings for all to authenticated
  using (is_admin()) with check (is_admin());

-- ============================================================
-- RLS: audit_logs (admin only)
-- ============================================================

create policy "audit_logs: admin all"
  on audit_logs for all to authenticated
  using (is_admin()) with check (is_admin());

-- ============================================================
-- Supabase Storage bucket: site-media
-- ============================================================

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

-- Public read
create policy "site-media: public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-media');

-- Admin upload
create policy "site-media: admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-media' and is_admin());

-- Admin update
create policy "site-media: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-media' and is_admin());

-- Admin delete
create policy "site-media: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-media' and is_admin());
