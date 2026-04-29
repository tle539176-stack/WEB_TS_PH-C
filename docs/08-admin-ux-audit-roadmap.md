# 08 - Audit UX Admin và Roadmap thực thi tổng thể

Trạng thái: tài liệu thực thi chính cho phase nâng cấp Admin tiếp theo.

Ngày lập: 2026-04-28.

Repo áp dụng:

```text
C:\Users\ADMIN\Desktop\Bác sĩ Phúc\WEB_TS_PH-C
```

Tài liệu nền:

- `docs/00-ke-hoach-thuc-thi-thong-nhat.md`
- `docs/04-admin-media-upload-va-media-library.md`
- `docs/05-admin-ui-ux-research-books-products.md`
- `docs/06-admin-ui-ux-implementation-spec.md`
- `docs/07-admin-shopee-tiktok-style-editor-execution-plan.md`

Mục tiêu của tài liệu này là gom kết quả kiểm tra Admin hiện tại và nghiên cứu chuẩn ngành thành một bộ chỉ dẫn thực thi rõ ràng cho toàn bộ khu vực `/admin`: dashboard, books, products, notes, categories, media, settings và workflow kiểm duyệt nội dung y tế.

## 1. Tóm tắt điều hành

Admin hiện tại đã có nền tảng tốt:

- Supabase Auth, Postgres, Storage và RLS đã là kiến trúc chính.
- Sidebar, dashboard, settings, categories, books, products, notes đều đã có UI quản trị.
- Books và Products đã có bước tiến lớn: tabs, upload ảnh compact, staged media, preview dùng component catalog, checklist chất lượng, nút `Lưu nháp` và `Đăng lên web`.
- Notes, Settings và Dashboard vẫn chưa đạt cùng chuẩn workflow như Books/Products.

Hướng nâng cấp nên là:

```text
Admin = Content Operations Workspace
List -> Work queue -> Guided editor -> Media -> Quality/medical review -> Preview -> Publish -> Review schedule
```

Không nên tiếp tục mở rộng bằng cách nhồi thêm form vào `src/pages/Admin.tsx`. Phase tiếp theo cần chuẩn hóa trải nghiệm trước, sau đó mới mở rộng chức năng.

## 2. Nguồn nghiên cứu và chuẩn ngành

### 2.1. Shopify Admin / ecommerce product operations

Nguồn:

- Shopify Help - Searching and filtering products: https://help.shopify.com/en/manual/products/searching-filtering
- Shopify Help - Product media types: https://help.shopify.com/en/manual/products/product-media/product-media-types
- Shopify Help - Adding product media: https://help.shopify.com/en/manual/products/product-media/add-media

Điểm rút ra:

- Product list phải có sort, search, filter, saved views và bulk actions.
- Product views mặc định nên có `All`, `Active/Published`, `Draft`, `Archived`.
- Product media cần upload trực tiếp, kéo thả, chọn ảnh có sẵn, đổi main media bằng reorder.
- Ảnh chính quyết định cách item xuất hiện ở collection/home/cart; với dự án này tương đương ảnh hiển thị trên `/products` và card preview.
- Ảnh cần tỷ lệ nhất quán để grid không vỡ layout.

Áp dụng:

- Books/Products giữ hướng hiện tại nhưng bổ sung saved views, bulk archive/delete/publish, column chooser sau phase chính.
- Media manager cần có điều khiển thay thế cho drag, vì hiện tại kéo thả không đủ cho keyboard/mobile accessibility.

### 2.2. WordPress CMS editorial workflow

Nguồn:

- WordPress Page/Post Settings sidebar: https://wordpress.org/documentation/article/page-post-settings-sidebar/
- WordPress Revisions: https://wordpress.org/documentation/article/revisions/
- WordPress Post Status: https://wordpress.org/documentation/article/post-status/

Điểm rút ra:

- Editor nên tách nội dung chính và sidebar metadata: featured image, excerpt, status, publish date, slug, author, categories.
- Trạng thái cơ bản gồm draft, pending review, scheduled, published, private/password protected.
- Autosave và revisions không ghi đè bản published; chúng bảo vệ nội dung khi mất mạng hoặc đóng tab.

Áp dụng:

- Notes cần editor kiểu CMS hơn: nội dung chính ở giữa, sidebar chứa category, cover, SEO, review, publish controls.
- Cần bổ sung `last saved`, autosave nháp cục bộ hoặc autosave DB, và lịch sử thay đổi tối thiểu cho nội dung dài.

### 2.3. Strapi / Directus content operations

Nguồn:

- Strapi Review Workflows: https://docs.strapi.io/cms/features/review-workflows
- Directus Collection Explorer: https://directus.io/docs/guides/content/explore

Điểm rút ra:

- CMS hiện đại không chỉ có publish; nó có review stages, assignee và quyền chuyển trạng thái.
- Collection explorer cần search/filter/layout/batch edit/bookmarks để người quản trị quay lại đúng tập nội dung thường xử lý.

Áp dụng:

- Phase đầu chưa cần multi-role phức tạp, nhưng nên chuẩn hóa trạng thái nội dung:

```text
draft -> in_review -> published -> archived
```

- Dashboard cần work queue: nháp thiếu ảnh, bài cần duyệt, bài published sắp đến hạn review, sản phẩm thiếu cảnh báo y tế, nội dung thiếu SEO.

### 2.4. GOV.UK Design System và WCAG 2.2

Nguồn:

- GOV.UK Error message: https://design-system.service.gov.uk/components/error-message/
- GOV.UK Task list: https://design-system.service.gov.uk/components/task-list/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

Điểm rút ra:

- Lỗi phải nằm gần field, nói rõ chuyện gì sai và sửa thế nào.
- Task list giúp người dùng biết việc gì đã xong, việc gì còn thiếu.
- WCAG 2.2 yêu cầu label/instruction cho input, mô tả lỗi bằng text, target tối thiểu 24x24 CSS px, và mọi thao tác drag phải có cách làm không cần kéo.

Áp dụng:

- Thay dần `alert()` / `window.confirm()` bằng toast, inline error, confirmation modal có focus management.
- Checklist cần link tới đúng field hoặc đúng tab.
- Media reorder cần nút `Lên`, `Xuống`, `Đặt chính` bên cạnh drag.
- Overlay hover phải có state rõ trên mobile/touch, không chỉ xuất hiện khi hover.

### 2.5. Nội dung y tế: Mayo Clinic và Cleveland Clinic

Nguồn:

- Mayo Clinic Health Information Policy: https://www.mayoclinic.org/about-this-site/health-information-policy
- Cleveland Clinic Editorial Policy: https://my.clevelandclinic.org/about/website/editorial-policy

Điểm rút ra:

- Nội dung y tế cần quy trình research, writing/editing, medical review, copy editing, visual content và publishing.
- Nội dung phải dễ hiểu, evidence-based, có nguồn và lịch review.
- Ngôn ngữ phải person-centered, dễ hiểu, tránh gây hại hoặc tạo claim quá mức.

Áp dụng:

- Notes cần trường nguồn tham khảo, reviewer, review date, next review date, medical disclaimer state.
- Products cần checklist claim y tế, chống các câu như chữa khỏi, điều trị bệnh, hiệu quả tức thì, thay thế thuốc.
- Dashboard cần cảnh báo nội dung y tế đến hạn review.

## 3. Audit Admin hiện tại

### 3.1. Kiến trúc giao diện hiện tại

File chính:

```text
src/pages/Admin.tsx
```

Các phần trong file:

- Auth gate và login.
- Sidebar navigation.
- `OverviewManager`.
- `SettingsManager`.
- `BooksManager`.
- `ProductsManager`.
- `CategoriesManager`.
- `NotesManager`.
- Shared helpers như `StatusBadge`, `QualityChecklist`, `EditorTabs`.

Vấn đề:

- File `Admin.tsx` đã quá lớn, trên 1.700 dòng.
- Các manager có pattern khác nhau, khó bảo trì và khó mở rộng.
- Books/Products đã theo workflow mới, Notes vẫn là form dài kiểu cũ.
- Settings, Categories và Notes vẫn dùng `alert()` / `window.confirm()`.

### 3.2. Điểm mạnh

- Đăng nhập Admin dùng Supabase Auth và kiểm tra `app_metadata.role = 'admin'`.
- Sidebar nhóm menu rõ: hệ thống, nội dung, cửa hàng, cấu hình.
- Books/Products đã có:
  - stats cards,
  - search/status filter,
  - tabs editor,
  - staged upload,
  - preview catalog,
  - quality checklist,
  - `Lưu nháp` / `Đăng lên web`.
- Media upload đã có media library và storage cleanup.
- Public catalog card đã được tái dùng trong preview Admin.

### 3.3. Vấn đề UX cần sửa

1. Dashboard chưa phải work queue.

Hiện dashboard thiên về tổng quan số lượng và hoạt động gần đây. Người quản trị cần biết hôm nay phải xử lý gì: nội dung thiếu ảnh, bài cần duyệt, bài đến hạn review, sản phẩm thiếu cảnh báo, nội dung thiếu SEO.

2. Notes chưa đồng bộ với Books/Products.

Notes vẫn có dropdown trạng thái trong form, phải tạo draft trước khi upload ảnh bìa, chưa có preview giống public detail, chưa có nguồn tham khảo và review y tế rõ ràng.

3. Error và confirm chưa đạt chuẩn.

`alert()` và `window.confirm()` làm ngắt mạch thao tác, không đủ ngữ cảnh, khó style, khó quản lý focus và không tốt cho accessibility.

4. Media drag chưa có thay thế đủ tốt.

`CompactMediaManager` có drag-and-drop và hover overlay. Cần bổ sung thao tác bằng nút cho keyboard/touch theo WCAG 2.2 2.5.7.

5. Không có autosave, revision hoặc unsaved guard thống nhất.

Nội dung dài như Notes rất dễ mất dữ liệu khi reload hoặc mạng lỗi. Books/Products cũng cần cảnh báo khi rời editor có thay đổi chưa lưu.

6. Content quality chưa đủ cho nội dung y tế.

Product checklist mới có keyword risk. Notes chưa có checklist nguồn, medical reviewer, `next_review_at`, disclaimer, và độ rõ ràng văn phong.

7. List chưa đủ mạnh cho vận hành thực tế.

Books/Products có search/filter cơ bản, nhưng chưa có saved views, bulk actions, column visibility, filter chips, empty states có hành động gợi ý.

## 4. Nguyên tắc thiết kế Admin mới

### 4.1. Admin là công cụ làm việc

Không dùng hero, layout marketing hoặc card trang trí. Màn hình Admin ưu tiên mật độ thông tin, quét nhanh, thao tác lặp lại, trạng thái rõ.

### 4.2. Mỗi module là một workspace

Mỗi workspace gồm:

```text
Header -> Saved views/filter tabs -> Search/filter/sort -> Table/grid -> Editor drawer/page -> Preview/review panel
```

### 4.3. Hành động chính ít nhưng rõ

Trong editor chỉ dùng:

- `Lưu nháp`
- `Gửi duyệt` nếu bật review
- `Đăng lên web`
- `Cập nhật bài đã đăng`
- `Lưu trữ`

Không bắt người dùng tự hiểu dropdown trạng thái nếu hành động có thể diễn đạt trực tiếp.

### 4.4. Checklist phải dẫn người dùng sửa lỗi

Checklist không chỉ để nhìn. Mỗi item lỗi phải:

- nêu field đang thiếu,
- nêu cách sửa,
- click được để mở đúng tab/field,
- phân biệt `error`, `warning`, `info`.

### 4.5. Nội dung y tế cần dấu vết kiểm duyệt

Mọi bài y tế published nên có:

- ngày xuất bản,
- ngày cập nhật,
- người review,
- ngày review tiếp theo,
- nguồn tham khảo,
- cảnh báo nếu có claim rủi ro.

## 5. Roadmap thực thi

### Phase 08.1 - Refactor Admin shell và shared UX primitives

Mục tiêu:

- `src/pages/Admin.tsx` chỉ giữ auth gate, sidebar, layout và route nội bộ.
- Tách từng manager ra module riêng.
- Thống nhất toast, modal, form error, unsaved changes guard.

Tạo mới:

```text
src/components/admin/shell/AdminLayout.tsx
src/components/admin/shell/AdminSidebar.tsx
src/components/admin/shell/AdminHeader.tsx
src/components/admin/common/AdminToast.tsx
src/components/admin/common/ConfirmDialog.tsx
src/components/admin/common/FormErrorSummary.tsx
src/components/admin/common/UnsavedChangesGuard.tsx
src/components/admin/common/StatusBadge.tsx
src/components/admin/common/QualityChecklist.tsx
```

Di chuyển:

```text
src/components/admin/overview/OverviewManager.tsx
src/components/admin/settings/SettingsManager.tsx
src/components/admin/categories/CategoriesManager.tsx
src/components/admin/books/BooksManager.tsx
src/components/admin/products/ProductsManager.tsx
src/components/admin/notes/NotesManager.tsx
```

Acceptance:

- `src/pages/Admin.tsx` còn dưới 250 dòng.
- Không đổi hành vi Supabase/Auth.
- `alert()` và `window.confirm()` không còn trong Books/Products/Notes.
- Build Docker pass.

### Phase 08.2 - Dashboard thành work queue

Mục tiêu:

Dashboard trả lời câu hỏi: "Hôm nay admin cần xử lý gì?"

Work queue:

- Books draft thiếu ảnh bìa.
- Products draft thiếu ảnh chính.
- Notes draft thiếu cover/excerpt/category.
- Notes `in_review`.
- Nội dung published thiếu SEO title/description.
- Sản phẩm có risk terms y tế.
- Notes đến hạn review trong 30 ngày.
- Media thiếu alt text.

Service cần thêm:

```text
content.getAdminWorkQueue()
media.getMediaQualityStats()
auditLogService.getRecentAuditEvents()
```

UI:

- `WorkQueuePanel`
- `ContentHealthPanel`
- `RecentActivityPanel`
- quick create buttons cho book/product/note/category/media.

Acceptance:

- Click item trong queue mở đúng editor.
- Queue có empty state rõ: "Không có việc cần xử lý".
- Dashboard load được khi một service lỗi nhẹ; mỗi panel có fallback riêng.

### Phase 08.3 - Chuẩn hóa Notes thành CMS editor y tế

Mục tiêu:

Notes phải đạt cùng chuẩn với Books/Products nhưng phù hợp bài viết y tế.

Layout:

```text
Header actions
Tabs: Nội dung | Media | SEO | Review y tế | Preview
Main editor
Right sidebar: Status, category, cover, checklist, review schedule
```

Fields cần đưa vào UI nếu DB đã có hoặc cần migration nhỏ:

```text
notes.sources jsonb
notes.medical_reviewer text
notes.reviewed_at timestamptz
notes.next_review_at timestamptz
notes.seo_title text
notes.seo_description text
notes.disclaimer_ack boolean
```

Nếu DB hiện đã có field nào thì dùng ngay, không migration lại. Nếu thiếu, tạo migration riêng.

Checklist Notes:

- Title có.
- Excerpt 80-160 ký tự.
- Content tối thiểu 600 ký tự với heading rõ.
- Category có.
- Cover có và có alt.
- Có ít nhất 1 nguồn nếu là bài kiến thức y tế.
- Không có claim điều trị quá mức.
- Có reviewer hoặc đã xác nhận tự review.
- Có `next_review_at`.
- SEO title/description có.

Acceptance:

- Tạo note mới upload cover ngay, không cần tạo draft kỹ thuật trước.
- `Lưu nháp`, `Gửi duyệt`, `Đăng lên web` hoạt động rõ.
- Preview dùng layout public hoặc detail preview component, không dựng mock lệch.
- Published note có review metadata hoặc cảnh báo thiếu review.

### Phase 08.4 - Saved views, filter chips và bulk actions

Mục tiêu:

List là nơi vận hành nội dung số lượng lớn.

Áp dụng cho Books, Products, Notes.

Views mặc định:

- Tất cả.
- Nháp.
- Cần duyệt.
- Đã xuất bản.
- Lưu trữ.
- Thiếu ảnh.
- Thiếu SEO.
- Cần review y tế.

Toolbar:

- Search.
- Status filter.
- Category/filter theo type.
- Sort: updated desc, created desc, title/name A-Z.
- Applied filter chips.
- Clear filters.

Bulk actions:

- Publish selected nếu checklist pass.
- Move to review.
- Archive.
- Delete with confirm dialog.
- Export CSV sau phase chính.

Acceptance:

- Filter không reset sau khi delete/archive một item.
- Empty state giải thích filter đang áp dụng và có nút clear.
- Bulk action hiển thị số item đã chọn.

### Phase 08.5 - Media accessibility và quality

Mục tiêu:

Media manager dùng được bằng mouse, keyboard và touch.

Tasks:

- Thêm nút `Di chuyển lên`, `Di chuyển xuống`.
- Overlay action luôn truy cập được qua keyboard và mobile.
- Thêm dialog edit ảnh có focus trap, ESC close, restore focus.
- Thêm alt quality hints.
- Thêm duplicate detection cơ bản bằng file name + size hoặc storage path.
- Thêm media library filters: entity type, missing alt, unattached, uploaded date.

Acceptance:

- Có thể reorder ảnh không cần drag.
- Target icon buttons tối thiểu 24x24 CSS px và nên dùng 36-40px trong Admin.
- Dialog edit ảnh có label, aria-modal và focus management.

### Phase 08.6 - Autosave, revisions và audit trail

Mục tiêu:

Giảm rủi ro mất dữ liệu và giúp truy vết nội dung y tế.

Phase đầu:

- Unsaved changes guard.
- Local autosave draft bằng `localStorage` theo entity/staging key.
- `lastSavedAt` hiển thị trong editor.
- Audit log hiển thị trong item detail.

Phase sau:

- DB revisions cho Notes trước, sau đó Books/Products nếu cần.

Migration đề xuất:

```sql
create table if not exists content_revisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('note', 'book', 'product', 'settings')),
  entity_id uuid not null,
  snapshot jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
```

Acceptance:

- Reload editor có thay đổi chưa lưu thì hiển thị restore draft.
- Update/publish tạo audit log.
- Với Notes, có thể xem ít nhất 5 revision gần nhất.

## 6. Backlog chi tiết theo module

### Overview

- Work queue theo trạng thái và lỗi chất lượng.
- Recent audit events có user/action/entity.
- Quick create mở đúng module ở create mode.
- Health score cho content: ảnh, SEO, review, medical claims.

### Products

- Giữ editor hiện tại làm nền.
- Bổ sung keyboard reorder cho media.
- Thêm risk claim panel rõ hơn: từ khóa, vị trí, khuyến nghị sửa.
- Thêm `warnings`, `usage`, `contraindications` vào checklist nếu field có trong DB.
- Thêm preview detail, không chỉ card.

### Books

- Giữ editor hiện tại làm nền.
- Thêm metadata panel: publisher, pages, rating, subtitle nếu DB có.
- Thêm preview detail.
- Thêm field nguồn hoặc ghi chú biên tập nếu sách liên quan y tế.

### Notes

- Nâng cấp lớn nhất trong phase này.
- Tách khỏi form dài hiện tại.
- Upload cover staged.
- Review workflow.
- Sources manager.
- Preview public.
- Review schedule.

### Categories

- Thêm sort/reorder.
- Thêm type filter: note/book/product nếu muốn dùng chung category.
- Trước khi xóa, hiển thị số item đang dùng category.
- Nếu có item đang dùng, ưu tiên archive/disable thay vì delete.

### Settings

- Chia thành tabs: Brand, Home hero, Contact, Social, SEO, Disclaimer.
- Live preview cho Navbar/Footer/Home hero.
- Unsaved guard.
- Inline validation thay `alert`.
- Audit log khi đổi logo/hero/disclaimer.

### Media Library

- Thêm màn hình riêng trong sidebar nếu quản trị ảnh tăng lên.
- Filters: all, unattached, missing alt, product, book, note, settings.
- Bulk alt edit hoặc bulk delete unattached sau khi confirm.

## 7. Thứ tự ưu tiên thực tế

Ưu tiên 1:

- Refactor shell/shared components.
- Thay alert/confirm.
- Dashboard work queue.
- Notes editor mới.

Ưu tiên 2:

- Media accessibility.
- Saved views/filter chips/bulk actions.
- Settings tabs và live preview.

Ưu tiên 3:

- Revisions DB.
- Multi-role editor/reviewer.
- Schedule publish.
- Export/import CSV.

## 8. Test matrix nghiệm thu

### Auth/Admin shell

| Case | Kỳ vọng |
| --- | --- |
| Chưa đăng nhập vào `/admin` | Hiển thị login |
| User không có role admin | Bị chặn, có nút logout |
| Admin login | Vào dashboard |
| Sidebar đổi module | Header và content đổi đúng |

### Dashboard

| Case | Kỳ vọng |
| --- | --- |
| Có draft thiếu ảnh | Queue hiển thị item và click mở editor |
| Không có việc cần xử lý | Empty state rõ |
| Service queue lỗi | Panel lỗi nhẹ, không sập toàn Admin |

### Notes

| Case | Kỳ vọng |
| --- | --- |
| Tạo note mới | Có thể nhập title/content và upload cover ngay |
| Publish thiếu source | Checklist chặn hoặc cảnh báo theo rule |
| Publish có claim rủi ro | Hiển thị cảnh báo y tế |
| Set next review date | Dashboard phản ánh khi sắp đến hạn |
| Reload khi chưa lưu | Có restore draft |

### Media

| Case | Kỳ vọng |
| --- | --- |
| Upload nhiều ảnh | Thumbnail hiển thị ổn, không vỡ layout |
| Reorder bằng keyboard/buttons | Thứ tự thay đổi và lưu đúng |
| Xóa ảnh chính | Có ảnh chính mới hoặc yêu cầu chọn lại |
| Ảnh thiếu alt | Checklist cảnh báo |

### Accessibility

| Case | Kỳ vọng |
| --- | --- |
| Tab qua toàn editor | Focus không bị mất hoặc bị che |
| Dialog confirm | Focus nằm trong dialog, ESC đóng |
| Error field | Có text lỗi gần field và error summary |
| Icon buttons | Có aria-label và target đủ lớn |

## 9. Definition of Done

Một phase chỉ được xem là hoàn thành khi:

- `npm run lint` pass trong môi trường có Node hoặc Docker builder.
- `npm run build` pass.
- `docker compose up -d --build --force-recreate` chạy thành công.
- Smoke test `/admin`, `/products`, `/books`, `/notes` nếu route có.
- Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào frontend.
- Không quay lại Firebase/mockData.
- Không làm mất dữ liệu Supabase hiện có.
- Tài liệu cập nhật nếu có migration hoặc thay đổi workflow.

## 10. Prompt thực thi cho AI/coder

```text
Thực thi phase nâng cấp Admin theo `docs/08-admin-ux-audit-roadmap.md`.

Mục tiêu:
- Biến `/admin` thành Content Operations Workspace dễ dùng cho người quản trị.
- Refactor `src/pages/Admin.tsx` để chỉ giữ auth gate, sidebar, layout và route nội bộ.
- Tách Overview, Settings, Categories, Books, Products, Notes thành module riêng.
- Chuẩn hóa toast, confirm dialog, inline form error, unsaved changes guard.
- Nâng cấp Dashboard thành work queue: draft thiếu ảnh, nội dung cần duyệt, thiếu SEO, media thiếu alt, sản phẩm có claim y tế, notes đến hạn review.
- Nâng cấp Notes thành CMS editor y tế với tabs, staged cover upload, sources, medical review checklist, preview public, `Lưu nháp` / `Gửi duyệt` / `Đăng lên web`.
- Bổ sung accessibility cho media manager: reorder không cần drag, icon buttons có aria-label/target đủ lớn, dialog có focus management.
- Giữ Books/Products workflow hiện tại nhưng bổ sung phần còn thiếu theo roadmap.

Ràng buộc:
- Không đổi kiến trúc Supabase Auth + Postgres + Storage.
- Không dùng Firebase, Firestore, mockData.
- Không đưa service-role key vào frontend.
- Không thêm multi-role phức tạp nếu chưa cần; nếu cần review workflow, giữ role admin hiện tại và thêm trạng thái trước.
- Ưu tiên dùng field DB hiện có; nếu cần migration, tạo migration nhỏ, cập nhật `src/types/database.ts`, và ghi rõ cách apply.

Sau khi sửa:
- Chạy `npm run lint` hoặc `npm run build` trong môi trường phù hợp.
- Chạy `docker compose up -d --build --force-recreate`.
- Smoke test `/admin`, login admin, tạo/sửa/publish note/product/book tối thiểu.
- Báo cáo file đã sửa, lệnh đã chạy, rủi ro còn lại.
```

## 11. Ghi chú triển khai

- Không thực hiện toàn bộ roadmap trong một PR lớn. Chia nhỏ theo phase 08.1, 08.2, 08.3.
- Phase 08.3 Notes có rủi ro nghiệp vụ cao nhất vì liên quan nội dung y tế; cần test kỹ dữ liệu published.
- Nếu thiếu Node trên host Windows, có thể chạy build qua Docker như hiện tại.
- Nếu cần kiểm thử hình ảnh, ưu tiên Playwright screenshot sau khi có Node hoặc dùng container test riêng.
