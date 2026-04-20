-- ============================================================
-- Migration 002: Admin Media Library — Web Bac Si CMS
-- Requires: migration 001 (handle_updated_at, is_admin functions)
-- ============================================================

-- ============================================================
-- Table: media_assets
-- ============================================================

create table if not exists media_assets (
  id                 uuid        primary key default gen_random_uuid(),
  bucket             text        not null default 'site-media',
  storage_path       text        not null unique,
  public_url         text        not null,
  file_name          text        not null,
  original_file_name text,
  mime_type          text        not null,
  size_bytes         bigint      not null default 0 check (size_bytes >= 0),
  width              integer,
  height             integer,
  alt                text        not null default '',
  caption            text,
  folder             text        not null default 'general',
  entity_type        text,
  entity_id          uuid,
  uploaded_by        uuid        references auth.users(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint media_assets_entity_type_check
    check (entity_type is null or entity_type in ('product', 'book', 'note', 'setting', 'general'))
);

create index if not exists media_assets_folder_idx
  on media_assets(folder);

create index if not exists media_assets_entity_idx
  on media_assets(entity_type, entity_id);

create index if not exists media_assets_created_at_idx
  on media_assets(created_at desc);

create trigger media_assets_updated_at
  before update on media_assets
  for each row execute function handle_updated_at();

alter table media_assets enable row level security;

create policy "media_assets: admin all"
  on media_assets for all to authenticated
  using (is_admin())
  with check (is_admin());

-- Public read (so public URLs work)
create policy "media_assets: public read"
  on media_assets for select to anon, authenticated using (true);

-- ============================================================
-- Extend product_images
-- ============================================================

alter table product_images
  add column if not exists media_asset_id uuid references media_assets(id) on delete set null;

-- ============================================================
-- Extend book_images
-- ============================================================

alter table book_images
  add column if not exists media_asset_id uuid references media_assets(id) on delete set null;

-- ============================================================
-- Extend notes
-- ============================================================

alter table notes
  add column if not exists cover_storage_path text,
  add column if not exists cover_alt text not null default '';
