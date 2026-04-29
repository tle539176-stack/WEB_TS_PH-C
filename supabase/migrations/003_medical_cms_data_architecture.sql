-- ============================================================
-- Migration 003: Medical CMS data architecture
-- Requires: 001_initial_schema.sql, 002_admin_media_library.sql
-- Additive only — no existing columns or tables removed.
-- ============================================================

-- ------------------------------------------------------------
-- people: authors, medical reviewers, editors
-- ------------------------------------------------------------
create table if not exists people (
  id                  uuid primary key default gen_random_uuid(),
  display_name        text not null,
  slug                text not null unique,
  role                text not null default 'reviewer',
  professional_title  text,
  credentials         text,
  specialties         text[] not null default '{}',
  bio                 text,
  profile_url         text,
  same_as             text[] not null default '{}',
  is_public           boolean not null default true,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint people_role_check
    check (role in ('author', 'reviewer', 'editor', 'admin', 'contributor'))
);

create index if not exists people_role_idx on people(role);
create index if not exists people_public_idx on people(is_public);
create index if not exists people_active_idx on people(is_active);

drop trigger if exists people_updated_at on people;
create trigger people_updated_at
  before update on people
  for each row execute function handle_updated_at();

alter table people enable row level security;

drop policy if exists "people: public read public profiles" on people;
create policy "people: public read public profiles"
  on people for select to anon, authenticated
  using (is_public = true);

drop policy if exists "people: admin all" on people;
create policy "people: admin all"
  on people for all to authenticated
  using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- categories: strengthen taxonomy without breaking old reads
-- ------------------------------------------------------------
alter table categories
  add column if not exists parent_id uuid references categories(id) on delete set null,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists is_active boolean not null default true;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'categories_type_check'
  ) then
    alter table categories
      add constraint categories_type_check
      check (type in ('note', 'product', 'book', 'tag', 'topic', 'condition', 'service'));
  end if;
end $$;

create index if not exists categories_type_active_idx
  on categories(type, is_active, sort_order);

create index if not exists categories_parent_id_idx
  on categories(parent_id);

-- ------------------------------------------------------------
-- notes: add structured medical metadata
-- ------------------------------------------------------------
alter table notes
  add column if not exists author_id uuid references people(id) on delete set null,
  add column if not exists reviewed_by_id uuid references people(id) on delete set null,
  add column if not exists medical_specialty text,
  add column if not exists medical_audience text not null default 'Patient',
  add column if not exists disclaimer_ack boolean not null default false,
  add column if not exists schema_type text not null default 'MedicalWebPage',
  add column if not exists word_count integer,
  add column if not exists reading_level text;

create index if not exists notes_author_id_idx on notes(author_id);
create index if not exists notes_reviewed_by_id_idx on notes(reviewed_by_id);
create index if not exists notes_review_due_idx
  on notes(next_review_at)
  where status = 'published' and next_review_at is not null;

-- ------------------------------------------------------------
-- note_sources: structured citations
-- ------------------------------------------------------------
create table if not exists note_sources (
  id              uuid primary key default gen_random_uuid(),
  note_id         uuid not null references notes(id) on delete cascade,
  title           text not null,
  url             text,
  publisher       text,
  source_type     text not null default 'website',
  doi             text,
  pmid            text,
  published_at    date,
  accessed_at     date,
  evidence_level  text,
  notes           text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint note_sources_source_type_check
    check (source_type in ('guideline', 'journal', 'systematic_review', 'textbook', 'government', 'organization', 'website', 'other')),
  constraint note_sources_evidence_level_check
    check (evidence_level is null or evidence_level in ('high', 'moderate', 'low', 'expert_opinion', 'unknown')),
  constraint note_sources_has_identifier_check
    check (
      nullif(btrim(coalesce(url, '')), '') is not null
      or nullif(btrim(coalesce(doi, '')), '') is not null
      or nullif(btrim(coalesce(pmid, '')), '') is not null
    )
);

create index if not exists note_sources_note_id_idx on note_sources(note_id, sort_order);
create index if not exists note_sources_pmid_idx on note_sources(pmid) where pmid is not null;
create index if not exists note_sources_doi_idx on note_sources(doi) where doi is not null;

drop trigger if exists note_sources_updated_at on note_sources;
create trigger note_sources_updated_at
  before update on note_sources
  for each row execute function handle_updated_at();

alter table note_sources enable row level security;

drop policy if exists "note_sources: public read if note published" on note_sources;
create policy "note_sources: public read if note published"
  on note_sources for select to anon, authenticated
  using (
    exists (
      select 1 from notes n
      where n.id = note_sources.note_id
        and n.status = 'published'
    )
  );

drop policy if exists "note_sources: admin all" on note_sources;
create policy "note_sources: admin all"
  on note_sources for all to authenticated
  using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- content_reviews: medical/editorial sign-off history
-- ------------------------------------------------------------
create table if not exists content_reviews (
  id                uuid primary key default gen_random_uuid(),
  entity_type       text not null,
  entity_id         uuid not null,
  reviewer_id       uuid references people(id) on delete set null,
  decision          text not null default 'approved',
  review_scope      text not null default 'medical',
  summary           text,
  evidence_notes    text,
  reviewed_at       timestamptz not null default now(),
  next_review_at    timestamptz,
  created_by        uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  constraint content_reviews_entity_type_check
    check (entity_type in ('note', 'product', 'book', 'setting')),
  constraint content_reviews_decision_check
    check (decision in ('approved', 'needs_changes', 'rejected', 'expired')),
  constraint content_reviews_scope_check
    check (review_scope in ('medical', 'editorial', 'seo', 'legal', 'product_safety'))
);

create index if not exists content_reviews_entity_idx
  on content_reviews(entity_type, entity_id, reviewed_at desc);

create index if not exists content_reviews_next_review_idx
  on content_reviews(next_review_at)
  where next_review_at is not null;

alter table content_reviews enable row level security;

drop policy if exists "content_reviews: admin all" on content_reviews;
create policy "content_reviews: admin all"
  on content_reviews for all to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists "content_reviews: public read published note reviews" on content_reviews;
create policy "content_reviews: public read published note reviews"
  on content_reviews for select to anon, authenticated
  using (
    entity_type = 'note'
    and exists (
      select 1 from notes n
      where n.id = content_reviews.entity_id
        and n.status = 'published'
    )
  );

-- ------------------------------------------------------------
-- content_revisions: immutable snapshots
-- ------------------------------------------------------------
create table if not exists content_revisions (
  id             uuid primary key default gen_random_uuid(),
  entity_type    text not null,
  entity_id      uuid,
  entity_key     text,
  version        integer not null,
  status         text,
  title          text,
  snapshot       jsonb not null,
  created_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now(),
  constraint content_revisions_entity_type_check
    check (entity_type in ('note', 'product', 'book', 'setting')),
  constraint content_revisions_entity_ref_check
    check (entity_id is not null or entity_key is not null)
);

create unique index if not exists content_revisions_entity_version_idx
  on content_revisions(entity_type, coalesce(entity_id::text, entity_key), version);

create index if not exists content_revisions_created_at_idx
  on content_revisions(created_at desc);

alter table content_revisions enable row level security;

drop policy if exists "content_revisions: admin all" on content_revisions;
create policy "content_revisions: admin all"
  on content_revisions for all to authenticated
  using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- content_media: generic attachment layer
-- ------------------------------------------------------------
create table if not exists content_media (
  id                uuid primary key default gen_random_uuid(),
  entity_type       text not null,
  entity_id         uuid not null,
  media_asset_id    uuid not null references media_assets(id) on delete cascade,
  role              text not null default 'gallery',
  alt_override      text,
  caption_override  text,
  sort_order        integer not null default 0,
  is_primary        boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint content_media_entity_type_check
    check (entity_type in ('note', 'product', 'book', 'setting')),
  constraint content_media_role_check
    check (role in ('cover', 'gallery', 'inline', 'logo', 'hero', 'footer'))
);

create index if not exists content_media_entity_idx
  on content_media(entity_type, entity_id, role, sort_order);

create unique index if not exists content_media_one_primary_idx
  on content_media(entity_type, entity_id, role)
  where is_primary = true;

create unique index if not exists content_media_entity_asset_role_idx
  on content_media(entity_type, entity_id, media_asset_id, role);

drop trigger if exists content_media_updated_at on content_media;
create trigger content_media_updated_at
  before update on content_media
  for each row execute function handle_updated_at();

alter table content_media enable row level security;

drop policy if exists "content_media: admin all" on content_media;
create policy "content_media: admin all"
  on content_media for all to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists "content_media: public read published content media" on content_media;
create policy "content_media: public read published content media"
  on content_media for select to anon, authenticated
  using (
    (entity_type = 'note' and exists (select 1 from notes n where n.id = content_media.entity_id and n.status = 'published'))
    or (entity_type = 'product' and exists (select 1 from products p where p.id = content_media.entity_id and p.status = 'published'))
    or (entity_type = 'book' and exists (select 1 from books b where b.id = content_media.entity_id and b.status = 'published'))
    or entity_type = 'setting'
  );

-- ------------------------------------------------------------
-- Backfill note_sources from legacy notes.sources JSONB
-- Only sources with a non-empty URL are backfilled (constraint).
-- ------------------------------------------------------------
insert into note_sources (note_id, title, url, accessed_at, sort_order)
select
  n.id,
  coalesce(src.value->>'title', src.value->>'url', 'Nguồn tham khảo') as title,
  nullif(btrim(src.value->>'url'), '') as url,
  nullif(src.value->>'accessed_at', '')::date as accessed_at,
  (src.ordinality::integer - 1) as sort_order
from notes n
cross join lateral jsonb_array_elements(n.sources) with ordinality as src(value, ordinality)
where jsonb_typeof(n.sources) = 'array'
  and not exists (
    select 1 from note_sources ns where ns.note_id = n.id
  )
  and nullif(btrim(coalesce(src.value->>'url', '')), '') is not null;

-- ------------------------------------------------------------
-- Backfill content_media from product_images and book_images
-- ------------------------------------------------------------
insert into content_media (entity_type, entity_id, media_asset_id, role, alt_override, sort_order, is_primary)
select 'product', pi.product_id, pi.media_asset_id, 'gallery', pi.alt, pi.sort_order, pi.is_primary
from product_images pi
where pi.media_asset_id is not null
on conflict do nothing;

insert into content_media (entity_type, entity_id, media_asset_id, role, alt_override, sort_order, is_primary)
select 'book', bi.book_id, bi.media_asset_id, 'gallery', bi.alt, bi.sort_order, bi.is_primary
from book_images bi
where bi.media_asset_id is not null
on conflict do nothing;
