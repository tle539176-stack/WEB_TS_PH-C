# 04 - Nâng cấp Admin Media Upload và Media Library

## 1. Trạng thái tài liệu

Tài liệu này là tài liệu thực thi chính cho phase nâng cấp Media trong Admin.

Tài liệu này không thay thế `docs/00-ke-hoach-thuc-thi-thong-nhat.md`. Kiến trúc nền vẫn là:

```text
Vite + React + TypeScript
Supabase Auth + Supabase Postgres + Supabase Storage
Custom Admin UI
```

Chỉ thực thi trong repo:

```text
C:\Users\tle53\Desktop\Web bac si
```

Nếu thấy `.next`, `src/app`, Next.js App Router, Firebase, Firestore, Gemini hoặc `mockData` trong runtime thì đang đi sai hướng.

## 2. Mục tiêu phase

Mục tiêu chính:

```text
Bỏ luồng dán link ảnh làm mặc định.
Chuyển Admin sang upload ảnh trực tiếp lên Supabase Storage.
Áp dụng cho sản phẩm, sách, bài viết, logo, hero trang chủ và settings.
```

Kết quả cần đạt:

- Admin upload ảnh từ máy tính, không phải dán URL.
- Sản phẩm có tối đa 5 ảnh.
- Sách có tối đa 5 ảnh.
- Bài viết có ảnh cover upload trực tiếp.
- Settings có upload logo và hero image.
- Có preview ảnh trước và sau upload.
- Có progress khi upload.
- Có xóa ảnh.
- Có đặt ảnh bìa.
- Có sắp xếp ảnh sản phẩm/sách.
- Có alt text cho ảnh.
- Có Media Library cơ bản để xem ảnh đã upload.
- Nhập URL thủ công chỉ được để trong khu vực nâng cao, không phải luồng chính.

## 3. Căn cứ tham khảo từ các nền tảng lớn

Shopify:

- Có Files/Media Library dùng chung cho product media, brand image, metaobject.
- Có upload, manage, delete, alt text, focal point, replace file, search/filter.
- Tham khảo: https://help.shopify.com/en/manual/shopify-admin/productivity-tools/file-uploads

WooCommerce:

- Tách Product Image và Product Gallery.
- Gallery có thể kéo thả để đổi thứ tự.
- Tham khảo: https://woocommerce.com/document/adding-product-images-and-galleries/

BigCommerce:

- Product image có `is_thumbnail`, `sort_order`, `description`.
- Hỗ trợ upload file bằng multipart hoặc dùng URL.
- Một sản phẩm chỉ có một thumbnail chính.
- Tham khảo: https://docs.bigcommerce.com/developer/docs/admin/catalog-and-inventory/products-overview

Amazon Seller Central:

- Ảnh chính cần rõ, đúng sản phẩm, nền trắng, không text/watermark/logo thừa.
- Cần kiểm tra upload ảnh có đạt chuẩn hay không.
- Tham khảo: https://images-na.ssl-images-amazon.com/images/G/01/rainier/help/Home_Garden_and_Pets-Style_Guide.pdf

Shopee Seller Centre:

- Listing tốt cần tối thiểu 3 ảnh không trùng, ảnh rõ, không mờ, không pixelated.
- Ảnh bìa nên có nền rõ, sản phẩm chiếm phần lớn khung hình, không watermark/text/border quá nhiều.
- Tham khảo: https://cdngarenanow-a.akamaihd.net/shopee/seller/seller_cms/b71e298c6c220f22ef6f08608dbe1bd8/Mall%20Listing%20Guidelines.pdf

Lazada Seller Center:

- Có Content Quality Score dựa trên title, category, description, product images, attributes.
- Product images nên rõ, nhiều góc, tối thiểu 3 ảnh.
- Tham khảo: https://img-ovs.alicdn.com/other/common/26cdee8bca2e45379fdf6c15b1779472

## 4. Hiện trạng repo trước khi nâng cấp

Các file chính:

```text
src/pages/Admin.tsx
src/services/mediaService.ts
src/services/contentService.ts
src/services/settingsService.ts
src/types/database.ts
supabase/migrations/001_initial_schema.sql
```

Hiện trạng đã có:

- Supabase Auth đăng nhập Admin bằng email/password.
- Supabase Storage bucket `site-media`.
- Bảng `product_images` có `url`, `storage_path`, `alt`, `sort_order`, `is_primary`.
- Bảng `book_images` có `url`, `storage_path`, `alt`, `sort_order`, `is_primary`.
- Bảng `settings` kiểu key-value.
- `mediaService.uploadImage(path, file)` đã tồn tại nhưng UI chưa dùng đầy đủ.
- Admin vẫn còn ô nhập URL ảnh ở sản phẩm, sách, bài viết và settings hero.

Các điểm phải sửa:

- `ImageManager` hiện còn nhập `URL ảnh mới`.
- `ProductsManager` hiện còn field `image`.
- `BooksManager` hiện còn field `image`.
- `NotesManager` hiện còn field `cover_image_url`.
- `SettingsManager` hiện còn nhập `heroImage` bằng URL.
- `SiteSettings` hiện chưa có `logoImage` và `logoStoragePath`.

## 5. Nguyên tắc bắt buộc

Không được làm:

- Không dùng Firebase.
- Không dùng Firestore.
- Không dùng Gemini.
- Không tạo lại `mockData`.
- Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào frontend.
- Không hardcode Supabase secret.
- Không hardcode password Admin.
- Không chuyển dự án sang Next.js.
- Không sửa auth sang Google login.
- Không xóa dữ liệu ảnh cũ đang có URL nhưng chưa có `storage_path`.
- Không upload ảnh vào folder tạm nếu chưa có entity ID, trừ khi có cơ chế cleanup rõ ràng.
- Không chỉ làm sản phẩm rồi bỏ quên sách, bài viết, logo, hero/settings.
- Không sửa trực tiếp migration `001_initial_schema.sql` nếu database local đã chạy.
- Không thêm thư viện drag-drop nặng khi có thể làm nút Lên/Xuống trước.
- Không dùng base64 lưu ảnh trong Postgres.
- Không lưu file ảnh vào repo `public/` như dữ liệu upload runtime.

Phải làm:

- Dùng Supabase Storage bucket `site-media`.
- Dùng public anon/publishable key ở browser.
- Upload chỉ cho user có role admin qua RLS hiện có.
- Giữ tương thích dữ liệu cũ: ảnh URL cũ vẫn hiển thị được.
- Khi xóa ảnh có `storage_path`, chỉ xóa object trong Storage nếu object đó không còn được tham chiếu ở nơi khác.
- Khi xóa ảnh không có `storage_path`, chỉ xóa row database.
- Manual URL chỉ là chế độ nâng cao.
- Khi thay logo/hero/note cover, nếu ảnh cũ có `storage_path` thì chỉ xóa object cũ sau khi ảnh mới lưu thành công và ảnh cũ không còn được dùng ở nơi khác.
- Tạo bản nháp sản phẩm/sách/bài viết trước rồi mới upload ảnh gắn với đúng ID.

## 5.1. Các lỗi AI thực thi thường mắc

Nếu thấy một trong các dấu hiệu sau thì phải dừng và sửa lại:

- AI chỉ thay label từ "URL ảnh" sang "Upload ảnh" nhưng bên trong vẫn lưu bằng URL dán tay.
- AI upload được ảnh nhưng không ghi `storage_path`, làm xóa ảnh không xóa được object trong Storage.
- AI chỉ lưu public URL vào settings mà không lưu `heroStoragePath` hoặc `logoStoragePath`.
- AI tạo `SUPABASE_SERVICE_ROLE_KEY` trong `.env` rồi đưa vào Docker/frontend.
- AI thêm Firebase/Gemini vì thấy file cũ hoặc tài liệu lịch sử.
- AI tạo sản phẩm mới và upload ảnh trước khi có `productId`.
- AI xóa toàn bộ ảnh URL cũ thay vì giữ tương thích.
- AI chỉ chạy `npm run build` mà không test upload thật trong `/admin`.
- AI không cập nhật `src/types/database.ts`, dẫn tới type sai hoặc dùng `any`.
- AI tạo Media Library chỉ đọc Storage object mà không có bảng `media_assets`, dẫn tới không biết ảnh đang dùng ở đâu.
- AI xóa Storage object ngay khi gỡ ảnh khỏi một sản phẩm, làm hỏng nơi khác đang dùng chung ảnh đó.
- AI tạo migration `002` nhưng không apply vào database local, làm `/admin` lỗi vì thiếu bảng `media_assets`.

## 6. Data model cần bổ sung

Không sửa trực tiếp migration `001_initial_schema.sql` nếu database đã chạy. Tạo migration mới:

```text
supabase/migrations/002_admin_media_library.sql
```

Nội dung migration đề xuất:

```sql
-- ============================================================
-- Admin Media Library
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

alter table product_images
  add column if not exists media_asset_id uuid references media_assets(id) on delete set null;

alter table book_images
  add column if not exists media_asset_id uuid references media_assets(id) on delete set null;

alter table notes
  add column if not exists cover_storage_path text,
  add column if not exists cover_alt text not null default '';
```

Lý do cần `media_assets`:

- Supabase Storage chỉ lưu file/object, không đủ thông tin nghiệp vụ.
- Admin cần biết ảnh thuộc product/book/note/settings nào.
- Admin cần search/filter ảnh.
- Admin cần biết ảnh thiếu alt text.
- Sau này có thể làm Media Library dùng lại ảnh.

## 7. TypeScript types cần cập nhật

Cập nhật `src/types/database.ts`.

Thêm type:

```ts
export type MediaAsset = {
  id: string;
  bucket: string;
  storage_path: string;
  public_url: string;
  file_name: string;
  original_file_name: string | null;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt: string;
  caption: string | null;
  folder: string;
  entity_type: 'product' | 'book' | 'note' | 'setting' | 'general' | null;
  entity_id: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};
```

Cập nhật:

- `ProductImage` thêm `media_asset_id: string | null`.
- `BookImage` thêm `media_asset_id: string | null`.
- `Note` thêm `cover_storage_path: string | null`, `cover_alt: string`.
- `NoteInsert` thêm `cover_storage_path?: string | null`, `cover_alt?: string`.
- `Database.public.Tables` thêm `media_assets`.

## 8. Settings model cần cập nhật

Cập nhật `src/services/settingsService.ts`.

Thêm vào `SiteSettings`:

```ts
logoImage: string;
logoStoragePath: string;
heroStoragePath: string;
footerImage: string;
footerStoragePath: string;
```

Default:

```ts
logoImage: '',
logoStoragePath: '',
heroStoragePath: '',
footerImage: '',
footerStoragePath: '',
```

Đọc settings:

- `logoImage` từ key `global`.
- `logoStoragePath` từ key `global`.
- `heroImage` từ key `home`.
- `heroStoragePath` từ key `home`.
- `footerImage` từ key `global` hoặc `footer`.
- `footerStoragePath` từ key `global` hoặc `footer`.

Lưu settings:

- `global` lưu `siteName`, `logoText`, `logoImage`, `logoStoragePath`, `tagline`, `footerText`, `footerImage`, `footerStoragePath`, SEO và disclaimer.
- `home` lưu `heroImage`, `heroStoragePath`.
- `contact` giữ email, phone, address.
- `social` giữ social URL.

## 9. Media service cần xây dựng

Cập nhật `src/services/mediaService.ts`.

Các hằng số:

```ts
const BUCKET = 'site-media';
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
```

Các hàm bắt buộc:

```ts
validateImageFile(file: File): void
getImageDimensions(file: File): Promise<{ width: number; height: number }>
sanitizeFileName(name: string): string
buildMediaPath(input): string
uploadMediaAsset(input): Promise<MediaAsset>
deleteMediaAsset(asset: MediaAsset): Promise<void>
listMediaAssets(input): Promise<MediaAsset[]>
updateMediaAssetAlt(id: string, alt: string): Promise<void>
getMediaReferenceCount(input: { mediaAssetId?: string; storagePath?: string }): Promise<number>
deleteStorageObjectIfUnused(input: { mediaAssetId?: string; storagePath: string }): Promise<void>
```

Các hàm nghiệp vụ:

```ts
uploadProductImage(productId: string, file: File, opts?: { alt?: string; isPrimary?: boolean }): Promise<ProductImage>
uploadBookImage(bookId: string, file: File, opts?: { alt?: string; isPrimary?: boolean }): Promise<BookImage>
uploadNoteCover(noteId: string, file: File, opts?: { alt?: string }): Promise<{ url: string; storagePath: string; asset: MediaAsset }>
uploadSettingImage(kind: 'logo' | 'hero' | 'footer', file: File, opts?: { alt?: string }): Promise<{ url: string; storagePath: string; asset: MediaAsset }>
reorderProductImages(productId: string, imageIds: string[]): Promise<void>
reorderBookImages(bookId: string, imageIds: string[]): Promise<void>
```

Quy tắc xóa an toàn:

- `deleteProductImage()` và `deleteBookImage()` phải xóa row liên kết trước.
- Chỉ xóa Storage object nếu `getMediaReferenceCount()` trả về `0` sau khi row liên kết đã bị xóa.
- Reference count phải kiểm tra tối thiểu:
  - `product_images.media_asset_id` hoặc `product_images.storage_path`.
  - `book_images.media_asset_id` hoặc `book_images.storage_path`.
  - `notes.cover_storage_path`.
  - settings JSON chứa `logoStoragePath`, `heroStoragePath`, `footerStoragePath`.
- Nếu ảnh đang được dùng ở nơi khác, chỉ gỡ khỏi entity hiện tại, không xóa object.
- Xóa asset trong Media Library là thao tác khác với gỡ ảnh khỏi sản phẩm/sách/bài viết. Nếu asset còn được dùng, phải chặn hoặc yêu cầu xác nhận rõ.

Path chuẩn:

```text
products/{productId}/{timestamp}-{safeFileName}
books/{bookId}/{timestamp}-{safeFileName}
notes/{noteId}/{timestamp}-{safeFileName}
settings/logo/{timestamp}-{safeFileName}
settings/hero/{timestamp}-{safeFileName}
settings/footer/{timestamp}-{safeFileName}
general/{timestamp}-{safeFileName}
```

File name phải:

- Không dấu tiếng Việt.
- Không khoảng trắng.
- Không ký tự lạ.
- Lowercase.
- Giữ extension hợp lệ.

Ví dụ:

```text
Kem dưỡng Ẩm 01.JPG
```

thành:

```text
kem-duong-am-01.jpg
```

## 10. Components cần tạo

Tạo thư mục:

```text
src/components/admin/media/
```

Tạo các component:

```text
src/components/admin/media/MediaUploader.tsx
src/components/admin/media/MediaGallery.tsx
src/components/admin/media/MediaLibraryPicker.tsx
src/components/admin/media/AdvancedImageUrlInput.tsx
```

### MediaUploader

Dùng cho một ảnh:

- Logo.
- Hero image.
- Note cover.
- Footer image nếu có.

Props đề xuất:

```ts
type MediaUploaderProps = {
  label: string;
  valueUrl?: string;
  valueStoragePath?: string;
  alt?: string;
  folder: 'settings/logo' | 'settings/hero' | 'settings/footer' | 'notes' | 'general';
  entityType: 'setting' | 'note' | 'general';
  entityId?: string;
  aspectHint?: '1:1' | '3:4' | '16:9' | 'free';
  onUploaded: (payload: { url: string; storagePath: string; assetId?: string; alt?: string }) => void;
  onRemove?: () => void;
};
```

UI bắt buộc:

- Dropzone.
- Button chọn file.
- Preview.
- Progress.
- Lỗi file.
- Alt text.
- Xóa/thay ảnh.
- Gợi ý tỉ lệ ảnh.

### MediaGallery

Dùng cho nhiều ảnh:

- Product images.
- Book images.

Props đề xuất:

```ts
type MediaGalleryProps = {
  entityId: string;
  entityType: 'product' | 'book';
  maxImages?: number;
  aspectHint: '1:1' | '3:4';
  onChanged?: () => void;
};
```

UI bắt buộc:

- Grid tối đa 5 ảnh.
- Ô thêm ảnh.
- Preview.
- Progress upload từng ảnh.
- Nút đặt làm ảnh bìa.
- Badge ảnh bìa.
- Alt text từng ảnh.
- Xóa ảnh.
- Sắp xếp ảnh.
- Hiển thị `n/5 ảnh`.
- Cảnh báo nếu chưa có ảnh bìa.

Kéo thả reorder có thể làm bằng button trước:

```text
Lên
Xuống
```

Không bắt buộc phải thêm thư viện drag-drop ngay trong phase này.

### MediaLibraryPicker

Dùng để chọn ảnh đã upload:

- Hiển thị danh sách ảnh gần đây từ `media_assets`.
- Search theo file name hoặc alt.
- Filter theo folder/entity type.
- Chọn ảnh để dùng lại.

Phase này chỉ cần bản cơ bản. Không cần làm quá phức tạp.

### AdvancedImageUrlInput

Luồng URL thủ công phải nằm trong `<details>` hoặc section nâng cao.

Label rõ:

```text
Nâng cao: dùng ảnh từ URL ngoài
```

Không được để URL là cách nhập chính.

## 11. Cập nhật Admin UI

File chính:

```text
src/pages/Admin.tsx
```

### ProductsManager

Bỏ field `image` khỏi form chính.

Luồng thêm mới:

```text
1. Admin bấm Thêm sản phẩm.
2. Nhập tên, giá, mô tả, trạng thái mặc định draft.
3. Bấm "Tạo bản nháp và tiếp tục".
4. Hệ thống createProduct() và lấy productId.
5. Form chuyển sang edit mode.
6. Hiển thị MediaGallery để upload tối đa 5 ảnh.
7. Admin có thể đặt ảnh bìa, sắp xếp, nhập alt.
8. Chỉ publish khi đạt checklist.
```

Lý do:

- Upload ảnh cần `productId`.
- Không nên upload ảnh vào folder tạm rồi phải dọn nếu sản phẩm chưa tạo.

Khi edit sản phẩm:

- Hiển thị `MediaGallery entityType="product"`.
- Không hiện ô URL ảnh mặc định.
- Có `AdvancedImageUrlInput` nếu cần import URL cũ.

### BooksManager

Tương tự sản phẩm:

- Bỏ field `image` khỏi form chính.
- Tạo sách nháp trước.
- Edit mode mới upload gallery.
- `MediaGallery entityType="book"`.
- Tỉ lệ gợi ý `3:4`.

### NotesManager

Thay `cover_image_url` input bằng `MediaUploader`.

Luồng tạo mới:

- Có thể tạo note draft trước rồi upload cover.
- Hoặc upload cover sau khi note được lưu lần đầu.
- Nếu chưa có `noteId`, nút upload disabled và hiển thị:

```text
Lưu bản nháp trước để upload ảnh cover.
```

Khi upload cover:

- Lưu `cover_image_url`.
- Lưu `cover_storage_path`.
- Lưu `cover_alt`.

### SettingsManager

Thay URL hero bằng `MediaUploader`.

Thêm:

- Upload logo image.
- Upload hero image.
- Upload footer image nếu cần.

Quy tắc hiển thị:

- Nếu có `logoImage`, Navbar/Footer dùng ảnh logo.
- Nếu không có `logoImage`, dùng `logoText`.
- Nếu có `heroImage`, Home dùng ảnh hero.
- Nếu không có `heroImage`, dùng ảnh mặc định hoặc layout hiện tại.

## 12. Cập nhật public UI

Các file cần kiểm tra:

```text
src/components/layout/Navbar.tsx
src/components/layout/Footer.tsx
src/pages/Home.tsx
src/pages/NoteDetail.tsx
src/pages/ProductDetail.tsx
src/pages/BookDetail.tsx
```

Yêu cầu:

- Navbar hiển thị logo ảnh nếu `settings.logoImage` có giá trị.
- Footer hiển thị logo ảnh nếu `settings.logoImage` có giá trị.
- Home hiển thị hero image từ settings.
- Note detail dùng `cover_alt` nếu có.
- Product detail và Book detail dùng `alt` từ image rows.

Không được phá layout hiện tại.

## 13. Publish checklist và Content Quality Score tối thiểu

Phase này phải thêm checklist cơ bản, chưa cần quá phức tạp.

Product checklist:

- Có tên.
- Có giá.
- Có mô tả.
- Có ít nhất 1 ảnh.
- Có ảnh bìa.
- Nếu có ít hơn 3 ảnh thì cảnh báo, nhưng chưa chặn publish.
- Có alt cho ảnh bìa.

Book checklist:

- Có title.
- Có author.
- Có mô tả.
- Có ít nhất 1 ảnh.
- Có ảnh bìa.
- Có alt cho ảnh bìa.

Note checklist:

- Có title.
- Có excerpt.
- Có content.
- Có cover image.
- Có cover alt.
- Nếu status là `published`, cảnh báo nếu chưa có nguồn trong `sources`.

Settings checklist:

- Có site name.
- Có logo text hoặc logo image.
- Có hero image.
- Có SEO title.
- Có SEO description.
- Có medical disclaimer.

Không cần chặn publish toàn bộ ngay. Trước mắt hiển thị cảnh báo rõ trong Admin.

## 14. Logging

Tận dụng `src/services/auditLogService.ts`.

Mỗi hành động sau phải ghi audit log:

- Upload ảnh.
- Xóa ảnh.
- Đặt ảnh bìa.
- Reorder ảnh.
- Thay logo.
- Thay hero image.
- Thay note cover.
- Publish sản phẩm/sách/bài viết.

Nếu hiện tại service chưa được gọi trong Admin, phải tích hợp.

## 15. Kiểm thử bắt buộc

Chạy lệnh:

```bash
npm run lint
npm run build
npx supabase migration up
docker compose up -d --build --force-recreate
```

Lưu ý migration:

- Nếu tạo `supabase/migrations/002_admin_media_library.sql`, phải apply migration vào Supabase local trước khi test `/admin`.
- Dùng `npx supabase migration up` cho local database đang chạy.
- Không dùng `npx supabase db reset` trừ khi người dùng chấp nhận mất dữ liệu local hiện có.
- Khi lên Supabase cloud/production, dùng quy trình deploy migration riêng như `npx supabase db push` hoặc SQL Editor theo môi trường thật.

Kiểm tra Supabase:

```bash
npx supabase status
```

Kiểm tra không leak secret:

```bash
rg -n "SUPABASE_SERVICE_ROLE_KEY|sb_secret|GEMINI|MY_GEMINI|firebase|firestore|mockData" src dist public
```

Kết quả mong muốn:

- Không có `SUPABASE_SERVICE_ROLE_KEY` trong `src`, `dist`, `public`.
- Không có Gemini/Firebase/Firestore/mockData trong runtime.
- Có thể còn chữ `SUPABASE_SERVICE_ROLE_KEY` trong scripts server-side hoặc docs, nhưng không được có trong frontend bundle.

## 16. Kiểm thử bằng browser

Đăng nhập:

```text
http://localhost:3001/admin
```

Luồng sản phẩm:

- Tạo sản phẩm draft.
- Upload 2 ảnh.
- Đặt ảnh thứ 2 làm ảnh bìa.
- Nhập alt text.
- Xóa ảnh thứ 1.
- Reload trang Admin.
- Ảnh còn lại vẫn hiển thị.
- Bảng `product_images` có `url`, `storage_path`, `alt`, `is_primary`.
- Bảng `media_assets` có asset tương ứng.
- Nếu ảnh bị xóa không còn được dùng ở đâu, Storage object tương ứng bị xóa.
- Nếu ảnh đang được dùng ở nơi khác, chỉ gỡ liên kết sản phẩm, không xóa Storage object.

Luồng sách:

- Tạo sách draft.
- Upload ảnh bìa.
- Đặt ảnh bìa.
- Reload Admin.
- Ảnh vẫn hiển thị.

Luồng bài viết:

- Tạo note draft.
- Upload cover image.
- Lưu.
- Reload Admin.
- Cover vẫn hiển thị.

Luồng settings:

- Upload logo.
- Upload hero image.
- Lưu settings.
- Mở `http://localhost:3001`.
- Navbar/Footer dùng logo nếu có.
- Trang chủ dùng hero image mới.

Luồng Storage:

- Vào Supabase Studio.
- Kiểm tra bucket `site-media` có object mới.
- Xóa ảnh trong Admin thì object tương ứng bị xóa nếu có `storage_path`.

## 17. Tiêu chuẩn nghiệm thu

Chỉ coi phase hoàn thành khi đạt đủ:

- Admin không còn bắt nhập URL ảnh trong luồng chính.
- Product upload trực tiếp hoạt động.
- Book upload trực tiếp hoạt động.
- Note cover upload trực tiếp hoạt động.
- Logo upload trực tiếp hoạt động.
- Hero upload trực tiếp hoạt động.
- Delete ảnh xóa đúng Storage object nếu có `storage_path` và object không còn được tham chiếu ở nơi khác.
- Delete ảnh không xóa Storage object nếu object đang được dùng ở nơi khác.
- Dữ liệu URL cũ vẫn hiển thị được.
- `npm run lint` pass.
- `npm run build` pass.
- Docker chạy được.
- `/admin` đăng nhập được.
- Public site vẫn load được.
- Không leak service role key.
- Không quay lại Firebase/Gemini/mockData.

## 18. Phạm vi chưa làm trong phase này

Không bắt buộc làm ngay:

- Crop ảnh nâng cao.
- Tự chuyển ảnh sang WebP.
- AI sinh alt text.
- Full drag-drop bằng thư viện ngoài.
- Scheduled publish.
- Version history.
- Role nhiều cấp.
- Analytics lượt xem.

Các mục này để phase sau, không trộn vào phase Media để tránh quá tải và sai hướng.

## 19. Prompt chuẩn giao AI thực thi

```text
Làm đúng repo `C:\Users\tle53\Desktop\Web bac si` theo `docs/04-admin-media-upload-va-media-library.md`, không đổi kiến trúc Supabase hiện tại: tạo migration `supabase/migrations/002_admin_media_library.sql` cho `media_assets`, `media_asset_id` trên product_images/book_images và cover metadata cho notes; apply migration local bằng `npx supabase migration up`; cập nhật `src/types/database.ts`; mở rộng `src/services/mediaService.ts` để validate ảnh, upload trực tiếp lên Supabase Storage bucket `site-media`, tạo media_assets, xóa storage object an toàn chỉ khi asset không còn được tham chiếu, upload product/book/note/settings images; tạo các component `src/components/admin/media/MediaUploader.tsx`, `MediaGallery.tsx`, `MediaLibraryPicker.tsx`, `AdvancedImageUrlInput.tsx`; sửa `src/pages/Admin.tsx` để bỏ nhập URL ảnh khỏi luồng chính và áp dụng upload trực tiếp cho sản phẩm, sách, bài viết, logo, hero trang chủ/settings, giữ URL thủ công chỉ ở mục nâng cao; cập nhật `src/services/settingsService.ts`, Navbar/Footer/Home/Detail pages để dùng logoImage/heroImage/cover alt; thêm checklist chất lượng tối thiểu và audit log cho upload/xóa/đặt ảnh bìa/reorder; giữ tương thích ảnh URL cũ; không dùng Firebase, Firestore, Gemini, mockData, không đưa `SUPABASE_SERVICE_ROLE_KEY` vào frontend; chạy `npm run lint`, `npm run build`, `docker compose up -d --build --force-recreate`, kiểm tra `/admin` upload ảnh thật thành công và báo cáo file đã sửa, kết quả kiểm thử, rủi ro còn lại.
```

## 20. Prompt ngắn nếu cần

```text
Thực thi phase Admin Media theo `docs/04-admin-media-upload-va-media-library.md`: tạo/apply migration media_assets bằng `npx supabase migration up`, Supabase Storage upload trực tiếp cho sản phẩm/sách/bài viết/logo/hero/settings, MediaGallery/MediaUploader, bỏ URL ảnh khỏi luồng chính, giữ URL nâng cao, xóa Storage object an toàn nếu không còn được tham chiếu, chạy lint/build/Docker và nghiệm thu upload thật trong `/admin`.
```
