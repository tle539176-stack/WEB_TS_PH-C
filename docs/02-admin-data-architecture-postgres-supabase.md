> TRẠNG THÁI HIỆN TẠI: TÀI LIỆU THAM KHẢO KIẾN TRÚC, KHÔNG THỰC THI RIÊNG LẺ.
>
> Tài liệu này mô tả nền tảng Supabase/Postgres ban đầu. Kế hoạch triển khai đầy đủ, bao gồm Admin Auth, Storage, migration khỏi Firebase, migration khỏi mockData và kiểm thử Docker, đã được gom vào `docs/00-ke-hoach-thuc-thi-thong-nhat.md`.
# Tài liệu tham khảo kiến trúc: Admin Data Architecture với Postgres/Supabase

## 1. Muc tieu

Thiet ke lai lop du lieu va Admin CMS cho website bac si theo huong ban tinh:

- San pham, sach va ghi chu/bai viet co the cap nhat thuong xuyen tu Admin.
- Khong dung Cloud Firestore lam database chinh.
- Dung Postgres lam database co cau truc.
- Luu anh trong Storage, database chi luu metadata anh.
- Ho tro nhieu anh cho moi san pham va moi sach, mac dinh khoang 5 anh/item.
- Chuan bi nen tang cho workflow y khoa: draft, review, published, archived.

## 2. Ket qua nghien cuu cac website y te lon

Cac website lon khong cong khai chi tiet database hoac CMS noi bo. Tuy nhien, tai lieu cong khai cua ho cho thay nhung diem chung ve cach van hanh noi dung y te:

1. Mayo Clinic co quy trinh tao noi dung gom editorial research, writing/editing, medical review, copy editing, annotation, visual content creation va publishing. Noi dung co lich review; cac chu de thay doi nhanh duoc review it nhat moi 2 nam.
2. Cleveland Clinic neu ro moi bai viet deu duoc medical expert review ve do chinh xac y khoa.
3. NHS co clinical sign-off, policy sign-off, final editorial checks va review noi dung he thong it nhat moi 3 nam.
4. Healthline hien thi ngay medical review va co mang luoi chuyen gia y te review noi dung.

Bai hoc ap dung cho du an:

- Admin khong chi la CRUD. Admin phai la noi quan ly quy trinh noi dung.
- Bai viet y khoa can truong `reviewed_by`, `reviewed_at`, `next_review_at`, `sources`.
- Can `status` de tach ban nhap, dang review, da xuat ban va luu tru.
- Can metadata va SEO de noi dung de tim, de quan ly.
- Can audit log de biet ai sua gi va khi nao.
- Can quan ly anh nhu mot phan cua quy trinh bien tap, khong chi paste URL.

Nguon tham khao:

- Mayo Clinic Health Information Policy: https://www.mayoclinic.org/about-this-site/health-information-policy
- Cleveland Clinic Editorial Policy: https://my.clevelandclinic.org/about/website/editorial-policy
- NHS Content Policy: https://www.nhs.uk/our-policies/content-policy/
- Healthline Editorial Process: https://www.healthline.com/about/process

## 3. Hien trang trong repo

Hien tai:

- Public site van doc du lieu tu `src/data/mockData.ts`.
- Admin ghi/doc cac collection `books`, `products`, `notes`, `categories`, `settings`.
- Firestore rules van validate `image` la string, chua ho tro `images`.
- `books` va `products` trong Admin chi co mot field anh: `image`.
- Detail page cua product/book cung chi render mot anh chinh.
- Admin nam gan nhu tat ca trong mot file lon: `src/pages/Admin.tsx`.

File lien quan:

- `src/pages/Admin.tsx`
- `src/pages/Books.tsx`
- `src/pages/BookDetail.tsx`
- `src/pages/Products.tsx`
- `src/pages/ProductDetail.tsx`
- `src/pages/Notes.tsx`
- `src/pages/NoteDetail.tsx`
- `src/data/mockData.ts`
- `firestore.rules`
- `firebase-blueprint.json`

Ket luan hien trang:

- Neu bo Firestore, can thay bang mot lop data moi truoc khi Admin co the hoat dong that.
- Vi du lieu co quan he ro rang, Postgres phu hop hon Firestore.
- Can lam schema truoc, roi moi sua Admin va public site theo schema do.

## 4. De xuat kien truc

Phuong an khuyen nghi:

```text
Frontend: React/Vite hien tai
Admin UI: custom Admin trong app hien tai
Auth Admin: Supabase Auth hoac backend session rieng
Database: Supabase Postgres
File Storage: Supabase Storage hoac Cloudinary
Authorization: Postgres RLS neu dung Supabase client truc tiep
```

Ly do chon Supabase Postgres:

- Moi project Supabase co Postgres day du.
- Supabase co Auth, Storage va Row Level Security.
- Postgres phu hop voi du lieu co quan he: product-category, product-images, book-images, article-category.
- Co the bat dau nhanh ma chua can tu viet backend Express rieng.

Nguon Supabase:

- Supabase Database: https://supabase.com/docs/guides/database/overview
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage: https://supabase.com/docs/guides/storage

## 5. Nguyen tac luu du lieu

Khong luu file anh trong Postgres.

Dung Storage de luu file:

```text
products/{productId}/01.webp
products/{productId}/02.webp
books/{bookId}/01.webp
notes/{noteId}/cover.webp
```

Dung Postgres de luu metadata:

```text
url
storage_path
alt
sort_order
is_primary
width
height
mime_type
created_at
```

Voi nhu cau 5 anh/san pham, nen dung bang anh rieng thay vi cac cot `image1`, `image2`, `image3`.

## 6. Schema de xuat

### 6.1. Enum

```sql
create type content_status as enum ('draft', 'in_review', 'published', 'archived');
create type media_owner_type as enum ('product', 'book', 'note', 'setting');
```

### 6.2. Categories

```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  type text not null default 'note',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

`type` co the la:

```text
note
product
book
```

### 6.3. Products

```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references categories(id),
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
```

### 6.4. Product Images

```sql
create table product_images (
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
  created_at timestamptz not null default now()
);

create index product_images_product_id_idx on product_images(product_id);
```

Quy uoc:

- Moi product nen co toi da 5 anh trong giai do dau.
- Chi mot anh `is_primary = true`.
- Public list page dung anh primary.
- Detail page dung toan bo gallery theo `sort_order`.

### 6.5. Books

```sql
create table books (
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
```

### 6.6. Book Images

```sql
create table book_images (
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
  created_at timestamptz not null default now()
);

create index book_images_book_id_idx on book_images(book_id);
```

### 6.7. Notes / Articles

```sql
create table notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  category_id uuid references categories(id),
  cover_image_url text,
  read_time text,
  status content_status not null default 'draft',
  reviewed_by text,
  reviewed_at timestamptz,
  next_review_at timestamptz,
  sources jsonb not null default '[]',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
```

### 6.8. Settings

```sql
create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
```

Vi du:

```text
global
home
footer
social
```

### 6.9. Audit Logs

```sql
create table audit_logs (
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
```

## 7. Admin modules can co

### 7.1. Dashboard

- Tong so products/books/notes/categories.
- So ban nhap.
- So bai viet can review.
- Hoat dong gan day tu `audit_logs`.

### 7.2. Products Manager

- CRUD product.
- Upload toi da 5 anh.
- Chon anh chinh.
- Sap xep anh.
- Alt text cho moi anh.
- Status: draft/published/archived.
- SEO fields.

### 7.3. Books Manager

- CRUD book.
- Upload toi da 5 anh.
- Bia truoc, bia sau, muc luc, anh review.
- Thong tin tac gia, publisher, year, pages, price.
- Status va SEO.

### 7.4. Notes Manager

- CRUD bai viet.
- Workflow draft/in_review/published/archived.
- Medical review fields.
- Sources.
- Cover image.
- SEO.

### 7.5. Media Manager

- Xem anh da upload.
- Loc theo product/book/note.
- Xoa anh khong dung.
- Copy URL neu can.

### 7.6. Settings

- Hero image.
- Contact.
- Social links.
- Footer.
- Medical disclaimer.

### 7.7. Admin Users

- Quan ly role admin/editor/reviewer neu can.
- Giai do dau co the chi can admin.

## 8. Cach public site doc du lieu

Sau khi schema on dinh:

- `Books.tsx` doc `books` co `status = published`.
- `BookDetail.tsx` doc book theo `slug`, kem `book_images`.
- `Products.tsx` doc `products` co `status = published`.
- `ProductDetail.tsx` doc product theo `slug`, kem `product_images`.
- `Notes.tsx` doc `notes` co `status = published`.
- `NoteDetail.tsx` doc note theo `slug`.

Trang public khong duoc doc ban nhap.

## 9. RLS va phan quyen

Neu dung Supabase client truc tiep:

- Bat RLS cho tat ca bang public.
- Cho `anon` doc row co `status = 'published'`.
- Chi admin/editor moi duoc insert/update/delete.
- Khong bao gio dua service role key vao frontend.

Vi du y tuong policy:

```sql
create policy "Public can read published products"
on products for select
to anon, authenticated
using (status = 'published');
```

Quyen admin nen nam trong `app_metadata`, khong nam trong `user_metadata`, vi user co the tu sua user metadata.

## 10. Lo trinh thuc thi

### Phase 2.1: Chot kien truc

- Chon Supabase Postgres hoac backend Express + Postgres.
- Chot storage: Supabase Storage hoac Cloudinary.
- Chot danh sach bang.

### Phase 2.2: Tao database schema

- Tao migrations SQL.
- Tao indexes.
- Bat RLS.
- Tao policies.

### Phase 2.3: Ket noi app voi Supabase

- Them `@supabase/supabase-js`.
- Tao `src/lib/supabase.ts`.
- Them bien moi truong `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

### Phase 2.4: Nang cap Admin

- Tach Admin thanh component/module nho.
- Products/Books co multi-image manager.
- Notes co workflow va medical review fields.
- Settings doc/ghi vao Postgres.

### Phase 2.5: Chuyen public site khoi mockData

- Doc data tu Postgres/Supabase.
- Them loading, empty, error states.
- Xoa phu thuoc public vao `mockData`.

### Phase 2.6: Migration du lieu

- Viet script seed tu `src/data/mockData.ts`.
- Import products/books/notes dau tien.
- Upload anh that vao Storage neu co.

## 11. Lệnh giao việc cũ

Prompt Phase 2 cũ đã bị loại bỏ vì chỉ scaffold Supabase, chưa hoàn tất toàn bộ migration khỏi Firebase/mockData.

Nếu cần giao AI agent thực thi nâng cấp, dùng prompt trong:

```text
docs/00-ke-hoach-thuc-thi-thong-nhat.md
```

## 12. Quyết định kiến trúc hiện tại

Các quyết định cũ trong tài liệu này đã được chốt lại trong `docs/00-ke-hoach-thuc-thi-thong-nhat.md`:

```text
Database: Supabase Postgres
Auth: Supabase Auth cho Admin
Storage: Supabase Storage
Admin UI: giữ custom Admin hiện tại, ưu tiên thay data layer trước
Public data: chuyển khỏi mockData sang Supabase published data
```

Không quay lại hướng giữ Firebase Auth/Firestore nếu không có yêu cầu rollback rõ ràng.

## 13. Đề xuất mặc định cũ

Neu can ra quyet dinh nhanh:

```text
Database: Supabase Postgres
Auth: Supabase Auth cho Admin
Storage: Supabase Storage
Admin UI: giu custom Admin hien tai va refactor tung module
Public data: chuyen tu mockData sang Supabase sau khi schema on dinh
```

Ly do:

- Giam phu thuoc Firebase/Firestore.
- Van co Postgres, Auth, Storage, RLS trong mot he.
- Khong can tu dung backend rieng ngay tu dau.
- Phu hop voi website ban tinh co CMS nho.



