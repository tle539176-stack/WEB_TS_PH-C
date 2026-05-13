import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedAntiAgingNotesSql = fs.readFileSync(
  path.resolve(__dirname, '..', 'supabase', 'migrations', '006_seed_anti_aging_notes.sql'),
  'utf8',
);

const schemaSql = `
create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'content_status') then
    create type content_status as enum ('draft', 'in_review', 'published', 'archived');
  end if;
end $$;

create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists admin_users_updated_at on admin_users;
create trigger admin_users_updated_at
  before update on admin_users
  for each row execute function handle_updated_at();

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  type text not null default 'note',
  sort_order integer not null default 0,
  parent_id uuid references categories(id) on delete set null,
  seo_title text,
  seo_description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_type_active_idx on categories(type, is_active, sort_order);
create index if not exists categories_parent_id_idx on categories(parent_id);
drop trigger if exists categories_updated_at on categories;
create trigger categories_updated_at
  before update on categories
  for each row execute function handle_updated_at();

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references categories(id) on delete set null,
  brand text,
  price numeric(12, 2),
  tag text,
  short_description text,
  description text,
  usage text,
  warnings text,
  status content_status not null default 'draft',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists products_status_idx on products(status);
create index if not exists products_category_id_idx on products(category_id);
drop trigger if exists products_updated_at on products;
create trigger products_updated_at
  before update on products
  for each row execute function handle_updated_at();

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  storage_path text,
  alt text not null default '',
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  width integer,
  height integer,
  mime_type text,
  media_asset_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on product_images(product_id);
create unique index if not exists product_images_one_primary_idx
  on product_images(product_id) where is_primary = true;

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  subtitle text,
  author text,
  publisher text,
  year text,
  price numeric(12, 2),
  description text,
  content text,
  pages integer,
  rating numeric(2, 1),
  is_new boolean not null default false,
  status content_status not null default 'draft',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists books_status_idx on books(status);
drop trigger if exists books_updated_at on books;
create trigger books_updated_at
  before update on books
  for each row execute function handle_updated_at();

create table if not exists book_images (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  url text not null,
  storage_path text,
  alt text not null default '',
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  width integer,
  height integer,
  mime_type text,
  media_asset_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists book_images_book_id_idx on book_images(book_id);
create unique index if not exists book_images_one_primary_idx
  on book_images(book_id) where is_primary = true;

create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  slug text not null unique,
  role text not null default 'reviewer',
  professional_title text,
  credentials text,
  specialties text[] not null default '{}',
  bio text,
  profile_url text,
  same_as text[] not null default '{}',
  is_public boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists people_role_idx on people(role);
create index if not exists people_public_idx on people(is_public);
create index if not exists people_active_idx on people(is_active);
drop trigger if exists people_updated_at on people;
create trigger people_updated_at
  before update on people
  for each row execute function handle_updated_at();

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  category_id uuid references categories(id) on delete set null,
  cover_image_url text,
  cover_storage_path text,
  cover_alt text not null default '',
  read_time text,
  status content_status not null default 'draft',
  reviewed_by text,
  reviewed_at timestamptz,
  next_review_at timestamptz,
  sources jsonb not null default '[]',
  seo_title text,
  seo_description text,
  author_id uuid references people(id) on delete set null,
  reviewed_by_id uuid references people(id) on delete set null,
  medical_specialty text,
  medical_audience text not null default 'Patient',
  disclaimer_ack boolean not null default false,
  schema_type text not null default 'MedicalWebPage',
  word_count integer,
  reading_level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists notes_status_idx on notes(status);
create index if not exists notes_category_id_idx on notes(category_id);
create index if not exists notes_author_id_idx on notes(author_id);
create index if not exists notes_reviewed_by_id_idx on notes(reviewed_by_id);
create index if not exists notes_review_due_idx on notes(next_review_at)
  where status = 'published' and next_review_at is not null;
drop trigger if exists notes_updated_at on notes;
create trigger notes_updated_at
  before update on notes
  for each row execute function handle_updated_at();

create table if not exists settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_entity_idx on audit_logs(entity_type, entity_id);
create index if not exists audit_logs_actor_idx on audit_logs(actor_id);
create index if not exists audit_logs_created_at_idx on audit_logs(created_at desc);

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  video_url text not null,
  thumbnail_url text,
  description text,
  category text,
  duration text,
  source text not null default 'facebook',
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists videos_home_idx on videos(is_active, is_featured desc, sort_order, created_at desc);
drop trigger if exists videos_updated_at on videos;
create trigger videos_updated_at
  before update on videos
  for each row execute function handle_updated_at();

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'site-media',
  storage_path text not null unique,
  public_url text not null,
  file_name text not null,
  original_file_name text,
  mime_type text not null,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  width integer,
  height integer,
  alt text not null default '',
  caption text,
  folder text not null default 'general',
  entity_type text,
  entity_id uuid,
  uploaded_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table media_assets
  drop constraint if exists media_assets_uploaded_by_fkey;

create index if not exists media_assets_folder_idx on media_assets(folder);
create index if not exists media_assets_entity_idx on media_assets(entity_type, entity_id);
create index if not exists media_assets_created_at_idx on media_assets(created_at desc);
drop trigger if exists media_assets_updated_at on media_assets;
create trigger media_assets_updated_at
  before update on media_assets
  for each row execute function handle_updated_at();

create table if not exists media_files (
  storage_path text primary key,
  mime_type text not null,
  size_bytes bigint not null default 0,
  data bytea not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists media_files_updated_at on media_files;
create trigger media_files_updated_at
  before update on media_files
  for each row execute function handle_updated_at();

create table if not exists note_sources (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references notes(id) on delete cascade,
  title text not null,
  url text,
  publisher text,
  source_type text not null default 'website',
  doi text,
  pmid text,
  published_at date,
  accessed_at date,
  evidence_level text,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists note_sources_note_id_idx on note_sources(note_id, sort_order);
drop trigger if exists note_sources_updated_at on note_sources;
create trigger note_sources_updated_at
  before update on note_sources
  for each row execute function handle_updated_at();

create table if not exists content_reviews (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  reviewer_id uuid references people(id) on delete set null,
  decision text not null default 'approved',
  review_scope text not null default 'medical',
  summary text,
  evidence_notes text,
  reviewed_at timestamptz not null default now(),
  next_review_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists content_reviews_entity_idx on content_reviews(entity_type, entity_id, reviewed_at desc);
create index if not exists content_reviews_next_review_idx on content_reviews(next_review_at)
  where next_review_at is not null;

create table if not exists content_revisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  entity_key text,
  version integer not null,
  status text,
  title text,
  snapshot jsonb not null,
  created_by uuid,
  created_at timestamptz not null default now()
);

create unique index if not exists content_revisions_entity_version_idx
  on content_revisions(entity_type, coalesce(entity_id::text, entity_key), version);
create index if not exists content_revisions_created_at_idx on content_revisions(created_at desc);

create table if not exists content_media (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  media_asset_id uuid not null references media_assets(id) on delete cascade,
  role text not null default 'gallery',
  alt_override text,
  caption_override text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_media_entity_idx on content_media(entity_type, entity_id, role, sort_order);
create unique index if not exists content_media_one_primary_idx
  on content_media(entity_type, entity_id, role) where is_primary = true;
create unique index if not exists content_media_entity_asset_role_idx
  on content_media(entity_type, entity_id, media_asset_id, role);
drop trigger if exists content_media_updated_at on content_media;
create trigger content_media_updated_at
  before update on content_media
  for each row execute function handle_updated_at();
`;

const seedSettingsSql = `
insert into settings (key, value) values
  ('home', '{"heroImage": "", "heroTitle": "", "heroSubtitle": "", "heroStoragePath": ""}'),
  ('contact', '{"email": "", "phone": "", "address": ""}'),
  ('social', '{"facebookUrl": "", "youtubeUrl": "", "instagramUrl": "", "twitterUrl": ""}'),
  ('global', '{"siteName": "Tiến sĩ Đặng Hữu Phúc", "logoText": "DP", "logoImage": "", "logoStoragePath": "", "tagline": "Kiến thức sức khỏe chính thống", "footerText": "Website chia sẻ kiến thức sức khỏe chính thống, dễ hiểu và có trách nhiệm cho cộng đồng.", "footerImage": "", "footerStoragePath": "", "seoTitle": "Tiến sĩ Đặng Hữu Phúc", "seoDescription": "Website chia sẻ kiến thức sức khỏe, ghi chú, sách và nội dung tham khảo của Tiến sĩ Đặng Hữu Phúc.", "medicalDisclaimer": "Thông tin trên website chỉ nhằm mục đích tham khảo, không thay thế cho tư vấn, chẩn đoán hoặc điều trị y khoa trực tiếp."}'),
  ('about', '{"aboutTitle": "Tiến sĩ Đặng Hữu Phúc", "aboutSubtitle": "Chia sẻ kiến thức sức khỏe chính thống, dễ hiểu và có trách nhiệm", "aboutQuote": "Kiến thức đúng giúp người đọc hiểu rõ hơn và ra quyết định sức khỏe thận trọng hơn.", "aboutSectionTitle": "Giới thiệu", "aboutBody": "Tiến sĩ Đặng Hữu Phúc xây dựng website này như một không gian chia sẻ kiến thức sức khỏe chính thống, dễ hiểu và có trách nhiệm cho cộng đồng. Nội dung được trình bày theo hướng giáo dục sức khỏe, giúp người đọc hiểu vấn đề, chuẩn bị câu hỏi phù hợp và trao đổi hiệu quả hơn với nhân viên y tế.\\n\\nCác bài viết, ghi chú, sách và tài liệu trên website ưu tiên tính rõ ràng, thận trọng và minh bạch nguồn tham khảo. Thông tin không thay thế chẩn đoán hoặc điều trị trực tiếp; khi có triệu chứng hoặc vấn đề sức khỏe cụ thể, người đọc nên tham khảo ý kiến bác sĩ hoặc cơ sở y tế phù hợp.", "aboutHighlights": "Giáo dục sức khỏe cộng đồng\\nKiến thức y khoa dễ hiểu\\nNội dung có nguồn tham khảo\\nKhuyến khích thăm khám đúng lúc", "aboutImage": "", "aboutStoragePath": "", "aboutImageAlt": "Tiến sĩ Đặng Hữu Phúc"}')
on conflict (key) do nothing;
`;

export async function runMigrations() {
  await query(schemaSql);
  await query(seedSettingsSql);
  await query(seedAntiAgingNotesSql);
  await seedAdminUser();
}

async function seedAdminUser() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD is not set. Admin login will not work until they are configured.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await query(
    `
    insert into admin_users (email, password_hash, role)
    values ($1, $2, 'admin')
    on conflict (email) do update
    set password_hash = excluded.password_hash,
        role = 'admin',
        updated_at = now()
    `,
    [email, passwordHash],
  );
}
