# 07 - Kế hoạch thực thi Admin Listing Editor kiểu Shopee/TikTok

Trạng thái: tài liệu thực thi chính cho phase nâng cấp editor Sách/Sản phẩm.

Tài liệu nền:

- `docs/05-admin-ui-ux-research-books-products.md`
- `docs/06-admin-ui-ux-implementation-spec.md`
- `docs/04-admin-media-upload-va-media-library.md`

Mục tiêu phase này là thay editor hiện tại bằng một luồng nhập liệu chuyên nghiệp hơn, lấy ý tưởng từ Shopee Seller Centre và TikTok Shop Seller Center nhưng điều chỉnh cho website y tế/cá nhân của Bác sĩ Wynn Tran.

## 1. Tóm tắt quyết định sản phẩm

### 1.1. Vấn đề hiện tại

Admin hiện tại đã tốt hơn bản đầu, nhưng vẫn còn các điểm gây chậm thao tác:

- Preview trong Admin chưa giống 100% card/trang ngoài website.
- Ảnh đang hiển thị lớn, chiếm nhiều chiều cao form.
- Upload ảnh phụ thuộc vào việc phải tạo bản nháp trước để có `entityId`.
- Người nhập phải chọn thủ công `Trạng thái`, trong khi nghiệp vụ thật chỉ cần `Lưu nháp` hoặc `Đăng lên web`.
- Luồng Sách và Sản phẩm chưa đủ giống một form đăng sản phẩm/bài bán hàng hiện đại.

### 1.2. Mục tiêu sau nâng cấp

Editor mới phải đạt các mục tiêu:

- Người dùng nhập liệu trong một luồng liền mạch.
- Không hiển thị khái niệm kỹ thuật “tạo bản nháp trước mới được upload ảnh”.
- Ảnh upload hàng loạt, hiển thị dạng thumbnail gọn, có overlay sửa/xóa/đặt ảnh chính.
- Preview Admin dùng đúng component ngoài web, không dựng mock riêng.
- Bỏ dropdown `Trạng thái`.
- Cuối form chỉ có hành động rõ nghĩa:
  - `Lưu nháp`
  - `Đăng lên web`
  - Với nội dung đã published: `Cập nhật bài đăng`
- Có checklist chất lượng và kiểm duyệt y tế trước khi đăng.

## 2. Nguồn tham khảo và điểm rút ra

### 2.1. TikTok Shop Seller Center

Nguồn:

- TikTok Shop Seller Center - Add and Manage Product:
  `https://seller-vn.tiktok.com/university/essay?knowledge_id=6837795793110786&lang=en`
- TikTok Shop Seller Center - Bulk listing / Manage product:
  `https://seller-vn.tiktok.com/university/essay?knowledge_id=10008556&lang=en`

Điểm rút ra:

- Luồng đăng sản phẩm được chia thành các nhóm:
  - Basic Information
  - Product Details
  - Sales Information
  - Shipping
  - Save Draft or Publish
- Ảnh là một phần của Basic Information, không bị tách thành bước kỹ thuật riêng.
- TikTok khuyến nghị:
  - Tối đa 9 ảnh/sản phẩm.
  - Tỷ lệ 1:1.
  - Tối thiểu 600x600 px.
  - File tối đa 10MB.
- Product Details nên dễ đọc, có đoạn ngắn/bullet points, có thể thêm ảnh phụ trong mô tả.
- Hành động cuối là `Save as draft` hoặc `Publish`, không bắt người dùng chọn trạng thái trong dropdown.
- Preview là một phần của màn nhập liệu để người bán biết sản phẩm sẽ hiển thị ra sao.

Áp dụng cho dự án:

- Sản phẩm dùng ảnh 1:1, tối đa 9 ảnh.
- Sách dùng ảnh bìa 3:4, tối đa 5 ảnh.
- Editor có tab nội dung nhưng hành động cuối vẫn là `Lưu nháp` / `Đăng lên web`.
- Preview sticky bên phải.

### 2.2. Shopee Seller Centre / Image Space

Nguồn:

- Shopee Mall Listing Guidelines:
  `https://cdngarenanow-a.akamaihd.net/shopee/seller/seller_cms/b71e298c6c220f22ef6f08608dbe1bd8/Mall%20Listing%20Guidelines.pdf`
- Shopee Image Space User Guide:
  `https://cdngarenanow-a.akamaihd.net/shopee/seller/seller_cms/cca80863028a1c42e2d1d46f0fd047bc/Image%20Space%20User%20Guide.pdf`

Điểm rút ra:

- Shopee nhấn mạnh listing chất lượng gồm:
  - Ảnh rõ, không trùng lặp.
  - Tên sản phẩm có cấu trúc.
  - Danh mục đúng.
  - Mô tả đủ thông tin.
  - Thuộc tính đầy đủ.
  - Biến thể rõ ràng nếu có.
- Image Space hỗ trợ:
  - Upload nhiều ảnh một lần.
  - Kéo thả ảnh.
  - Xem dạng grid/list.
  - Sửa ảnh.
  - Xóa ảnh.
  - Dùng lại ảnh trong listing.
- Ảnh bìa cần rõ, sản phẩm chiếm tỷ lệ lớn, tránh watermark/text/border quá nhiều.

Áp dụng cho dự án:

- Tạo `CompactMediaManager` dạng grid thumbnail.
- Hỗ trợ upload nhiều ảnh một lần.
- Hỗ trợ kéo thả sắp xếp hoặc tối thiểu nút lên/xuống ở phase đầu.
- Overlay thumbnail gồm:
  - `Đặt ảnh chính`
  - `Sửa`
  - `Xóa`
- Checklist ảnh:
  - Có ảnh chính.
  - Nên có ít nhất 3 ảnh cho sản phẩm.
  - Ảnh không trùng.
  - Alt text không rỗng khi đăng.

### 2.3. Chính sách y tế/TikTok Healthcare

Nguồn:

- TikTok Healthcare and Pharmaceuticals Policy:
  `https://ads.tiktok.com/help/article/tiktok-ads-policy-healthcare-pharmaceuticals`

Điểm rút ra:

- Nội dung y tế/sức khỏe nhạy cảm với claim điều trị.
- Cần tránh các claim kiểu:
  - chữa khỏi
  - điều trị bệnh
  - hiệu quả tức thì
  - thay thế thuốc kê đơn
  - miracle/cure
  - before/after cho thực phẩm bổ sung/thiết bị y tế

Áp dụng cho dự án:

- Khi bấm `Đăng lên web`, kiểm tra từ khóa rủi ro trong tên/mô tả.
- Không chặn tuyệt đối ở phase đầu, nhưng cảnh báo rõ.
- Hiển thị disclaimer y tế trong preview nếu là sản phẩm sức khỏe.
- CTA nên là `Xem chi tiết`, `Tìm hiểu thêm`, `Liên hệ tư vấn`, tránh ngôn ngữ cam kết điều trị.

## 3. Phạm vi triển khai

### 3.1. Trong phạm vi phase này

- Admin editor cho `products`.
- Admin editor cho `books`.
- Media upload compact cho Sách/Sản phẩm.
- Preview dùng component ngoài web.
- Nút `Lưu nháp` và `Đăng lên web`.
- Staged media để upload ảnh trước khi record chính được tạo.
- Checklist chất lượng trước khi đăng.
- Route public `/products`, `/books` tiếp tục dùng card component đã tách.

### 3.2. Ngoài phạm vi phase này

Không triển khai ngay:

- SKU/kho hàng/vận chuyển/COD.
- Biến thể sản phẩm.
- Bulk Excel import/export.
- AI viết mô tả.
- Crop ảnh nâng cao bằng canvas.
- Video sản phẩm.
- Review/approval nhiều cấp.

Những mục này có thể đưa vào phase sau nếu website chuyển sang bán hàng trực tiếp.

## 4. Kiến trúc UX mới

### 4.1. Layout tổng quan

Editor dùng layout 2 cột:

```text
+-------------------------------------------------------------+
| Header: Tên màn + trạng thái hiện tại + actions             |
|                                    [Lưu nháp] [Đăng lên web] |
+-------------------------------------------+-----------------+
| Tabs / Form                               | Preview sticky  |
|                                           |                 |
| [Thông tin cơ bản] [Mô tả] [SEO & kiểm]   | Card ngoài web  |
|                                           | Detail ngoài web |
| Form fields                               | Checklist       |
| Media compact                             |                 |
+-------------------------------------------+-----------------+
```

### 4.2. Tabs

#### Product editor

Tabs:

1. `Thông tin cơ bản`
   - Ảnh sản phẩm.
   - Tên sản phẩm.
   - Giá.
   - Tag.
   - Thương hiệu nếu dùng.
2. `Mô tả`
   - Mô tả ngắn.
   - Mô tả chi tiết.
   - Gợi ý bullet points.
3. `SEO & kiểm duyệt`
   - Slug.
   - SEO title.
   - SEO description.
   - Checklist claim y tế.

#### Book editor

Tabs:

1. `Thông tin cơ bản`
   - Ảnh bìa.
   - Tên sách.
   - Tác giả.
   - Năm.
   - Giá.
   - Đánh dấu sách mới.
2. `Mô tả`
   - Subtitle nếu cần.
   - Mô tả.
   - Nội dung nổi bật nếu sau này mở rộng.
3. `SEO & kiểm duyệt`
   - Slug.
   - SEO title.
   - SEO description.
   - Checklist nội dung.

### 4.3. Header actions

Header editor có:

- `Hủy`
- `Lưu nháp`
- `Đăng lên web`

Quy tắc:

- `Lưu nháp` luôn cho phép nếu có tối thiểu tên/title.
- `Đăng lên web` yêu cầu checklist tối thiểu pass.
- Nếu đang sửa item đã published:
  - `Lưu nháp` đổi nội dung về draft nếu người dùng xác nhận.
  - Nút chính đổi label thành `Cập nhật bài đăng`.
- Không hiển thị dropdown trạng thái trong form.

### 4.4. Preview

Preview có 2 tab nhỏ:

- `Card`
- `Chi tiết`

Quy tắc quan trọng:

- Preview không được dùng mock card riêng.
- Preview phải dùng chung component với public site:
  - `ProductCard`
  - `BookCard`
  - `ProductDetailPreview`
  - `BookDetailPreview`
- Nếu Admin đang bọc bởi `.admin-ui` để đồng bộ font Admin, preview phải có scope riêng để trả về font public.

CSS đề xuất:

```css
.admin-ui .site-preview,
.admin-ui .site-preview :where(p, span, label, button, input, textarea, select, table, th, td, a) {
  font-family: var(--font-sans);
}

.admin-ui .site-preview :where(h1, h2, h3, h4, h5, h6, .font-serif) {
  font-family: var(--font-serif);
}
```

Nếu muốn giống tuyệt đối hơn ở phase sau, có thể dùng iframe preview route, nhưng phase này ưu tiên component reuse để nhẹ và dễ bảo trì.

## 5. Component cần tạo/tách

### 5.1. Public/shared catalog components

Tạo thư mục:

```text
src/components/catalog/
```

Components:

```text
ProductCatalogCard.tsx
BookCatalogCard.tsx
ProductDetailPreview.tsx
BookDetailPreview.tsx
CatalogPreviewShell.tsx
MedicalDisclaimer.tsx
```

Yêu cầu:

- `/products` dùng `ProductCatalogCard`.
- Admin product preview cũng dùng `ProductCatalogCard`.
- `/books` dùng `BookCatalogCard`.
- Admin book preview cũng dùng `BookCatalogCard`.
- Không duplicate JSX card giữa page public và Admin.

Props đề xuất:

```ts
type CatalogImage = {
  url: string;
  alt: string;
  isPrimary?: boolean;
};

type ProductCardViewModel = {
  id?: string;
  name: string;
  slug?: string;
  price: number | null;
  tag?: string | null;
  brand?: string | null;
  description?: string | null;
  images: CatalogImage[];
};

type BookCardViewModel = {
  id?: string;
  title: string;
  slug?: string;
  subtitle?: string | null;
  author?: string | null;
  year?: string | null;
  price: number | null;
  rating?: number | null;
  isNew?: boolean;
  description?: string | null;
  images: CatalogImage[];
};
```

### 5.2. Admin listing editor components

Tạo thư mục:

```text
src/components/admin/listing-editor/
```

Components:

```text
ListingEditorShell.tsx
ListingEditorTabs.tsx
ListingEditorActions.tsx
ListingPreviewPanel.tsx
ListingQualityPanel.tsx
CompactMediaManager.tsx
CompactMediaThumb.tsx
ImageEditDialog.tsx
UnsavedChangesGuard.tsx
```

### 5.3. Product-specific components

Tạo thư mục:

```text
src/components/admin/products/
```

Components:

```text
ProductEditorV2.tsx
ProductBasicTab.tsx
ProductDescriptionTab.tsx
ProductSeoReviewTab.tsx
ProductListV2.tsx
```

### 5.4. Book-specific components

Tạo thư mục:

```text
src/components/admin/books/
```

Components:

```text
BookEditorV2.tsx
BookBasicTab.tsx
BookDescriptionTab.tsx
BookSeoReviewTab.tsx
BookListV2.tsx
```

## 6. Media architecture mới

### 6.1. Lý do cần staged media

Hiện tại ảnh sản phẩm/sách nằm trong:

```text
product_images.product_id NOT NULL
book_images.book_id NOT NULL
```

Vì vậy editor hiện tại cần tạo record trước để có `productId/bookId` rồi mới upload ảnh. Đây là nguyên nhân người dùng phải đi qua bước “tạo bản nháp”.

Phase mới phải ẩn hoàn toàn chi tiết này khỏi UI.

### 6.2. Hướng kỹ thuật được chọn

Dùng staged media:

1. Khi người dùng chọn ảnh trong form mới, upload ảnh vào `media_assets` trước.
2. `media_assets.entity_id = null`.
3. Ảnh được hiển thị trong editor bằng URL public từ `media_assets`.
4. Khi bấm `Lưu nháp` hoặc `Đăng lên web`:
   - Tạo hoặc update `products/books`.
   - Attach staged images vào `product_images/book_images`.
   - Update `media_assets.entity_id`.
   - Move storage path từ staging sang folder entity nếu khả thi.

Không hiển thị bước này cho người dùng.

### 6.3. Kiểu dữ liệu editor

Tạo file:

```text
src/components/admin/listing-editor/types.ts
```

Định nghĩa:

```ts
export type EditorEntityType = 'product' | 'book';

export type EditorImage = {
  id: string;
  source: 'persisted' | 'staged' | 'library';
  url: string;
  storagePath: string | null;
  mediaAssetId: string | null;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  fileName?: string | null;
};
```

### 6.4. Media service cần bổ sung

Trong `src/services/mediaService.ts`, thêm:

```ts
export async function uploadStagedMediaAsset(input: {
  file: File;
  entityType: 'product' | 'book';
  stagingKey: string;
  alt?: string;
  uploadedBy?: string;
}): Promise<MediaAsset>
```

Folder:

```text
staging/products/{stagingKey}
staging/books/{stagingKey}
```

Thêm:

```ts
export async function attachStagedProductImages(input: {
  productId: string;
  images: EditorImage[];
}): Promise<ProductImage[]>

export async function attachStagedBookImages(input: {
  bookId: string;
  images: EditorImage[];
}): Promise<BookImage[]>
```

Quy tắc attach:

- Xóa các image rows không còn trong `images`.
- Với persisted image: update `alt`, `is_primary`, `sort_order`.
- Với staged/library image: insert row mới vào `product_images/book_images`.
- Đảm bảo đúng một ảnh chính.
- Nếu không có ảnh chính nhưng có ảnh, ảnh đầu tiên thành ảnh chính.
- Update `media_assets.entity_id`.
- Nếu move storage path được:
  - từ `staging/products/{key}/...`
  - sang `products/{productId}/...`
  - update `media_assets.storage_path`, `media_assets.public_url`, `media_assets.folder`.

### 6.5. Dọn staging

Thêm cleanup an toàn:

```ts
export async function deleteUnattachedStagedAssets(stagingKey: string): Promise<void>
```

Khi user hủy form mới:

- Nếu ảnh staged chưa attach:
  - xóa storage object.
  - xóa media_assets row.

Khi tab/browser đóng đột ngột:

- Không xử lý ngay ở phase này.
- Thêm maintenance script sau nếu cần:
  - xóa staged assets cũ hơn 24h và `entity_id is null`.

### 6.6. Upload hàng loạt

`CompactMediaManager` cần input:

```tsx
<input
  type="file"
  multiple
  accept="image/jpeg,image/png,image/webp"
/>
```

Upload flow:

```text
User chọn nhiều file
-> validate từng file
-> upload tuần tự hoặc Promise pool 3 file/lần
-> thêm vào images state
-> file đầu tiên là primary nếu chưa có primary
```

Không dùng `Promise.all` không giới hạn vì nhiều ảnh lớn có thể làm request fail.

Giới hạn:

- Product: tối đa 9 ảnh.
- Book: tối đa 5 ảnh.
- File: tối đa 10MB ở UI, nhưng nếu muốn giữ cấu hình hiện tại 5MB thì ghi rõ trong copy.
- Loại file: JPG, PNG, WebP.

## 7. CompactMediaManager spec

### 7.1. Layout

```text
Ảnh sản phẩm (4/9)                         [Chọn từ thư viện] [Thêm ảnh]

[thumb primary] [thumb] [thumb] [thumb] [add tile]
```

Thumbnail size:

- Desktop: `88px`.
- Mobile: grid 4 cột hoặc scroll ngang.

### 7.2. Thumbnail states

Mỗi thumbnail có:

- Badge `Chính` nếu `isPrimary`.
- Loading overlay khi upload.
- Error badge nếu file lỗi.
- Hover overlay:
  - icon crop/edit.
  - icon star/set primary.
  - icon trash/delete.

Touch/mobile:

- Tap thumbnail mở `ImageEditDialog`.
- Không phụ thuộc hover.

### 7.3. ImageEditDialog

Phase đầu:

- Preview ảnh lớn.
- Field `Alt text`.
- Button `Đặt làm ảnh chính`.
- Button `Xóa`.
- Button `Đóng`.

Phase sau:

- Crop 1:1 / 3:4.
- Rotate.
- Zoom.
- Background cleanup.

### 7.4. Sắp xếp ảnh

Phase đầu:

- Nút lên/xuống hoặc drag handle.

Phase tốt nhất:

- Dùng drag & drop.
- Nếu thêm thư viện, ưu tiên thư viện nhỏ như `@dnd-kit/sortable`.
- Nếu không muốn thêm dependency, dùng HTML5 drag/drop đơn giản.

## 8. Save/Publish behavior

### 8.1. Product form model

```ts
type ProductEditorForm = {
  id?: string;
  name: string;
  price: number;
  tag: string;
  brand: string;
  shortDescription: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  images: EditorImage[];
};
```

### 8.2. Book form model

```ts
type BookEditorForm = {
  id?: string;
  title: string;
  subtitle: string;
  author: string;
  year: string;
  price: number;
  description: string;
  isNew: boolean;
  seoTitle: string;
  seoDescription: string;
  images: EditorImage[];
};
```

### 8.3. Save draft

User bấm `Lưu nháp`:

```text
validate minimum
-> create/update entity with status='draft'
-> attach staged images
-> reload item
-> toast "Đã lưu nháp"
-> ở lại editor
```

Minimum validation:

- Product: có `name`.
- Book: có `title`.

### 8.4. Publish

User bấm `Đăng lên web`:

```text
run publish validation
-> nếu lỗi cứng: hiển thị checklist và không publish
-> nếu cảnh báo y tế: yêu cầu xác nhận hoặc sửa
-> create/update entity with status='published'
-> set published_at nếu chưa có
-> attach staged images
-> reload list/editor
-> toast "Đã đăng lên web"
```

Publish validation cứng:

Product:

- Có tên.
- Có giá > 0.
- Có mô tả tối thiểu 30 ký tự.
- Có ít nhất 1 ảnh.
- Có đúng 1 ảnh chính.

Book:

- Có tên sách.
- Có tác giả.
- Có mô tả tối thiểu 50 ký tự.
- Có ít nhất 1 ảnh bìa.
- Có đúng 1 ảnh chính.

Publish warning:

- Product nên có ít nhất 3 ảnh.
- Alt text nên đầy đủ.
- SEO description nên có.
- Claim y tế nhạy cảm xuất hiện.

### 8.5. Không còn dropdown trạng thái

Không render field:

```text
Trạng thái: draft/published/archived
```

Thay vào đó:

- Trong list vẫn hiển thị status badge để quản trị biết trạng thái.
- Trong editor chỉ hiển thị text nhỏ:
  - `Bản nháp`
  - `Đang hiển thị trên web`
  - `Đã lưu trữ`
- Action phụ cho archived/deactivate đặt ở menu trong list, không đặt trong form chính.

## 9. Preview 100% giống ngoài web

### 9.1. Tách component card

Hiện tại card public đang nằm trong page. Cần tách:

```text
src/components/catalog/ProductCatalogCard.tsx
src/components/catalog/BookCatalogCard.tsx
```

`Products.tsx` chỉ map data:

```tsx
{filtered.map(product => (
  <ProductCatalogCard key={product.id} product={toProductCardViewModel(product)} />
))}
```

Admin preview:

```tsx
<CatalogPreviewShell>
  <ProductCatalogCard product={toProductCardViewModel(form)} preview />
</CatalogPreviewShell>
```

### 9.2. View model mapper

Tạo:

```text
src/lib/catalogViewModels.ts
```

Functions:

```ts
export function productToCardViewModel(product: ProductWithImages): ProductCardViewModel
export function productFormToCardViewModel(form: ProductEditorForm): ProductCardViewModel
export function bookToCardViewModel(book: BookWithImages): BookCardViewModel
export function bookFormToCardViewModel(form: BookEditorForm): BookCardViewModel
```

### 9.3. Detail preview

Không cần preview toàn bộ route trước mắt. Tạo detail preview component nhẹ nhưng dùng cùng design:

```text
ProductDetailPreview.tsx
BookDetailPreview.tsx
```

Nó dùng cùng view model, ảnh và typography với detail page public.

### 9.4. Preview states

Preview phải có trạng thái khi thiếu dữ liệu:

- Chưa có ảnh: placeholder đúng kích thước card public.
- Chưa có tên: text placeholder nhạt.
- Giá rỗng: `Liên hệ` hoặc `0đ` tùy public card đang dùng.

Không được làm vỡ layout khi field rỗng.

## 10. Checklist và kiểm duyệt y tế

### 10.1. Quality checklist data

Tạo:

```text
src/lib/contentQuality.ts
```

Types:

```ts
export type QualitySeverity = 'error' | 'warning' | 'info';

export type QualityCheck = {
  id: string;
  label: string;
  severity: QualitySeverity;
  passed: boolean;
  detail?: string;
};
```

Functions:

```ts
export function getProductPublishChecks(form: ProductEditorForm): QualityCheck[]
export function getBookPublishChecks(form: BookEditorForm): QualityCheck[]
export function hasBlockingErrors(checks: QualityCheck[]): boolean
```

### 10.2. Claim y tế

Tạo keyword list ban đầu:

```ts
const MEDICAL_RISK_TERMS = [
  'chữa khỏi',
  'điều trị',
  'trị bệnh',
  'khỏi bệnh',
  'cam kết',
  'hiệu quả tức thì',
  'thay thế thuốc',
  'không cần bác sĩ',
  'giảm cân thần tốc',
  'ung thư',
  'tiểu đường',
  'huyết áp',
];
```

Quy tắc:

- Nếu xuất hiện trong tên/mô tả sản phẩm:
  - severity `warning`.
  - Khi publish hiển thị confirm dialog:
    - `Nội dung có từ khóa y tế nhạy cảm. Bạn đã kiểm tra tính chính xác và disclaimer chưa?`
- Không tự động sửa nội dung của user.

## 11. Thay đổi service layer

### 11.1. contentService

Thêm hàm save rõ nghĩa:

```ts
export async function saveProductDraft(input: ProductEditorPayload): Promise<ProductWithImages>
export async function publishProduct(input: ProductEditorPayload): Promise<ProductWithImages>
export async function saveBookDraft(input: BookEditorPayload): Promise<BookWithImages>
export async function publishBook(input: BookEditorPayload): Promise<BookWithImages>
```

Payload:

```ts
type ProductEditorPayload = {
  id?: string;
  name: string;
  price: number;
  tag?: string;
  brand?: string;
  shortDescription?: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  images: EditorImage[];
};
```

Implementation:

- `saveProductDraft`: `status = 'draft'`.
- `publishProduct`: `status = 'published'`.
- Không expose status dropdown ra UI.

### 11.2. Media max image config

Hiện tại `mediaService.ts` có:

```ts
const MAX_IMAGES = 5;
```

Cần đổi thành:

```ts
const MAX_PRODUCT_IMAGES = 9;
const MAX_BOOK_IMAGES = 5;
```

Hoặc truyền max vào function.

## 12. Refactor Admin.tsx

Admin hiện tại đang chứa nhiều manager trong một file. Phase này nên giảm độ phình của `Admin.tsx`.

### 12.1. Mục tiêu

`Admin.tsx` chỉ giữ:

- auth gate
- sidebar
- layout
- active menu routing

Các manager chuyển ra file riêng:

```text
src/components/admin/products/ProductManager.tsx
src/components/admin/books/BookManager.tsx
```

### 12.2. Không làm refactor quá rộng

Không cần tách toàn bộ Notes/Categories/Settings trong phase này nếu sợ rủi ro. Chỉ tách Sách/Sản phẩm và component dùng chung.

## 13. Kế hoạch triển khai theo phase

### Phase 1 - Chuẩn hóa component preview

Mục tiêu: preview Admin và public dùng chung card.

Tasks:

1. Tạo `src/components/catalog/ProductCatalogCard.tsx`.
2. Tạo `src/components/catalog/BookCatalogCard.tsx`.
3. Tạo `src/lib/catalogViewModels.ts`.
4. Sửa `Products.tsx` dùng `ProductCatalogCard`.
5. Sửa `Books.tsx` dùng `BookCatalogCard`.
6. Tạo `CatalogPreviewShell`.
7. Sửa Admin preview dùng card mới.
8. Kiểm tra `/products`, `/books`, `/admin`.

Acceptance:

- Card ngoài web và preview Admin dùng cùng file component.
- `rg "ProductCatalogCard"` thấy dùng ở cả public page và Admin preview.
- Không còn duplicate JSX card lớn trong `Products.tsx` và Admin preview.

### Phase 2 - Compact media manager

Mục tiêu: ảnh gọn, upload nhiều, overlay sửa/xóa.

Tasks:

1. Tạo `CompactMediaManager`.
2. Tạo `CompactMediaThumb`.
3. Tạo `ImageEditDialog`.
4. Sửa upload input thành `multiple`.
5. Upload tuần tự hoặc concurrency 3.
6. Hiển thị progress từng thumbnail.
7. Hỗ trợ:
   - set primary
   - edit alt
   - delete
   - reorder
8. Thay `MediaGallery` trong Product/Book editor bằng `CompactMediaManager`.

Acceptance:

- Có thể chọn nhiều ảnh trong một lần.
- Ảnh hiển thị thumbnail gọn.
- Hover/tap có sửa/xóa.
- Ảnh chính được hiển thị rõ.
- Xóa ảnh không làm hỏng ảnh khác.

### Phase 3 - Staged media để bỏ bước tạo nháp trước

Mục tiêu: user upload ảnh ngay trong form mới.

Tasks:

1. Thêm `uploadStagedMediaAsset`.
2. Thêm `attachStagedProductImages`.
3. Thêm `attachStagedBookImages`.
4. Editor tạo `stagingKey` bằng `crypto.randomUUID()`.
5. Khi upload ảnh form mới:
   - upload vào staging.
   - thêm vào `images` state.
6. Khi `Lưu nháp`/`Đăng`:
   - create entity.
   - attach staged images.
7. Khi `Hủy` form mới:
   - cleanup staged images.

Acceptance:

- Mở form mới có thể upload ảnh ngay.
- Không có nút/copy “Tạo bản nháp để upload ảnh”.
- Sau khi lưu, ảnh xuất hiện đúng trong bảng và ngoài web nếu published.
- Không có product/book rỗng được tạo chỉ vì user mở form rồi đóng.

### Phase 4 - Save draft / Publish actions

Mục tiêu: bỏ dropdown trạng thái.

Tasks:

1. Xóa field status khỏi Product/Book editor UI.
2. Tạo `ListingEditorActions`.
3. Thêm handlers:
   - `handleSaveDraft`
   - `handlePublish`
4. Service set status theo action.
5. Nếu publish validation fail, show checklist.
6. Nếu warning y tế, show confirm.

Acceptance:

- Form không còn dropdown trạng thái.
- `Lưu nháp` lưu `status='draft'`.
- `Đăng lên web` lưu `status='published'`.
- Public page chỉ thấy item published.
- Draft không hiện public.

### Phase 5 - Tabs và form layout mới

Mục tiêu: form khoa học giống seller center.

Tasks:

1. Tạo `ListingEditorShell`.
2. Tạo tabs:
   - `Thông tin cơ bản`
   - `Mô tả`
   - `SEO & kiểm duyệt`
3. Chuyển Product fields vào tab tương ứng.
4. Chuyển Book fields vào tab tương ứng.
5. Preview sticky bên phải.
6. Actions sticky top hoặc bottom.

Acceptance:

- Form không quá dài trong một khối.
- Ảnh nằm gọn trong `Thông tin cơ bản`.
- Preview luôn nhìn thấy trên desktop.
- Mobile stack hợp lý: form trước, preview sau hoặc collapsible.

### Phase 6 - Kiểm thử và nghiệm thu

Tasks:

1. `docker compose up -d --build --force-recreate`.
2. `npm run lint` trong Docker builder.
3. Smoke test:
   - `/admin`
   - `/products`
   - `/books`
   - `/env-config.js`
4. Manual test Admin:
   - tạo product mới, upload nhiều ảnh, lưu nháp.
   - product draft không hiện ngoài web.
   - đăng product, product hiện ngoài `/products`.
   - sửa product published, đổi ảnh chính, cập nhật bài đăng.
   - xóa ảnh.
   - tạo book mới tương tự.
5. Kiểm tra Supabase:
   - `products.status`.
   - `books.status`.
   - `product_images.is_primary`.
   - `book_images.is_primary`.
   - `media_assets.entity_id`.
6. Kiểm tra không còn staged assets mồ côi sau flow bình thường.

## 14. Test matrix chi tiết

### 14.1. Product

| Case | Bước | Kỳ vọng |
| --- | --- | --- |
| New draft | Mở form, nhập tên, upload 3 ảnh, bấm `Lưu nháp` | Product tạo `draft`, ảnh attach đủ |
| Draft public visibility | Vào `/products` | Product draft không hiện |
| Publish | Mở draft, bấm `Đăng lên web` | Product status `published`, hiện public |
| Multi upload | Chọn 5 ảnh cùng lúc | 5 thumbnail xuất hiện, không vỡ layout |
| Primary image | Đặt ảnh thứ 2 làm chính | Chỉ ảnh thứ 2 `is_primary=true` |
| Delete image | Xóa ảnh chính | Nếu còn ảnh khác, ảnh đầu tiên thành chính hoặc cảnh báo |
| Medical warning | Mô tả có “chữa khỏi” | Publish hiển thị cảnh báo xác nhận |
| Empty publish | Không ảnh, bấm publish | Không publish, checklist báo lỗi |

### 14.2. Book

| Case | Bước | Kỳ vọng |
| --- | --- | --- |
| New draft | Nhập title, upload bìa, `Lưu nháp` | Book draft được tạo |
| Publish missing author | Bấm publish khi thiếu tác giả | Không publish |
| Cover ratio | Upload ảnh bìa | Thumbnail dùng 3:4 |
| Preview | Nhập title/author/price | Preview card cập nhật realtime |
| Public visibility | Publish book | Hiện trên `/books` |

## 15. Rủi ro và cách giảm rủi ro

### 15.1. Staged media mồ côi

Rủi ro:

- User upload ảnh rồi đóng tab.

Giảm rủi ro:

- Khi bấm `Hủy`, cleanup ngay.
- Thêm script cleanup sau:
  - xóa `media_assets` folder `staging/%`.
  - `entity_id is null`.
  - `created_at < now() - interval '24 hours'`.

### 15.2. Preview không giống 100%

Rủi ro:

- Admin CSS override font public.

Giảm rủi ro:

- Dùng shared component.
- Bọc preview trong `.site-preview`.
- CSS preview override sau `.admin-ui`.
- Screenshot test public card và admin preview.

### 15.3. Upload nhiều ảnh gây fail

Rủi ro:

- Upload 9 ảnh cùng lúc làm request nặng.

Giảm rủi ro:

- Upload queue concurrency 3.
- Progress từng ảnh.
- File nào fail chỉ báo fail cho file đó, không hủy toàn bộ.

### 15.4. Publish sai nội dung y tế

Rủi ro:

- Nội dung claim quá mạnh, gây rủi ro pháp lý/uy tín.

Giảm rủi ro:

- Checklist claim y tế.
- Confirm khi có từ khóa nhạy cảm.
- Disclaimer luôn hiển thị ở public product detail.

## 16. File thay đổi dự kiến

Tạo mới:

```text
src/components/catalog/ProductCatalogCard.tsx
src/components/catalog/BookCatalogCard.tsx
src/components/catalog/ProductDetailPreview.tsx
src/components/catalog/BookDetailPreview.tsx
src/components/catalog/CatalogPreviewShell.tsx
src/components/catalog/MedicalDisclaimer.tsx
src/components/admin/listing-editor/ListingEditorShell.tsx
src/components/admin/listing-editor/ListingEditorTabs.tsx
src/components/admin/listing-editor/ListingEditorActions.tsx
src/components/admin/listing-editor/ListingPreviewPanel.tsx
src/components/admin/listing-editor/ListingQualityPanel.tsx
src/components/admin/listing-editor/CompactMediaManager.tsx
src/components/admin/listing-editor/CompactMediaThumb.tsx
src/components/admin/listing-editor/ImageEditDialog.tsx
src/components/admin/listing-editor/types.ts
src/components/admin/products/ProductEditorV2.tsx
src/components/admin/products/ProductBasicTab.tsx
src/components/admin/products/ProductDescriptionTab.tsx
src/components/admin/products/ProductSeoReviewTab.tsx
src/components/admin/products/ProductManager.tsx
src/components/admin/books/BookEditorV2.tsx
src/components/admin/books/BookBasicTab.tsx
src/components/admin/books/BookDescriptionTab.tsx
src/components/admin/books/BookSeoReviewTab.tsx
src/components/admin/books/BookManager.tsx
src/lib/catalogViewModels.ts
src/lib/contentQuality.ts
```

Sửa:

```text
src/pages/Admin.tsx
src/pages/Products.tsx
src/pages/Books.tsx
src/services/contentService.ts
src/services/mediaService.ts
src/index.css
```

Không cần migration DB ở phase đầu nếu `media_assets.entity_id` đã nullable. Nếu sau khi kiểm tra schema thấy thiếu index, có thể thêm migration index:

```sql
create index if not exists idx_media_assets_staging_cleanup
on media_assets (entity_id, folder, created_at);
```

## 17. Prompt thực thi cho AI/coder

Dùng prompt này khi giao phase:

```text
Thực thi phase 07 theo `docs/07-admin-shopee-tiktok-style-editor-execution-plan.md`.

Mục tiêu:
- Product/Book Admin editor dùng layout kiểu seller center: tabs + form chính + preview sticky.
- Preview dùng chung component với public `/products` và `/books`, không mock riêng.
- Ảnh dùng CompactMediaManager: upload nhiều ảnh, thumbnail nhỏ, overlay sửa/xóa/đặt ảnh chính, sắp xếp.
- Bỏ dropdown Trạng thái khỏi editor.
- Chỉ dùng `Lưu nháp` và `Đăng lên web`; service tự set `status=draft/published`.
- Cho phép upload ảnh ngay trong form mới bằng staged media, không bắt user tạo nháp trước.
- Có checklist chất lượng và cảnh báo claim y tế trước khi publish.

Ràng buộc:
- Không quay lại Firebase/mockData.
- Không phá kiến trúc Supabase Auth + Postgres + Storage.
- Không làm SKU/kho hàng/vận chuyển/biến thể trong phase này.
- Giữ dữ liệu hiện có.
- Chạy Docker build, `tsc --noEmit`, smoke test `/admin`, `/products`, `/books`, `/env-config.js`.
```

## 18. Tiêu chí hoàn thành cuối phase

Phase được xem là hoàn thành khi:

- Người dùng có thể tạo Sản phẩm/Sách mới, upload ảnh ngay, không thấy bước tạo nháp kỹ thuật.
- Có thể upload nhiều ảnh cùng lúc.
- Ảnh hiển thị compact thumbnail, thao tác sửa/xóa/đặt chính rõ ràng.
- Preview trong Admin dùng cùng component với ngoài web.
- Form không còn dropdown trạng thái.
- `Lưu nháp` tạo/cập nhật draft.
- `Đăng lên web` tạo/cập nhật published.
- Draft không xuất hiện ngoài public pages.
- Published xuất hiện ngoài public pages.
- Build Docker pass.
- TypeScript pass.
- Không có lỗi console nghiêm trọng khi render `/admin`, `/products`, `/books`.
