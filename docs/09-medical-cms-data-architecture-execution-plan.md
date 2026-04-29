# 09 - Kế hoạch thực thi nâng cấp cấu trúc dữ liệu CMS y tế

Trạng thái: tài liệu thực thi chính cho phase nâng cấp cấu trúc dữ liệu y tế/khoa học.

Phạm vi: Supabase Postgres, Supabase Storage, TypeScript types, service layer, Admin Notes/Categories/Media, public Notes detail và structured data.

Không thuộc phạm vi phase này: thay đổi branding, viết nội dung y khoa thật, redesign toàn bộ giao diện public, đổi khỏi Supabase, hoặc quay lại Firebase/mockData.

## 1. Mục tiêu

Mục tiêu của phase này là đưa cấu trúc lưu dữ liệu từ mức CMS nhỏ sang mức CMS y tế có khả năng:

- Lưu nguồn tham khảo y khoa có cấu trúc, không chỉ JSON tự do.
- Lưu người viết, người review y khoa, bằng cấp, chuyên môn và hồ sơ.
- Lưu lịch sử review/sign-off để biết ai duyệt, duyệt lúc nào, quyết định gì.
- Lưu revision/snapshot để truy vết thay đổi nội dung quan trọng.
- Chuẩn hóa taxonomy để phân loại bài viết, sản phẩm, sách theo chủ đề rõ ràng.
- Chuẩn hóa media attachment để tránh lệch dữ liệu giữa media library và các bảng ảnh riêng.
- Cung cấp đủ dữ liệu cho public page và JSON-LD theo Schema.org/Google Article.

Kết quả mong muốn: bài viết y tế có thể hiển thị công khai với nguồn, reviewer, ngày review, ngày review tiếp theo, disclaimer, structured data và lịch sử thay đổi có thể kiểm tra trong Admin.

## 2. Kết quả kiểm tra hiện trạng

Kiểm tra ngày 2026-04-29 trên repo hiện tại:

- `categories` có `name`, `slug`, `description`, `type`, `sort_order`, nhưng `type` là `text`, chưa có `parent_id`, chưa có tags, chưa có unique theo `(type, slug)`.
- `notes` đã có `reviewed_by`, `reviewed_at`, `next_review_at`, `sources`, `seo_title`, `seo_description`, nhưng:
  - `reviewed_by` là text, không liên kết tới người review thật.
  - `sources` là `jsonb`, khó validate, khó search, khó thống kê DOI/PMID/publisher/evidence level.
  - `src/types/database.ts` chưa expose đủ `reviewed_by` và `reviewed_at` trong `Note`.
  - Chưa có `author_id`, `reviewed_by_id`, `medical_specialty`, `medical_audience`, `disclaimer_ack`.
- `product_images` và `book_images` có `media_asset_id`, nhưng vẫn lặp `url`, `alt`, `width`, `height`, `mime_type` với `media_assets`.
- `media_assets` có nền tốt, nhưng chưa có bảng nối chung cho mọi entity/role media.
- `audit_logs` ghi sự kiện, nhưng không thay thế được revision vì không có snapshot version đầy đủ để restore nội dung.
- Public `NoteDetail` hiển thị `sources` nếu có, nhưng chưa hiển thị author/reviewer/review date đầy đủ và chưa render JSON-LD.
- Chưa có table riêng cho reviewer/author/editor.

Kết luận: cấu trúc hiện tại không sai và đủ cho MVP, nhưng chưa đủ chặt cho website y tế có tính khoa học.

## 3. Chuẩn tham chiếu

Các nguồn tham chiếu dùng để định hướng mô hình dữ liệu:

- Schema.org `MedicalWebPage`: có `lastReviewed`, `reviewedBy`, `medicalAudience`, `citation`, `specialty`.
  https://schema.org/MedicalWebPage
- Google Search Central Article structured data: khuyến nghị `author`, `datePublished`, `dateModified`, `headline`, `image`.
  https://developers.google.com/search/docs/appearance/structured-data/article
- NHS content policy: nội dung lâm sàng cần clinical sign-off, review định kỳ, dựa trên evidence hiện hành.
  https://www.nhs.uk/our-policies/content-policy/
- NHS review date pattern: review date nên nằm gần nội dung, review là một phần của content lifecycle.
  https://service-manual.nhs.uk/design-system/patterns/know-that-a-page-is-up-to-date
- Cleveland Clinic Health Library: bài viết có nguồn tham khảo, medical review, và được review lại định kỳ.
  https://my.clevelandclinic.org/health/about

Các tiêu chí rút ra cho dự án:

- Không publish bài y tế nếu thiếu nguồn tham khảo.
- Không publish bài y tế nếu thiếu người review chuyên môn hoặc ngày review.
- Không publish bài y tế nếu thiếu ngày review tiếp theo.
- Tách dữ liệu reviewer/author thành entity riêng.
- Nguồn tham khảo cần có cấu trúc để kiểm tra chất lượng.
- Cần lưu dấu vết review và revision cho nội dung y tế.
- Public page phải hiển thị dấu hiệu tin cậy ngay gần nội dung chính.

## 4. Kiến trúc dữ liệu đích

### 4.1 Giữ lại

Giữ các bảng hiện có để tránh phá vỡ frontend:

- `notes`
- `categories`
- `products`
- `books`
- `media_assets`
- `product_images`
- `book_images`
- `settings`
- `audit_logs`

Không xóa `sources` JSONB trong `notes` ở phase đầu. Chỉ deprecate dần sau khi backfill sang `note_sources`.

### 4.2 Thêm mới

Thêm các bảng:

- `people`: người viết, reviewer, editor.
- `note_sources`: nguồn tham khảo có cấu trúc cho bài viết.
- `content_reviews`: lịch sử review/sign-off.
- `content_revisions`: snapshot nội dung để truy vết/restore.
- `content_media`: bảng nối chung giữa entity và `media_assets`.
- `content_terms`: bảng nối taxonomy nếu cần gắn nhiều danh mục/tag cho một nội dung.

Mở rộng bảng:

- `notes`: thêm `author_id`, `reviewed_by_id`, `medical_specialty`, `medical_audience`, `disclaimer_ack`, `schema_type`, `word_count`, `reading_level`.
- `categories`: thêm `parent_id`, `seo_title`, `seo_description`, `is_active`; thêm check constraint cho `type`.

## 5. Migration đề xuất

Tạo migration mới:

```powershell
npx supabase migration new medical_cms_data_architecture
```

Tên file dự kiến:

```text
supabase/migrations/003_medical_cms_data_architecture.sql
```

### 5.1 SQL migration khung

```sql
-- ============================================================
-- Migration 003: Medical CMS data architecture
-- Requires: 001_initial_schema.sql, 002_admin_media_library.sql
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

drop policy if exists "people: public read active" on people;
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

-- Keep old global slug unique for now. Do not replace until code is ready.

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

-- Public can read reviews for published notes only.
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
-- content_revisions: immutable-ish snapshots
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
-- ------------------------------------------------------------
insert into note_sources (note_id, title, url, accessed_at, sort_order)
select
  n.id,
  coalesce(src.value->>'title', src.value->>'url', 'Nguồn tham khảo') as title,
  nullif(src.value->>'url', '') as url,
  nullif(src.value->>'accessed_at', '')::date as accessed_at,
  src.ordinality::integer - 1 as sort_order
from notes n
cross join lateral jsonb_array_elements(n.sources) with ordinality as src(value, ordinality)
where jsonb_typeof(n.sources) = 'array'
  and not exists (
    select 1 from note_sources ns where ns.note_id = n.id
  )
  and nullif(src.value->>'url', '') is not null;
```

### 5.2 Ghi chú triển khai migration

- Không xóa `notes.sources` ngay. Giữ để rollback và tương thích code cũ.
- Không xóa `product_images`/`book_images` ngay. Phase này có thể backfill `content_media`, nhưng public catalog vẫn đọc bảng cũ cho đến khi service được chuyển xong.
- Nếu migration local đã có dữ liệu test lỗi encoding, không sửa dữ liệu trong phase này trừ khi được yêu cầu.
- Nếu `note_sources_has_identifier_check` làm backfill fail vì source cũ thiếu cả URL/DOI/PMID, cần sửa backfill hoặc bỏ qua source rỗng.

## 6. Thay đổi TypeScript types

Cập nhật `src/types/database.ts`.

### 6.1 Bổ sung type mới

Thêm:

```ts
export type Person = {
  id: string;
  display_name: string;
  slug: string;
  role: 'author' | 'reviewer' | 'editor' | 'admin' | 'contributor';
  professional_title: string | null;
  credentials: string | null;
  specialties: string[];
  bio: string | null;
  profile_url: string | null;
  same_as: string[];
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type NoteSourceRow = {
  id: string;
  note_id: string;
  title: string;
  url: string | null;
  publisher: string | null;
  source_type: 'guideline' | 'journal' | 'systematic_review' | 'textbook' | 'government' | 'organization' | 'website' | 'other';
  doi: string | null;
  pmid: string | null;
  published_at: string | null;
  accessed_at: string | null;
  evidence_level: 'high' | 'moderate' | 'low' | 'expert_opinion' | 'unknown' | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ContentReview = {
  id: string;
  entity_type: 'note' | 'product' | 'book' | 'setting';
  entity_id: string;
  reviewer_id: string | null;
  decision: 'approved' | 'needs_changes' | 'rejected' | 'expired';
  review_scope: 'medical' | 'editorial' | 'seo' | 'legal' | 'product_safety';
  summary: string | null;
  evidence_notes: string | null;
  reviewed_at: string;
  next_review_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type ContentRevision = {
  id: string;
  entity_type: 'note' | 'product' | 'book' | 'setting';
  entity_id: string | null;
  entity_key: string | null;
  version: number;
  status: string | null;
  title: string | null;
  snapshot: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
};

export type ContentMedia = {
  id: string;
  entity_type: 'note' | 'product' | 'book' | 'setting';
  entity_id: string;
  media_asset_id: string;
  role: 'cover' | 'gallery' | 'inline' | 'logo' | 'hero' | 'footer';
  alt_override: string | null;
  caption_override: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};
```

### 6.2 Cập nhật `Note`

Thêm vào `Note`:

```ts
reviewed_by: string | null;
reviewed_at: string | null;
author_id: string | null;
reviewed_by_id: string | null;
medical_specialty: string | null;
medical_audience: string;
disclaimer_ack: boolean;
schema_type: string;
word_count: number | null;
reading_level: string | null;
```

### 6.3 Cập nhật relation types

Thêm:

```ts
export type NoteWithMedicalMeta = Note & {
  categories: Category | null;
  author: Person | null;
  reviewer: Person | null;
  note_sources: NoteSourceRow[];
  content_reviews: (ContentReview & { reviewer: Person | null })[];
};
```

## 7. Thay đổi service layer

Tập trung ở `src/services/contentService.ts`, `src/services/mediaService.ts`, có thể thêm service mới:

```text
src/services/medicalContentService.ts
src/services/revisionService.ts
```

### 7.1 Notes read API

Sửa các hàm:

- `getPublishedNotesWithCategory`
- `getNoteBySlug`
- `getAllNotes`
- `getNoteById`

Mục tiêu:

- Public listing vẫn nhẹ: chỉ lấy fields cần cho card.
- Detail lấy đủ:
  - category
  - author
  - reviewer
  - note_sources
  - latest approved content review
  - cover media nếu dùng `content_media`

Ví dụ query detail:

```ts
const { data, error } = await supabase
  .from('notes')
  .select(`
    *,
    categories(*),
    author:people!notes_author_id_fkey(*),
    reviewer:people!notes_reviewed_by_id_fkey(*),
    note_sources(*)
  `)
  .eq('slug', slug)
  .eq('status', 'published')
  .single();
```

Nếu Supabase relationship alias không tự nhận do foreign key naming, tách thành nhiều query rõ ràng để tránh lỗi.

### 7.2 Notes write API

Thêm API:

```ts
export async function upsertNoteSources(noteId: string, sources: NoteSourceInput[]): Promise<NoteSourceRow[]>
export async function createContentReview(input: ContentReviewInput): Promise<ContentReview>
export async function createContentRevision(input: ContentRevisionInput): Promise<ContentRevision>
export async function getPeople(role?: Person['role']): Promise<Person[]>
export async function createPerson(input: PersonInsert): Promise<Person>
export async function updatePerson(id: string, input: Partial<PersonInsert>): Promise<void>
```

Luồng `createNote`/`updateNote`:

1. Tạo hoặc update note.
2. Ghi revision trước hoặc sau khi update:
   - Với update: snapshot `before` trước khi ghi.
   - Với create: snapshot sau khi tạo, version 1.
3. Upsert `note_sources`.
4. Nếu action là review/publish:
   - Ghi `content_reviews`.
   - Update `notes.reviewed_by_id`, `reviewed_at`, `next_review_at`, `disclaimer_ack`.
5. Ghi audit log.

### 7.3 Publish validation

Tạo helper trong `src/lib/contentQuality.ts` hoặc file mới:

```ts
export function getMedicalNotePublishChecks(note: MedicalNoteDraft): ChecklistItem[]
```

Các điều kiện block publish:

- Có `title`, `excerpt`, `content`.
- Có `category_id`.
- Có `cover_image_url` hoặc cover media.
- Có `cover_alt`.
- Có `author_id`.
- Có `reviewed_by_id`.
- Có `reviewed_at`.
- Có `next_review_at`.
- `next_review_at > reviewed_at`.
- Có ít nhất 1 `note_sources`.
- Mỗi source có `title` và ít nhất một định danh: `url`, `doi`, hoặc `pmid`.
- Có `seo_title` và `seo_description`.
- `disclaimer_ack = true`.
- Không có claim y tế rủi ro cao chưa được xác nhận.

Điều kiện warning:

- Không có `publisher` trên source.
- Source là `website/other` thay vì guideline/journal/systematic review.
- `next_review_at` quá xa, ví dụ hơn 36 tháng.
- Nội dung quá ngắn.
- Thiếu `medical_specialty`.

## 8. Thay đổi Admin UI

### 8.1 People/Reviewers manager

Thêm module:

```text
src/components/admin/people/PeopleManager.tsx
```

Menu Admin:

```text
Người viết & Reviewer
```

Chức năng:

- Tạo/sửa/xóa mềm reviewer.
- Fields:
  - display name
  - role
  - professional title
  - credentials
  - specialties
  - bio
  - profile URL
  - sameAs links
  - active/inactive

Không xóa cứng reviewer đã dùng trong bài viết. Dùng `is_active = false`.

### 8.2 Notes editor

Cập nhật `src/components/admin/notes/NotesManager.tsx`:

- Tab `Thông tin`:
  - author selector
  - reviewer selector
  - medical specialty
  - medical audience
- Tab `Nguồn & Review`:
  - Sources editor mới theo `note_sources`.
  - Source fields: title, URL, publisher, source type, DOI, PMID, published date, accessed date, evidence level.
  - Review panel: decision, summary, evidence notes, reviewed date, next review date.
  - Disclaimer acknowledgement checkbox.
- Tab `SEO & Schema`:
  - SEO title/description.
  - Schema type readonly default `MedicalWebPage`.
  - Preview JSON-LD.
- Publish area:
  - `Lưu nháp`
  - `Gửi duyệt`
  - `Duyệt y khoa`
  - `Đăng lên web`

Publish phải bị block nếu checklist medical fail.

### 8.3 Dashboard work queue

Cập nhật work queue:

- Notes published quá hạn review.
- Notes thiếu source.
- Notes thiếu reviewer.
- Notes có source loại `website/other` nhưng thiếu publisher.
- Notes chưa có disclaimer acknowledgment.
- Notes có `next_review_at` trong 30 ngày tới.
- Product có claim rủi ro cao nhưng thiếu warning/source.

### 8.4 Categories manager

Cập nhật:

- Chọn type bằng select, không nhập text tự do.
- Chọn parent category.
- Hiển thị tree đơn giản.
- Thêm filter theo type.
- Validate slug unique.

## 9. Thay đổi Public UI

### 9.1 `NoteDetail.tsx`

Hiển thị gần đầu bài:

- Tác giả.
- Người review y khoa.
- Bằng cấp/chuyên môn reviewer.
- Ngày xuất bản.
- Ngày cập nhật.
- Ngày review y khoa gần nhất.
- Ngày review tiếp theo nếu có.

Hiển thị sau nội dung:

- Medical disclaimer.
- Sources/references có cấu trúc:
  - title
  - publisher
  - publication date
  - DOI/PMID nếu có
  - accessed date nếu là web source

Không hiển thị nguồn trống hoặc URL không hợp lệ.

### 9.2 JSON-LD

Tạo helper:

```text
src/lib/structuredData.ts
```

Render trong `NoteDetail.tsx`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(buildMedicalWebPageJsonLd(note)) }}
/>
```

JSON-LD tối thiểu:

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "headline": "Tiêu đề bài viết",
  "description": "Mô tả SEO hoặc excerpt",
  "datePublished": "ISO date",
  "dateModified": "ISO date",
  "lastReviewed": "ISO date",
  "medicalAudience": "Patient",
  "author": {
    "@type": "Person",
    "name": "Tên tác giả"
  },
  "reviewedBy": {
    "@type": "Person",
    "name": "Tên bác sĩ review",
    "jobTitle": "Chức danh"
  },
  "citation": [
    "Nguồn 1",
    "Nguồn 2"
  ],
  "image": "Cover URL"
}
```

Nếu thiếu reviewer hoặc last reviewed, không publish bài y tế.

## 10. Media architecture

Phase này không bắt buộc xóa `product_images`/`book_images`. Thay vào đó:

1. Tạo `content_media`.
2. Backfill từ `product_images`, `book_images`, `notes.cover_storage_path`.
3. Service mới đọc `content_media` trước, fallback về bảng cũ.
4. Sau khi ổn định, phase sau mới có thể deprecate bảng ảnh riêng.

Backfill mẫu:

```sql
insert into content_media (entity_type, entity_id, media_asset_id, role, alt_override, sort_order, is_primary)
select 'product', product_id, media_asset_id, 'gallery', alt, sort_order, is_primary
from product_images
where media_asset_id is not null
on conflict do nothing;

insert into content_media (entity_type, entity_id, media_asset_id, role, alt_override, sort_order, is_primary)
select 'book', book_id, media_asset_id, 'gallery', alt, sort_order, is_primary
from book_images
where media_asset_id is not null
on conflict do nothing;
```

## 11. RLS và bảo mật

Nguyên tắc:

- Public chỉ đọc dữ liệu published/active.
- Admin đọc/ghi tất cả qua `is_admin()`.
- Không đưa service role key vào frontend.
- Reviewer/people public chỉ hiện `is_public = true`; `is_active` chỉ dùng để quyết định còn cho chọn trong Admin hay không.
- `content_revisions` chỉ admin đọc.
- `content_reviews` public chỉ đọc review của published notes.

RLS cần test bằng anon key, không chỉ bằng service role.

## 12. Thứ tự thực thi

### Phase 09.1 - Migration nền

1. Tạo migration `003_medical_cms_data_architecture.sql`.
2. Thêm `people`, `note_sources`, `content_reviews`, `content_revisions`, `content_media`.
3. Mở rộng `notes`, `categories`.
4. Thêm RLS.
5. Backfill `note_sources` từ `notes.sources`.
6. Backfill `content_media` từ ảnh cũ nếu an toàn.
7. Chạy migration local.

Lệnh kiểm tra:

```powershell
npx supabase migration up
docker exec supabase_db_Web_bac_si psql -U postgres -d postgres -c "\dt public.*"
docker exec supabase_db_Web_bac_si psql -U postgres -d postgres -c "select count(*) from note_sources;"
```

### Phase 09.2 - Types và services

1. Cập nhật `src/types/database.ts`.
2. Thêm service cho people/sources/reviews/revisions.
3. Sửa `contentService.ts` để đọc/ghi note metadata mới.
4. Giữ fallback legacy `notes.sources`.
5. Chạy TypeScript.

Lệnh:

```powershell
docker run --rm -v "${PWD}:/app" -v web-ts-phc-node-modules:/app/node_modules -w /app node:22-alpine sh -lc "npm ci && npm run lint"
```

### Phase 09.3 - Admin UI

1. Thêm People Manager.
2. Cập nhật Notes editor.
3. Cập nhật publish checklist.
4. Cập nhật dashboard work queue.
5. Cập nhật Categories manager.

Smoke test:

- Tạo reviewer.
- Tạo note draft.
- Thêm 2 nguồn.
- Tạo review approved.
- Publish note.
- Note xuất hiện ngoài `/notes`.

### Phase 09.4 - Public UI và JSON-LD

1. Cập nhật `NoteDetail.tsx`.
2. Thêm `structuredData.ts`.
3. Hiển thị reviewer/review dates/references/disclaimer.
4. Render JSON-LD.
5. Kiểm tra HTML output có `application/ld+json`.

Smoke test:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3001/notes/<slug>
```

### Phase 09.5 - Docker và regression

```powershell
docker compose up -d --build
Invoke-WebRequest -UseBasicParsing http://localhost:3001/
Invoke-WebRequest -UseBasicParsing http://localhost:3001/admin
Invoke-WebRequest -UseBasicParsing http://localhost:3001/notes
```

## 13. Acceptance criteria

Phase này chỉ coi là đạt khi:

- `npm run lint` pass.
- Docker build pass.
- Migration local apply được từ DB hiện tại.
- Admin tạo được reviewer.
- Admin tạo/sửa note với source mới.
- Publish note bị chặn nếu thiếu reviewer/source/review date/next review/disclaimer.
- Public note detail hiển thị:
  - author hoặc reviewer
  - reviewed date
  - next review date nếu có
  - references
  - disclaimer
- Public note detail có JSON-LD hợp lệ ở mức cơ bản.
- Không làm hỏng `/products`, `/books`, `/admin`.
- Legacy notes có `sources` JSONB vẫn đọc được sau migration.

## 14. Rủi ro và cách giảm rủi ro

### Rủi ro: migration làm hỏng dữ liệu notes cũ

Giảm rủi ro:

- Không drop cột cũ.
- Backfill additive.
- Chạy local trước.
- Export dữ liệu trước khi migration.

### Rủi ro: Supabase relationship alias lỗi

Giảm rủi ro:

- Nếu query nested fail, dùng nhiều query nhỏ trong service.
- Không phụ thuộc alias phức tạp trong bước đầu.

### Rủi ro: Admin workflow phức tạp hơn

Giảm rủi ro:

- Tách tab rõ ràng.
- Checklist chỉ block khi publish, không block khi lưu draft.
- Cho phép tạo reviewer nhanh trong modal.

### Rủi ro: media migration làm lệch ảnh public

Giảm rủi ro:

- Giữ `product_images`/`book_images`.
- Chỉ đọc `content_media` cho Notes trước.
- Product/Book chuyển sau khi đã test.

## 15. Prompt giao AI thực thi

```text
Thực thi phase 09 theo `docs/09-medical-cms-data-architecture-execution-plan.md`.

Mục tiêu: nâng cấu trúc dữ liệu CMS y tế từ MVP lên mô hình có nguồn tham khảo có cấu trúc, reviewer/author riêng, lịch sử review, revision, taxonomy mạnh hơn, media attachment chung và JSON-LD cho bài viết y tế.

Yêu cầu bắt buộc:
1. Tạo migration `003_medical_cms_data_architecture.sql` theo tài liệu:
   - thêm `people`
   - thêm `note_sources`
   - thêm `content_reviews`
   - thêm `content_revisions`
   - thêm `content_media`
   - mở rộng `notes`
   - mở rộng `categories`
   - thêm RLS public/admin đúng vai trò
   - backfill `note_sources` từ `notes.sources`
2. Không xóa `notes.sources`, `product_images`, `book_images` trong phase này.
3. Cập nhật `src/types/database.ts` đầy đủ.
4. Cập nhật service layer để Notes đọc/ghi source/reviewer/review metadata mới, có fallback legacy.
5. Cập nhật Admin Notes editor để chọn author/reviewer, nhập source có cấu trúc, tạo review, checklist publish y tế.
6. Thêm hoặc cập nhật Admin People/Reviewers manager.
7. Cập nhật public `NoteDetail.tsx` để hiển thị reviewer, reviewed date, next review date, references, disclaimer.
8. Thêm JSON-LD `MedicalWebPage`/Article cơ bản cho note detail.
9. Không đưa service role key vào frontend, không dùng Firebase/mockData.
10. Chạy kiểm tra:
    - migration local
    - `npm run lint`
    - `docker compose up -d --build`
    - smoke test `/admin`, `/notes`, `/notes/:slug`

Báo cáo cuối cùng phải gồm:
- File đã sửa/tạo.
- Migration đã apply hay chưa.
- Kết quả lint/build/Docker.
- Các test thủ công đã làm.
- Rủi ro còn lại.
```

## 16. Lệnh kiểm tra nhanh sau khi AI thực thi

```powershell
docker exec supabase_db_Web_bac_si psql -U postgres -d postgres -c "select count(*) from people;"
docker exec supabase_db_Web_bac_si psql -U postgres -d postgres -c "select count(*) from note_sources;"
docker exec supabase_db_Web_bac_si psql -U postgres -d postgres -c "select count(*) from content_reviews;"
docker exec supabase_db_Web_bac_si psql -U postgres -d postgres -c "select count(*) from content_revisions;"
docker exec supabase_db_Web_bac_si psql -U postgres -d postgres -c "select count(*) from content_media;"
docker run --rm -v "${PWD}:/app" -v web-ts-phc-node-modules:/app/node_modules -w /app node:22-alpine sh -lc "npm ci && npm run lint"
docker compose up -d --build
Invoke-WebRequest -UseBasicParsing http://localhost:3001/admin
Invoke-WebRequest -UseBasicParsing http://localhost:3001/notes
```

## 17. Quyết định kỹ thuật

- Chọn additive migration thay vì rewrite schema để giảm rủi ro.
- Giữ JSONB legacy để không mất dữ liệu và dễ rollback.
- Tách `note_sources` vì nguồn tham khảo là dữ liệu cần validate, lọc, thống kê và render.
- Tách `people` vì reviewer/author là tín hiệu tin cậy quan trọng, không nên là text tự do.
- Tách `content_reviews` vì review y tế là sự kiện nghiệp vụ, không chỉ là field ngày tháng.
- Tách `content_revisions` vì audit log không đủ để restore hoặc so sánh phiên bản.
- Tạo `content_media` nhưng chưa xóa bảng ảnh riêng để tránh phá public catalog.
