# 10 - Đặc tả nâng cấp UI/UX Admin Products

Trạng thái: tài liệu đề xuất/đặc tả để team chốt phương án trước khi triển khai.

Phạm vi: module `Danh mục Sản phẩm` trong `/admin`, chủ yếu là `src/components/admin/products/ProductsManager.tsx` và các component dùng chung liên quan đến editor, media, list/filter.

Không thuộc phạm vi: đổi kiến trúc Supabase, đổi public `/products`, sửa schema DB lớn, hoặc refactor toàn bộ Admin.

## 1. Mục tiêu

Nâng trải nghiệm quản trị sản phẩm theo hướng:

- Khi thêm hoặc sửa sản phẩm, giao diện chuyển sang không gian tập trung cho form.
- Giảm nhiễu từ danh sách, bộ lọc, thống kê và các thao tác không liên quan.
- Giảm rủi ro mất dữ liệu khi đang nhập.
- Giúp Admin biết rõ đang ở chế độ tạo mới/sửa, còn thiếu gì để lưu nháp hoặc đăng lên web.
- Chuẩn bị nền cho các cải tiến sau như saved views, bulk actions, inline validation, unsaved changes guard.

## 2. Hiện trạng

File chính:

```text
src/components/admin/products/ProductsManager.tsx
```

Hiện tại module có:

- Header `Danh mục Sản phẩm`.
- Nút `Thêm sản phẩm`.
- Stat cards: tổng sản phẩm, đã xuất bản, bản nháp, thiếu ảnh.
- Form editor khi `isAdding = true`.
- Tabs: thông tin cơ bản, mô tả, SEO & kiểm duyệt.
- Media manager, preview public card, checklist chất lượng.
- Search/filter/sort.
- Table danh sách sản phẩm.

Vấn đề chính: khi click `Thêm sản phẩm`, form xuất hiện nhưng các thành phần bên dưới vẫn còn:

- Search/filter/sort.
- Counter đang hiển thị x/y sản phẩm.
- Table danh sách sản phẩm.
- Empty/result states của list.

Điều này khiến form bị chen trong cùng một màn hình vận hành danh sách, chưa tạo được chế độ nhập liệu tập trung.

## 3. Tham chiếu UX

Các pattern đáng áp dụng:

- Shopify Admin dùng resource list/search/filter/views để quản lý nhiều item, còn product detail là màn hình riêng tập trung cho chỉnh sửa sản phẩm.
  https://help.shopify.com/en/manual/shopify-admin/productivity-tools/searching-filtering-views
- Shopify Polaris `ResourceList` mô tả nhiệm vụ chính của danh sách là giúp người dùng tìm một object và đi tới trang chi tiết của object đó.
  https://polaris-react.shopify.com/components/lists/resource-list
- Shopify product details chia nội dung thành các khu vực như title/description, media, category, pricing, product status, publishing, product organization, search engine listing.
  https://help.shopify.com/en/manual/products/details/product-details-page
- Shopify contextual save bar dùng để báo có thay đổi chưa lưu khi tạo/sửa object và cung cấp save/discard rõ ràng.
  https://polaris-react.shopify.com/components/internal-only/contextual-save-bar
- Atlassian Forms nhấn mạnh form cần có cấu trúc, trình tự, nhãn, help text và feedback rõ ràng; nên autofocus field đầu tiên.
  https://atlassian.design/patterns/forms
- Material Design error pattern: lỗi nhập liệu cần chỉ rõ vấn đề và cách sửa, giữ lại dữ liệu người dùng đã nhập.
  https://www.mdui.org/en/design/1/patterns/errors.html

### 3.1 Nghiên cứu bổ sung từ hệ thống tương tự

#### Shopify Admin / Polaris

Nguồn:

- Product details page:
  https://help.shopify.com/en/manual/products/details/product-details-page
- Searching and filtering using views:
  https://help.shopify.com/en/manual/shopify-admin/productivity-tools/searching-filtering-views
- Polaris Index filters:
  https://polaris-react.shopify.com/components/selection-and-input/index-filters
- Polaris Index table:
  https://polaris-react.shopify.com/components/tables/index-table

Quan sát:

- Shopify tách rõ `Products index` và `Product details page`. List dùng để tìm, lọc, xem nhanh và chọn item; detail page là nơi chỉnh sửa đầy đủ một sản phẩm.
- Product detail được chia thành nhiều khu vực: title/description, media, category, pricing, variants, product status, publishing, insights, product organization và search engine listing.
- Product status không chỉ là published/draft. Shopify có Active, Draft, Archived, Unlisted và hiển thị nhãn status ở nhiều nơi trong admin.
- Resource list hỗ trợ views, search, filters, sort, edit columns và bulk actions. Views giúp user lưu lại các tác vụ thường làm như `draft`, `missing info`, `needs update`.
- Polaris Index table coi list là lớp trung gian để scan nhiều resource, thao tác nhiều item và đi vào detail page.

Insight áp dụng:

- Module hiện tại nên phân tách mạnh `List mode` và `Editor mode`. Khi tạo/sửa, không nên vẫn giữ list bên dưới.
- List nên phát triển theo hướng resource index: saved/quick views, row badges, bulk actions, sortable columns.
- Editor nên có khu vực riêng cho `Publishing readiness`, không chỉ một tab checklist.
- Nên cân nhắc trạng thái `unlisted` hoặc `hidden` trong tương lai nếu sản phẩm cần link riêng nhưng chưa hiển thị ở catalog.

#### WooCommerce

Nguồn:

- Adding and managing products:
  https://woocommerce.com/document/managing-products/

Quan sát:

- WooCommerce bắt đầu từ việc phân loại product type: simple, grouped, external/affiliate, variable, virtual/downloadable.
- Trước khi nhập dữ liệu, WooCommerce hướng người quản trị nghĩ về category, tax, stock, shipping, variations, attributes và reviews.
- Product editor cần thích ứng theo loại sản phẩm, vì không phải mọi sản phẩm đều cần cùng field.

Insight áp dụng:

- Website này nhiều khả năng không phải e-commerce inventory đầy đủ; sản phẩm có thể là `khuyên dùng`, `affiliate`, `tham khảo`, hoặc `bán trực tiếp`.
- Product form nên có field `product_kind` trong tương lai: `recommended`, `affiliate`, `direct_sale`, `service_bundle`.
- Các field như tồn kho, shipping, biến thể chưa nên đưa vào phase focus mode. Nhưng UI nên thiết kế mở để thêm progressive sections sau này.
- Với sản phẩm y tế/khuyến nghị, `warnings`, `usage`, `contraindications`, `evidence/source` quan trọng hơn inventory.

#### Webflow CMS

Nguồn:

- Save and publish Collection items:
  https://help.webflow.com/hc/en-us/articles/33961230697107-Save-and-publish-Collection-items
- CMS auto-save:
  https://webflow.com/updates/cms-auto-save
- CMS draft and publishing workflow:
  https://webflow.com/updates/cms-draft-publishing-improvements
- Faster CMS item creation and undo/redo improvements:
  https://webflow.com/updates/cms-item-creation-and-undo-redo-updates

Quan sát:

- Webflow tách draft changes khỏi nội dung live, giúp editor sửa nội dung đã published mà không vô tình đẩy thay đổi ra public.
- Webflow đưa autosave vào CMS và nhấn mạnh draft-first editing để giảm rủi ro mất dữ liệu hoặc publish nhầm nội dung chưa hoàn thiện.
- Có nhiều hành động publish: publish now, queue for next publish, remove from queue, unpublish, schedule, archive.
- Webflow cải thiện item creation bằng cách cho thấy toàn bộ fields ngay, autosave sau khi item được tạo, và có split button để tạo draft hoặc publish trong một bước.
- Undo/redo được nhấn mạnh như một phần giảm rủi ro khi nhập liệu.

Insight áp dụng:

- Sau `Lưu nháp`, user nên ở lại editor để tiếp tục hoàn thiện thay vì bị đẩy về list.
- Khi sản phẩm đã published, chỉnh sửa nên có trạng thái rõ: đang sửa bản live hay draft changes. Phase đầu có thể chưa làm draft version riêng, nhưng UI cần cảnh báo rõ khi update published item.
- Action bar nên tách `Lưu nháp`, `Cập nhật`, `Đăng lên web`, `Gỡ khỏi web/Lưu trữ` theo trạng thái sản phẩm.
- Nên thêm undo mức form hoặc ít nhất là `discard changes` có confirm.

#### Contentful

Nguồn:

- Field validations:
  https://www.contentful.com/help/fields/adding-validations-to-existing-fields/
- Validations for hidden and required fields:
  https://www.contentful.com/help/fields/adding-validations-to-existing-fields/validations-for-hidden-and-required-fields/

Quan sát:

- Contentful cho phép validation theo field và required fields sẽ chặn publish nếu thiếu, kể cả khi field bị ẩn trong editor.
- Field appearance và help text dùng để hướng dẫn editor nhập đúng loại dữ liệu.

Insight áp dụng:

- `Publish` phải dựa trên validation cứng, không chỉ toast.
- Field bị ẩn theo tab vẫn phải được tính trong checklist publish.
- Nên có help text ngắn cạnh field nhạy cảm như mô tả công dụng, cảnh báo y tế, SEO description.
- Checklist phải là lớp tổng hợp; lỗi thực tế vẫn cần hiện cạnh field.

#### Sanity Studio

Nguồn:

- Drafts:
  https://www.sanity.io/docs/content-lake/drafts
- Validation:
  https://www.sanity.io/docs/validation

Quan sát:

- Sanity tạo draft khi chỉnh sửa document đã published, giữ bản published nguyên vẹn cho tới khi publish lại.
- Validation có thể ở field-level hoặc document-level. Error block publish; warning chỉ cảnh báo.
- Validation chạy ngay trong Studio khi editor đang làm việc.

Insight áp dụng:

- Cần phân biệt rõ `error` và `warning` trong checklist. Error không được confirm để bỏ qua.
- Các rule như thiếu ảnh chính, thiếu mô tả tối thiểu, thiếu cảnh báo y tế nếu có claim phải là error khi publish.
- Khi chỉnh sửa sản phẩm published, nên báo rõ tác động: `Cập nhật sẽ thay đổi nội dung đang hiển thị ngoài web`.
- Phase sau nên cân nhắc draft changes cho sản phẩm published, giống mô hình CMS.

#### Atlassian Forms

Nguồn:

- Forms:
  https://atlassian.design/patterns/forms/

Quan sát:

- Long forms nên dùng multi-step hoặc progressive disclosure để giảm cảm giác quá tải.
- Các field nên nhóm theo logic.
- Validation/error messages cần chỉ ra field nào cần bổ sung, nằm gần field và biến mất khi điều kiện đã đạt.

Insight áp dụng:

- Editor tabs hiện tại đi đúng hướng, nhưng cần biến checklist thành điều hướng sửa lỗi.
- Không nên dồn media, thông tin cơ bản và mô tả dài vào một màn hình quá nhiều.
- Form thêm mới nên autofocus field đầu tiên và giữ action chính dễ thấy khi user cuộn.

### 3.2 Ma trận so sánh nhanh

| Hệ thống | Pattern mạnh | Áp dụng cho Admin Products |
| --- | --- | --- |
| Shopify | List/detail separation, saved views, product status, publishing section | Tách list/editor, thêm quick views, publishing readiness |
| Polaris | Index table, filters, sort, bulk actions, pagination | Nâng list thành resource index có view/filter/bulk sau phase đầu |
| WooCommerce | Product types, attributes, variations | Chuẩn bị product kind/progressive fields, chưa ép mọi field từ đầu |
| Webflow CMS | Draft changes, publish options, autosave sau create | Lưu nháp giữ trong editor, cảnh báo khi sửa published item |
| Contentful | Field validations, required blocks publish, help text | Validation cạnh field, publish bị block bởi lỗi cứng |
| Sanity | Draft vs published separation, field/document validation | Error/warning rõ ràng, warning không thay thế error |
| Atlassian Forms | Multi-step, progressive disclosure, field-level errors | Tabs theo nhóm logic, checklist click-to-fix |

### 3.3 Kết luận từ benchmark

Điểm nâng cấp quan trọng nhất không chỉ là ẩn list khi tạo mới. Định hướng đúng hơn là:

```text
Products list = nơi tìm, lọc, scan, xử lý nhiều sản phẩm.
Product editor = nơi tập trung hoàn thiện một sản phẩm.
```

Vì vậy phase 10 nên ưu tiên:

1. Tách list/editor bằng focus mode.
2. Thêm dirty state và discard confirmation.
3. Giữ user trong editor sau `Lưu nháp`.
4. Tách lỗi publish thành error/warning rõ ràng.
5. Chuẩn bị list views/bulk actions cho phase sau.

## 4. Persona và jobs-to-be-done

### Admin nội dung

Nhiệm vụ:

- Tạo sản phẩm mới nhanh.
- Upload ảnh.
- Nhập mô tả dễ hiểu, tránh claim y tế rủi ro.
- Lưu nháp để hoàn thiện sau.
- Đăng sản phẩm khi đủ điều kiện.

Rủi ro:

- Mất dữ liệu khi click nhầm sang danh sách hoặc menu khác.
- Không biết còn thiếu gì để đăng.
- Bị phân tâm bởi list/filter khi đang nhập form.

### Người phụ trách vận hành sản phẩm

Nhiệm vụ:

- Tìm sản phẩm cần sửa.
- Lọc draft/published/missing image.
- Sửa nhanh thông tin, giá, ảnh.
- Archive/delete khi cần.

Rủi ro:

- Không có bulk actions.
- Không có saved views.
- Khó biết item nào thiếu thông tin quan trọng.

## 5. Pain points cần xử lý

### P0 - List vẫn hiển thị trong lúc tạo mới

Khi `isAdding=true`, người dùng đang làm một tác vụ nhập liệu có rủi ro mất dữ liệu, nhưng list/search/filter vẫn nằm ngay dưới form. Đây là nhiễu nhận thức và làm trang dài không cần thiết.

Hướng xử lý: tạo `editor focus mode`.

### P1 - Không có unsaved changes guard

Nếu đã nhập tên/giá/mô tả/ảnh rồi bấm `Hủy`, đổi menu, refresh hoặc click sang item khác, chưa có lớp cảnh báo rõ ràng.

Hướng xử lý: tracking `isDirty`, confirm trước khi rời editor.

### P1 - Save actions chưa theo ngữ cảnh thay đổi

Các nút `Hủy`, `Lưu nháp`, `Đăng lên web` nằm trong form header, nhưng chưa có trạng thái "Có thay đổi chưa lưu" hoặc save bar sticky. Khi cuộn sâu, người dùng có thể mất định hướng hành động chính.

Hướng xử lý: sticky editor action bar hoặc contextual save bar trong vùng Admin.

### P1 - Checklist thiếu liên kết trực tiếp tới field lỗi

Checklist báo thiếu thông tin nhưng chưa cho click để nhảy tới tab/field cần sửa.

Hướng xử lý: checklist item có `targetTab` và `targetField`, click chuyển tab và focus field.

### P1 - Media manager phụ thuộc kéo thả

Ảnh có thể kéo để sắp xếp, nhưng chưa có nút move left/right/up/down rõ ràng cho người không dùng drag/drop hoặc keyboard.

Hướng xử lý: thêm nút reorder accessible.

### P2 - List thiếu chế độ xem theo tác vụ

Hiện chỉ có search, status filter, sort. Chưa có quick views như `Cần hoàn thiện`, `Thiếu ảnh`, `Có cảnh báo y tế`, `Đã xuất bản`.

Hướng xử lý: thêm view tabs/chips phía trên filter.

### P2 - Empty state chưa dẫn hành động

Khi filter không có kết quả, chỉ báo không có sản phẩm phù hợp. Chưa có CTA `Xóa bộ lọc`, `Tạo sản phẩm mới`, hoặc gợi ý view khác.

Hướng xử lý: empty state theo ngữ cảnh.

### P2 - Bảng list chưa hỗ trợ chọn nhiều item

Với nhiều sản phẩm, archive/publish/delete từng item sẽ chậm.

Hướng xử lý: bulk selection và bulk actions ở phase sau.

### P2 - Form chưa có section dành riêng cho tổ chức sản phẩm

Hiện form chỉ có name, price, tag, brand, description. Với hệ thống có categories/taxonomy, sản phẩm nên có khu vực tổ chức rõ hơn: category, brand/vendor, tag, status, SEO.

Hướng xử lý: thêm field/category khi schema/service sẵn sàng.

## 6. Đề xuất UX chính

### 6.1 Editor Focus Mode

Khi người dùng click `Thêm sản phẩm` hoặc `Sửa sản phẩm`, màn hình chuyển sang một trong hai trạng thái:

```text
List mode
Editor mode
```

Trong `Editor mode`, ẩn:

- Stat cards.
- Search/filter/sort.
- Product table.
- Empty state của list.
- Nút `Thêm sản phẩm` ở header list.

Chỉ giữ:

- Breadcrumb nhỏ: `Sản phẩm / Tạo mới` hoặc `Sản phẩm / Chỉnh sửa`.
- Editor header.
- Form tabs.
- Workflow/checklist.
- Preview.
- Sticky action bar.

Không cần route mới trong phase đầu. Có thể dùng state `mode = 'list' | 'create' | 'edit'`.

### 6.2 Layout đề xuất

#### List mode

```text
[Header: Danh mục Sản phẩm]                     [Thêm sản phẩm]
[Stat cards]
[View chips: Tất cả | Cần hoàn thiện | Thiếu ảnh | Đã xuất bản | Lưu trữ]
[Search + filters + sort]
[Table / Empty state]
```

#### Editor mode

```text
[Back to list] Sản phẩm / Tạo sản phẩm mới

[Sticky action bar]
Unsaved product                         [Hủy] [Lưu nháp] [Đăng lên web]

[Editor header]
Tạo sản phẩm mới
Mô tả ngắn về luồng nhập liệu

[Tabs]
Thông tin | Mô tả | Ảnh | SEO & Kiểm duyệt

[Main layout]
Left: workflow/checklist
Center: active form section
Right: public preview + publish readiness
```

Khác biệt quan trọng: media nên là tab riêng hoặc section đầu của tab `Ảnh`, không bị trộn vào `Thông tin cơ bản` nếu form tiếp tục mở rộng.

### 6.3 Sticky Action Bar

Hiển thị khi:

- Đang tạo mới.
- Đang chỉnh sửa.
- Có thay đổi chưa lưu.

Nội dung:

- Text trạng thái:
  - `Sản phẩm mới chưa lưu`
  - `Có thay đổi chưa lưu`
  - `Đang lưu...`
- Actions:
  - `Hủy`
  - `Lưu nháp`
  - `Đăng lên web` hoặc `Cập nhật bài đăng`

Khi không có thay đổi trong edit mode, có thể vẫn hiển thị `Quay lại danh sách` và `Cập nhật` disabled.

### 6.4 Unsaved Changes Guard

Tạo helper:

```text
hasDirtyProductForm(initialSnapshot, currentForm, currentImages)
```

Trigger confirm khi:

- Click `Hủy`.
- Click `Quay lại danh sách`.
- Click menu Admin khác.
- Click `Thêm sản phẩm` khi đang edit.
- Refresh/close tab nếu browser hỗ trợ `beforeunload`.

Message:

```text
Bạn có thay đổi chưa lưu. Rời khỏi màn hình này sẽ mất dữ liệu đang nhập.
```

Actions:

- `Tiếp tục chỉnh sửa`
- `Bỏ thay đổi`

### 6.5 Checklist có hành động

Mỗi checklist item nên có metadata:

```ts
type ProductChecklistItem = {
  id: string;
  label: string;
  ok: boolean;
  severity: 'error' | 'warning';
  targetTab?: ProductEditorTab;
  targetField?: string;
  fixLabel?: string;
};
```

Ví dụ:

- Thiếu tên sản phẩm -> `Thông tin`, focus `name`.
- Thiếu mô tả -> `Mô tả`, focus textarea.
- Thiếu ảnh chính -> `Ảnh`, focus media manager.
- Có claim y tế -> `Mô tả`, focus textarea.

### 6.6 Inline Validation

Không chỉ hiện toast khi save fail. Cần hiển thị lỗi ngay cạnh field:

- Tên sản phẩm: bắt buộc.
- Giá: phải lớn hơn 0.
- Mô tả: tối thiểu 30 ký tự.
- Ảnh: ít nhất 1 ảnh khi publish.
- Ảnh chính: bắt buộc khi publish.
- Alt text: warning.

Toast chỉ dùng để tóm tắt hoặc báo lỗi hệ thống.

### 6.7 Product Views

Thêm quick views:

- `Tất cả`
- `Bản nháp`
- `Đã xuất bản`
- `Thiếu ảnh`
- `Cần hoàn thiện`
- `Có cảnh báo y tế`

View không thay thế filter hiện tại; view là preset cho filter.

### 6.8 Empty States

Empty state theo ngữ cảnh:

- Không có sản phẩm nào:
  - CTA: `Thêm sản phẩm đầu tiên`.
- Không có kết quả do filter:
  - CTA: `Xóa bộ lọc`.
- View `Thiếu ảnh` không có item:
  - Message: `Tất cả sản phẩm đã có ảnh.`

### 6.9 Product Row Improvements

Thêm tín hiệu ngay trên list:

- Badge thiếu ảnh.
- Badge thiếu mô tả.
- Badge có cảnh báo claim y tế.
- Ngày cập nhật.
- Số ảnh.

Mục tiêu: user biết item nào cần xử lý mà không phải mở từng sản phẩm.

## 7. Đặc tả triển khai đề xuất

### 7.1 State model

Thay:

```ts
const [isAdding, setIsAdding] = useState(false);
const [editingId, setEditingId] = useState<string | null>(null);
```

Bằng hoặc bổ sung:

```ts
type ProductMode = 'list' | 'create' | 'edit';

const [mode, setMode] = useState<ProductMode>('list');
const [editingId, setEditingId] = useState<string | null>(null);
const isEditorMode = mode === 'create' || mode === 'edit';
```

Giữ `isAdding` nếu muốn giảm rủi ro, nhưng code đọc sẽ rõ hơn nếu có `mode`.

### 7.2 Conditional rendering

Pseudo:

```tsx
if (isEditorMode) {
  return (
    <ProductEditorWorkspace
      mode={mode}
      formData={formData}
      editorImages={editorImages}
      activeTab={activeTab}
      saving={saving}
      onCancel={requestExitEditor}
      onSaveDraft={() => saveProduct('draft')}
      onPublish={() => saveProduct('published')}
    />
  );
}

return (
  <ProductListWorkspace
    stats={productStats}
    products={filtered}
    filters={...}
    onCreate={startCreate}
    onEdit={startEdit}
  />
);
```

Phase đầu có thể chưa tách file, nhưng nên tách sau khi ổn định:

```text
src/components/admin/products/ProductListWorkspace.tsx
src/components/admin/products/ProductEditorWorkspace.tsx
src/components/admin/products/ProductEditorActionBar.tsx
src/components/admin/products/ProductFilterBar.tsx
```

### 7.3 Start create

```ts
const startCreate = async () => {
  if (await confirmLeaveIfDirty()) return;
  resetForm();
  setMode('create');
  requestAnimationFrame(() => nameInputRef.current?.focus());
};
```

### 7.4 Start edit

```ts
const startEdit = async (product: ProductWithImages) => {
  if (await confirmLeaveIfDirty()) return;
  hydrateForm(product);
  setMode('edit');
  setActiveTab('basic');
};
```

### 7.5 Exit editor

```ts
const requestExitEditor = async () => {
  if (isDirty) {
    const ok = await confirm(...);
    if (!ok) return;
  }
  await cleanupStagedAssetsIfNeeded();
  resetForm();
  setMode('list');
};
```

### 7.6 Save behavior

Sau `Lưu nháp`:

- Nếu đang create: giữ user trong editor mode, đổi mode sang `edit`, hiển thị toast `Đã lưu nháp`.
- Không tự quay về list.
- Cập nhật `editingId`.
- Sau đó user có thể tiếp tục thêm ảnh/mô tả hoặc đăng.

Sau `Đăng lên web`:

- Nếu publish thành công, quay lại list mode.
- Reset filters hoặc giữ filter hiện tại tùy team quyết định. Khuyến nghị giữ filter hiện tại nhưng nếu filter đang `draft`, hiển thị toast có action `Xem đã xuất bản`.

### 7.7 Focus management

- Khi vào create mode, focus `Tên sản phẩm`.
- Khi click checklist item, chuyển tab và focus field liên quan.
- Khi save fail, focus lỗi đầu tiên.
- Khi đóng editor, focus lại nút `Thêm sản phẩm` hoặc row vừa sửa.

### 7.8 Responsive

Desktop:

- 3-column editor: workflow / form / preview.

Tablet:

- 2-column: form + preview, workflow nằm trên.

Mobile:

- Single column.
- Action bar sticky bottom.
- Preview có thể collapse.

## 8. Acceptance criteria

### Editor focus mode

- Click `Thêm sản phẩm` thì không còn thấy stat cards, search/filter/sort và table.
- Click edit sản phẩm cũng chuyển sang editor mode.
- Có breadcrumb/quay lại danh sách rõ ràng.
- Header editor phân biệt `Tạo sản phẩm mới` và `Chỉnh sửa sản phẩm`.

### Guard dữ liệu

- Nhập dữ liệu rồi bấm `Hủy` phải hỏi xác nhận.
- Nhập dữ liệu rồi bấm menu Admin khác phải hỏi xác nhận hoặc chặn điều hướng nội bộ.
- Refresh/close tab có cảnh báo browser nếu có thay đổi chưa lưu.

### Save

- Lưu nháp create mới không làm mất ảnh staged.
- Lưu nháp create mới chuyển sang edit mode với `editingId`.
- Publish thành công quay về list.
- Publish fail hiển thị lỗi tại checklist/field, không chỉ toast.

### Checklist

- Checklist item thiếu dữ liệu có thể click để đi tới tab/field cần sửa.
- Thiếu ảnh chính block publish.
- Mô tả dưới 30 ký tự block publish.
- Claim y tế rủi ro hiển thị warning cần xác nhận.

### List mode

- Filter/search/sort chỉ hiển thị ở list mode.
- Empty state có CTA đúng ngữ cảnh.
- Row có badge thiếu ảnh/thiếu mô tả nếu có.

### Accessibility

- Tất cả icon-only buttons có `aria-label`.
- Media reorder có cách không phụ thuộc drag/drop.
- Action bar có thứ tự tab hợp lý.
- Error text được liên kết với field qua `aria-describedby` nếu triển khai field-level error.

## 9. Thứ tự triển khai

### Phase 10.1 - Focus mode tối thiểu

1. Thêm `mode` hoặc `isEditorMode`.
2. Khi editor mode, ẩn stats/filter/list.
3. Thêm back/breadcrumb.
4. Sau save draft giữ ở editor.
5. Sau publish quay về list.
6. Smoke test create/edit/publish.

### Phase 10.2 - Unsaved changes và sticky action bar

1. Tạo dirty snapshot.
2. Confirm trước khi hủy/rời editor.
3. Thêm sticky action bar.
4. Autofocus field đầu tiên.

### Phase 10.3 - Checklist actionable và inline errors

1. Mở rộng checklist item metadata.
2. Click checklist chuyển tab/focus field.
3. Thêm inline errors cho required fields.
4. Toast chỉ còn là summary.

### Phase 10.4 - List mode nâng cao

1. Thêm view chips.
2. Thêm contextual empty states.
3. Thêm row badges.
4. Chuẩn bị bulk selection nếu cần.

## 10. Không làm trong phase đầu

- Không đổi schema DB.
- Không viết lại Product public card.
- Không thêm bulk editor lớn.
- Không chuyển sang route `/admin/products/:id` nếu team chưa chốt.
- Không thay đổi Books/Notes trong cùng PR, trừ component dùng chung rất nhỏ.

## 11. Prompt giao AI triển khai sau khi chốt

```text
Thực thi theo `docs/10-admin-products-ux-focus-mode-spec.md`.

Mục tiêu phase đầu: nâng UI/UX module `Danh mục Sản phẩm` trong Admin bằng Editor Focus Mode.

Yêu cầu bắt buộc:
1. Chỉ sửa phạm vi Products Admin và component dùng chung cần thiết.
2. Khi click `Thêm sản phẩm` hoặc edit sản phẩm, chuyển sang editor mode.
3. Trong editor mode phải ẩn stat cards, search/filter/sort và table danh sách.
4. Editor mode phải có breadcrumb/quay lại danh sách, header rõ ràng, form rộng rãi, preview và checklist.
5. `Lưu nháp` khi tạo mới phải giữ user trong editor, chuyển sang edit mode sau khi có `editingId`.
6. `Đăng lên web` thành công thì quay lại list mode.
7. Thêm guard cơ bản khi hủy/rời editor nếu form đã thay đổi.
8. Không đổi schema DB, không sửa public `/products` ngoài phạm vi cần thiết.
9. Không revert các thay đổi hiện có của user.
10. Chạy `npm run lint` hoặc `tsc --noEmit`, `docker compose up -d --build web`, smoke test `/admin`.

Báo cáo cuối cùng:
- File đã sửa
- Hành vi UX đã thay đổi
- Kết quả lint/build/Docker
- Rủi ro còn lại
```

## 12. Câu hỏi cần team chốt

1. Sau `Lưu nháp`, có giữ user trong editor không?
   - Khuyến nghị: có.
2. Sau `Đăng lên web`, có quay về list không?
   - Khuyến nghị: có.
3. Có cần route riêng `/admin/products/new` và `/admin/products/:id` không?
   - Khuyến nghị: chưa cần trong phase đầu.
4. Có áp dụng focus mode tương tự cho Books sau khi Products ổn không?
   - Khuyến nghị: có, nhưng làm sau để giảm rủi ro.
5. Có cần bulk actions trong phase này không?
   - Khuyến nghị: chưa, đưa vào phase sau.
