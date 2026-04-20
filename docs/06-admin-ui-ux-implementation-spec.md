# 06 - Spec triển khai UI/UX Admin, Thư viện Sách và Sản phẩm

Trạng thái: tài liệu thực thi phase UI/UX.

Tài liệu nền: `docs/05-admin-ui-ux-research-books-products.md`.

## 1. Phạm vi phase này

Triển khai nâng cấp UX cho:

- Admin dashboard.
- Admin list/editor cho `products`.
- Admin list/editor cho `books`.
- Public `/products` và `/products/:slug`.
- Public `/books` và `/books/:slug`.

Không thay đổi kiến trúc:

```text
Supabase Auth + Supabase Postgres + Supabase Storage + custom Admin UI
```

Không quay lại Firebase hoặc mockData.

## 2. Mục tiêu sản phẩm

Admin phải trở thành công cụ nhập liệu theo dòng chảy:

```text
List -> Create draft -> Guided editor -> Media -> Quality checklist -> Preview -> Publish
```

Public Books/Products phải trở thành catalog dễ tìm:

```text
Search -> Filter -> Compare by card -> Detail -> CTA
```

## 3. Component cần tạo hoặc tách

### 3.1. Admin shared components

Tạo thư mục:

```text
src/components/admin/content-workflow/
```

Components đề xuất:

- `ContentListToolbar.tsx`
- `ContentStatusBadge.tsx`
- `ContentQualityChecklist.tsx`
- `EditorStepList.tsx`
- `EditorStickyActions.tsx`
- `EntityPreviewPanel.tsx`
- `UnsavedChangesGuard.tsx`

### 3.2. Product admin components

Tạo hoặc tách:

```text
src/components/admin/products/
```

Components:

- `ProductList.tsx`
- `ProductEditor.tsx`
- `ProductBasicsStep.tsx`
- `ProductContentStep.tsx`
- `ProductMediaStep.tsx`
- `ProductSeoReviewStep.tsx`
- `ProductPreview.tsx`

### 3.3. Book admin components

Tạo hoặc tách:

```text
src/components/admin/books/
```

Components:

- `BookList.tsx`
- `BookEditor.tsx`
- `BookBasicsStep.tsx`
- `BookContentStep.tsx`
- `BookMediaStep.tsx`
- `BookSeoReviewStep.tsx`
- `BookPreview.tsx`

### 3.4. Public catalog components

Tạo thư mục:

```text
src/components/catalog/
```

Components:

- `CatalogHeader.tsx`
- `CatalogSearch.tsx`
- `CatalogFilterPanel.tsx`
- `AppliedFilterChips.tsx`
- `CatalogSortSelect.tsx`
- `BookCard.tsx`
- `ProductCard.tsx`
- `MedicalDisclaimer.tsx`

## 4. Admin dashboard spec

Trong `src/pages/Admin.tsx`, dashboard cần có:

### 4.1. Quick create

Buttons:

- `Tạo sách`
- `Tạo sản phẩm`
- `Tạo ghi chú`
- `Tạo danh mục`

Click đưa thẳng tới editor tương ứng ở mode create.

### 4.2. Work queue

Cards:

- Sách nháp chưa có ảnh bìa.
- Sản phẩm nháp chưa có ảnh.
- Nội dung published nhưng thiếu SEO.
- Nội dung mới cập nhật trong 7 ngày.

### 4.3. Recent content

List 5 item gần nhất:

- Thumbnail.
- Type.
- Title/name.
- Status.
- Updated at.
- Action `Sửa`.

## 5. Admin list spec

### 5.1. Product list

Toolbar:

- Search by name/brand/tag.
- Status filter.
- Category filter.
- Sort: updated desc, created desc, name A-Z, price.
- Button `Tạo sản phẩm`.

Rows:

- Thumbnail.
- Product name.
- Brand.
- Price.
- Status badge.
- Image count.
- Updated at.
- Actions: edit, preview, duplicate, archive, delete.

### 5.2. Book list

Toolbar:

- Search by title/author/year.
- Status filter.
- Topic/category filter.
- Sort: updated desc, year desc, title A-Z, price.
- Button `Tạo sách`.

Rows:

- Cover.
- Title.
- Author.
- Year.
- Price.
- Status badge.
- Image count.
- Updated at.
- Actions: edit, preview, duplicate, archive, delete.

## 6. Admin editor spec

### 6.1. Shared editor layout

Desktop:

```text
┌───────────────┬──────────────────────────────┬──────────────────┐
│ Step list     │ Form step                    │ Preview/checklist │
│ 240px         │ flexible                     │ 320px             │
└───────────────┴──────────────────────────────┴──────────────────┘
```

Mobile:

```text
Stepper chips
Form
Checklist accordion
Sticky actions
```

Sticky actions:

- `Lưu nháp`
- `Xem trước`
- `Xuất bản`

Publish disabled nếu checklist có lỗi bắt buộc.

### 6.2. Product steps

Step 1 - Thông tin chính:

- `name` required.
- `price`.
- `brand`.
- `tag`.
- `status`.
- `short_description`.

Step 2 - Phân loại:

- `category_id`.
- `product_type` nếu có migration sau.
- `health_goals` nếu có migration sau.

Step 3 - Nội dung:

- `description`.
- `usage`.
- `warnings`.
- `contraindications` nếu có migration sau.

Step 4 - Ảnh:

- `MediaGallery`.
- Cover required trước publish.
- Alt text warning nếu trống.

Step 5 - SEO và review:

- `seo_title`.
- `seo_description`.
- Checklist.

Step 6 - Preview/publish:

- Preview card.
- Preview detail.
- Public URL nếu status published.

### 6.3. Book steps

Step 1 - Thông tin chính:

- `title` required.
- `subtitle`.
- `author`.
- `year`.
- `price`.
- `status`.
- `description`.

Step 2 - Metadata:

- `publisher`.
- `pages`.
- `rating`.
- `is_new`.
- `category/topic` nếu có.

Step 3 - Nội dung:

- `content`.
- `sample_url` nếu có migration sau.
- `buy_url` nếu có migration sau.

Step 4 - Ảnh:

- `MediaGallery` aspect `3:4`.
- Cover required trước publish.
- Alt text warning nếu trống.

Step 5 - SEO và review:

- `seo_title`.
- `seo_description`.
- Checklist.

Step 6 - Preview/publish:

- Preview card.
- Preview detail.
- Public URL nếu status published.

## 7. Quality checklist rules

### 7.1. Product checklist

Required to publish:

- Có tên sản phẩm.
- Có mô tả ngắn hoặc mô tả chính.
- Có giá hoặc CTA thay thế.
- Có ít nhất 1 ảnh bìa.
- Có `warnings` hoặc disclaimer mặc định.

Recommended:

- Có brand.
- Có category.
- Có 3 ảnh.
- SEO title không quá dài.
- SEO description đủ mô tả.

### 7.2. Book checklist

Required to publish:

- Có tên sách.
- Có tác giả.
- Có mô tả.
- Có ít nhất 1 ảnh bìa.

Recommended:

- Có năm xuất bản.
- Có số trang.
- Có nhà xuất bản.
- Có subtitle.
- Có SEO title/description.

## 8. Public `/books` spec

### 8.1. Layout

Top:

- Heading.
- Intro.
- Search.
- Topic chips.

Main:

- Left filter panel desktop.
- Filter drawer mobile.
- Grid/list toggle optional.
- Sort select.
- Applied filter chips.
- Book grid.

### 8.2. Filters

Use current DB first:

- Search: title, subtitle, author, description.
- Year.
- Price range.
- New only.

If category/topic is added later:

- Topic/category.
- Format.

### 8.3. Card states

Each book card:

- Cover with stable aspect ratio.
- Badge `Mới` when `is_new`.
- Title.
- Subtitle.
- Author/year.
- Price.
- CTA `Chi tiết`.

No action should require hover only.

## 9. Public `/books/:slug` spec

Sections:

1. Back link.
2. Cover + purchase panel.
3. Title/subtitle/author/year/price.
4. Description.
5. Key takeaways from `content`.
6. Metadata: publisher, pages, rating.
7. Related notes/books placeholder.

## 10. Public `/products` spec

### 10.1. Layout

Top:

- Heading.
- Medical disclaimer one sentence.
- Search.
- Health goal chips.

Main:

- Filter panel/drawer.
- Sort select.
- Applied filter chips.
- Product grid.

### 10.2. Filters

Use current DB first:

- Search: name, brand, tag, description.
- Brand.
- Price range.
- Tag.

If category/health goal is added later:

- Health goal.
- Product type.
- Audience.

### 10.3. Product card

Each product card:

- Thumbnail.
- Brand.
- Name.
- Tag/health goal chip.
- Short description.
- Price.
- `Xem chi tiết`.
- `Mua ngay` only if buy URL exists.

No action should require hover only.

## 11. Public `/products/:slug` spec

Sections:

1. Back link.
2. Gallery + purchase panel.
3. Name/brand/price/tag.
4. Short description.
5. Vì sao được khuyên dùng.
6. Thành phần chính if field exists later.
7. Cách dùng from `usage`.
8. Lưu ý from `warnings`.
9. Disclaimer.
10. Related notes/products placeholder.

## 12. Data/service changes

Phase 1 should avoid migration unless necessary.

Allowed without migration:

- Use existing `brand`, `tag`, `price`, `description`, `usage`, `warnings`, `seo_title`, `seo_description`.
- Derive filters from loaded data.
- Use category table where available.

Phase 2 optional migrations:

```text
products.health_goals text[]
products.product_type text
products.ingredients text
products.contraindications text
products.buy_url text
products.featured boolean

books.format text
books.isbn text
books.buy_url text
books.featured boolean
books.sample_url text
```

If adding migrations:

- Update `src/types/database.ts`.
- Update services.
- Run Supabase migration locally.
- Verify RLS still works.

## 13. Acceptance criteria

Admin:

- User can create a product draft with only required basics.
- User can add media immediately after draft exists.
- User can see missing fields before publishing.
- User can preview card/detail before publishing.
- User can publish and see public pages update.
- Same for books.

Public:

- `/books` has real search/filter/sort.
- `/products` has real search/filter/sort.
- Card actions work on desktop and mobile.
- Detail pages show medical/book metadata clearly.
- Empty states are useful.

Technical:

- `npm run build` passes in Docker.
- `docker compose up -d --build --force-recreate` works.
- Admin smoke test covers create/update/publish/delete for books/products.
- No service-role key in frontend.

## 14. Suggested implementation sequence

### Step 1 - Refactor admin list/editor without changing DB

- Extract current product/book managers out of `Admin.tsx`.
- Add list toolbar.
- Add editor shell and step list.
- Keep existing service functions.

### Step 2 - Add quality checklist and preview

- Shared checklist component.
- Product preview.
- Book preview.
- Disable publish if required checklist fails.

### Step 3 - Redesign public catalog pages

- Add catalog shared components.
- Implement derived filters from current data.
- Make cards mobile friendly.

### Step 4 - Improve detail pages

- Reorganize content sections.
- Add disclaimer blocks.
- Add related content placeholders.

### Step 5 - Optional data model enhancement

- Add migrations only after UX is stable.
- Backfill defaults.

## 15. Prompt giao AI triển khai

```text
Làm đúng repo `C:\Users\ADMIN\Desktop\Bác sĩ Phúc\WEB_TS_PH-C` theo `docs/05-admin-ui-ux-research-books-products.md` và `docs/06-admin-ui-ux-implementation-spec.md`.

Mục tiêu: nâng cấp UI/UX Admin cho Books/Products thành workflow List -> Draft -> Guided editor -> Media -> Checklist -> Preview -> Publish; redesign public `/books`, `/books/:slug`, `/products`, `/products/:slug` thành catalog có search/filter/sort/card/detail dễ dùng.

Không đổi kiến trúc Supabase Auth/Postgres/Storage. Không quay lại Firebase/mockData. Không đưa service-role key vào frontend.

Ưu tiên phase 1 không migration: dùng field hiện có trước, chỉ thêm migration nếu thật cần và phải cập nhật `src/types/database.ts`.

Sau khi sửa, chạy build Docker, smoke test create/update/publish/delete product/book, kiểm tra public pages phản ánh dữ liệu Admin.
```
